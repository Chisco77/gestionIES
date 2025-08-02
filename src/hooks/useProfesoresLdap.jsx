// src/hooks/useProfesoresLdap.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function useProfesoresLdap() {
  return useQuery({
    queryKey: ["profesores-ldap"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/ldap/usuarios?tipo=teachers`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error al obtener los profesores desde LDAP");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
