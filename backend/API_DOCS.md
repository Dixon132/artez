# ==============================
# 📚 DOCUMENTACIÓN DE API - ARTESENA
# ==============================

## ARQUITECTURA

Este backend está diseñado como un ecommerce modular con:
- Productos configurables (opciones dinámicas)
- Carrito sin login (session-based)
- Órdenes con snapshot (inmutables)
- i18n (traducciones en español, inglés, etc.)

---

## 🔷 PRODUCTS API

### GET /api/products/
Lista todos los productos con imágenes y opciones

**Query params:**
- `?lang=en` - Idioma de traducción (es, en, fr)

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Charango Profesional",
    "description": "Charango hecho a mano...",
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
          "name": "Madera",
          "values": [
            { "id": 1, "name": "Naranjillo", "base_extra_price": "0.00", "image": "/media/options/naranjillo.png" },
            { "id": 2, "name": "Palo Santo", "base_extra_price": "10.00", "image": "/media/options/palo_santo.png" }
          ]
        }
      }
    ]
  }
]
```

### GET /api/products/{id}/?lang=en
Detalle de un producto específico

### POST /api/products/
Crear producto (admin)

**Body:**
```json
{
  "name": "Charango Profesional",
  "description": "Descripción...",
  "base_price": 150.00,
  "category": 1
}
```

---

## 🗂️ CATEGORIES API

### GET /api/categories/?lang=en
Lista todas las categorías

**Respuesta:**
```json
[
  { "id": 1, "name": "Charango" },
  { "id": 2, "name": "Ronroco" }
]
```

---

## 🛒 CART API

### GET /api/cart/{session_id}/
Obtener carrito por session_id

**Respuesta:**
```json
{
  "id": 1,
  "session_id": "abc123",
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": 1,
      "product": 1,
      "product_name": "Charango Profesional",
      "product_price": "150.00",
      "quantity": 2,
      "selected_options": [
        {
          "id": 1,
          "option": 1,
          "value": 2,
          "option_name": "Madera",
          "value_name": "Palo Santo",
          "extra_price": "10.00"
        }
      ]
    }
  ]
}
```

### POST /api/cart/add-item/
Agregar producto al carrito

**Body:**
```json
{
  "session_id": "abc123",
  "product_id": 1,
  "quantity": 2,
  "options": [
    { "option_id": 1, "value_id": 2 },
    { "option_id": 3, "value_id": 5 }
  ]
}
```

**Respuesta:**
```json
{
  "message": "Producto agregado al carrito",
  "cart": { ... }
}
```

### DELETE /api/cart/{session_id}/items/{item_id}/
Eliminar item del carrito

### PATCH /api/cart/{session_id}/items/{item_id}/
Actualizar cantidad de item

**Body:**
```json
{
  "quantity": 3
}
```

---

## 📦 ORDERS API

### GET /api/orders/
Listar todas las órdenes (admin)

### GET /api/orders/{id}/
Detalle de orden

**Respuesta:**
```json
{
  "id": 1,
  "email": "cliente@example.com",
  "full_name": "Juan Pérez",
  "address": "Calle Falsa 123, La Paz, Bolivia",
  "total_price": "320.00",
  "created_at": "2024-01-15T11:00:00Z",
  "items": [
    {
      "id": 1,
      "product_name": "Charango Profesional",
      "base_price": "150.00",
      "quantity": 2,
      "options": [
        {
          "id": 1,
          "option_name": "Madera",
          "value_name": "Palo Santo",
          "extra_price": "10.00"
        }
      ]
    }
  ]
}
```

### POST /api/orders/create/
Crear orden desde carrito

**Body:**
```json
{
  "session_id": "abc123",
  "email": "cliente@example.com",
  "full_name": "Juan Pérez",
  "address": "Calle Falsa 123, La Paz, Bolivia"
}
```

**Respuesta:**
```json
{
  "message": "Orden creada exitosamente",
  "order": { ... }
}
```

**NOTA:** Esta acción:
1. Calcula el total del carrito
2. Crea snapshot de productos y opciones
3. Vacía el carrito

---

## 🌍 i18n (INTERNACIONALIZACIÓN)

Todos los endpoints de productos, categorías y opciones soportan traducciones.

**Uso:**
```
GET /api/products/?lang=en
GET /api/categories/?lang=es
```

**Idiomas soportados:**
- `es` - Español (default)
- `en` - Inglés
- `fr` - Francés

**Fallback:** Si no existe traducción, se devuelve el campo base.

---

## 🔑 PRINCIPIOS CLAVE

1. **Productos configurables:** Opciones dinámicas reutilizables
2. **Carrito sin login:** Basado en session_id
3. **Órdenes inmutables:** Snapshot de productos/opciones
4. **i18n desacoplado:** Traducciones en tablas separadas
5. **API RESTful:** Endpoints claros y consistentes

---

## 🚀 FLUJO DE COMPRA

1. Cliente navega productos: `GET /api/products/?lang=en`
2. Agrega al carrito: `POST /api/cart/add-item/`
3. Revisa carrito: `GET /api/cart/{session_id}/`
4. Crea orden: `POST /api/orders/create/`
5. Orden confirmada con snapshot inmutable
