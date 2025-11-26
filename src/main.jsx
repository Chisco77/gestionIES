/**
 * main.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Punto de entrada de la aplicación React.
 *
 * Funcionalidades:
 * - Importa estilos globales desde index.css.
 * - Renderiza el componente raíz <App /> en el elemento con id="root".
 *
 * Dependencias:
 * - react
 * - react-dom
 */


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")).render(
  //  <StrictMode>
  <App />
  //  </StrictMode>,
);