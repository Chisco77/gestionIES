import { useState, useEffect } from "react";
import { columns } from "../components/columns";
import { TablaPrestamos } from "../components/TablaPrestamos";
import { DialogoAsignacionMasiva } from "../components/DialogoAsignacionMasiva";
import { DialogoEditarPrestamos } from "../components/DialogoEditarPrestamos";
import { DialogoAsignarLibros } from "../components/DialogoAsignarLibros";
import { DialogoDocumentoPrestamo } from "../components/DialogoDocumentoPrestamo";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
import { DialogoAccionMasiva } from "../components/DialogoAccionMasiva";
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

  const {
    data: prestamos,
    isLoading,
    error,
    refetch,
  } = usePrestamos({ esAlumno: true });

  //const uidsConPrestamo = prestamos?.map((p) => p.uid) || [];
// 
  const uidsConPrestamo =
    prestamos?.map((p) => ({
      uid: p.uid,
      iniciocurso: p.iniciocurso,
    })) || [];


    
    // Sincroniza los filtrados con los datos actualizados
  useEffect(() => {
    setPrestamosFiltrados(prestamos || []);
  }, [prestamos]);
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

  const handleEliminar = async (alumno) => {
    if (!alumno) return;
    // lógica de eliminar préstamos del backend
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
              <Button
                onClick={() => setAbrirDialogoPrestar(true)}
                title="Asignar libros"
                variant="outline"
                size="icon"
                //disabled={!alumno}
              >
                <Plus className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handleEditar(alumno)}
                title="Editar registro"
                variant="outline"
                size="icon"
                disabled={!alumno}
              >
                <Pencil className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => handleEliminar(alumno)}
                title="Eliminar registro"
                variant="outline"
                size="icon"
                disabled={!alumno}
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* Separador vertical */}
              <div className="w-px h-6 bg-gray-300 mx-2" />

              {/* Grupo 2: acciones masivas */}
              <Button
                onClick={() => setAbrirInsertarMasivo(true)}
                title="Asignación masiva"
                variant="outline"
                size="icon"
              >
                <LibraryBig className="w-4 h-4" />
              </Button>

              <Button
                onClick={() =>
                  setAbrirDialogoAccionMasiva({
                    open: true,
                    tipo: "entregarDoc",
                  })
                }
                title="Entrega de documento de compromiso"
                variant="outline"
                size="icon"
              >
                <FileCheck className="w-4 h-4" />
              </Button>

              <Button
                onClick={() =>
                  setAbrirDialogoAccionMasiva({
                    open: true,
                    tipo: "recibirDoc",
                  })
                }
                title="Recepción de documento de compromiso"
                variant="outline"
                size="icon"
              >
                <FileText className="w-4 h-4" />
              </Button>

              <Button
                onClick={() =>
                  setAbrirDialogoAccionMasiva({
                    open: true,
                    tipo: "entregarLibros",
                  })
                }
                title="Entrega física de libros"
                variant="outline"
                size="icon"
              >
                <BookOpen className="w-4 h-4" />
              </Button>

              <Button
                onClick={() =>
                  setAbrirDialogoAccionMasiva({
                    open: true,
                    tipo: "devolverLibros",
                  })
                }
                title="Devolución de libros"
                variant="outline"
                size="icon"
              >
                <Book className="w-4 h-4" />
              </Button>
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
    </div>
  );
}
