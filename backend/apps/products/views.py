from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import (
    Product, Category, ProductImage, Option, OptionValue,
    ProductTranslation, CategoryTranslation, OptionTranslation, OptionValueTranslation
)
from .serializers import (
    ProductSerializer, ProductAdminSerializer, CategorySerializer,
    ProductImageUploadSerializer, OptionSerializer, OptionAdminSerializer,
    OptionValueSerializer, OptionValueAdminSerializer,
    ProductTranslationSerializer, CategoryTranslationSerializer,
    OptionTranslationSerializer, OptionValueTranslationSerializer
)


# ==============================
# 📦 PRODUCTS VIEWSET
# ==============================

class ProductViewSet(ModelViewSet):
    """
    ViewSet para productos con soporte i18n
    
    ENDPOINTS:
    
    GET /api/products/
    - Lista todos los productos
    - Query params: ?lang=en (para traducción)
    
    GET /api/products/{id}/
    - Detalle de un producto
    
    POST /api/products/
    - Crear producto (admin)
    - Body: { name, description, base_price, category }
    
    PUT /api/products/{id}/
    - Actualizar producto (admin)
    
    DELETE /api/products/{id}/
    - Eliminar producto (admin)
    
    POST /api/products/{id}/upload-image/
    - Subir imagen a producto
    - Body: FormData con 'image'
    
    DELETE /api/products/{id}/delete-image/{image_id}/
    - Eliminar imagen de producto
    """
    queryset = Product.objects.all()

    def get_serializer_class(self):
        """Usa serializer simple para crear/editar, completo para leer"""
        if self.action in ('create', 'update', 'partial_update'):
            return ProductAdminSerializer
        return ProductSerializer

    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        """Subir imagen a producto"""
        product = self.get_object()
        image = request.FILES.get('image')
        
        if not image:
            return Response({'error': 'No se proporcionó imagen'}, status=status.HTTP_400_BAD_REQUEST)
        
        product_image = ProductImage.objects.create(product=product, image=image)
        serializer = ProductImageUploadSerializer(product_image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='delete-image/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """Eliminar imagen de producto"""
        try:
            product = self.get_object()
            image = ProductImage.objects.get(id=image_id, product=product)
            image.delete()
            return Response({'message': 'Imagen eliminada'}, status=status.HTTP_204_NO_CONTENT)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)


# ==============================
# 🗂️ CATEGORIES VIEWSET
# ==============================

class CategoryViewSet(ModelViewSet):
    """
    ViewSet para categorías con soporte i18n
    
    ENDPOINTS:
    
    GET /api/categories/
    - Lista todas las categorías
    
    POST /api/categories/
    - Crear categoría (admin)
    
    PUT /api/categories/{id}/
    - Actualizar categoría (admin)
    
    DELETE /api/categories/{id}/
    - Eliminar categoría (admin)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# ==============================
# 🎛️ OPTIONS VIEWSET
# ==============================

class OptionViewSet(ModelViewSet):
    """
    ViewSet para opciones
    
    ENDPOINTS:
    
    GET /api/options/
    - Lista todas las opciones con sus valores
    
    POST /api/options/
    - Crear opción (admin)
    
    PUT /api/options/{id}/
    - Actualizar opción (admin)
    
    DELETE /api/options/{id}/
    - Eliminar opción (admin)
    """
    queryset = Option.objects.all()
    
    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OptionAdminSerializer
        return OptionSerializer


# ==============================
# 🎚️ OPTION VALUES VIEWSET
# ==============================

class OptionValueViewSet(ModelViewSet):
    """
    ViewSet para valores de opciones
    
    ENDPOINTS:
    
    GET /api/option-values/
    - Lista todos los valores de opciones
    
    POST /api/option-values/
    - Crear valor de opción (admin)
    - Body: FormData con { option, name, base_extra_price, image }
    
    PUT /api/option-values/{id}/
    - Actualizar valor de opción (admin)
    
    DELETE /api/option-values/{id}/
    - Eliminar valor de opción (admin)
    """
    queryset = OptionValue.objects.all()
    serializer_class = OptionValueAdminSerializer


# ==============================
# 🌍 TRANSLATIONS VIEWSETS
# ==============================

class ProductTranslationViewSet(ModelViewSet):
    queryset = ProductTranslation.objects.all()
    serializer_class = ProductTranslationSerializer


class CategoryTranslationViewSet(ModelViewSet):
    queryset = CategoryTranslation.objects.all()
    serializer_class = CategoryTranslationSerializer


class OptionTranslationViewSet(ModelViewSet):
    queryset = OptionTranslation.objects.all()
    serializer_class = OptionTranslationSerializer


class OptionValueTranslationViewSet(ModelViewSet):
    queryset = OptionValueTranslation.objects.all()
    serializer_class = OptionValueTranslationSerializer
