/**
 * ProtectedRoute.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 * 
 * Componente de ruta protegida para React Router.
 *
 * Funcionalidades:
 * - Verifica la autenticación del usuario consultando `/check-auth` en el backend.
 * - Mientras se realiza la verificación, muestra un mensaje de "Cargando...".
 * - Si el usuario está autenticado, renderiza los componentes hijos (`children`).
 * - Si no está autenticado, redirige a la ruta de login (`/login`).
 *
 * Estados principales:
 * - isAuthenticated: null | true | false
 *      • null → verificación en curso
 *      • true → usuario autenticado
 *      • false → usuario no autenticado, redirigir a login
 *
 * Dependencias:
 * - react-router-dom: Navigate
 * - react: useState, useEffect
 *
 */


import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/check-auth`, {
      method: "GET",
      credentials: "include", // Importante para enviar cookie de sesión
    })
      .then((res) => {
        if (res.status === 200) {
          setIsAuthenticated(true);
        } else if (res.status === 401) {
          setIsAuthenticated(false);
        } else {
          throw new Error("Error inesperado");
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
