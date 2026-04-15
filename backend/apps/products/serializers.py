from rest_framework import serializers
from .models import (
    Category, CategoryTranslation,
    Product, ProductImage, ProductTranslation,
    Option, OptionTranslation,
    OptionValue, OptionValueTranslation,
    ProductOption
)


# ==============================
# 🔷 SERIALIZERS CON i18n
# ==============================

class CategorySerializer(serializers.ModelSerializer):
    """Serializer de categoría con traducción"""
    
    class Meta:
        model = Category
        fields = ['id', 'name']

    def to_representation(self, instance):
        """Aplica traducción si existe ?lang=xx"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request:
            lang = request.query_params.get('lang', 'es')
            translation = instance.translations.filter(language=lang).first()
            if translation:
                data['name'] = translation.name
        
        return data


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer de imágenes de producto"""
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image']
    
    def get_image(self, obj):
        """Retorna URL absoluta de la imagen"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class OptionValueSerializer(serializers.ModelSerializer):
    """Serializer de valores de opción con traducción"""
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = OptionValue
        fields = ['id', 'name', 'base_extra_price', 'image']
    
    def get_image(self, obj):
        """Retorna URL absoluta de la imagen"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

    def to_representation(self, instance):
        """Aplica traducción si existe ?lang=xx"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request:
            lang = request.query_params.get('lang', 'es')
            translation = instance.translations.filter(language=lang).first()
            if translation:
                data['name'] = translation.name
        
        return data


class OptionSerializer(serializers.ModelSerializer):
    """Serializer de opción con valores y traducción"""
    values = OptionValueSerializer(many=True, read_only=True)

    class Meta:
        model = Option
        fields = ['id', 'name', 'values']

    def to_representation(self, instance):
        """Aplica traducción si existe ?lang=xx"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request:
            lang = request.query_params.get('lang', 'es')
            translation = instance.translations.filter(language=lang).first()
            if translation:
                data['name'] = translation.name
        
        return data


class ProductOptionSerializer(serializers.ModelSerializer):
    """Serializer de opciones de producto"""
    option = OptionSerializer(read_only=True)

    class Meta:
        model = ProductOption
        fields = ['option']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer completo de producto con imágenes, opciones y traducción"""
    images = ProductImageSerializer(many=True, read_only=True)
    product_options = ProductOptionSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'base_price',
            'category',
            'category_name',
            'images',
            'product_options'
        ]

    def to_representation(self, instance):
        """Aplica traducción si existe ?lang=xx"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request:
            lang = request.query_params.get('lang', 'es')
            translation = instance.translations.filter(language=lang).first()
            if translation:
                data['name'] = translation.name
                data['description'] = translation.description
        
        return data


class ProductAdminSerializer(serializers.ModelSerializer):
    """Serializer para admin (crear/editar productos)"""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'base_price', 'category']


class ProductImageUploadSerializer(serializers.ModelSerializer):
    """Serializer para subir imágenes de productos"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image']


class OptionValueAdminSerializer(serializers.ModelSerializer):
    """Serializer para admin (crear/editar valores de opciones)"""
    
    class Meta:
        model = OptionValue
        fields = ['id', 'option', 'name', 'base_extra_price', 'image']


class OptionAdminSerializer(serializers.ModelSerializer):
    """Serializer para admin (crear/editar opciones)"""
    values = OptionValueSerializer(many=True, read_only=True)
    
    class Meta:
        model = Option
        fields = ['id', 'name', 'values']


# ==============================
# 🌍 TRANSLATION SERIALIZERS
# ==============================

class ProductTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTranslation
        fields = ['id', 'product', 'language', 'name', 'description']


class CategoryTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryTranslation
        fields = ['id', 'category', 'language', 'name']


class OptionTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OptionTranslation
        fields = ['id', 'option', 'language', 'name']


class OptionValueTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OptionValueTranslation
        fields = ['id', 'option_value', 'language', 'name']
