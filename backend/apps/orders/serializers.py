from rest_framework import serializers
from .models import Cart, CartItem, CartItemOption, Order, OrderItem, OrderItemOption, ShippingZone, Coupon, Continent, Country
from apps.products.models import (
    Product, Option, OptionValue,
    ProductTranslation, OptionTranslation, OptionValueTranslation,
)


# ==============================
# 🛒 CART SERIALIZERS
# ==============================

class CartItemOptionSerializer(serializers.ModelSerializer):
    """Serializer de opciones seleccionadas en item de carrito"""
    option_name = serializers.SerializerMethodField()
    value_name = serializers.SerializerMethodField()
    extra_price = serializers.DecimalField(source='value.base_extra_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItemOption
        fields = ['id', 'option', 'value', 'option_name', 'value_name', 'extra_price']

    def get_option_name(self, obj):
        """Return translated option name if lang is in context, otherwise base name."""
        lang = self.context.get('lang')
        if lang:
            translation = OptionTranslation.objects.filter(
                option=obj.option, language=lang
            ).first()
            if translation:
                return translation.name
        return obj.option.name

    def get_value_name(self, obj):
        """Return translated option value name if lang is in context, otherwise base name."""
        lang = self.context.get('lang')
        if lang:
            translation = OptionValueTranslation.objects.filter(
                option_value=obj.value, language=lang
            ).first()
            if translation:
                return translation.name
        return obj.value.name


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer de item de carrito con opciones"""
    selected_options = CartItemOptionSerializer(many=True, read_only=True)
    product_name = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(source='product.base_price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'quantity', 'selected_options']

    def get_product_name(self, obj):
        """Return translated product name if lang is in context, otherwise base name."""
        lang = self.context.get('lang')
        if lang:
            translation = ProductTranslation.objects.filter(
                product=obj.product, language=lang
            ).first()
            if translation:
                return translation.name
        return obj.product.name

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
    quantity = serializers.IntegerField(min_value=1, max_value=99, default=1)
    options = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )


# ==============================
# 📦 ORDER SERIALIZERS
# ==============================

class CountrySerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='shipping_zone.name', read_only=True, default=None)
    zone_id = serializers.IntegerField(source='shipping_zone.id', read_only=True, default=None)

    class Meta:
        model = Country
        fields = ['id', 'name', 'code', 'shipping_zone', 'zone_name', 'zone_id']


class ShippingZoneSerializer(serializers.ModelSerializer):
    countries = CountrySerializer(many=True, read_only=True)
    country_count = serializers.SerializerMethodField()
    continent_name = serializers.CharField(source='continent.name', read_only=True, default=None)

    class Meta:
        model = ShippingZone
        fields = ['id', 'name', 'price', 'extra_per_item', 'continent', 'continent_name', 'countries', 'country_count', 'created_at', 'updated_at']

    def get_country_count(self, obj):
        return obj.countries.count()


class ContinentSerializer(serializers.ModelSerializer):
    zones = ShippingZoneSerializer(many=True, read_only=True)

    class Meta:
        model = Continent
        fields = ['id', 'name', 'code', 'zones', 'created_at']


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

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
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    country_name = serializers.CharField(source='country.name', read_only=True, default=None)

    class Meta:
        model = Order
        fields = ['id', 'email', 'full_name', 'address', 'total_price', 'country', 'country_name', 'shipping_zone', 'shipping_cost', 'coupon', 'discount_applied', 'status', 'status_display', 'created_at', 'items']


class CreateOrderSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    address = serializers.CharField()
    country_code = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_null=True, allow_blank=True)


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
        ('incoming', 'Pedido Entrante'),
        ('pending_payment', 'Pendiente de Pago'),
        ('in_production', 'En Fabricación'),
        ('shipped', 'Enviado'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ])
