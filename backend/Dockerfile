# Etapa de construcción 
FROM node:18-slim AS builder
WORKDIR /app
COPY backend/package*.json ./
# Instalar dependencias
RUN npm install
# Copiar el resto del código
COPY backend/ .
# El backend usa el .env en la ruta de trabajo.
# No copiamos el .env aquí, lo inyectaremos en el docker-compose.yml

# Etapa de producción
FROM node:18-slim
WORKDIR /app
# Copiar solo lo necesario de la etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/ .
# La aplicación corre en el puerto 5000 (según tu .env)
EXPOSE 5000
# Comando para iniciar el servidor
#CMD ["node", "server.js"]
CMD node server.js
