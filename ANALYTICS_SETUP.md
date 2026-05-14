# 📊 GOOGLE ANALYTICS & META PIXEL - IMPLEMENTACIÓN COMPLETA

## ✅ CONFIGURACIÓN COMPLETADA

### IDs Configurados:
- **Google Analytics**: `G-Y3HQMXX28H`
- **Meta Pixel**: `1652832672174387`

---

## 📁 ARCHIVOS CREADOS

### 1. `.env.local`
Variables de entorno con tus IDs reales.

### 2. `src/lib/analytics.ts`
Funciones de Google Analytics:
- `gaViewItem()` - Ver producto
- `gaAddToCart()` - Agregar al carrito
- `gaBeginCheckout()` - Iniciar checkout
- `gaPurchase()` - Compra completada
- `gaViewItemList()` - Ver lista de productos

### 3. `src/lib/fbpixel.ts`
Funciones de Meta Pixel:
- `fbViewContent()` - Ver producto
- `fbAddToCart()` - Agregar al carrito
- `fbInitiateCheckout()` - Iniciar checkout
- `fbPurchase()` - Compra completada
- `fbSearch()` - Búsqueda (para futuro)

---

## 🎯 EVENTOS IMPLEMENTADOS

### Página de Productos (`/products`)
✅ **view_item_list** (GA) - Cuando se carga la lista
✅ **PageView** (Meta) - Cuando se visita la página

### Página de Detalle (`/products/[id]`)
✅ **view_item** (GA) - Cuando se ve un producto
✅ **ViewContent** (Meta) - Cuando se ve un producto
✅ **add_to_cart** (GA) - Cuando se agrega al carrito
✅ **AddToCart** (Meta) - Cuando se agrega al carrito

### Página de Checkout (`/checkout`)
✅ **begin_checkout** (GA) - Cuando se inicia el checkout
✅ **InitiateCheckout** (Meta) - Cuando se inicia el checkout

### Página de Éxito (`/checkout/success`)
✅ **purchase** (GA) - Cuando se completa la compra
✅ **Purchase** (Meta) - Cuando se completa la compra

---

## 🔍 CÓMO VERIFICAR QUE FUNCIONA

### Google Analytics:
1. Ve a: https://analytics.google.com/
2. Selecciona tu propiedad "Artesena"
3. Ve a **Informes → Tiempo real**
4. Navega en tu sitio web
5. Deberías ver:
   - Usuarios activos
   - Eventos en tiempo real
   - Páginas vistas

### Meta Pixel:
1. Instala la extensión: **Meta Pixel Helper** (Chrome)
   - https://chrome.google.com/webstore/detail/meta-pixel-helper/
2. Ve a tu sitio web
3. El ícono de la extensión se pondrá **verde** ✅
4. Click en el ícono para ver:
   - Pixel ID detectado
   - Eventos disparados
   - Datos enviados

---

## 📊 DATOS QUE SE ENVÍAN

### Ejemplo: Agregar al Carrito
```javascript
// Google Analytics
{
  currency: 'USD',
  value: 150.00,
  items: [{
    item_id: 1,
    item_name: 'Charango Profesional',
    item_category: 'Charango',
    price: 150.00,
    quantity: 1
  }]
}

// Meta Pixel
{
  content_ids: [1],
  content_name: 'Charango Profesional',
  content_type: 'product',
  value: 150.00,
  currency: 'USD',
  quantity: 1
}
```

---

## 🎯 BENEFICIOS INMEDIATOS

### 1. **Remarketing**
- Mostrar anuncios a usuarios que vieron productos pero no compraron
- Crear audiencias personalizadas en Facebook/Instagram

### 2. **Optimización de Campañas**
- Ver qué productos generan más interés
- Medir ROI de anuncios de Facebook/Google

### 3. **Analytics Avanzado**
- Embudos de conversión
- Tasa de abandono de carrito
- Productos más vistos vs más comprados

### 4. **Audiencias Lookalike**
- Meta puede crear audiencias similares a tus compradores
- Expandir alcance con usuarios similares

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

### En Google Analytics:
1. Configurar **Conversiones**:
   - Marca "purchase" como conversión principal
   - Asigna valor monetario

2. Crear **Embudos**:
   - view_item → add_to_cart → begin_checkout → purchase

3. Configurar **Informes personalizados**:
   - Productos más vendidos
   - Tasa de conversión por categoría

### En Meta Pixel:
1. Verificar el **Dominio**:
   - Business Manager → Configuración → Dominios
   - Agrega tu dominio y verifica

2. Crear **Eventos Personalizados**:
   - Para promociones especiales
   - Para productos destacados

3. Configurar **Conversiones API** (avanzado):
   - Enviar eventos desde el servidor
   - Mayor precisión con iOS 14+

---

## 🔐 SEGURIDAD

✅ Las variables están en `.env.local` (no se suben a Git)
✅ Los IDs son públicos (no son secretos)
✅ No se envía información personal sensible
✅ Compatible con GDPR/CCPA (considera agregar banner de cookies)

---

## 📝 NOTAS IMPORTANTES

1. **Desarrollo vs Producción**:
   - Los eventos se están enviando en desarrollo
   - Considera crear propiedades separadas para dev/prod

2. **Privacidad**:
   - No se envían emails ni datos personales
   - Solo IDs de productos y valores monetarios

3. **Performance**:
   - Los scripts se cargan con `strategy="afterInteractive"`
   - No afectan el rendimiento inicial de la página

---

## 🎉 ¡TODO LISTO!

Tu e-commerce ahora tiene tracking completo de:
- ✅ Vistas de productos
- ✅ Agregados al carrito
- ✅ Inicios de checkout
- ✅ Compras completadas

**Reinicia el servidor** para que las variables de entorno se carguen:
```bash
cd frontend
npm run dev
```

Luego navega por tu sitio y verifica en tiempo real que los eventos se están enviando! 🚀
