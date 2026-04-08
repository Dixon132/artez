from django.contrib import admin
from .models import Category, Product, ProductImage, Option, OptionValue, ProductOption

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(Option)
admin.site.register(OptionValue)
admin.site.register(ProductOption)
