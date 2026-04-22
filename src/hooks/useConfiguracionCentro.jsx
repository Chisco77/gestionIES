/**
 * useConfiguracionCentro.jsx - Hook para obtener los datos del IES.
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Fecha de creación: 2025
 *
 * Descripción:
 * Hook basado en React Query para recuperar la información 
 * institucional del centro (nombre, dirección, contacto, etc.)
 * y mantenerla en caché.
 *
 * Uso:
 * const { data: centro, isLoading } = useConfiguracionCentro();
 */

import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

export function useConfiguracionCentro() {
  return useQuery({
    queryKey: ["configuracion-centro"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/configuracion-centro`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Error obteniendo la configuración del centro");
      }

      const data = await res.json();
      
      // Retornamos el objeto 'centro' que viene del controlador
      const c = data.centro || {};

      return {
        id: c.id,
        nombreIes: c.nombre_ies || "",
        direccionLinea1: c.direccion_linea_1 || "",
        direccionLinea2: c.direccion_linea_2 || "",
        direccionLinea3: c.direccion_linea_3 || "",
        telefono: c.telefono || "",
        fax: c.fax || "",
        email: c.email || "",
        localidad: c.localidad || "Trujillo",
        provincia: c.provincia || "Cáceres",
        codigoPostal: c.codigo_postal || "",
        webUrl: c.web_url || "",
        logoUrl: c.logo_url || "",
        updatedAt: c.updated_at
      };
    },
    // Al ser datos que rara vez cambian, ponemos un staleTime alto (1 hora)
    staleTime: 1000 * 60 * 60, 
  });
}