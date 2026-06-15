import os
import random
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from apps.products.models import Product, ProductImage

MEDIA_PRODUCTS = os.path.join(settings.MEDIA_ROOT, 'products')

all_files = [
    f for f in os.listdir(MEDIA_PRODUCTS)
    if os.path.isfile(os.path.join(MEDIA_PRODUCTS, f))
    and f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))
]

print(f"Found {len(all_files)} image files in media/products/")

already_used = set(
    ProductImage.objects.values_list('image', flat=True)
)
# strip the 'products/' prefix from stored paths
already_used_basenames = {os.path.basename(p) for p in already_used}
print(f"Already assigned: {len(already_used_basenames)} images")

available = [f for f in all_files if f not in already_used_basenames]
print(f"Available for assignment: {len(available)} images")

products = [p for p in Product.objects.all() if p.images.count() == 0]

print(f"Products without images: {len(products)}")
for p in products:
    print(f"  ID:{p.id}  name:{p.name}")

random.shuffle(available)
images_per_product = 5
total_needed = len(products) * images_per_product

if len(available) < total_needed:
    print(f"WARNING: Need {total_needed} but only have {len(available)} available!")

idx = 0
for product in products:
    assigned = 0
    while assigned < images_per_product and idx < len(available):
        filename = available[idx]
        relative_path = f'products/{filename}'
        ProductImage.objects.create(product=product, image=relative_path)
        assigned += 1
        idx += 1
    print(f"  -> Assigned {assigned} images to product {product.id} ({product.name})")

print("\nDone!")
