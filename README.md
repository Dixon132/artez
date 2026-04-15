# 🎸 ARTESENA - E-COMMERCE COMPLETO

## ✅ PROYECTO COMPLETADO

Sistema completo de e-commerce para instrumentos andinos bolivianos con backend Django + PostgreSQL y frontend Next.js.

---

## 🔷 BACKEND (Django + PostgreSQL)

### Características:
- ✅ **PostgreSQL** como base de datos
- ✅ **Django REST Framework** para APIs
- ✅ **Productos configurables** con opciones dinámicas
- ✅ **Carrito session-based** (sin login)
- ✅ **Órdenes con snapshot** inmutable
- ✅ **i18n** (español, inglés, francés)
- ✅ **Upload de imágenes** para productos y opciones
- ✅ **Admin panel** completo con inlines

### Modelos:
**Products:**
- Category, Product, ProductImage
- Option, OptionValue, ProductOption
- 4 modelos de traducción (i18n)

**Orders:**
- Cart, CartItem, CartItemOption
- Order (con estados), OrderItem, OrderItemOption

### APIs Principales:
```
GET    /api/products/              # Lista productos
POST   /api/products/              # Crear producto
POST   /api/products/{id}/upload-image/  # Subir imagen
DELETE /api/products/{id}/delete-image/{image_id}/  # Eliminar imagen

GET    /api/categories/            # Lista categorías
POST   /api/categories/            # Crear categoría

GET    /api/options/               # Lista opciones
POST   /api/option-values/         # Crear valor de opción (con imagen)

GET    /api/cart/{session_id}/     # Obtener carrito
POST   /api/cart/add-item/         # Agregar al carrito
PATCH  /api/cart/{session_id}/items/{item_id}/  # Actualizar cantidad
DELETE /api/cart/{session_id}/items/{item_id}/  # Eliminar item

GET    /api/orders/                # Lista órdenes
POST   /api/orders/create/         # Crear orden
PATCH  /api/orders/{id}/update-status/  # Cambiar estado
```

### Credenciales:
- **Admin Django**: admin / admin123
- **PostgreSQL**: postgres / admin123
- **Database**: artesena_db

---

## 🔷 FRONTEND (Next.js + Tailwind)

### Características:
- ✅ **Panel Admin completo** con CRUD de productos, categorías, opciones
- ✅ **Upload de imágenes** con preview
- ✅ **Gestión de órdenes** con cambio de estado
- ✅ **Catálogo de productos** con API real
- ✅ **Detalle de producto** con selección de opciones
- ✅ **Carrito funcional** con gestión de items
- ✅ **Checkout** con formulario de orden
- ✅ **Validaciones** en todos los formularios
- ✅ **Notificaciones** de éxito/error
- ✅ **Diseño responsive** y minimalista

### Páginas Admin:
1. **Dashboard** (`/admin`)
   - Vista general con accesos rápidos

2. **Productos** (`/admin/products`)
   - CRUD completo
   - Upload múltiple de imágenes
   - Vista en grid con cards
   - Modal para crear/editar
   - Modal para gestionar imágenes

3. **Categorías** (`/admin/categories`)
   - CRUD simple
   - Tabla con acciones inline

4. **Órdenes** (`/admin/orders`)
   - Lista de órdenes
   - Cambio de estado (pending, processing, shipped, delivered, cancelled)
   - Modal con detalle completo
   - Vista de items y opciones

5. **Carritos** (`/admin/carts`)
   - Información sobre el sistema de carritos
   - Solo visualización (se gestionan automáticamente)

### Páginas Públicas:
1. **Home** (`/`)
   - Hero con Vanta.js waves
   - Secciones con animaciones GSAP

2. **Productos** (`/products`)
   - Catálogo completo
   - Cards con hover effects
   - Imágenes desde API

3. **Detalle** (`/products/[id]`)
   - Galería de imágenes
   - Selección de opciones
   - Selector de cantidad
   - Agregar al carrito
   - Validación de opciones requeridas

4. **Carrito** (`/cart`)
   - Lista de items
   - Actualizar cantidad
   - Eliminar items
   - Resumen de compra
   - Checkout con formulario

### Servicios API:
Archivo: `frontend/src/services/api.ts`
- `productsApi`: CRUD + upload/delete imágenes
- `categoriesApi`: CRUD
- `optionsApi`: CRUD
- `optionValuesApi`: CRUD con imágenes
- `cartApi`: get, addItem, updateItem, removeItem, clear
- `ordersApi`: list, get, create, updateStatus
- `getSessionId()`: Genera/obtiene session_id único

---

## 🚀 CÓMO USAR

### Backend:
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### Frontend:
```bash
cd frontend
npm run dev
```

### URLs:
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000/api/
- **Admin Django**: http://127.0.0.1:8000/admin/
- **Admin Panel**: http://localhost:3000/admin

---

## 📊 FLUJO COMPLETO

### 1. Admin agrega productos:
1. Ir a `/admin/products`
2. Click en "Nuevo Producto"
3. Llenar formulario (nombre, descripción, precio, categoría)
4. Guardar
5. Click en ícono de imagen
6. Subir imágenes
7. Producto listo

### 2. Cliente compra:
1. Navegar a `/products`
2. Click en producto
3. Seleccionar opciones (madera, estuche, etc.)
4. Seleccionar cantidad
5. Click "Agregar al carrito"
6. Ir a `/cart`
7. Revisar items
8. Click "Finalizar Compra"
9. Llenar formulario (email, nombre, dirección)
10. Confirmar
11. Orden creada

### 3. Admin gestiona orden:
1. Ir a `/admin/orders`
2. Ver lista de órdenes
3. Click "Ver detalle"
4. Cambiar estado (pending → processing → shipped → delivered)
5. Cliente recibe notificación (futuro)

---

## 🔑 CARACTERÍSTICAS CLAVE

### Backend:
- **Snapshot en órdenes**: Los productos y opciones se guardan como texto, no como FK
- **Session-based cart**: No requiere login
- **i18n**: Traducciones en tablas separadas
- **Upload de imágenes**: Productos y opciones tienen imágenes
- **Estados de orden**: pending, processing, shipped, delivered, cancelled

### Frontend:
- **Admin moderno**: Sin emojis, con iconos SVG
- **Sidebar flotante**: Con sombra y bordes redondeados
- **Modales**: Para crear/editar/ver detalles
- **Validaciones**: En todos los formularios
- **Feedback visual**: Notificaciones de éxito/error
- **Responsive**: Funciona en mobile y desktop

---

## 📝 DATOS DE EJEMPLO

El backend incluye 3 productos de ejemplo:
- Charango Profesional ($150)
- Ronroco Profesional ($200)
- Walaycho Tradicional ($120)

Con opciones:
- **Madera**: Naranjillo (+$0), Palo Santo (+$10), Quina Quina (+$15)
- **Estuche**: Sin estuche (+$0), Básico (+$20), Premium (+$50)

---

## 🎯 PRÓXIMOS PASOS

1. Agregar autenticación de usuarios
2. Implementar pasarela de pago
3. Agregar notificaciones por email
4. Implementar búsqueda y filtros
5. Agregar reviews de productos
6. Implementar wishlist
7. Agregar tracking de envíos
8. Implementar analytics

---

## 🎉 ¡PROYECTO LISTO!

Todo el sistema está funcional y listo para usar. El backend y frontend están completamente integrados y funcionando.
