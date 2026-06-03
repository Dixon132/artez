import re

from rest_framework.viewsets import ViewSet, ReadOnlyModelViewSet, ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import Cart, CartItem, CartItemOption, Order, OrderItem, OrderItemOption, ShippingZone, Coupon
from .serializers import (
    CartSerializer, AddToCartSerializer, 
    OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer,
    ShippingZoneSerializer, CouponSerializer
)
from apps.products.models import Product, Option, OptionValue

# Pattern for valid session IDs: session_{timestamp}_{9 lowercase alphanumeric chars}
SESSION_ID_PATTERN = re.compile(r'^session_\d+_[a-z0-9]{9}$')


# ==============================
# 🛒 CART VIEWSET
# ==============================

class CartViewSet(ViewSet):
    """
    ViewSet para manejo de carrito (session-based, sin login)
    
    ENDPOINTS:
    
    GET /api/cart/{session_id}/
    - Obtener carrito por session_id
    
    POST /api/cart/add-item/
    - Agregar producto al carrito
    
    DELETE /api/cart/{session_id}/items/{item_id}/
    - Eliminar item del carrito
    
    PATCH /api/cart/{session_id}/items/{item_id}/
    - Actualizar cantidad de item
    
    DELETE /api/cart/{session_id}/clear/
    - Vaciar carrito
    """

    def retrieve(self, request, pk=None):
        """Obtener carrito por session_id. Crea uno vacío si no existe."""
        lang = request.query_params.get('lang', None)
        cart, _created = Cart.objects.get_or_create(session_id=pk)
        
        # Optimize with prefetching
        cart = Cart.objects.prefetch_related(
            'items__product__images',
            'items__product__translations',
            'items__selected_options__option__translations',
            'items__selected_options__value__translations'
        ).get(id=cart.id)
        
        serializer = CartSerializer(cart, context={'request': request, 'lang': lang})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Agregar producto al carrito con opciones"""
        serializer = AddToCartSerializer(data=request.data)
        
        if not serializer.is_valid():
            # Check if quantity validation failed to return consistent error message
            if 'quantity' in serializer.errors:
                return Response({'error': 'Quantity must be between 1 and 99'}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']
        product_id = data['product_id']
        quantity = data.get('quantity', 1)
        options = data.get('options', [])

        # Validate session_id format: session_{timestamp}_{9 lowercase alphanumeric chars}
        if not SESSION_ID_PATTERN.match(session_id):
            return Response(
                {'error': 'Invalid session ID format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Crear o obtener carrito
        cart, created = Cart.objects.get_or_create(session_id=session_id)

        # Crear item
        cart_item = CartItem.objects.create(
            cart=cart,
            product=product,
            quantity=quantity
        )

        # Agregar opciones seleccionadas
        for opt in options:
            try:
                option = Option.objects.get(id=opt['option_id'])
                value = OptionValue.objects.get(id=opt['value_id'])
                CartItemOption.objects.create(
                    cart_item=cart_item,
                    option=option,
                    value=value
                )
            except (Option.DoesNotExist, OptionValue.DoesNotExist):
                pass

        # Reload with prefetches for optimized serialization
        optimized_cart = Cart.objects.prefetch_related(
            'items__product__images',
            'items__product__translations',
            'items__selected_options__option__translations',
            'items__selected_options__value__translations'
        ).get(id=cart.id)

        cart_serializer = CartSerializer(optimized_cart, context={'request': request})
        return Response({
            'message': 'Producto agregado al carrito',
            'cart': cart_serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='items/(?P<item_id>[^/.]+)')
    def remove_item(self, request, pk=None, item_id=None):
        """Eliminar item del carrito"""
        try:
            cart = Cart.objects.get(session_id=pk)
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            
            # Reload with prefetches for optimized serialization
            optimized_cart = Cart.objects.prefetch_related(
                'items__product__images',
                'items__product__translations',
                'items__selected_options__option__translations',
                'items__selected_options__value__translations'
            ).get(id=cart.id)
            
            cart_serializer = CartSerializer(optimized_cart, context={'request': request})
            return Response({
                'message': 'Item eliminado',
                'cart': cart_serializer.data
            })
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'], url_path='items/(?P<item_id>[^/.]+)')
    def update_item(self, request, pk=None, item_id=None):
        """Actualizar cantidad de item"""
        try:
            cart = Cart.objects.get(session_id=pk)
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            quantity = request.data.get('quantity')
            
            if quantity is None:
                return Response({'error': 'Quantity must be between 1 and 99'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Ensure quantity is an integer
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                return Response({'error': 'Quantity must be between 1 and 99'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate quantity range (1-99 inclusive)
            if quantity < 1 or quantity > 99:
                return Response({'error': 'Quantity must be between 1 and 99'}, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item.quantity = quantity
            cart_item.save()
            
            # Reload with prefetches for optimized serialization
            optimized_cart = Cart.objects.prefetch_related(
                'items__product__images',
                'items__product__translations',
                'items__selected_options__option__translations',
                'items__selected_options__value__translations'
            ).get(id=cart.id)
            
            cart_serializer = CartSerializer(optimized_cart, context={'request': request})
            return Response({
                'message': 'Cantidad actualizada',
                'cart': cart_serializer.data
            })
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'])
    def clear(self, request, pk=None):
        """Vaciar carrito"""
        try:
            cart = Cart.objects.get(session_id=pk)
            cart.items.all().delete()
            
            # Reload with prefetches for optimized serialization
            optimized_cart = Cart.objects.prefetch_related(
                'items__product__images',
                'items__product__translations',
                'items__selected_options__option__translations',
                'items__selected_options__value__translations'
            ).get(id=cart.id)
            
            cart_serializer = CartSerializer(optimized_cart, context={'request': request})
            return Response({
                'message': 'Carrito vaciado',
                'cart': cart_serializer.data
            })
        except Cart.DoesNotExist:
            return Response({'error': 'Carrito no encontrado'}, status=status.HTTP_404_NOT_FOUND)


# ==============================
# 📦 ORDER VIEWSET
# ==============================

class OrderViewSet(ReadOnlyModelViewSet):
    """
    ViewSet para órdenes
    """
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'email']
    search_fields = ['full_name', 'email', 'address']

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def create_order(self, request):
        """Crear orden desde carrito (con snapshot)"""
        serializer = CreateOrderSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']

        try:
            cart = Cart.objects.get(session_id=session_id)
        except Cart.DoesNotExist:
            return Response({'error': 'Carrito no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if not cart.items.exists():
            return Response({'error': 'Carrito vacío'}, status=status.HTTP_400_BAD_REQUEST)

        # Calcular total
        total_price = 0
        for item in cart.items.all():
            item_price = item.product.base_price
            for opt in item.selected_options.all():
                item_price += opt.value.base_extra_price
            total_price += item_price * item.quantity
            
        shipping_zone = None
        shipping_cost = 0
        if 'shipping_zone_id' in data and data['shipping_zone_id']:
            try:
                shipping_zone = ShippingZone.objects.get(id=data['shipping_zone_id'])
                shipping_cost = shipping_zone.price
                total_price += shipping_cost
            except ShippingZone.DoesNotExist:
                pass
                
        coupon = None
        discount_applied = 0
        if 'coupon_code' in data and data['coupon_code']:
            try:
                coupon = Coupon.objects.get(code=data['coupon_code'], is_active=True)
                if coupon.discount_type == 'fixed':
                    discount_applied = coupon.discount_value
                else:
                    discount_applied = (total_price * coupon.discount_value) / 100
                total_price -= discount_applied
                if total_price < 0: total_price = 0
            except Coupon.DoesNotExist:
                pass

        # Crear orden
        order = Order.objects.create(
            email=data['email'],
            full_name=data['full_name'],
            address=data['address'],
            total_price=total_price,
            shipping_zone=shipping_zone,
            shipping_cost=shipping_cost,
            coupon=coupon,
            discount_applied=discount_applied,
            status='incoming'
        )

        # Crear items de orden (snapshot)
        for item in cart.items.all():
            order_item = OrderItem.objects.create(
                order=order,
                product_name=item.product.name,
                base_price=item.product.base_price,
                quantity=item.quantity
            )

            # Crear opciones de orden (snapshot)
            for opt in item.selected_options.all():
                OrderItemOption.objects.create(
                    order_item=order_item,
                    option_name=opt.option.name,
                    value_name=opt.value.name,
                    extra_price=opt.value.base_extra_price
                )

        # Vaciar carrito
        cart.items.all().delete()

        order_serializer = OrderSerializer(order)
        return Response({
            'message': 'Orden creada exitosamente',
            'order': order_serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Actualizar estado de orden (admin) - solo permite avanzar al siguiente estado"""
        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Orden no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateOrderStatusSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['status']
        current_status = order.status
        
        if new_status == 'cancelled':
            order.status = 'cancelled'
            order.save()
            order_serializer = OrderSerializer(order)
            return Response({
                'message': 'Orden cancelada',
                'order': order_serializer.data
            })
        
        next_allowed = Order.STATUS_FLOW.get(current_status)
        if not next_allowed or new_status != next_allowed:
            return Response({
                'error': f'No se puede cambiar de "{current_status}" a "{new_status}". El siguiente estado permitido es: {next_allowed}'
            }, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()

        order_serializer = OrderSerializer(order)
        return Response({
            'message': 'Estado actualizado',
            'order': order_serializer.data
        })

class ShippingZoneViewSet(ModelViewSet):
    queryset = ShippingZone.objects.all()
    serializer_class = ShippingZoneSerializer
    
class CouponViewSet(ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['code']
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        import random
        import string
        from datetime import datetime, timedelta
        
        code = request.data.get('code') or ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        discount_type = request.data.get('discount_type', 'percent')
        discount_value = request.data.get('discount_value', 10)
        expires_in_months = request.data.get('expires_in_months')
        
        expires_at = None
        if expires_in_months:
            months = int(expires_in_months)
            expires_at = datetime.now() + timedelta(days=months * 30)
        
        coupon = Coupon.objects.create(
            code=code,
            discount_type=discount_type,
            discount_value=discount_value,
            expires_at=expires_at
        )
        return Response(CouponSerializer(coupon).data, status=status.HTTP_201_CREATED)
        
    @action(detail=False, methods=['post'])
    def validate(self, request):
        code = request.data.get('code')
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            return Response(CouponSerializer(coupon).data)
        except Coupon.DoesNotExist:
            return Response({'error': 'Cupón inválido o inactivo'}, status=status.HTTP_404_NOT_FOUND)
