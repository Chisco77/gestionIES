#!/bin/bash
set -e

# =============================================
# Configuración de rutas
# =============================================
# Directorio donde está el script
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

# =============================================
# Comprobaciones previas
# =============================================
if command -v docker &> /dev/null; then
  echo "Docker ya está instalado. Saliendo..."
  exit 0
fi

if docker ps -a --format '{{.Names}}' | grep -q "^portainer$"; then
  echo "Portainer ya está instalado. Saliendo..."
  exit 0
fi

# =============================================
# Instalación de Docker y Portainer
# =============================================
echo "============================================="
echo "   Instalando Docker y Portainer..."
echo "============================================="

apt install -y apt-transport-https ca-certificates curl lsb-release


echo "🔄 Actualizando índices de paquetes..."
sudo apt-get update -y

echo "🔍 Verificando disponibilidad de 'software-properties-common' en repositorios..."
if apt-cache show software-properties-common > /dev/null 2>&1; then
    echo "✅ Disponible en repos. Instalando..."
    sudo apt-get install -y software-properties-common
else
    echo "⚠️ No disponible en repos. Procediendo con instalación manual de ambos paquetes..."
    TMPDIR=$(mktemp -d)
    cd "$TMPDIR"

    # Definir nombres y URLs
    SPC="software-properties-common_0.99.30-4.1~deb12u1_all.deb"
    PSP="python3-software-properties_0.99.30-4.1~deb12u1_all.deb"

    URL_SPC="https://ftp.debian.org/debian/pool/main/s/software-properties/${SPC}"
    URL_PSP="https://ftp.debian.org/debian/pool/main/s/software-properties/${PSP}"

    echo "⬇️ Descargando $PSP"
    wget "$URL_PSP" -O "$PSP"

    echo "⬇️ Descargando $SPC"
    wget "$URL_SPC" -O "$SPC"

    echo "📦 Instalando paquetes (primero python3-software-properties)..."
    sudo apt install -y "./$PSP" "./$SPC"
fi 


curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker volume create portainer_data

docker run -d -p 9000:9443 --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# =============================================
# Certificados autofirmados
# =============================================
echo "============================================="
echo "   Generando certificados autofirmados..."
echo "   Introduce los datos cuando se soliciten."
echo "============================================="

mkdir -p /etc/nginx/ssl
cd /etc/nginx/ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt

# =============================================
# Configuración original del despliegue
# =============================================

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


# Añadir DB_PASSWORD a .env
if grep -q "^DB_PASSWORD=" "$SCRIPT_DIR/.env" 2>/dev/null; then
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" "$SCRIPT_DIR/.env"
else
  echo "DB_PASSWORD=${DB_PASSWORD}" >> "$SCRIPT_DIR/.env"
fi


# Añadir DB_PASSWORD a backend/.env (resuelto con ruta absoluta)
if grep -q "^DB_PASSWORD=" "$SCRIPT_DIR/backend/.env" 2>/dev/null; then
  sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" "$SCRIPT_DIR/backend/.env"
else
  echo "DB_PASSWORD=${DB_PASSWORD}" >> "$SCRIPT_DIR/backend/.env"
fi

# Modificar ALLOWED_ORIGINS en ./backend/.env
if grep -q "^ALLOWED_ORIGINS=" ./backend/.env 2>/dev/null; then
  sed -i "s#^ALLOWED_ORIGINS=\(.*\)#ALLOWED_ORIGINS=\1,https://${SERVER_IP}#" "$SCRIPT_DIR/backend/.env"
else
  echo "ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173,https://${SERVER_IP}" >> "$SCRIPT_DIR/backend/.env"
fi

# Añadir LDAP_URL al final de ./backend/.env
if grep -q "^LDAP_URL=" ./backend/.env 2>/dev/null; then
  sed -i "s#^LDAP_URL=.*#LDAP_URL=ldap://${LDAP_IP}:389#" "$SCRIPT_DIR/backend/.env"
else
  echo "LDAP_URL=ldap://${LDAP_IP}:389" >> "$SCRIPT_DIR/backend/.env"
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

# Usar ruta absoluta al directorio del script
cd "$SCRIPT_DIR"

# 1. Construir imágenes
echo "🔨 Construyendo imágenes..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" build

# 2. Levantar contenedores
echo "🟢 Iniciando contenedores..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d

# 3. Esperar a que PostgreSQL esté arriba
wait_for_db

# 4. Crear base de datos (si no existe)
create_db

# 5. Importar dump
import_dump

echo "🎉 Despliegue finalizado con éxito."
