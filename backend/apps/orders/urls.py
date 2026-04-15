from django.urls import path
from .views import CartViewSet, OrderViewSet

# ==============================
# 🛒 CART URLS
# ==============================

cart_list = CartViewSet.as_view({
    'post': 'add_item'
})

cart_detail = CartViewSet.as_view({
    'get': 'retrieve'
})

cart_clear = CartViewSet.as_view({
    'delete': 'clear'
})

cart_item_actions = CartViewSet.as_view({
    'delete': 'remove_item',
    'patch': 'update_item'
})

# ==============================
# 📦 ORDER URLS
# ==============================

order_list = OrderViewSet.as_view({
    'get': 'list'
})

order_detail = OrderViewSet.as_view({
    'get': 'retrieve'
})

order_create = OrderViewSet.as_view({
    'post': 'create_order'
})

order_update_status = OrderViewSet.as_view({
    'patch': 'update_status'
})

# ==============================
# URL PATTERNS
# ==============================

urlpatterns = [
    # Cart endpoints
    path('cart/add-item/', cart_list, name='cart-add-item'),
    path('cart/<str:pk>/', cart_detail, name='cart-detail'),
    path('cart/<str:pk>/clear/', cart_clear, name='cart-clear'),
    path('cart/<str:pk>/items/<int:item_id>/', cart_item_actions, name='cart-item-actions'),
    
    # Order endpoints
    path('orders/', order_list, name='order-list'),
    path('orders/<int:pk>/', order_detail, name='order-detail'),
    path('orders/create/', order_create, name='order-create'),
    path('orders/<int:pk>/update-status/', order_update_status, name='order-update-status'),
]
