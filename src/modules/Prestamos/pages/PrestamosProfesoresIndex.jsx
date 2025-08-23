import { useState } from "react";
import { columns } from "../components/columns";
import { TablaPrestamos } from "../components/TablaPrestamos";
import { DialogoEditarPrestamos } from "../components/DialogoEditarPrestamos";
import { DialogoPrestarLibros } from "../components/DialogoPrestarLibros";
import { DialogoDocumentoPrestamo } from "../components/DialogoDocumentoPrestamo";
import { DialogoEtiquetas } from "../components/DialogoEtiquetas";
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
  Users,
  Plus,
  Trash2,
  Pencil,
  LibraryBig,
  Loader,
} from "lucide-react";
import { usePrestamos } from "@/hooks/usePrestamos";

export function PrestamosProfesoresIndex() {
  const [prestamosFiltrados, setPrestamosFiltrados] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirDialogoPrestar, setAbrirDialogoPrestar] = useState(false);
  const [abrirDialogoDocumentoPrestamo, setAbrirDialogoDocumentoPrestamo] =
    useState(false);
  const [abrirDialogoEtiquetas, setAbrirDialogoEtiquetas] = useState(false);

  const {
    data: prestamos,
    isLoading,
    error,
    refetch,
  } = usePrestamos({ esAlumno: false });

  const handleEditar = (seleccionado) => {
    if (!seleccionado) return;
    setProfesorSeleccionado(seleccionado);
    setAbrirEditar(true);
  };

  const uidsConPrestamo = prestamos?.map((p) => p.uid) || [];

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

  return (
    <div className="container mx-auto py-10 p-12 space-y-6">
      <TablaPrestamos
        columns={columns}
        data={prestamos}
        onFilteredChange={(rows) => setPrestamosFiltrados(rows)}
        acciones={(seleccionado) => (
          <>
            <Button
              onClick={() => setAbrirDialogoPrestar(true)}
              title="Prestar libros"
              variant="outline"
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => handleEditar(seleccionado)}
              disabled={!seleccionado}
              title="Editar préstamos"
              variant="outline"
              size="icon"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleEliminar(seleccionado)}
              disabled={!seleccionado}
              title="Eliminar préstamos"
              variant="outline"
              size="icon"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
                <Tag className="mr-2 h-4 w-4" />
                Documento Préstamo Libros
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAbrirDialogoEtiquetas(true)}>
                <Tag className="mr-2 h-4 w-4" />
                Etiquetas libros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <DialogoEditarPrestamos
        open={abrirEditar}
        onClose={() => setAbrirEditar(false)}
        usuario={profesorSeleccionado}
        onSuccess={refetch}
      />

      <DialogoPrestarLibros
        open={abrirDialogoPrestar}
        onClose={() => setAbrirDialogoPrestar(false)}
        onSuccess={() => {
          refetch();
          setAbrirDialogoPrestar(false);
        }}
        uidsConPrestamo={uidsConPrestamo}
        esAlumno={false}
      />

      <DialogoDocumentoPrestamo
        open={abrirDialogoDocumentoPrestamo}
        onOpenChange={setAbrirDialogoDocumentoPrestamo}
        alumnos={prestamosFiltrados}
      />

      <DialogoEtiquetas
        usuarios={prestamosFiltrados}
        open={abrirDialogoEtiquetas}
        onOpenChange={setAbrirDialogoEtiquetas}
      />
    </div>
  );
}
