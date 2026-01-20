# Eliminar restos de node_modules
#rm -rf node_modules

# 1️⃣ Parar y eliminar solo contenedores gestionIES
#docker rm -f nginx_gestionIES node_gestionIES postgres_gestionIES

# 2️⃣ Eliminar imágenes de frontend y backend gestionIES
#docker rmi -f gestionies_frontend gestionies_backend

# 3️⃣ Construir imágenes frescas
#docker compose build

# 4️⃣ Levantar todos los servicios de gestionIES
#docker compose up -d

# 5️⃣ Mostrar logs de los servicios para verificar que arrancan bien
#docker compose logs -f
## hacia arriba funciona


#!/bin/bash
set -e

echo "🧹 Limpiando node_modules y cache de Vite..."
rm -rf node_modules
rm -rf node_modules/.vite

echo "🛑 Parando y eliminando contenedores gestionIES..."
docker rm -f nginx_gestionIES node_gestionIES postgres_gestionIES || true

echo "🧨 Eliminando imágenes antiguas de frontend y backend..."
docker rmi -f gestionies_frontend gestionies_backend || true

echo "⚡ Construyendo imágenes frescas (sin cache)..."
docker compose build --no-cache

echo "🚀 Levantando todos los servicios..."
docker compose up -d

echo "📖 Mostrando logs de frontend y backend..."
docker compose logs -f frontend_nginx backend_app
