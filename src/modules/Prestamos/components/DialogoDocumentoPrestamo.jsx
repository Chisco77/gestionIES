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

function toBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}


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

      // Nueva cabecera con imágenes y texto alineado al logo izquierdo
      const imagenLogoIzquierda = "logo.png";
      const imagenLogoDerecha = "logojunta.png";

      const logoHeight = 20; // tamaño en mm
      const logoWith = 50; // tamaño en mm
      const textX = marginLeft + logoHeight + 5; // margen izquierdo + imagen + espacio

      // Carga imágenes de forma asíncrona
      const imgDataIzq = await toBase64(imagenLogoIzquierda);
      const imgDataDer = await toBase64(imagenLogoDerecha);

      // Inserta imágenes
      doc.addImage(
        imgDataIzq,
        "PNG",
        marginLeft,
        marginTop,
        logoHeight,
        logoHeight
      );
      doc.addImage(
        imgDataDer,
        "PNG",
        pageWidth - marginLeft - logoWith,
        marginTop,
        logoWith,
        logoHeight
      );

      // Inserta texto junto al logo izquierdo
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");

      const lineasCabecera = [
        "Secretaría General de Educación y F.P.",
        "Avda. Reina Mª Cristina, s/n. 10200 TRUJILLO (Cáceres)",
        "Apdo. De Correos n.º 17",
        "Teléfono: 927027790   Fax: 927027789",
        "email: ies.franciscodeorellana@edu.juntaex.es",
      ];

      lineasCabecera.forEach((linea, index) => {
        doc.text(linea, textX, marginTop + 4 + index * 2.5);
      });

      // Título
      doc.setFontSize(14);
      doc.text("DOCUMENTO PRÉSTAMO LIBROS", pageWidth / 2, marginTop + 30, {
        align: "center",
      });

      // Texto legal
      let yTexto = marginTop + 35;
      doc.setFontSize(11);

      const nombreAlumno = alumno.nombreAlumno ?? "";
      const curso = alumno.curso ?? "";

      const texto1 = `D/Dª _____________________________________________________________ con DNI: ________________, como padre/madre/tutor legal del alumno/alumna  `;
      const texto2 = ` del curso `;
      const texto3 = `, se responsabiliza junto con su hijo/hija del correcto uso de los libros de texto abajo indicados, comprometiéndose a devolverlos en la fecha que se le indique y sabiendo que en caso de pérdida o deterioro de los libros tendrán que pagar una cantidad determinada por el Consejo Escolar del Centro.`;

      const fullText = texto1 + nombreAlumno + texto2 + curso + texto3;
      const lineas = doc.splitTextToSize(fullText, pageWidth - 2 * marginLeft);

      let cursor = 0; // para saber por dónde vamos en el texto total
      for (let linea of lineas) {
        let x = marginLeft;
        doc.setFont("helvetica", "normal");

        // Calculamos el índice de esta línea en el texto completo
        const indexEnTexto = fullText.indexOf(linea, cursor);
        cursor = indexEnTexto + linea.length;

        let partes = [];
        let pos = 0;

        while (pos < linea.length) {
          const globalOffset = indexEnTexto + pos;

          // ¿Está en el rango del nombre del alumno?
          const enNombre =
            globalOffset >= texto1.length &&
            globalOffset < texto1.length + nombreAlumno.length;

          // ¿Está en el rango del curso?
          const cursoOffset =
            texto1.length + nombreAlumno.length + texto2.length;
          const enCurso =
            globalOffset >= cursoOffset &&
            globalOffset < cursoOffset + curso.length;

          const letra = linea[pos];

          // Empieza bloque nuevo
          if (
            partes.length === 0 ||
            partes[partes.length - 1].negrita !== (enNombre || enCurso)
          ) {
            partes.push({ texto: letra, negrita: enNombre || enCurso });
          } else {
            partes[partes.length - 1].texto += letra;
          }

          pos++;
        }

        for (let parte of partes) {
          doc.setFont("helvetica", parte.negrita ? "bold" : "normal");
          doc.text(parte.texto, x, yTexto);
          x += doc.getTextWidth(parte.texto);
        }

        yTexto += lineHeight;
      }

      // Tabla
      const startY = yTexto + 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
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
        const entregado = true;

        doc.text(libro, marginLeft, y);

        doc.rect(marginLeft + 110, y - 4.5, 5, 5);
        if (entregado) doc.text("X", marginLeft + 110.7, y);

        doc.rect(marginLeft + 150, y - 4.5, 5, 5);
        if (devuelto) doc.text("X", marginLeft + 150.7, y);

        y += 8;
      });

      // Firmas
      y += 10;
      doc.setFontSize(11);
      doc.text("Trujillo, a _______", marginLeft, y);
      y += 20;
      doc.text("El alumno ", marginLeft, y);
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

      // Progreso
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
