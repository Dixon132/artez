from django.db import models
from apps.products.models import Product, Option, OptionValue, TimeStampedModel


# ==============================
# 🏷️ COUPONS & SHIPPING
# ==============================

class ShippingZone(TimeStampedModel):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    extra_per_item = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    continent = models.ForeignKey('Continent', on_delete=models.SET_NULL, null=True, blank=True, related_name='zones')

    def __str__(self):
        return f"{self.name} (${self.price} + ${self.extra_per_item}/item)"

    def calculate_shipping(self, item_count):
        from decimal import Decimal
        if item_count <= 0:
            return Decimal('0.00')
        return self.price + Decimal(str(max(0, item_count - 1))) * self.extra_per_item


class Continent(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name


class Country(TimeStampedModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=3, unique=True)
    shipping_zone = models.ForeignKey(ShippingZone, on_delete=models.SET_NULL, null=True, blank=True, related_name='countries')

    class Meta:
        verbose_name_plural = 'countries'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

class Coupon(TimeStampedModel):
    DISCOUNT_TYPES = [
        ('fixed', 'Fijo ($)'),
        ('percent', 'Porcentaje (%)'),
    ]
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default='percent')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.code} - {self.discount_value} {self.get_discount_type_display()}"


# ==============================
# 🛒 CART - Carrito sin login (session-based)
# ==============================

class Cart(TimeStampedModel):
    """Carrito basado en session_id (no requiere login)"""
    session_id = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"Cart {self.session_id}"


class CartItem(TimeStampedModel):
    """Item en el carrito con producto y cantidad"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"


class CartItemOption(models.Model):
    """Opciones seleccionadas para un item del carrito"""
    cart_item = models.ForeignKey(CartItem, on_delete=models.CASCADE, related_name='selected_options')
    option = models.ForeignKey(Option, on_delete=models.CASCADE)
    value = models.ForeignKey(OptionValue, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.option.name}: {self.value.name}"


# ==============================
# 📦 ORDERS - Órdenes con snapshot
# ==============================

class Order(TimeStampedModel):
    """Orden de compra con datos del cliente"""
    STATUS_CHOICES = [
        ('incoming', 'Pedido Entrante'),
        ('pending_payment', 'Pendiente de Pago'),
        ('in_production', 'En Fabricación'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    
    STATUS_FLOW = {
        'incoming': 'pending_payment',
        'pending_payment': 'in_production',
        'in_production': 'shipped',
        'shipped': 'delivered',
    }
    
    email = models.EmailField()
    full_name = models.CharField(max_length=255)
    address = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)
    shipping_zone = models.ForeignKey(ShippingZone, on_delete=models.SET_NULL, null=True, blank=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Order #{self.id} - {self.email}"


class OrderItem(models.Model):
    """Item de orden (snapshot del producto al momento de compra)"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_name = models.CharField(max_length=255)  # Snapshot
    base_price = models.DecimalField(max_digits=10, decimal_places=2)  # Snapshot
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"


class OrderItemOption(models.Model):
    """Opciones seleccionadas en orden (snapshot, NO FK)"""
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='options')
    option_name = models.CharField(max_length=100)  # Snapshot
    value_name = models.CharField(max_length=100)  # Snapshot
    extra_price = models.DecimalField(max_digits=10, decimal_places=2)  # Snapshot

    def __str__(self):
        return f"{self.option_name}: {self.value_name}"
