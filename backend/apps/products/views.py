from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, filters
from django_filters.rest_framework import DjangoFilterBackend
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        """Usa serializer simple para crear/editar, completo para leer"""
        if self.action in ('create', 'update', 'partial_update'):
            return ProductAdminSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        product = serializer.save()
        ProductTranslation.objects.create(
            product=product,
            language='es',
            name=product.name,
            description=product.description
        )
    
    def perform_update(self, serializer):
        product = serializer.save()
        translation, created = ProductTranslation.objects.get_or_create(
            product=product,
            language='es',
            defaults={'name': product.name, 'description': product.description}
        )
        if not created:
            translation.name = product.name
            translation.description = product.description
            translation.save()

    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        """Subir imagen a producto"""
        product = self.get_object()
        image = request.FILES.get('image')
        
        if not image:
            return Response({'error': 'No se proporcionó imagen'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            product_image = ProductImage.objects.create(product=product, image=image)
            serializer = ProductImageUploadSerializer(product_image)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['name']
    search_fields = ['name']
    
    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OptionAdminSerializer
        return OptionSerializer
    
    def perform_create(self, serializer):
        option = serializer.save()
        OptionTranslation.objects.create(
            option=option,
            language='es',
            name=option.name
        )
    
    def perform_update(self, serializer):
        option = serializer.save()
        translation, created = OptionTranslation.objects.get_or_create(
            option=option,
            language='es',
            defaults={'name': option.name}
        )
        if not created:
            translation.name = option.name
            translation.save()


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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['option']
    search_fields = ['name']
    
    def perform_create(self, serializer):
        option_value = serializer.save()
        OptionValueTranslation.objects.create(
            option_value=option_value,
            language='es',
            name=option_value.name
        )
    
    def perform_update(self, serializer):
        option_value = serializer.save()
        translation, created = OptionValueTranslation.objects.get_or_create(
            option_value=option_value,
            language='es',
            defaults={'name': option_value.name}
        )
        if not created:
            translation.name = option_value.name
            translation.save()


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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    
    def perform_create(self, serializer):
        category = serializer.save()
        CategoryTranslation.objects.create(
            category=category,
            language='es',
            name=category.name
        )
    
    def perform_update(self, serializer):
        category = serializer.save()
        translation, created = CategoryTranslation.objects.get_or_create(
            category=category,
            language='es',
            defaults={'name': category.name}
        )
        if not created:
            translation.name = category.name
            translation.save()
