-- ==============================
-- 🔷 CREAR BASE DE DATOS ARTESENA
-- ==============================
-- 
-- Ejecutar este script en PostgreSQL:
-- psql -U postgres
-- Luego copiar y pegar este contenido
-- 

DROP DATABASE IF EXISTS artesena_db;
CREATE DATABASE artesena_db;

-- Conectar a la base de datos
\c artesena_db;

-- Verificar conexión
SELECT current_database();
