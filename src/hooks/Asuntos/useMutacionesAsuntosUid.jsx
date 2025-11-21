// hooks/useMutacionesAsuntosUid.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

/* ======================
   Crear asunto propio
   ====================== */
export function useCrearAsuntoUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nuevoAsunto) => {
      const res = await fetch(`${API_BASE}/panel/asuntos-propios?uid=${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nuevoAsunto),
      });
      if (!res.ok) throw new Error("No se pudo crear el asunto propio");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["asuntos", "uid", uid]);
    },
  });
}

/* ======================
   Actualizar asunto propio
   ====================== */
export function useActualizarAsuntoUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, datos }) => {
      const res = await fetch(`${API_BASE}/panel/asuntos-propios/${id}?uid=${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el asunto propio");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["asuntos", "uid", uid]);
    },
  });
}

/* ======================
   Eliminar asunto propio
   ====================== */
export function useEliminarAsuntoUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/panel/asuntos-propios/${id}?uid=${uid}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudo eliminar el asunto propio");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["asuntos", "uid", uid]);
    },
  });
}
