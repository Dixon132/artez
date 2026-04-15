from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ==============================
# 🔷 URL CONFIGURATION
# ==============================
# 
# ESTRUCTURA DE APIs:
# 
# /admin/                    - Panel de administración Django
# /api/products/             - Productos (GET con ?lang=en para i18n)
# /api/categories/           - Categorías (GET con ?lang=en para i18n)
# /api/cart/                 - Carrito (session-based)
# /api/orders/               - Órdenes
# /media/                    - Archivos estáticos (imágenes)
# 
# ==============================

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.orders.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
