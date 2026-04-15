from django.db import models
from apps.products.models import Product, Option, OptionValue, TimeStampedModel


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
        ('pending', 'Pendiente'),
        ('processing', 'Procesando'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    
    email = models.EmailField()
    full_name = models.CharField(max_length=255)
    address = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
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
