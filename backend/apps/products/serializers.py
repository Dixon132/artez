from rest_framework import serializers
from .models import (
    Category,
    Product,
    ProductImage,
    Option,
    OptionValue,
    ProductOption
)

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

# 🔷 IMÁGENES

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']


# 🔷 VALORES DE OPCIÓN

class OptionValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = OptionValue
        fields = ['id', 'name', 'base_extra_price', 'image']


# 🔷 OPCIÓN CON VALORES 

class OptionSerializer(serializers.ModelSerializer):
    values = OptionValueSerializer(many=True)

    class Meta:
        model = Option
        fields = ['id', 'name', 'values']


# 🔷 PRODUCT OPTION (solo devuelve opción completa)

class ProductOptionSerializer(serializers.ModelSerializer):
    option = OptionSerializer()

    class Meta:
        model = ProductOption
        fields = ['option']


# 🔷 PRODUCTO COMPLETO (lectura - frontend)

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    product_options = ProductOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'base_price',
            'category',
            'images',
            'product_options'
        ]


# 🔷 PRODUCTO ADMIN (escritura simple)

class ProductAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'base_price', 'category']