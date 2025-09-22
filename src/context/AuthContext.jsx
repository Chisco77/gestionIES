import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/check-auth`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then(data => {
        setUser({
          username: data.username,
          perfil: data.perfil ?? "profesor",
        });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
