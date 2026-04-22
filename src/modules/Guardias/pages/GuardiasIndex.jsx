import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGuardias } from "@/hooks/useGuardias"; // Debes crear este hook
import { columnsGuardias } from "../components/columns-guardias";
import { TablaGuardias } from "../components/TablaGuardias";
import { Loader, ShieldCheck } from "lucide-react";

export function GuardiasIndex() {
  const { user } = useAuth();
  const { data: guardias, isLoading, error } = useGuardias();

  // Filtrado: El profesor solo ve sus guardias realizadas (donde él cubrió)
  // Si es directiva, ve todas.
  const guardiasVisibles = useMemo(() => {
    if (!guardias) return [];
    if (user?.perfil === "directiva") return guardias;
    
    return guardias.filter((g) => g.uid_profesor_cubridor === user?.username);
  }, [guardias, user]);

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" />
            Histórico de Guardias Realizadas
          </h2>
          <p className="text-sm text-muted-foreground">
            Consulta el registro de todas las guardias que has cubierto hasta la fecha.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-10 border rounded-lg bg-red-50">
          ❌ Error al cargar las guardias: {error.message}
        </div>
      ) : (
        <TablaGuardias 
          columns={columnsGuardias} 
          data={guardiasVisibles} 
        />
      )}
    </div>
  );
}