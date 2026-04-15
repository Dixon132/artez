from django.contrib import admin
from .models import (
    Category, CategoryTranslation,
    Product, ProductImage, ProductTranslation, ProductOption,
    Option, OptionTranslation,
    OptionValue, OptionValueTranslation
)


# ==============================
# 🔷 INLINES
# ==============================

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductOptionInline(admin.TabularInline):
    model = ProductOption
    extra = 1


class ProductTranslationInline(admin.TabularInline):
    model = ProductTranslation
    extra = 1


class CategoryTranslationInline(admin.TabularInline):
    model = CategoryTranslation
    extra = 1


class OptionValueInline(admin.TabularInline):
    model = OptionValue
    extra = 1


class OptionTranslationInline(admin.TabularInline):
    model = OptionTranslation
    extra = 1


class OptionValueTranslationInline(admin.TabularInline):
    model = OptionValueTranslation
    extra = 1


# ==============================
# 🔷 ADMIN MODELS
# ==============================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    inlines = [CategoryTranslationInline]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'base_price', 'category']
    list_filter = ['category']
    search_fields = ['name']
    inlines = [ProductImageInline, ProductOptionInline, ProductTranslationInline]


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    inlines = [OptionValueInline, OptionTranslationInline]


@admin.register(OptionValue)
class OptionValueAdmin(admin.ModelAdmin):
    list_display = ['id', 'option', 'name', 'base_extra_price']
    list_filter = ['option']
    inlines = [OptionValueTranslationInline]
