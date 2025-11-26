
/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "./backend/ssl-dev/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "./backend/ssl-dev/cert.pem")),
    },
    proxy: {
      "/api": {
        target: "https://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
*/


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Mantenemos la base para producción, es crucial para el enrutamiento y carga de assets
  base: '/gestionIES/', 
  plugins: [react()],
  resolve: {
    alias: {
      // Mantenemos los aliases para que la compilación funcione
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🎉 ¡Eliminamos la sección 'server' y las dependencias de 'fs' de desarrollo!
});