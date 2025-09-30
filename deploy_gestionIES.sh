#!/bin/bash
set -e

# ===============================
# Configuración
# ===============================
APP_NAME="gestionIES"
DB_NAME="IESOrellana"
DB_USER="postgres"
DB_DUMP="${DB_NAME}.sql"

# Nombres de contenedores según docker-compose.yml
DB_CONTAINER="postgres_gestionIES"
BACKEND_CONTAINER="node_gestionIES"
FRONTEND_CONTAINER="nginx_gestionIES"

# ===============================
# Funciones auxiliares
# ===============================
wait_for_db() {
  echo "⏳ Esperando a que la base de datos esté lista..."
  until docker exec -i "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
    sleep 2
  done
  echo "✅ Base de datos lista."
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
echo "🔨 Construyendo imágenes..."
docker-compose build

# 2. Levantar contenedores
echo "🟢 Iniciando contenedores..."
docker-compose up -d

# 3. Esperar a que la DB esté lista
wait_for_db

# 4. Importar dump
import_dump

echo "🎉 Despliegue finalizado con éxito."
```
