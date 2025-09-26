/**
 * EstanciasIndex.jsx - Página de gestión de estancias
 *
 * ------------------------------------------------------------
 * Inspirado en el módulo de libros
 * ------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import { columns } from "../components/columns";
import { TablaEstancias } from "../components/TablaEstancias";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
// Aquí luego podrás importar los diálogos de insertar/editar/eliminar
// import { DialogoInsertarEstancia } from "../components/DialogoInsertarEstancia";
// import { DialogoEditarEstancia } from "../components/DialogoEditarEstancia";
// import { DialogoEliminarEstancia } from "../components/DialogoEliminarEstancia";

export function EstanciasIndex() {
  const [estanciasFiltradas, setEstanciasFiltradas] = useState([]);
  const [estancias, setEstancias] = useState([]);
  const [estanciaSeleccionada, setEstanciaSeleccionada] = useState(null);
  const [abrirInsertar, setAbrirInsertar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirEliminar, setAbrirEliminar] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchEstancias = async () => {
    try {
      const res = await fetch(`${API_URL}/db/estancias`, {
        credentials: "include",
      });
      const data = await res.json();
      setEstancias(data);
    } catch (error) {
      console.error("❌ Error al obtener estancias:", error);
      setEstancias([]);
    }
  };

  useEffect(() => {
    fetchEstancias();
  }, []);

  const handleEditar = (estancia) => {
    if (!estancia) {
      alert("Selecciona una estancia para editar.");
      return;
    }
    setEstanciaSeleccionada(estancia);
    setAbrirEditar(true);
  };

  const handleEliminar = (estancia) => {
    if (!estancia) {
      alert("Selecciona una estancia para eliminar.");
      return;
    }
    setEstanciaSeleccionada(estancia);
    setAbrirEliminar(true);
  };

  const onSuccess = () => {
    fetchEstancias();
    setAbrirInsertar(false);
    setAbrirEditar(false);
    setAbrirEliminar(false);
    setEstanciaSeleccionada(null);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaEstancias
        columns={columns}
        data={estancias}
        onFilteredChange={(filtradas) => setEstanciasFiltradas(filtradas)}
        acciones={(seleccionado) => (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirInsertar(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditar(seleccionado)}
              disabled={!seleccionado}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEliminar(seleccionado)}
              disabled={!seleccionado}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      />

      {/* Diálogos (a implementar después) */}
      {/* <DialogoInsertarEstancia
        open={abrirInsertar}
        onClose={() => setAbrirInsertar(false)}
        onSuccess={onSuccess}
      />
      <DialogoEditarEstancia
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        estanciaSeleccionada={estanciaSeleccionada}
        onSuccess={onSuccess}
      />
      <DialogoEliminarEstancia
        open={abrirEliminar}
        onClose={() => setAbrirEliminar(false)}
        estanciaSeleccionada={estanciaSeleccionada}
        onSuccess={onSuccess}
      /> */}
    </div>
  );
}
