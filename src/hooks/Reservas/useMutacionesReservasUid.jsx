import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL ? `${API_URL.replace(/\/$/, "")}/db` : "/db";

/* ======================
   Crear reserva de aula
   ====================== */
export function useCrearReservaUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nuevaReserva) => {
      const res = await fetch(`${API_BASE}/reservas-estancias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...nuevaReserva, uid }),
      });

      if (!res.ok) throw new Error("No se pudo crear la reserva");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reservas", "uid", uid]);
    },
  });
}

/* ======================
   Actualizar reserva de aula
   ====================== */
export function useActualizarReservaUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, datos }) => {
      const res = await fetch(`${API_BASE}/reservas-estancias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...datos, uid }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar la reserva");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reservas", "uid", uid]);
    },
  });
}

/* ======================
   Eliminar reserva de aula
   ====================== */
export function useEliminarReservaUid(uid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_BASE}/reservas-estancias/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("No se pudo eliminar la reserva");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reservas", "uid", uid]);
    },
  });
}
