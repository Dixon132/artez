from django.contrib import admin
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
    list_display = ['id', 'session_id', 'created_at']
    search_fields = ['session_id']
    inlines = [CartItemInline]


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
