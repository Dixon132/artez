from rest_framework.viewsets import ModelViewSet
from .models import Product, Category
from .serializers import ProductSerializer, ProductAdminSerializer, CategorySerializer


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ProductAdminSerializer
        return ProductSerializer


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
