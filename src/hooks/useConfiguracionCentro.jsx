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
      const c = data.centro || {};

      return {
        id: c.id,
        nombreIes: c.nombre_ies || import.meta.env.VITE_IES_NAME || "",
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

        // Logos
        logoMiiesUrl: c.logo_miies_url || "",
        logoCentroUrl: c.logo_centro_url || "",
        faviconUrl: c.favicon_url || "",

        // 🔹 UID (mantener por compatibilidad)
        uidDirectora: c.uid_directora || null,
        uidSecretaria: c.uid_secretaria || null,

        // 🔥 NUEVO: datos enriquecidos
        directora: c.directora
          ? {
              uid: c.directora.uid,
              nombre: c.directora.nombre,
              apellidos: c.directora.apellidos,
              nombreCompleto: c.directora.nombreCompleto,
            }
          : null,

        secretaria: c.secretaria
          ? {
              uid: c.secretaria.uid,
              nombre: c.secretaria.nombre,
              apellidos: c.secretaria.apellidos,
              nombreCompleto: c.secretaria.nombreCompleto,
            }
          : null,

        updatedAt: c.updated_at,
      };
    },

    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
