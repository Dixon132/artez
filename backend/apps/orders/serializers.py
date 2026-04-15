from rest_framework import serializers
from .models import Cart, CartItem, CartItemOption, Order, OrderItem, OrderItemOption
from apps.products.models import Product, Option, OptionValue


# ==============================
# 🛒 CART SERIALIZERS
# ==============================

class CartItemOptionSerializer(serializers.ModelSerializer):
    """Serializer de opciones seleccionadas en item de carrito"""
    option_name = serializers.CharField(source='option.name', read_only=True)
    value_name = serializers.CharField(source='value.name', read_only=True)
    extra_price = serializers.DecimalField(source='value.base_extra_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItemOption
        fields = ['id', 'option', 'value', 'option_name', 'value_name', 'extra_price']


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer de item de carrito con opciones"""
    selected_options = CartItemOptionSerializer(many=True, read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.base_price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'quantity', 'selected_options']

    def get_product_image(self, obj):
        """Obtener primera imagen del producto"""
        first_image = obj.product.images.first()
        if first_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
        return None


class CartSerializer(serializers.ModelSerializer):
    """Serializer completo de carrito"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'session_id', 'created_at', 'items', 'total']

    def get_total(self, obj):
        """Calcular total del carrito"""
        total = 0
        for item in obj.items.all():
            item_price = item.product.base_price
            for opt in item.selected_options.all():
                item_price += opt.value.base_extra_price
            total += item_price * item.quantity
        return float(total)


class AddToCartSerializer(serializers.Serializer):
    """
    Serializer para agregar producto al carrito
    
    Ejemplo de uso:
    POST /api/cart/add-item
    {
        "session_id": "abc123",
        "product_id": 1,
        "quantity": 2,
        "options": [
            {"option_id": 1, "value_id": 2},
            {"option_id": 3, "value_id": 5}
        ]
    }
    """
    session_id = serializers.CharField(max_length=255)
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    options = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )


# ==============================
# 📦 ORDER SERIALIZERS
# ==============================

class OrderItemOptionSerializer(serializers.ModelSerializer):
    """Serializer de opciones de item de orden (snapshot)"""
    
    class Meta:
        model = OrderItemOption
        fields = ['id', 'option_name', 'value_name', 'extra_price']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer de item de orden con opciones"""
    options = OrderItemOptionSerializer(many=True, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'base_price', 'quantity', 'options']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer completo de orden"""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'email', 'full_name', 'address', 'total_price', 'status', 'status_display', 'created_at', 'items']


class CreateOrderSerializer(serializers.Serializer):
    """
    Serializer para crear orden desde carrito
    
    Ejemplo de uso:
    POST /api/orders/create
    {
        "session_id": "abc123",
        "email": "cliente@example.com",
        "full_name": "Juan Pérez",
        "address": "Calle Falsa 123, La Paz, Bolivia"
    }
    """
    session_id = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    address = serializers.CharField()


class UpdateOrderStatusSerializer(serializers.Serializer):
    """
    Serializer para actualizar estado de orden
    
    Ejemplo de uso:
    PATCH /api/orders/{id}/update-status
    {
        "status": "processing"
    }
    """
    status = serializers.ChoiceField(choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ])
