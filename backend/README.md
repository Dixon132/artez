# 🎸 ARTESENA BACKEND - DOCUMENTACIÓN COMPLETA

## 📋 RESUMEN

Backend completo para ecommerce de instrumentos andinos con:
- ✅ Productos configurables con opciones dinámicas
- ✅ Carrito sin login (session-based)
- ✅ Órdenes con snapshot inmutable
- ✅ i18n (español, inglés, francés)
- ✅ PostgreSQL
- ✅ Django REST Framework
- ✅ Admin panel completo

---

## 🗂️ ESTRUCTURA DE APPS

```
backend/
├── apps/
│   ├── products/          # Productos, categorías, opciones
│   │   ├── models.py      # 10 modelos (Product, Category, Option, etc + i18n)
│   │   ├── serializers.py # Serializers con soporte i18n
│   │   ├── views.py       # ViewSets con endpoints comentados
│   │   └── admin.py       # Admin con inlines
│   │
│   └── orders/            # Carritos y órdenes
│       ├── models.py      # 6 modelos (Cart, Order, Items, Options)
│       ├── serializers.py # Serializers para cart y orders
│       ├── views.py       # ViewSets con lógica de negocio
│       └── admin.py       # Admin con inlines
│
├── config/
│   ├── settings.py        # PostgreSQL configurado
│   └── urls.py            # URLs con comentarios
│
├── media/                 # Imágenes de productos y opciones
├── API_DOCS.md           # Documentación completa de API
└── populate_db.py        # Script para poblar DB
```

---

## 🔷 MODELOS

### Products App

**Modelos principales:**
- `Category` - Categorías de productos
- `Product` - Productos con precio base
- `ProductImage` - Imágenes de productos
- `Option` - Opciones configurables (Madera, Estuche)
- `OptionValue` - Valores de opciones (Naranjillo, Palo Santo)
- `ProductOption` - Relación many-to-many

**Modelos i18n:**
- `CategoryTranslation`
- `ProductTranslation`
- `OptionTranslation`
- `OptionValueTranslation`

### Orders App

**Carrito:**
- `Cart` - Carrito basado en session_id
- `CartItem` - Items del carrito
- `CartItemOption` - Opciones seleccionadas

**Órdenes:**
- `Order` - Orden con datos del cliente
- `OrderItem` - Items de orden (snapshot)
- `OrderItemOption` - Opciones de orden (snapshot)

---

## 🚀 ENDPOINTS

### Products

```
GET    /api/products/              # Lista productos
GET    /api/products/{id}/         # Detalle producto
POST   /api/products/              # Crear producto (admin)
PUT    /api/products/{id}/         # Actualizar producto (admin)
DELETE /api/products/{id}/         # Eliminar producto (admin)

Query params: ?lang=en (para i18n)
```

### Categories

```
GET    /api/categories/            # Lista categorías
GET    /api/categories/{id}/       # Detalle categoría
POST   /api/categories/            # Crear categoría (admin)
PUT    /api/categories/{id}/       # Actualizar categoría (admin)
DELETE /api/categories/{id}/       # Eliminar categoría (admin)

Query params: ?lang=en (para i18n)
```

### Cart

```
GET    /api/cart/{session_id}/                    # Obtener carrito
POST   /api/cart/add-item/                        # Agregar item
DELETE /api/cart/{session_id}/items/{item_id}/    # Eliminar item
PATCH  /api/cart/{session_id}/items/{item_id}/    # Actualizar cantidad
```

### Orders

```
GET    /api/orders/                # Lista órdenes (admin)
GET    /api/orders/{id}/           # Detalle orden
POST   /api/orders/create/         # Crear orden desde carrito
```

---

## 📝 EJEMPLOS DE USO

### 1. Listar productos con traducción

```bash
GET /api/products/?lang=en
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Professional Charango",
    "description": "Handmade charango...",
    "base_price": "150.00",
    "category": 1,
    "category_name": "Charango",
    "images": [
      { "id": 1, "image": "/media/products/charango1.jpg" }
    ],
    "product_options": [
      {
        "option": {
          "id": 1,
          "name": "Wood",
          "values": [
            { "id": 1, "name": "Naranjillo", "base_extra_price": "0.00" },
            { "id": 2, "name": "Palo Santo", "base_extra_price": "10.00" }
          ]
        }
      }
    ]
  }
]
```

### 2. Agregar producto al carrito

```bash
POST /api/cart/add-item/
Content-Type: application/json

{
  "session_id": "abc123",
  "product_id": 1,
  "quantity": 2,
  "options": [
    { "option_id": 1, "value_id": 2 },
    { "option_id": 2, "value_id": 5 }
  ]
}
```

### 3. Crear orden

```bash
POST /api/orders/create/
Content-Type: application/json

{
  "session_id": "abc123",
  "email": "cliente@example.com",
  "full_name": "Juan Pérez",
  "address": "Calle Falsa 123, La Paz, Bolivia"
}
```

---

## 🔧 CONFIGURACIÓN

### Base de datos

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'artesena_db',
        'USER': 'postgres',
        'PASSWORD': 'admin123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### CORS

```python
CORS_ALLOW_ALL_ORIGINS = True  # Solo para desarrollo
```

---

## 🎯 COMANDOS ÚTILES

### Crear migraciones
```bash
python manage.py makemigrations
```

### Aplicar migraciones
```bash
python manage.py migrate
```

### Crear superusuario
```bash
python manage.py createsuperuser
```

### Poblar base de datos
```bash
python manage.py shell < populate_db.py
```

### Iniciar servidor
```bash
python manage.py runserver
```

---

## 🔑 CREDENCIALES

**Admin Panel:**
- URL: http://127.0.0.1:8000/admin/
- Usuario: `admin`
- Contraseña: `admin123`

**PostgreSQL:**
- Database: `artesena_db`
- Usuario: `postgres`
- Contraseña: `admin123`

---

## 📊 DATOS DE EJEMPLO

El script `populate_db.py` crea:
- 3 categorías (Charango, Ronroco, Walaycho)
- 3 productos profesionales
- 2 opciones (Madera, Estuche)
- 6 valores de opciones
- Traducciones en inglés para todo

---

## 🌍 i18n (INTERNACIONALIZACIÓN)

Todos los endpoints soportan el parámetro `?lang=xx`:

```bash
GET /api/products/?lang=en    # Inglés
GET /api/products/?lang=es    # Español (default)
GET /api/products/?lang=fr    # Francés
```

**Fallback:** Si no existe traducción, se devuelve el campo base.

---

## 🔥 CARACTERÍSTICAS CLAVE

1. **Productos configurables:** Opciones dinámicas reutilizables
2. **Carrito sin login:** Basado en session_id del navegador
3. **Órdenes inmutables:** Snapshot de productos/opciones al momento de compra
4. **i18n desacoplado:** Traducciones en tablas separadas
5. **API RESTful:** Endpoints claros y bien documentados
6. **Admin completo:** Panel con inlines para gestión fácil

---

## 📚 DOCUMENTACIÓN ADICIONAL

Ver `API_DOCS.md` para documentación completa de la API con todos los ejemplos de request/response.

---

## 🚀 PRÓXIMOS PASOS

1. Agregar imágenes a los productos desde el admin
2. Configurar autenticación JWT (opcional)
3. Agregar filtros y búsqueda en productos
4. Implementar paginación
5. Agregar webhooks para notificaciones de órdenes
6. Integrar pasarela de pago

---

## 🎉 ¡LISTO PARA USAR!

El backend está completamente funcional y listo para conectar con el frontend Next.js.
