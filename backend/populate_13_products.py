import os
import random
import sys
from decimal import Decimal
from django.core.files import File

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from apps.products.models import Product, ProductImage, Category, Option

def run():
    images_dir = r"C:\Users\diego\Desktop\web\PROD\images"
    
    charango_names = [
        "Charango Maestro Andino",
        "Ronroco Voces del Viento",
        "Charango Quirquincho Clásico",
        "Walaycho Alma de la Puna",
        "Charango Naranjillo Premium",
        "Charango Jacarandá Imperial",
        "Ronroco Kjarkas Edición Limitada",
        "Charango Inti Raymi",
        "Walaycho Cantos de la Sierra",
        "Charango Diablo de Oruro",
        "Charango Llaqta Madera Fina",
        "Ronroco Sonidos del Valle",
        "Charango Cóndor de los Andes"
    ]
    
    categories = list(Category.objects.all())
    options = list(Option.objects.all()) if hasattr(Option, 'objects') else []
    
    for i in range(1, 14):
        folder_path = os.path.join(images_dir, str(i))
        if not os.path.exists(folder_path):
            print(f"Folder {folder_path} not found. Skipping.")
            continue
            
        name = charango_names[i - 1]
        
        # Decide category based on name roughly
        if "Ronroco" in name:
            cat = next((c for c in categories if c.name.lower() == 'ronroco'), categories[0])
        elif "Walaycho" in name:
            cat = next((c for c in categories if c.name.lower() == 'walaycho'), categories[0])
        else:
            cat = next((c for c in categories if c.name.lower() == 'charango'), categories[0])
            
        desc = f"Instrumento de alta calidad fabricado artesanalmente. El {name} destaca por su excelente resonancia, maderas selectas y un acabado impecable que refleja la verdadera tradición andina."
        price = Decimal(str(random.randint(250, 850)))
        
        product = Product.objects.create(
            name=name,
            description=desc,
            base_price=price,
            category=cat
        )
        
        # Assign some random options if they exist
        if options:
            selected_opts = random.sample(options, min(2, len(options)))
            product.options.set(selected_opts)
            
        # Add images
        for filename in os.listdir(folder_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                file_path = os.path.join(folder_path, filename)
                with open(file_path, 'rb') as f:
                    pi = ProductImage(product=product)
                    pi.image.save(filename, File(f), save=True)
                    
        print(f"Created product: {name} with images from folder {i}")

if __name__ == "__main__":
    run()
