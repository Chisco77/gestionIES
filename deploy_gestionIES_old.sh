#!/bin/bash
set -e

# ===============================
# Configuración
# ===============================
APP_NAME="gestionIES"
DB_NAME="gestionIES"
DB_USER="postgres"
DB_DUMP="${DB_NAME}.sql"

# Nombres de contenedores según docker-compose.yml
DB_CONTAINER="postgres_gestionIES"
BACKEND_CONTAINER="node_gestionIES"
FRONTEND_CONTAINER="nginx_gestionIES"

# ===============================
# Preguntas al usuario
# ===============================
read -sp "Introduce la contraseña para la base de datos ($DB_NAME): " DB_PASSWORD
echo
read -p "Introduce la IP del servidor que aloja la aplicación: " SERVER_IP
read -p "Introduce la IP del servidor LDAP: " LDAP_IP

# ===============================
# Modificación de archivos .env
# ===============================

# Añadir DB_PASSWORD a ./.env
if grep -q "^DB_PASSWORD=" ./.env 2>/dev/null; then
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" ./.env
else
  echo "DB_PASSWORD=${DB_PASSWORD}" >> ./.env
fi

# Añadir DB_PASSWORD a ./backend/.env
if grep -q "^DB_PASSWORD=" ./backend/.env 2>/dev/null; then
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" ./backend/.env
else
  echo "DB_PASSWORD=${DB_PASSWORD}" >> ./backend/.env
fi

# Modificar ALLOWED_ORIGINS en ./backend/.env
if grep -q "^ALLOWED_ORIGINS=" ./backend/.env 2>/dev/null; then
  sed -i "s#^ALLOWED_ORIGINS=\(.*\)#ALLOWED_ORIGINS=\1,https://${SERVER_IP}#" ./backend/.env
else
  echo "ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173,https://${SERVER_IP}" >> ./backend/.env
fi

# Añadir LDAP_URL al final de ./backend/.env
if grep -q "^LDAP_URL=" ./backend/.env 2>/dev/null; then
  sed -i "s#^LDAP_URL=.*#LDAP_URL=ldap://${LDAP_IP}:389#" ./backend/.env
else
  echo "LDAP_URL=ldap://${LDAP_IP}:389" >> ./backend/.env
fi

# ===============================
# Funciones auxiliares
# ===============================
create_db() {
  echo "📦 Creando base de datos $DB_NAME (si no existe)..."
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | grep -q 1 \
    || docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -c "CREATE DATABASE \"$DB_NAME\";"
  echo "✅ Base de datos $DB_NAME disponible."
}

wait_for_db() {
  echo "⏳ Esperando a que la base de datos esté lista..."
  until docker exec -i "$DB_CONTAINER" pg_isready -U "$DB_USER" > /dev/null 2>&1; do
    sleep 2
  done
  echo "✅ Servicio PostgreSQL listo."
}

import_dump() {
  if [ -f "$DB_DUMP" ]; then
    echo "📥 Importando dump $DB_DUMP a la base de datos $DB_NAME..."
    cat "$DB_DUMP" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
    echo "✅ Dump importado correctamente."
  else
    echo "⚠️  No se encontró el archivo $DB_DUMP. Se omite la importación."
  fi
}

# ===============================
# Deploy
# ===============================
echo "🚀 Iniciando despliegue de $APP_NAME..."

# 1. Construir imágenes
#echo "🔨 Construyendo imágenes..."
docker compose build

# 2. Levantar contenedores
#echo "🟢 Iniciando contenedores..."
docker compose up -d

# 3. Esperar a que PostgreSQL esté arriba
wait_for_db

# 4. Crear base de datos (si no existe)
create_db

# 5. Importar dump
import_dump

echo "🎉 Despliegue finalizado con éxito."
