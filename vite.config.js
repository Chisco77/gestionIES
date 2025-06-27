/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:5000',  // URL backend con HTTPS
        changeOrigin: true,
        secure: false, // porque el certificado es autofirmado
      },
    },
  },
})
*/

import { defineConfig } from 'vite'
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
