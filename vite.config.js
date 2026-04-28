/*import { defineConfig } from 'vite'
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
});*/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/gestionIES/', 
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Redirige las llamadas al API al backend (puerto 5000)
      '/api': {
        target: 'https://localhost:5000',
        secure: false, // Si usas certificados auto-firmados
        changeOrigin: true,
      },
      // Redirige las llamadas de imágenes/planos al backend si decides moverlas allí
      '/uploads': {
        target: 'https://localhost:5000',
        secure: false,
        changeOrigin: true,
      }
    }
  }
});