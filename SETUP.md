# Artesena - Guía de Configuración Rápida

Este repositorio ahora incluye todo el código del Frontend (Next.js), Backend (Django) y **la base de datos SQLite pre-cargada con los 13 productos reales inyectados** junto con **todas sus imágenes** (tanto las públicas de arte del frontend como los archivos multimedia del backend). 

Sigue estos pasos para levantar el proyecto desde cero en cualquier PC sin perder ninguna foto ni configuración.

## 1. Backend (Django)

1. Abre una terminal en la raíz del proyecto y navega a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Crea y activa tu entorno virtual:
   ```bash
   python -m venv venv
   
   # En Windows:
   venv\Scripts\activate
   
   # En Mac/Linux:
   source venv/bin/activate
   ```
3. Instala las dependencias necesarias:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow
   ```
4. **Base de Datos y Medios:** La base de datos `db.sqlite3` ya viene incluida en este repositorio con todo el catálogo, y la carpeta `media/` contiene todas las fotos de los charangos. Para asegurar que todo esté en orden, aplica migraciones:
   ```bash
   python manage.py migrate
   ```
5. Levanta el servidor:
   ```bash
   python manage.py runserver
   ```
   El backend y la API estarán corriendo en `http://127.0.0.1:8000`.

---

## 2. Frontend (Next.js)

1. Abre otra terminal independiente y navega a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El frontend estará corriendo en `http://localhost:3000`.

---

## 3. Notas Importantes

- Las imágenes de arte (secciones Home y Nosotros) ya están integradas dentro de `frontend/public/img/art/`.
- Los 13 productos que inyectamos están enlazados a la carpeta `backend/media/products/`. ¡Asegúrate de mantener esa carpeta intacta para que no se rompan las imágenes del catálogo!
- Si agregas más productos desde el panel, las imágenes se guardarán automáticamente en `backend/media/` y la base de datos se actualizará.

¡Y listo! Todo el diseño editorial estilo "Zara" con tipografía inter y aguayos está configurado y funcionando.
