from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Cart, CartItem, CartItemOption, Order, OrderItem, OrderItemOption
from .serializers import (
    CartSerializer, AddToCartSerializer, 
    OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer
)
from apps.products.models import Product, Option, OptionValue


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
        """Obtener carrito por session_id"""
        try:
            cart = Cart.objects.get(session_id=pk)
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data)
        except Cart.DoesNotExist:
            # Crear carrito vacío si no existe
            cart = Cart.objects.create(session_id=pk)
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Agregar producto al carrito con opciones"""
        serializer = AddToCartSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        session_id = data['session_id']
        product_id = data['product_id']
        quantity = data.get('quantity', 1)
        options = data.get('options', [])

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

        cart_serializer = CartSerializer(cart, context={'request': request})
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
            
            cart_serializer = CartSerializer(cart, context={'request': request})
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
            
            if quantity and quantity > 0:
                cart_item.quantity = quantity
                cart_item.save()
                
                cart_serializer = CartSerializer(cart, context={'request': request})
                return Response({
                    'message': 'Cantidad actualizada',
                    'cart': cart_serializer.data
                })
            else:
                return Response({'error': 'Cantidad inválida'}, status=status.HTTP_400_BAD_REQUEST)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'error': 'Item no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['delete'])
    def clear(self, request, pk=None):
        """Vaciar carrito"""
        try:
            cart = Cart.objects.get(session_id=pk)
            cart.items.all().delete()
            
            cart_serializer = CartSerializer(cart, context={'request': request})
            return Response({
                'message': 'Carrito vaciado',
                'cart': cart_serializer.data
            })
        except Cart.DoesNotExist:
            return Response({'error': 'Carrito no encontrado'}, status=status.HTTP_404_NOT_FOUND)


# ==============================
# 📦 ORDER VIEWSET
# ==============================

class OrderViewSet(ViewSet):
    """
    ViewSet para órdenes
    
    ENDPOINTS:
    
    GET /api/orders/
    - Listar todas las órdenes (admin)
    
    GET /api/orders/{id}/
    - Detalle de orden
    
    POST /api/orders/create/
    - Crear orden desde carrito
    
    PATCH /api/orders/{id}/update-status/
    - Actualizar estado de orden (admin)
    """

    def list(self, request):
        """Listar todas las órdenes"""
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Detalle de orden"""
        try:
            order = Order.objects.get(id=pk)
            serializer = OrderSerializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response({'error': 'Orden no encontrada'}, status=status.HTTP_404_NOT_FOUND)

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

        # Crear orden
        order = Order.objects.create(
            email=data['email'],
            full_name=data['full_name'],
            address=data['address'],
            total_price=total_price,
            status='pending'
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
        """Actualizar estado de orden (admin)"""
        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Orden no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateOrderStatusSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order.status = serializer.validated_data['status']
        order.save()

        order_serializer = OrderSerializer(order)
        return Response({
            'message': 'Estado actualizado',
            'order': order_serializer.data
        })
