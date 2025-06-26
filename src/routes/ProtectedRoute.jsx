import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from '../config';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/check-auth`, {
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
