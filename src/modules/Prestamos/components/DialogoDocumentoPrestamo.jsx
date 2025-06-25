import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DialogoDocumentoPrestamo({ open, onOpenChange, alumnos = [] }) {
  const [nombrePdf, setNombrePdf] = useState("documento_prestamo");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const generarPdfPorAlumnos = async () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = 210;
    const marginLeft = 20;
    const marginTop = 20;
    const lineHeight = 6;

    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      if (i > 0) doc.addPage();

      // Cabecera institucional
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("I.E.S. “Francisco de Orellana”", marginLeft, marginTop);
      doc.text("Junta de Extremadura", pageWidth - marginLeft, marginTop, {
        align: "right",
      });
      doc.text(
        "Consejería de Educación, Ciencia y F.P.",
        pageWidth - marginLeft,
        marginTop + 5,
        { align: "right" }
      );

      // Título
      doc.setFontSize(14);
      doc.text("DOCUMENTO PRÉSTAMO LIBROS", pageWidth / 2, marginTop + 25, {
        align: "center",
      });

      // Texto legal con nombre del alumno y curso
      let yTexto = marginTop + 35;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const nombreAlumno = alumno.nombreAlumno ?? "";
      const curso = alumno.curso ?? "";

      const parrafo =
        `D/Dª _____________________________________________________________ con DNI: ________________, como padre/madre/tutor legal del alumno/alumna ${nombreAlumno} del curso ${curso}, se responsabiliza junto con su hijo/hija del correcto uso de los libros de texto abajo indicados, ` +
        `comprometiéndose a devolverlos en la fecha que se le indique y sabiendo que en caso de pérdida o deterioro de los libros tendrán que pagar una cantidad determinada por el Consejo Escolar del Centro.`;

      const textoEnLineas = doc.splitTextToSize(
        parrafo,
        pageWidth - 2 * marginLeft
      );
      doc.text(textoEnLineas, marginLeft, yTexto);

      // Tabla de libros
      const startY = yTexto + 25 + textoEnLineas.length * 5;
      doc.setFontSize(11);
      doc.text("Libro", marginLeft, startY);
      doc.text("Entregado", marginLeft + 110, startY);
      doc.text("Devuelto", marginLeft + 150, startY);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, startY + 2, pageWidth - marginLeft, startY + 2);

      let y = startY + 8;
      doc.setFontSize(10);

      (alumno.prestamos ?? []).forEach((p) => {
        if (y > 270) {
          doc.addPage();
          y = marginTop;
        }

        const libro = p.libro ?? "";
        const devuelto = p.devuelto === true;
        const entregado = true; // siempre se considera entregado

        doc.text(libro, marginLeft, y);

        // Casilla "Entregado"
        doc.rect(marginLeft + 110, y - 4.5, 5, 5);
        if (entregado) doc.text("X", marginLeft + 110.7, y);

        // Casilla "Devuelto"
        doc.rect(marginLeft + 150, y - 4.5, 5, 5);
        if (devuelto) doc.text("X", marginLeft + 150.7, y);

        y += 8;
      });

      // Firmas
      y += 10;
      doc.setFontSize(11);
      doc.text("Trujillo, a _______", marginLeft, y);
      y += 20;
      doc.text("El alumno", marginLeft, y);
      doc.text("PADRE/MADRE/TUTOR LEGAL", pageWidth - marginLeft, y, {
        align: "right",
      });
      y += 20;
      doc.text("Fdo: _________________________", marginLeft, y);
      doc.text("Fdo: _________________________", pageWidth - marginLeft, y, {
        align: "right",
      });
      y += 8;
      doc.text("DNI: _________________", marginLeft, y);
      doc.text("DNI: _________________", pageWidth - marginLeft, y, {
        align: "right",
      });

      // Actualiza barra de progreso
      setProgress(Math.round(((i + 1) / alumnos.length) * 100));
    }

    doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              Documento préstamo libros (varios alumnos)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">
              Nombre del archivo PDF
            </label>
            <Input
              type="text"
              value={nombrePdf}
              onChange={(e) => setNombrePdf(e.target.value)}
              placeholder="documento_prestamo_2025"
            />
          </div>
          {loading && (
            <div className="w-full mt-4">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-4 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center text-sm mt-2 text-gray-700">
                Generando PDF... {progress}%
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button
              disabled={loading || alumnos.length === 0}
              onClick={async () => {
                setLoading(true);
                setProgress(0);
                setShowSuccessToast(false);
                try {
                  await generarPdfPorAlumnos();
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
