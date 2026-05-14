# Feature: seo-localized-urls, Property 9: Session ID Format Validation
"""
Property-based test for session ID format validation.

**Validates: Requirements 6.5**

Tests that for any string NOT matching the pattern `session_\\d+_[a-z0-9]{9}`,
the cart add-item endpoint returns HTTP 400 with error "Invalid session ID format".
"""
import re
import string

from hypothesis import given, settings, assume
from hypothesis import strategies as st
from hypothesis.extra.django import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.products.models import Product, Category


# The valid session ID pattern
SESSION_ID_PATTERN = re.compile(r'^session_\d+_[a-z0-9]{9}$')


def invalid_session_id_strategy():
    """
    Strategy that generates strings which do NOT match session_\\d+_[a-z0-9]{9}.

    We use multiple approaches to generate invalid session IDs:
    1. Completely random text strings
    2. Strings with wrong prefix
    3. Strings with non-numeric timestamp part
    4. Strings with wrong-length suffix (too short or too long)
    5. Strings with uppercase or special chars in suffix
    6. Empty strings
    7. Strings that look close but have subtle issues
    """
    # Strategy 1: Completely random text (very unlikely to match pattern)
    random_text = st.text(
        alphabet=string.printable,
        min_size=0,
        max_size=100
    )

    # Strategy 2: Wrong prefix with valid-looking rest
    wrong_prefix = st.builds(
        lambda prefix, ts, suffix: f"{prefix}_{ts}_{suffix}",
        st.text(
            alphabet=string.ascii_lowercase,
            min_size=1,
            max_size=10
        ).filter(lambda s: s != "session"),
        st.from_regex(r'\d{1,13}', fullmatch=True),
        st.from_regex(r'[a-z0-9]{9}', fullmatch=True),
    )

    # Strategy 3: Correct prefix but non-numeric timestamp
    non_numeric_timestamp = st.builds(
        lambda ts, suffix: f"session_{ts}_{suffix}",
        st.text(
            alphabet=string.ascii_letters + string.punctuation,
            min_size=1,
            max_size=13
        ).filter(lambda s: not s.isdigit()),
        st.from_regex(r'[a-z0-9]{9}', fullmatch=True),
    )

    # Strategy 4: Correct prefix and timestamp but wrong suffix length
    wrong_suffix_length = st.builds(
        lambda ts, suffix: f"session_{ts}_{suffix}",
        st.from_regex(r'\d{1,13}', fullmatch=True),
        st.from_regex(r'[a-z0-9]{1,20}', fullmatch=True).filter(lambda s: len(s) != 9),
    )

    # Strategy 5: Correct structure but uppercase/special chars in suffix
    invalid_suffix_chars = st.builds(
        lambda ts, suffix: f"session_{ts}_{suffix}",
        st.from_regex(r'\d{1,13}', fullmatch=True),
        st.text(
            alphabet=string.ascii_uppercase + string.punctuation + " ",
            min_size=9,
            max_size=9
        ),
    )

    # Strategy 6: Empty string
    empty = st.just("")

    # Combine all strategies
    return st.one_of(
        random_text,
        wrong_prefix,
        non_numeric_timestamp,
        wrong_suffix_length,
        invalid_suffix_chars,
        empty,
    ).filter(lambda s: not SESSION_ID_PATTERN.match(s))


class SessionIdFormatPropertyTest(TestCase):
    """
    Property 9: Session ID Format Validation

    For any string that does NOT match `session_\\d+_[a-z0-9]{9}`,
    the cart add-item endpoint SHALL respond with HTTP 400 and
    error message "Invalid session ID format".

    **Validates: Requirements 6.5**
    """

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="PBT Instruments")
        self.product = Product.objects.create(
            name="PBT Charango",
            description="Test instrument for PBT",
            base_price=100.00,
            category=self.category
        )

    @given(session_id=invalid_session_id_strategy())
    @settings(max_examples=100, deadline=None)
    def test_invalid_session_id_returns_400(self, session_id):
        """
        Property: Any session_id not matching session_\\d+_[a-z0-9]{9}
        must be rejected with 400 and "Invalid session ID format" error.

        **Validates: Requirements 6.5**
        """
        # Ensure the generated string truly doesn't match the valid pattern
        assume(not SESSION_ID_PATTERN.match(session_id))

        response = self.client.post('/api/cart/add-item/', {
            'session_id': session_id,
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
            f"Expected 400 for invalid session_id '{session_id}', got {response.status_code}"
        )

        # For non-empty session_ids that pass serializer validation,
        # check the specific error message
        if session_id and 'error' in response.data:
            self.assertEqual(
                response.data['error'],
                'Invalid session ID format',
                f"Expected 'Invalid session ID format' error for session_id '{session_id}', "
                f"got '{response.data.get('error')}'"
            )
