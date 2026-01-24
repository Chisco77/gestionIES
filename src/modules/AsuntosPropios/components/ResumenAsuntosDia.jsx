import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

export function ResumenAsuntosDia({ fecha }) {
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  console.log("DEBUG USER:", user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["asuntosDia", fecha],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/db/permisos-enriquecidos?tipo=13&fecha=${fecha}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Error obteniendo asuntos propios");
      return res.json();
    },
  });

  const asuntos = data?.asuntos ?? [];
  let contadorProfesor = 1;

  if (isLoading) return <p>Cargando asuntos propios...</p>;
  if (error) return <p className="text-red-500">Error cargando datos</p>;
  //if (!asuntos.length) return <p>No hay asuntos propios para este día.</p>;

  // Ordenar: días disfrutados asc, luego created_at asc
  const asuntosOrdenados = [...asuntos].sort((a, b) => {
    if ((a.dias_disfrutados ?? 0) !== (b.dias_disfrutados ?? 0)) {
      return (a.dias_disfrutados ?? 0) - (b.dias_disfrutados ?? 0);
    }
    return new Date(a.created_at) - new Date(b.created_at);
  });

  return (
    <div className="mb-4 bg-white border border-gray-200 rounded-md p-3">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Solicitudes para este día
      </h3>
      <div className="flex flex-col space-y-2">
        {asuntosOrdenados.map((a) => {
          const mostrarNombre =
            user.perfil === "directiva" || user.perfil === "admin";

          // Comparación usando user.username
          const esYo =
            a.uid &&
            user.username &&
            a.uid.toLowerCase().trim() === user.username.toLowerCase().trim();

          let nombre;
          if (esYo) {
            nombre = "YO";
          } else if (mostrarNombre) {
            nombre = a.nombreProfesor || "Sin nombre";
          } else {
            nombre = `Profesor${contadorProfesor++}`;
          }

          console.log("DEBUG ASUNTO:", {
            nombreProfesor: a.nombreProfesor,
            uidAsunto: a.uid,
            userUsername: user.username,
            esYo,
          });

          return (
            <Card
              key={a.id}
              className="p-2 border border-gray-200 rounded-md bg-gray-50 shadow-none"
            >
              <CardContent className="flex justify-between items-center p-2">
                <div className="flex items-center space-x-2">
                  <User className={esYo ? "text-green-500" : "text-blue-500"} />
                  <span className="font-medium">{nombre}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Disfrutados: {a.dias_disfrutados ?? 0}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
