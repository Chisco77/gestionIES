// src/hooks/useAlumnosLdap.js
import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;

export function useAlumnosLdap() {
  return useQuery({
    queryKey: ["alumnos-ldap"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/ldap/usuarios?tipo=students`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error al obtener los alumnos desde LDAP");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // cache 5 min
  });
}
