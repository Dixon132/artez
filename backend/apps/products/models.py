from django.db import models


# 🔷 CATEGORÍA

class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# 🔷 OPCIONES GLOBALES

class Option(models.Model):
    name = models.CharField(max_length=100)  # Ej: Madera, Estuche

    def __str__(self):
        return self.name


class OptionValue(models.Model):
    option = models.ForeignKey(Option, on_delete=models.CASCADE, related_name='values')
    name = models.CharField(max_length=100)
    base_extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='options/')

    def __str__(self):
        return f"{self.option.name} - {self.name}"


# 🔷 PRODUCTO

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')

    # 🔥 AQUÍ ESTÁ LA CLAVE
    options = models.ManyToManyField(Option, through='ProductOption')

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return f"Imagen de {self.product.name}"

# 🔥 TABLA INTERMEDIA (PRODUCTO ↔ OPCIÓN)

class ProductOption(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_options')
    option = models.ForeignKey(Option, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.product.name} - {self.option.name}"
