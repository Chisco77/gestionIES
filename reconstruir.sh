# Eliminar restos de node_modules
rm -rf node_modules

# 1️⃣ Parar y eliminar solo contenedores gestionIES
docker ps -a --filter "name=gestionIES" --format "{{.Names}}" | xargs -r docker rm -f

# 2️⃣ Eliminar imágenes de frontend y backend gestionIES
docker images --format "{{.Repository}}:{{.Tag}}" | grep "gestionies_" | xargs -r docker rmi -f

# 3️⃣ Construir imágenes frescas
docker-compose build

# 4️⃣ Levantar todos los servicios de gestionIES
docker-compose up -d

# 5️⃣ Mostrar logs de los servicios para verificar que arrancan bien
docker-compose logs -f
