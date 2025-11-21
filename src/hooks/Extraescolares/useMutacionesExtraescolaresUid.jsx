// hooks/useMutacionesExtraescolaresUid.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

/* ============================================================
   Crear actividad extraescolar para un usuario
   ============================================================ */
export function useCrearExtraescolarUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nuevaActividad) => {
      const res = await fetch(`${API_BASE}/panel/extraescolares?uid=${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevaActividad),
      });

      if (!res.ok) throw new Error("No se pudo crear actividad extraescolar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["extraescolares", "uid", uid]);
    },
  });
}

/* ============================================================
   Actualizar actividad extraescolar por ID
   ============================================================ */
export function useActualizarExtraescolarUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, datos }) => {
      const res = await fetch(
        `${API_BASE}/panel/extraescolares/${id}?uid=${uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(datos),
        }
      );

      if (!res.ok)
        throw new Error("No se pudo actualizar la actividad extraescolar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["extraescolares", "uid", uid]);
    },
  });
}

/* ============================================================
   Eliminar actividad extraescolar por ID
   ============================================================ */
export function useEliminarExtraescolarUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(
        `${API_BASE}/panel/extraescolares/${id}?uid=${uid}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok)
        throw new Error("No se pudo eliminar la actividad extraescolar");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["extraescolares", "uid", uid]);
    },
  });
}
