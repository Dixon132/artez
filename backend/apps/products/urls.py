from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, CategoryViewSet, OptionViewSet, OptionValueViewSet,
    ProductTranslationViewSet, CategoryTranslationViewSet,
    OptionTranslationViewSet, OptionValueTranslationViewSet
)

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('categories', CategoryViewSet)
router.register('options', OptionViewSet)
router.register('option-values', OptionValueViewSet)
router.register('product-translations', ProductTranslationViewSet)
router.register('category-translations', CategoryTranslationViewSet)
router.register('option-translations', OptionTranslationViewSet)
router.register('option-value-translations', OptionValueTranslationViewSet)

urlpatterns = router.urls
