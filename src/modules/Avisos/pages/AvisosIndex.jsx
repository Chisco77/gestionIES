/**
 * AvisosIndex.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente principal de gestión de avisos del sistema.
 *
 * Este módulo permite visualizar y administrar los avisos
 * registrados en la aplicación, incluyendo la creación de
 * nuevos avisos, edición y eliminación de los existentes.
 * También integra la configuración de envío de correos
 * mediante SMTP, accesible únicamente para usuarios con
 * perfil de administrador.
 *
 * Utiliza React Query para la obtención de datos y mantiene
 * la sincronización del estado tras cada operación mediante
 * invalidación de queries.
 *
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Mail } from "lucide-react";

import { useAvisos } from "@/hooks/useAvisos";
import { TablaAvisos } from "../components/TablaAvisos";
import { columns } from "../components/columnsAvisos";

import { DialogoInsertarAviso } from "../components/DialogoInsertarAviso";
import { DialogoEditarAviso } from "../components/DialogoEditarAviso";
import { DialogoEliminarAviso } from "../components/DialogoEliminarAviso";
import { DialogoSMTP } from "../components/DialogoSMTP";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AvisosIndex() {
  const [abrirDialogoInsertar, setAbrirDialogoInsertar] = useState(false);
  const [abrirDialogoEditar, setAbrirDialogoEditar] = useState(false);
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);
  const [abrirDialogoSMTP, setAbrirDialogoSMTP] = useState(false);

  const { data: avisos = [], isLoading } = useAvisos();
  const { user } = useAuth();

  // Verificamos si ya existe el módulo SMTP para bloquear la inserción duplicada
  const existeSMTP = avisos.some((a) => a.modulo === "smtp");

  const handleEditar = (aviso) => {
    if (!aviso) return toast.error("Selecciona un aviso para editar.");
    setAvisoSeleccionado(aviso);
    setAbrirDialogoEditar(true);
  };

  const handleEliminar = (aviso) => {
    if (!aviso) return toast.error("Selecciona un aviso para eliminar.");
    setAvisoSeleccionado(aviso);
    setAbrirDialogoEliminar(true);
  };

  const handleAbrirSMTP = () => {
    if (user?.perfil !== "administrador") {
      toast.error("Solo el administrador puede modificar los datos SMTP.");
      return;
    }
    setAbrirDialogoSMTP(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaAvisos
        columns={columns}
        data={avisos}
        loading={isLoading}
        acciones={(seleccionado) => {
          // Calculamos el estado de la fila seleccionada en tiempo real
          const esSMTP = seleccionado?.modulo === "smtp";

          return (
            <TooltipProvider>
              <div className="flex gap-2">
                {/* Botón Insertar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAbrirDialogoInsertar(true)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {existeSMTP
                      ? "La configuración SMTP ya existe"
                      : "Insertar aviso"}
                  </TooltipContent>
                </Tooltip>

                {/* Botón Editar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditar(seleccionado)}
                        disabled={!seleccionado || esSMTP}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {esSMTP
                      ? "SMTP se gestiona desde el icono de Mail"
                      : "Editar aviso"}
                  </TooltipContent>
                </Tooltip>

                {/* Botón Eliminar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEliminar(seleccionado)}
                        disabled={!seleccionado || esSMTP}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {esSMTP ? "SMTP no se puede eliminar" : "Eliminar aviso"}
                  </TooltipContent>
                </Tooltip>

                {/* Botón SMTP */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAbrirSMTP}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Configuración SMTP</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          );
        }}
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
      <DialogoSMTP
        open={abrirDialogoSMTP}
        onClose={() => setAbrirDialogoSMTP(false)}
      />
    </div>
  );
}
