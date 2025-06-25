// components/DialogoEtiquetas.jsx
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import logo from "/src/images/logo.png";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DialogoListadoCurso({ alumnos, open, onOpenChange }) {
  //const [open, setOpen] = useState(false);
  const [nombrePdf, setNombrePdf] = useState("etiquetasbecarios");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const generatePdfListadoPorCurso = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const pageWidth = 210; // A4 en mm
    const marginLeft = 20;
    const marginTop = 35;
    const lineHeight = 8;
    const contentBottom = 287; // pageHeight - 10

    // Agrupar y ordenar alumnos por curso y por apellido
    const grupos = alumnos.reduce((acc, alumno) => {
      const curso = alumno.groups?.[1] ?? "Sin curso";
      if (!acc[curso]) acc[curso] = [];
      acc[curso].push(alumno);
      return acc;
    }, {});

    const cursosOrdenados = Object.keys(grupos).sort();

    cursosOrdenados.forEach((curso, cursoIndex) => {
      const alumnosCurso = grupos[curso].sort((a, b) =>
        (a.sn || "").localeCompare(b.sn || "")
      );

      if (cursoIndex > 0) doc.addPage();

      // Título del curso
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`Listado del curso: ${curso}`, pageWidth / 2, 20, {
        align: "center",
      });

      // Línea horizontal
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(marginLeft, 24, pageWidth - marginLeft, 24);

      // Encabezado de columnas en negrita
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const startY = marginTop;
      doc.text("Apellidos", marginLeft, startY);
      doc.text("Nombre", marginLeft + 60, startY);
      doc.text("Usuario", marginLeft + 120, startY);

      // Filas de alumnos
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      let y = startY + 10;

      alumnosCurso.forEach((alumno, index) => {
        if (y + lineHeight > contentBottom) {
          doc.addPage();
          y = marginTop;

          // Repetir encabezado de página
          doc.setFontSize(14);
          doc.setFont("helvetica", "normal");
          doc.text(`Listado del curso: ${curso}`, pageWidth / 2, 20, {
            align: "center",
          });
          doc.setDrawColor(0);
          doc.setLineWidth(0.5);
          doc.line(marginLeft, 24, pageWidth - marginLeft, 24);

          // Repetir encabezado de columnas
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text("Apellidos", marginLeft, marginTop);
          doc.text("Nombre", marginLeft + 60, marginTop);
          doc.text("Usuario", marginLeft + 120, marginTop);

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          y = marginTop + 6;
        }

        doc.text(alumno.sn ?? "", marginLeft, y);
        doc.text(alumno.givenName ?? "", marginLeft + 60, y);
        doc.text(alumno.uid ?? "", marginLeft + 120, y);
        y += lineHeight;
      });
    });

    doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
  };

  useEffect(() => {
    if (showSuccessToast) {
      const timeout = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showSuccessToast]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Listado de alumnos por curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del archivo PDF
              </label>
              <Input
                type="text"
                value={nombrePdf}
                onChange={(e) => setNombrePdf(e.target.value)}
                placeholder="Ejemplo: etiquetas_2025"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                No es necesario añadir extensión .pdf, se añadirá
                automáticamente.
              </p>
            </div>
          </div>
          {loading && (
            <div className="w-full">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-4 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center text-sm mt-2 text-gray-700">
                Generando etiquetas... {progress}%
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              disabled={loading || nombrePdf.trim() === ""}
              onClick={async () => {
                setLoading(true);
                setProgress(0);
                setShowSuccessToast(false);
                try {
                  await generatePdfListadoPorCurso();
                  setShowSuccessToast(true);
                  onOpenChange?.(false);
                } finally {
                  setLoading(false);
                  setProgress(0);
                }
              }}
            >
              {loading ? "Generando..." : "Confirmar y generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          PDF generado con éxito
        </div>
      )}
    </>
  );
}
