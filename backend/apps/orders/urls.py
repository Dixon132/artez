from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CartItemViewSet, OrderViewSet, OrderItemViewSet

router = DefaultRouter()
router.register('carts', CartViewSet)
router.register('cart-items', CartItemViewSet)
router.register('orders', OrderViewSet)
router.register('order-items', OrderItemViewSet)

urlpatterns = router.urls
