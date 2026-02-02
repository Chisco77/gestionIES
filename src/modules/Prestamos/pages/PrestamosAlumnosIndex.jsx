/**
 * PrestamosAlumnosIndex.jsx
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Componente principal del módulo de gestión de préstamos de alumnos.
 *
 * Funcionalidades:
 * - Visualiza los préstamos de alumnos en una tabla filtrable y paginable.
 * - Permite seleccionar un alumno para realizar acciones individuales:
 *     • Asignar libros
 *     • Editar registro
 *     • Eliminar registro
 * - Proporciona acciones masivas sobre todos o varios alumnos:
 *     • Asignación masiva de libros
 *     • Entrega o recepción de documentos de compromiso
 *     • Entrega o devolución de libros
 * - Ofrece generación de informes:
 *     • Documento de compromiso de préstamo
 *     • Etiquetas PDF para libros
 * - Mantiene sincronización entre la tabla filtrada y los diálogos (etiquetas/documentos).
 * - Utiliza el hook personalizado `usePrestamos` para la carga y actualización de datos.
 *
 * Estados principales:
 * - prestamosFiltrados: préstamos visibles tras filtrado
 * - alumnoSeleccionado: fila seleccionada en la tabla
 * - abrir*: control de apertura de los distintos diálogos
 * - abrirAccionMasiva: estado y tipo de acción masiva en curso
 *
 * Dependencias:
 * - TablaPrestamos: tabla con filtros, selección y acciones
 * - Diálogos: DialogoAsignacionMasiva, DialogoEditarPrestamos, DialogoAsignarLibros,
 *            DialogoDocumentoPrestamo, DialogoEtiquetas, DialogoAccionMasiva
 * - Componentes UI: Button, DropdownMenu
 * - Iconos: lucide-react
 *
 */

import { useState, useEffect } from "react";
import { columns } from "../components/columns";
import { TablaPrestamos } from "../components/TablaPrestamos";
import { DialogoAsignacionMasiva } from "../components/DialogoAsignacionMasiva";
import { DialogoEditarPrestamos } from "../components/DialogoEditarPrestamos";
import { DialogoAsignarLibros } from "../components/DialogoAsignarLibros";
import { DialogoDocumentoPrestamo } from "../components/DialogoDocumentoPrestamo";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
import { DialogoAccionMasiva } from "../components/DialogoAccionMasiva";
import { DialogoEliminarPrestamo } from "../components/DialogoEliminarPrestamo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Tag,
  Plus,
  Trash2,
  Pencil,
  LibraryBig,
  Loader,
  FileCheck,
  FileText,
  BookOpen,
  Book,
} from "lucide-react";

import { usePrestamos } from "@/hooks/usePrestamos";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { generarListadoPrestamosLibrosAlumnosPdf } from "@/utils/Informes";

export function PrestamosAlumnosIndex() {
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirInsertarMasivo, setAbrirInsertarMasivo] = useState(false);
  const [abrirDialogoPrestar, setAbrirDialogoPrestar] = useState(false);
  const [abrirDialogoDocumentoPrestamo, setAbrirDialogoDocumentoPrestamo] =
    useState(false);
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);
  const [abrirAccionMasiva, setAbrirDialogoAccionMasiva] = useState({
    open: false,
    tipo: null,
  });
  const [abrirDialogoEliminar, setAbrirDialogoEliminar] = useState(false);

  const {
    data: prestamos,
    isLoading,
    error,
    refetch,
  } = usePrestamos({ esAlumno: true });

  const uidsConPrestamo =
    prestamos?.map((p) => ({
      uid: p.uid,
      iniciocurso: p.iniciocurso,
    })) || [];

  const handleGenerarListadoPrestamosLibrosAlumnosPdf = () => {
    if (!prestamosFiltrados || prestamosFiltrados.length === 0) {
      alert("No hay datos para generar el informe.");
      return;
    }

    generarListadoPrestamosLibrosAlumnosPdf({
      alumnos: prestamosFiltrados,
      nombrePdf: "listado_prestamos_libros_alumnos",
    });
  };

  // Sincroniza los filtrados con los datos actualizados
  /*useEffect(() => {
    setPrestamosFiltrados(prestamos || []);
  }, [prestamos]);
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }*/

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error.message}</div>;
  }

  // Eliminar registro de préstamo. Solo si doc_compromiso = 0
  const handleEliminar = (alumno) => {
    if (!alumno) {
      alert("Selecciona un registro para eliminar.");
      return;
    }

    setAlumnoSeleccionado(alumno);
    setAbrirDialogoEliminar(true);
  };

  const handleEditar = (alumno) => {
    if (!alumno) return;
    setAlumnoSeleccionado(alumno);
    setAbrirEditar(true);
  };

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPrestamos
        columns={columns}
        data={prestamos}
        onFilteredChange={(rows) => setPrestamosFiltrados(rows)}
        onSelectUsuario={(usuario) => setAlumnoSeleccionado(usuario)}
        acciones={(alumno) => (
          <>
            <div className="flex items-center space-x-2 mt-2">
              {/* Grupo 1: acciones individuales del alumno */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setAbrirDialogoPrestar(true)}
                      variant="outline"
                      size="icon"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Asignar libros</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleEditar(alumno)}
                      variant="outline"
                      size="icon"
                      disabled={!alumno}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Editar registro</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleEliminar(alumno)}
                      variant="outline"
                      size="icon"
                      disabled={!alumno}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Eliminar registro</p>
                  </TooltipContent>
                </Tooltip>

                {/* Separador vertical */}
                <div className="w-px h-6 bg-gray-300 mx-2" />

                {/* Grupo 2: acciones masivas */}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setAbrirInsertarMasivo(true)}
                      variant="outline"
                      size="icon"
                    >
                      <LibraryBig className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Asignación masiva</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        setAbrirDialogoAccionMasiva({
                          open: true,
                          tipo: "entregarDoc",
                        })
                      }
                      variant="outline"
                      size="icon"
                    >
                      <FileCheck className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Entrega masiva de documento de compromiso</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        setAbrirDialogoAccionMasiva({
                          open: true,
                          tipo: "recibirDoc",
                        })
                      }
                      variant="outline"
                      size="icon"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Recepción masiva de documento de compromiso</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        setAbrirDialogoAccionMasiva({
                          open: true,
                          tipo: "entregarLibros",
                        })
                      }
                      variant="outline"
                      size="icon"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Entrega física de libros</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() =>
                        setAbrirDialogoAccionMasiva({
                          open: true,
                          tipo: "devolverLibros",
                        })
                      }
                      variant="outline"
                      size="icon"
                    >
                      <Book className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-500 text-white">
                    <p>Devolución masiva de libros</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}
        informes={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Informes">
                <Printer className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setAbrirDialogoDocumentoPrestamo(true)}
              >
                <Tag className="mr-2 h-4 w-4" /> Documento compromiso préstamo
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setAbrirDialogoEtiquetas(true)}>
                <Tag className="mr-2 h-4 w-4" /> Etiquetas libros
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleGenerarListadoPrestamosLibrosAlumnosPdf}
              >
                <FileText className="mr-2 h-4 w-4 text-red-500" />
                Litado de préstamos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Diálogos */}
      <DialogoAsignacionMasiva
        open={abrirInsertarMasivo}
        onClose={() => setAbrirInsertarMasivo(false)}
        onSuccess={refetch}
      />

      <DialogoEditarPrestamos
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuario={alumnoSeleccionado}
        onSuccess={refetch}
      />

      <DialogoAsignarLibros
        open={abrirDialogoPrestar}
        onClose={() => setAbrirDialogoPrestar(false)}
        onSuccess={() => {
          refetch();
          setAbrirDialogoPrestar(false);
        }}
        uidsConPrestamo={uidsConPrestamo}
        esAlumno={true}
      />

      <DialogoDocumentoPrestamo
        open={abrirDialogoDocumentoPrestamo}
        onOpenChange={setAbrirDialogoDocumentoPrestamo}
        alumnos={prestamosFiltrados} // solo filtrados
      />

      <DialogoEtiquetas
        usuarios={prestamosFiltrados} // solo filtrados
        open={abrirDialogoEtiquetas}
        onOpenChange={setAbrirDialogoEtiquetas}
      />

      {/* Diálogo genérico de acción masiva */}
      <DialogoAccionMasiva
        open={abrirAccionMasiva.open}
        tipo={abrirAccionMasiva.tipo}
        onClose={() => setAbrirDialogoAccionMasiva({ open: false, tipo: null })}
        alumnos={prestamos}
        onSuccess={refetch}
      />

      <DialogoEliminarPrestamo
        open={abrirDialogoEliminar}
        onClose={() => setAbrirDialogoEliminar(false)}
        alumnoSeleccionado={alumnoSeleccionado}
        onSuccess={refetch}
      />
    </div>
  );
}
