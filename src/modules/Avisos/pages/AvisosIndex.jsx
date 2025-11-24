import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { useAvisos } from "@/hooks/useAvisos";
import { TablaAvisos } from "../components/TablaAvisos";
import { columns } from "../components/columnsAvisos";

import { DialogoInsertarAviso } from "../components/DialogoInsertarAviso";
import { DialogoEditarAviso } from "../components/DialogoEditarAviso";
import { DialogoEliminarAviso } from "../components/DialogoEliminarAviso";

export function AvisosIndex() {
  const [abrirDialogoInsertar, setAbrirDialogoInsertar] = useState(false);
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);

  // 🔹 Hook React Query para obtener todos los avisos
  const { data: avisos = [], isLoading } = useAvisos();

  const handleEditar = (aviso) => {
    if (!aviso) return alert("Selecciona un aviso para editar.");
    setAvisoSeleccionado(aviso);
    setAbrirDialogoEditar(true);
  };

  const handleEliminar = (aviso) => {
    if (!aviso) return alert("Selecciona un aviso para eliminar.");
    setAvisoSeleccionado(aviso);
    setAbrirDialogoEliminar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaAvisos
        columns={columns}
        data={avisos}
        loading={isLoading}
        acciones={(seleccionado) => (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setAbrirDialogoInsertar(true)}
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

      {/* Diálogos */}
      <DialogoInsertarAviso
        open={abrirDialogoInsertar}
        onClose={() => setAbrirDialogoInsertar(false)}
      />
      <DialogoEditarAviso
        open={abrirDialogoEditar}
        onClose={() => setAbrirDialogoEditar(false)}
        avisoSeleccionado={avisoSeleccionado}
      />
      <DialogoEliminarAviso
        open={abrirDialogoEliminar}
        onClose={() => setAbrirDialogoEliminar(false)}
        avisoSeleccionado={avisoSeleccionado}
      />
    </div>
  );
}
