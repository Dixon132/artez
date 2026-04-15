from django.db import models


# ==============================
# 🔷 CORE - Modelo base con timestamps
# ==============================

class TimeStampedModel(models.Model):
    """Modelo abstracto que agrega created_at y updated_at a cualquier modelo que lo herede"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ==============================
# 🔷 PRODUCTS - Modelos principales
# ==============================

class Category(models.Model):
    """Categoría de productos (Charango, Ronroco, Walaycho)"""
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Option(models.Model):
    """Opción configurable global (Madera, Estuche, Tamaño)"""
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class OptionValue(models.Model):
    """Valor de una opción (Naranjillo, Palo Santo, Premium)"""
    option = models.ForeignKey(Option, on_delete=models.CASCADE, related_name='values')
    name = models.CharField(max_length=100)
    base_extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='options/', blank=True, null=True)

    def __str__(self):
        return f"{self.option.name} - {self.name}"


class Product(models.Model):
    """Producto principal con precio base y opciones configurables"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    options = models.ManyToManyField(Option, through='ProductOption')

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Imágenes de un producto"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return f"Imagen de {self.product.name}"


class ProductOption(models.Model):
    """Tabla intermedia: qué opciones tiene cada producto"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_options')
    option = models.ForeignKey(Option, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.product.name} - {self.option.name}"


# ==============================
# 🌍 i18n - Traducciones
# ==============================

class ProductTranslation(models.Model):
    """Traducciones de productos"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='translations')
    language = models.CharField(max_length=10)  # 'es', 'en', 'fr'
    name = models.CharField(max_length=255)
    description = models.TextField()

    class Meta:
        unique_together = ('product', 'language')

    def __str__(self):
        return f"{self.product.name} ({self.language})"


class CategoryTranslation(models.Model):
    """Traducciones de categorías"""
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='translations')
    language = models.CharField(max_length=10)
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = ('category', 'language')

    def __str__(self):
        return f"{self.category.name} ({self.language})"


class OptionTranslation(models.Model):
    """Traducciones de opciones"""
    option = models.ForeignKey(Option, on_delete=models.CASCADE, related_name='translations')
    language = models.CharField(max_length=10)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('option', 'language')

    def __str__(self):
        return f"{self.option.name} ({self.language})"


class OptionValueTranslation(models.Model):
    """Traducciones de valores de opciones"""
    option_value = models.ForeignKey(OptionValue, on_delete=models.CASCADE, related_name='translations')
    language = models.CharField(max_length=10)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ('option_value', 'language')

    def __str__(self):
        return f"{self.option_value.name} ({self.language})"
