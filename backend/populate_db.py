"""
Script para poblar la base de datos con datos de ejemplo
Ejecutar: python manage.py shell < populate_db.py
"""

from apps.products.models import Category, Product, Option, OptionValue, ProductOption
from apps.products.models import CategoryTranslation, ProductTranslation, OptionTranslation, OptionValueTranslation

print("🔷 Creando categorías...")

# Categorías
charango_cat = Category.objects.create(name="Charango")
ronroco_cat = Category.objects.create(name="Ronroco")
walaycho_cat = Category.objects.create(name="Walaycho")

# Traducciones de categorías
CategoryTranslation.objects.create(category=charango_cat, language="en", name="Charango")
CategoryTranslation.objects.create(category=ronroco_cat, language="en", name="Ronroco")
CategoryTranslation.objects.create(category=walaycho_cat, language="en", name="Walaycho")

print("✅ Categorías creadas")

print("🔷 Creando opciones...")

# Opciones
madera_opt = Option.objects.create(name="Madera")
estuche_opt = Option.objects.create(name="Estuche")

# Traducciones de opciones
OptionTranslation.objects.create(option=madera_opt, language="en", name="Wood")
OptionTranslation.objects.create(option=estuche_opt, language="en", name="Case")

print("✅ Opciones creadas")

print("🔷 Creando valores de opciones...")

# Valores de Madera
naranjillo = OptionValue.objects.create(
    option=madera_opt,
    name="Naranjillo",
    base_extra_price=0
)
palo_santo = OptionValue.objects.create(
    option=madera_opt,
    name="Palo Santo",
    base_extra_price=10
)
quina_quina = OptionValue.objects.create(
    option=madera_opt,
    name="Quina Quina",
    base_extra_price=15
)

# Traducciones de valores de madera
OptionValueTranslation.objects.create(option_value=naranjillo, language="en", name="Naranjillo")
OptionValueTranslation.objects.create(option_value=palo_santo, language="en", name="Palo Santo")
OptionValueTranslation.objects.create(option_value=quina_quina, language="en", name="Quina Quina")

# Valores de Estuche
sin_estuche = OptionValue.objects.create(
    option=estuche_opt,
    name="Sin estuche",
    base_extra_price=0
)
estuche_basico = OptionValue.objects.create(
    option=estuche_opt,
    name="Estuche básico",
    base_extra_price=20
)
estuche_premium = OptionValue.objects.create(
    option=estuche_opt,
    name="Estuche premium",
    base_extra_price=50
)

# Traducciones de valores de estuche
OptionValueTranslation.objects.create(option_value=sin_estuche, language="en", name="No case")
OptionValueTranslation.objects.create(option_value=estuche_basico, language="en", name="Basic case")
OptionValueTranslation.objects.create(option_value=estuche_premium, language="en", name="Premium case")

print("✅ Valores de opciones creados")

print("🔷 Creando productos...")

# Productos
charango_pro = Product.objects.create(
    name="Charango Profesional",
    description="Charango hecho a mano por artesanos bolivianos. Sonido cálido y profundo.",
    base_price=150.00,
    category=charango_cat
)

ronroco_pro = Product.objects.create(
    name="Ronroco Profesional",
    description="Ronroco de alta calidad con acabado artesanal. Ideal para música andina.",
    base_price=200.00,
    category=ronroco_cat
)

walaycho_pro = Product.objects.create(
    name="Walaycho Tradicional",
    description="Walaycho tradicional boliviano. Sonido brillante y alegre.",
    base_price=120.00,
    category=walaycho_cat
)

# Traducciones de productos
ProductTranslation.objects.create(
    product=charango_pro,
    language="en",
    name="Professional Charango",
    description="Handmade charango by Bolivian artisans. Warm and deep sound."
)

ProductTranslation.objects.create(
    product=ronroco_pro,
    language="en",
    name="Professional Ronroco",
    description="High quality ronroco with artisan finish. Ideal for Andean music."
)

ProductTranslation.objects.create(
    product=walaycho_pro,
    language="en",
    name="Traditional Walaycho",
    description="Traditional Bolivian walaycho. Bright and cheerful sound."
)

print("✅ Productos creados")

print("🔷 Asignando opciones a productos...")

# Asignar opciones a productos
ProductOption.objects.create(product=charango_pro, option=madera_opt)
ProductOption.objects.create(product=charango_pro, option=estuche_opt)

ProductOption.objects.create(product=ronroco_pro, option=madera_opt)
ProductOption.objects.create(product=ronroco_pro, option=estuche_opt)

ProductOption.objects.create(product=walaycho_pro, option=madera_opt)
ProductOption.objects.create(product=walaycho_pro, option=estuche_opt)

print("✅ Opciones asignadas")

print("\n🎉 Base de datos poblada exitosamente!")
print("\n📊 Resumen:")
print(f"   - {Category.objects.count()} categorías")
print(f"   - {Product.objects.count()} productos")
print(f"   - {Option.objects.count()} opciones")
print(f"   - {OptionValue.objects.count()} valores de opciones")
print("\n🔑 Credenciales admin:")
print("   - Usuario: admin")
print("   - Contraseña: admin123")
print("   - URL: http://127.0.0.1:8000/admin/")
