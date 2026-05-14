from django.contrib import admin
from django.db.models import Count, Sum, F
from .models import Cart, CartItem, CartItemOption, Order, OrderItem, OrderItemOption


# ==============================
# 🛒 CART ADMIN
# ==============================

class CartItemOptionInline(admin.TabularInline):
    model = CartItemOption
    extra = 0


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'session_id', 'item_count', 'total_value', 'created_at']
    search_fields = ['session_id']
    list_filter = ['created_at']
    inlines = [CartItemInline]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            _item_count=Count('items'),
            _total_value=Sum(F('items__product__base_price') * F('items__quantity')),
        )
        return queryset

    def item_count(self, obj):
        return obj._item_count
    item_count.short_description = 'Item Count'
    item_count.admin_order_field = '_item_count'

    def total_value(self, obj):
        value = obj._total_value
        if value is None:
            return '$0.00'
        return f'${value:.2f}'
    total_value.short_description = 'Total Value'
    total_value.admin_order_field = '_total_value'

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        active_cart_count = Cart.objects.annotate(
            _item_count=Count('items')
        ).filter(_item_count__gt=0).count()
        extra_context['title'] = f'Carts ({active_cart_count} active)'
        return super().changelist_view(request, extra_context=extra_context)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart', 'product', 'quantity']
    list_filter = ['cart']
    inlines = [CartItemOptionInline]


# ==============================
# 📦 ORDER ADMIN
# ==============================

class OrderItemOptionInline(admin.TabularInline):
    model = OrderItemOption
    extra = 0


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'email', 'full_name', 'total_price', 'created_at']
    search_fields = ['email', 'full_name']
    list_filter = ['created_at']
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product_name', 'base_price', 'quantity']
    list_filter = ['order']
    inlines = [OrderItemOptionInline]
