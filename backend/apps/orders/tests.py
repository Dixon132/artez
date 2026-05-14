from django.test import TestCase, RequestFactory
from django.contrib.admin.sites import AdminSite
from rest_framework.test import APIClient
from rest_framework import status
from apps.products.models import Product, Category
from apps.orders.models import Cart, CartItem
from apps.orders.admin import CartAdmin


class CartQuantityValidationTest(TestCase):
    """Tests for cart quantity validation (1-99 range) - Requirements 4.2, 4.5"""

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Instruments")
        self.product = Product.objects.create(
            name="Charango",
            description="Traditional Bolivian instrument",
            base_price=150.00,
            category=self.category
        )
        self.session_id = "session_1234567890_abcde1234"

    # ===== add_item quantity validation =====

    def test_add_item_valid_quantity_1(self):
        """Adding item with quantity=1 (minimum) should succeed"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': self.session_id,
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_item_valid_quantity_99(self):
        """Adding item with quantity=99 (maximum) should succeed"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': self.session_id,
            'product_id': self.product.id,
            'quantity': 99
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_item_valid_quantity_50(self):
        """Adding item with quantity=50 (mid-range) should succeed"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': self.session_id,
            'product_id': self.product.id,
            'quantity': 50
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_item_quantity_zero_rejected(self):
        """Adding item with quantity=0 should be rejected with 400"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': self.session_id,
            'product_id': self.product.id,
            'quantity': 0
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Quantity must be between 1 and 99')

    def test_add_item_quantity_negative_rejected(self):
        """Adding item with negative quantity should be rejected with 400"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': self.session_id,
            'product_id': self.product.id,
            'quantity': -5
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Quantity must be between 1 and 99')

    def test_add_item_quantity_100_rejected(self):
        """Adding item with quantity=100 (above max) should be rejected with 400"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': self.session_id,
            'product_id': self.product.id,
            'quantity': 100
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Quantity must be between 1 and 99')

    # ===== update_item quantity validation =====

    def test_update_item_valid_quantity(self):
        """Updating item with valid quantity should succeed"""
        cart = Cart.objects.create(session_id=self.session_id)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        response = self.client.patch(
            f'/api/cart/{self.session_id}/items/{cart_item.id}/',
            {'quantity': 50},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 50)

    def test_update_item_quantity_1(self):
        """Updating item with quantity=1 (minimum) should succeed"""
        cart = Cart.objects.create(session_id=self.session_id)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=5)

        response = self.client.patch(
            f'/api/cart/{self.session_id}/items/{cart_item.id}/',
            {'quantity': 1},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 1)

    def test_update_item_quantity_99(self):
        """Updating item with quantity=99 (maximum) should succeed"""
        cart = Cart.objects.create(session_id=self.session_id)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=5)

        response = self.client.patch(
            f'/api/cart/{self.session_id}/items/{cart_item.id}/',
            {'quantity': 99},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 99)

    def test_update_item_quantity_zero_rejected(self):
        """Updating item with quantity=0 should be rejected, preserving existing quantity"""
        cart = Cart.objects.create(session_id=self.session_id)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=5)

        response = self.client.patch(
            f'/api/cart/{self.session_id}/items/{cart_item.id}/',
            {'quantity': 0},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Quantity must be between 1 and 99')
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 5)  # Preserved

    def test_update_item_quantity_negative_rejected(self):
        """Updating item with negative quantity should be rejected, preserving existing quantity"""
        cart = Cart.objects.create(session_id=self.session_id)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=3)

        response = self.client.patch(
            f'/api/cart/{self.session_id}/items/{cart_item.id}/',
            {'quantity': -1},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Quantity must be between 1 and 99')
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 3)  # Preserved

    def test_update_item_quantity_100_rejected(self):
        """Updating item with quantity=100 should be rejected, preserving existing quantity"""
        cart = Cart.objects.create(session_id=self.session_id)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=10)

        response = self.client.patch(
            f'/api/cart/{self.session_id}/items/{cart_item.id}/',
            {'quantity': 100},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Quantity must be between 1 and 99')
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 10)  # Preserved

    def test_update_item_quantity_large_number_rejected(self):
        """Updating item with very large quantity should be rejected, preserving existing quantity"""
        cart = Cart.objects.create(session_id=self.session_id)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        response = self.client.patch(
            f'/api/cart/{self.session_id}/items/{cart_item.id}/',
            {'quantity': 9999},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Quantity must be between 1 and 99')
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 2)  # Preserved


class CartRetrieveCreationTest(TestCase):
    """Tests for cart creation on missing session_id (Requirement 4.4)"""

    def setUp(self):
        self.client = APIClient()

    def test_retrieve_nonexistent_session_creates_empty_cart(self):
        """When retrieve is called with a session_id that doesn't exist, create a new empty Cart"""
        response = self.client.get('/api/cart/session_12345_abc/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['session_id'], 'session_12345_abc')
        self.assertEqual(data['items'], [])
        self.assertEqual(data['total'], 0)

    def test_retrieve_nonexistent_session_persists_cart(self):
        """The created cart should be persisted in the database"""
        self.client.get('/api/cart/session_99999_xyz/')
        self.assertTrue(Cart.objects.filter(session_id='session_99999_xyz').exists())

    def test_retrieve_existing_session_returns_same_cart(self):
        """When retrieve is called with an existing session_id, return the existing cart"""
        cart = Cart.objects.create(session_id='session_existing_001')
        response = self.client.get('/api/cart/session_existing_001/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['session_id'], 'session_existing_001')
        self.assertEqual(data['id'], cart.id)

    def test_retrieve_does_not_duplicate_cart(self):
        """Calling retrieve multiple times with same session_id should not create duplicates"""
        self.client.get('/api/cart/session_nodupe_001/')
        self.client.get('/api/cart/session_nodupe_001/')
        count = Cart.objects.filter(session_id='session_nodupe_001').count()
        self.assertEqual(count, 1)


class CartSessionIdFormatValidationTest(TestCase):
    """Tests for session_id format validation - Requirements 6.4, 6.5"""

    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Instruments")
        self.product = Product.objects.create(
            name="Charango",
            description="Traditional Bolivian instrument",
            base_price=150.00,
            category=self.category
        )

    # ===== Valid session_id formats =====

    def test_valid_session_id_accepted(self):
        """A properly formatted session_id should be accepted"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_1234567890_abcde1234',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_valid_session_id_with_short_timestamp(self):
        """A session_id with a short timestamp should be accepted"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_1_abc123def',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_valid_session_id_all_digits_suffix(self):
        """A session_id with all-digit 9-char suffix should be accepted"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_9999999999_123456789',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # ===== Invalid session_id formats =====

    def test_missing_session_prefix_rejected(self):
        """A session_id without 'session_' prefix should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'invalid_1234567890_abcde1234',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid session ID format')

    def test_non_numeric_timestamp_rejected(self):
        """A session_id with non-numeric timestamp should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_abcdefg_abcde1234',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid session ID format')

    def test_short_alphanumeric_suffix_rejected(self):
        """A session_id with less than 9 alphanumeric chars should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_1234567890_abc',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid session ID format')

    def test_long_alphanumeric_suffix_rejected(self):
        """A session_id with more than 9 alphanumeric chars should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_1234567890_abcde12345',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid session ID format')

    def test_uppercase_suffix_rejected(self):
        """A session_id with uppercase chars in suffix should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_1234567890_ABCDE1234',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid session ID format')

    def test_empty_session_id_rejected(self):
        """An empty session_id should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': '',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_random_string_rejected(self):
        """A completely random string should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'just-a-random-string',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid session ID format')

    def test_special_chars_in_suffix_rejected(self):
        """A session_id with special characters in suffix should be rejected"""
        response = self.client.post('/api/cart/add-item/', {
            'session_id': 'session_1234567890_abc!@#$%^',
            'product_id': self.product.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Invalid session ID format')


class CartAdminTest(TestCase):
    """Tests for CartAdmin computed columns and filtering - Requirements 6.1, 6.2, 6.3, 6.6"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = CartAdmin(Cart, self.site)
        self.factory = RequestFactory()
        self.category = Category.objects.create(name="Instruments")
        self.product1 = Product.objects.create(
            name="Charango", description="Test", base_price=150.00, category=self.category
        )
        self.product2 = Product.objects.create(
            name="Ronroco", description="Test", base_price=200.00, category=self.category
        )

    def test_list_display_contains_expected_fields(self):
        """CartAdmin list_display should include id, session_id, item_count, total_value, created_at"""
        expected = ['id', 'session_id', 'item_count', 'total_value', 'created_at']
        self.assertEqual(self.admin.list_display, expected)

    def test_search_fields_contains_session_id(self):
        """CartAdmin search_fields should include session_id"""
        self.assertIn('session_id', self.admin.search_fields)

    def test_list_filter_contains_created_at(self):
        """CartAdmin list_filter should include created_at for date filtering"""
        self.assertIn('created_at', self.admin.list_filter)

    def test_item_count_annotation(self):
        """item_count should return the number of CartItem records for a cart"""
        cart = Cart.objects.create(session_id="session_1000_admintest")
        CartItem.objects.create(cart=cart, product=self.product1, quantity=2)
        CartItem.objects.create(cart=cart, product=self.product2, quantity=1)

        request = self.factory.get('/admin/orders/cart/')
        queryset = self.admin.get_queryset(request)
        annotated_cart = queryset.get(pk=cart.pk)
        self.assertEqual(self.admin.item_count(annotated_cart), 2)

    def test_item_count_empty_cart(self):
        """item_count should return 0 for a cart with no items"""
        cart = Cart.objects.create(session_id="session_2000_emptytest")

        request = self.factory.get('/admin/orders/cart/')
        queryset = self.admin.get_queryset(request)
        annotated_cart = queryset.get(pk=cart.pk)
        self.assertEqual(self.admin.item_count(annotated_cart), 0)

    def test_total_value_annotation(self):
        """total_value should return sum of (base_price * quantity) for all items"""
        cart = Cart.objects.create(session_id="session_3000_valuetest")
        CartItem.objects.create(cart=cart, product=self.product1, quantity=2)  # 150 * 2 = 300
        CartItem.objects.create(cart=cart, product=self.product2, quantity=1)  # 200 * 1 = 200

        request = self.factory.get('/admin/orders/cart/')
        queryset = self.admin.get_queryset(request)
        annotated_cart = queryset.get(pk=cart.pk)
        self.assertEqual(self.admin.total_value(annotated_cart), '$500.00')

    def test_total_value_empty_cart(self):
        """total_value should return $0.00 for a cart with no items"""
        cart = Cart.objects.create(session_id="session_4000_emptyval")

        request = self.factory.get('/admin/orders/cart/')
        queryset = self.admin.get_queryset(request)
        annotated_cart = queryset.get(pk=cart.pk)
        self.assertEqual(self.admin.total_value(annotated_cart), '$0.00')

    def test_changelist_view_shows_active_cart_count(self):
        """changelist_view should show active cart count in the title"""
        # Create one active cart (has items) and one empty cart
        cart1 = Cart.objects.create(session_id="session_5000_active")
        CartItem.objects.create(cart=cart1, product=self.product1, quantity=1)
        Cart.objects.create(session_id="session_6000_empty")

        from django.contrib.auth import get_user_model
        User = get_user_model()
        admin_user = User.objects.create_superuser('admin', 'admin@test.com', 'password')

        request = self.factory.get('/admin/orders/cart/')
        request.user = admin_user
        response = self.admin.changelist_view(request)
        # The title should contain the active cart count (1 active)
        self.assertIn('1 active', response.context_data['title'])
