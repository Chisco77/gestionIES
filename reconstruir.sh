# Eliminar restos de node_modules
rm -rf node_modules

# 1️⃣ Parar y eliminar solo contenedores gestionIES
docker rm -f nginx_gestionIES node_gestionIES postgres_gestionIES

# 2️⃣ Eliminar imágenes de frontend y backend gestionIES
docker rmi -f gestionies_frontend gestionies_backend

# 3️⃣ Construir imágenes frescas
docker compose build

# 4️⃣ Levantar todos los servicios de gestionIES
docker compose up -d

# 5️⃣ Mostrar logs de los servicios para verificar que arrancan bien
docker compose logs -f
