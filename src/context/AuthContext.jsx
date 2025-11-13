import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cerrar sesión
  const logout = async () => {
    // Llamar al backend para cerrar sesión
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: "POST",
        credentials: "include", // Enviar las cookies de sesión
      });

      // Limpiar el estado de usuario y restablecer loading
      setUser(null);
      setLoading(true); // Establecer loading a true para reiniciar la autenticación
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Cargar usuario al montar el componente o cuando el user cambie
  useEffect(() => {
    // Solo intentamos obtener el usuario si loading es true o user es null (si estamos haciendo un nuevo login)
    if (user === null) {
      fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
        credentials: "include", // Para incluir las cookies de sesión
      })
        .then((res) => {
          if (!res.ok) throw new Error("No autenticado");
          return res.json();
        })
        .then((data) => {
          setUser({
            username: data.username,
            perfil: data.perfil ?? "profesor",
            givenName: data.givenName || "",
            sn: data.sn || "",
            employeeNumber: data.employeeNumber || null,
          });
        })
        .catch(() => {
          setUser(null);  // Si hay error, el usuario no está autenticado
        })
        .finally(() => setLoading(false)); // Finalmente, setea loading como false
    }
  }, [user]);  // El useEffect se ejecutará cuando `user` cambie

  // Valor que se pasará a los componentes hijos
  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
