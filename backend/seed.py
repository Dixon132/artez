import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.products.models import Category, Option, OptionValue, Product, ProductOption

# Limpiar datos previos
ProductOption.objects.all().delete()
Product.objects.all().delete()
OptionValue.objects.all().delete()
Option.objects.all().delete()
Category.objects.all().delete()

# ── Categorías ──
cat_charango  = Category.objects.create(name="Charango")
cat_ronroco   = Category.objects.create(name="Ronroco")
cat_walaycho  = Category.objects.create(name="Walaycho")

# ── Opciones globales ──
opt_madera  = Option.objects.create(name="Madera")
opt_estuche = Option.objects.create(name="Estuche")

# ── Valores de Madera ──
OptionValue.objects.create(option=opt_madera, name="Naranjillo",  base_extra_price=0)
OptionValue.objects.create(option=opt_madera, name="Palo Santo",  base_extra_price=10)
OptionValue.objects.create(option=opt_madera, name="Quina Quina", base_extra_price=15)

# ── Valores de Estuche ──
OptionValue.objects.create(option=opt_estuche, name="Sin estuche", base_extra_price=0)
OptionValue.objects.create(option=opt_estuche, name="Básico",      base_extra_price=20)
OptionValue.objects.create(option=opt_estuche, name="Premium",     base_extra_price=50)

# ── Productos ──
p1 = Product.objects.create(
    name="Charango Profesional",
    description="Charango artesanal de alta calidad, tallado a mano con maderas nobles de los Andes bolivianos.",
    base_price=150,
    category=cat_charango,
)
p2 = Product.objects.create(
    name="Ronroco Profesional",
    description="Ronroco de concierto con cuerpo profundo y sonido cálido, ideal para música andina tradicional.",
    base_price=200,
    category=cat_ronroco,
)
p3 = Product.objects.create(
    name="Walaycho Tradicional",
    description="Walaycho pequeño y ligero, perfecto para principiantes y viajeros que quieren llevar los Andes consigo.",
    base_price=120,
    category=cat_walaycho,
)

# ── Asignar opciones a productos ──
for product in [p1, p2, p3]:
    ProductOption.objects.create(product=product, option=opt_madera)
    ProductOption.objects.create(product=product, option=opt_estuche)

print("Seed completado:")
print(f"  {Category.objects.count()} categorias")
print(f"  {Option.objects.count()} opciones")
print(f"  {OptionValue.objects.count()} valores de opcion")
print(f"  {Product.objects.count()} productos")
print(f"  {ProductOption.objects.count()} relaciones producto-opcion")
