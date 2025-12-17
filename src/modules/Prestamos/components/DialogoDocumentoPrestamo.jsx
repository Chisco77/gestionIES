/**
 * Componente: DialogoDocumentoPrestamo
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 *
 * Este componente muestra un diálogo para generar un PDF de documentos de préstamo
 * de libros para varios alumnos. Cada alumno genera una página con su información,
 * lista de préstamos y normativa de uso de libros.
 *
 * Props:
 *   - open: boolean → indica si el diálogo está abierto.
 *   - onOpenChange: function → callback que se ejecuta al abrir/cerrar el diálogo.
 *   - alumnos: array → lista de objetos de alumnos, cada uno con propiedades:
 *       - nombreUsuario: string → nombre completo del alumno.
 *       - curso: string → curso del alumno.
 *       - prestamos: array → lista de libros prestados con:
 *           - libro: string → nombre del libro.
 *           - devuelto: boolean → indica si el libro fue devuelto.
 *
 * Estados internos:
 *   - nombrePdf: string → nombre del archivo PDF a generar.
 *   - loading: boolean → indica si se está generando el PDF.
 *   - progress: number → porcentaje de progreso de generación.
 *   - showSuccessToast: boolean → controla la visualización del toast de éxito.
 *
 * Funciones principales:
 *   - toBase64(url): Promise → convierte una imagen desde URL a base64 para usar en jsPDF.
 *   - generarPdfPorAlumnos(): genera un PDF usando jsPDF:
 *       1. Añade cabecera con logos y datos del centro.
 *       2. Inserta texto legal incluyendo nombre y curso del alumno en negrita.
 *       3. Genera tabla con libros, marcas de entregado/devuelto.
 *       4. Añade secciones de firma y normativa de uso de libros.
 *       5. Maneja múltiples páginas si el contenido excede una página.
 *       6. Actualiza progreso mientras recorre los alumnos.
 *       7. Guarda el archivo con el nombre indicado en `nombrePdf`.
 *
 * Librerías/componentes usados:
 *   - React: useState, useEffect
 *   - jsPDF: generación de documentos PDF
 *   - Dialog/DialogContent/DialogHeader/DialogTitle/DialogFooter
 *   - Input, Button: componentes UI
 *
 */

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
  const lineasCabecera = [
    import.meta.env.VITE_DIRECCION_LINEA_1,
    import.meta.env.VITE_DIRECCION_LINEA_2,
    import.meta.env.VITE_DIRECCION_LINEA_3,
    import.meta.env.VITE_DIRECCION_LINEA_4,
    import.meta.env.VITE_DIRECCION_LINEA_5,
  ].filter(Boolean);

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

      lineasCabecera.forEach((linea, index) => {
        doc.text(linea, textX, marginTop + 4 + index * 2.5);
      });

      // Título
      doc.setFontSize(14);
      doc.text("DOCUMENTO PRÉSTAMO LIBROS", pageWidth / 2, marginTop + 30, {
        align: "center",
      });

      // Texto legal
      let yTexto = marginTop + 37;
      doc.setFontSize(11);

      const nombreUsuario = " " + alumno.nombreUsuario ?? "";
      const curso = alumno.curso ?? "";

      const texto1 = `D/Dª _____________________________________________________________ con DNI: ________________, como padre/madre/tutor legal del alumno/alumna  `;
      const texto2 = ` del curso `;
      const texto3 = `, se responsabiliza junto con su hijo/hija del correcto uso de los libros de texto abajo indicados, comprometiéndose a devolverlos en la fecha que se le indique y sabiendo que en caso de pérdida o deterioro de los libros tendrán que pagar una cantidad determinada por el Consejo Escolar del Centro.`;

      const fullText = texto1 + nombreUsuario + texto2 + curso + texto3;
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
            globalOffset < texto1.length + nombreUsuario.length;

          // ¿Está en el rango del curso?
          const cursoOffset =
            texto1.length + nombreUsuario.length + texto2.length;
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

      doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        "Normas de uso de los libros de texto",
        pageWidth / 2,
        marginTop,
        {
          align: "center",
        }
      );

      y = marginTop + 15;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      // Párrafo inicial
      const textoIntro =
        "El libro de texto adquirido es un bien común y social, tú lo disfrutarás este curso y el próximo curso, otro alumno debe recibirlo en perfecto estado.";
      const lineasIntro = doc.splitTextToSize(
        textoIntro,
        pageWidth - 2 * marginLeft
      );
      lineasIntro.forEach((linea) => {
        doc.text(linea, marginLeft, y);
        y += lineHeight;
      });

      y += 5;

      // Subtítulo
      doc.setFont("helvetica", "bold");
      doc.text("El alumno está obligado a:", marginLeft, y);
      y += lineHeight + 2;

      // Lista con viñetas y sangría
      const obligaciones = [
        "Forrar los libros para una mejor conservación de los mismos.",
        "Custodiar correctamente sus libros y material escolar.",
        "Comunicar su pérdida o extravío al tutor o a la educadora social de manera inmediata.",
        "Abonar la cantidad de 40 euros acordada en reunión del Consejo Escolar en caso de pérdida o deterioro total.",
      ];

      doc.setFont("helvetica", "normal");
      obligaciones.forEach((item) => {
        const texto = "• " + item; // viñeta con punto
        const lineas = doc.splitTextToSize(
          texto,
          pageWidth - 2 * marginLeft - 10
        );

        lineas.forEach((linea, index) => {
          const x = index === 0 ? marginLeft + 5 : marginLeft + 10; // sangría
          doc.text(linea, x, y);
          y += lineHeight;
        });

        y += 2; // espacio entre puntos
      });

      y += 5;
      doc.setFont("helvetica", "normal");
      const textoFinal =
        "Educando en la responsabilidad conseguiremos unos adultos socialmente competentes.";
      const lineasFinal = doc.splitTextToSize(
        textoFinal,
        pageWidth - 2 * marginLeft
      );
      lineasFinal.forEach((linea) => {
        doc.text(linea, marginLeft, y);
        y += lineHeight;
      });

      y += 10;

      // Línea centrada
      doc.setFont("helvetica", "bold");
      doc.text("ES TAREA DE TODOS.", pageWidth / 2, y, { align: "center" });

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
