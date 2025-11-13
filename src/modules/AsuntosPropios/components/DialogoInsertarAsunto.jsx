/*import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { jsPDF } from "jspdf";

export function DialogoInsertarAsunto({ open, onClose, fecha, onSuccess }) {

  const generatePermisosPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = 210;
    const marginLeft = 20;
    const marginTop = 20;
    let y = marginTop;

    // ----- TÍTULO PRINCIPAL -----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ANEXO V", pageWidth / 2, y, { align: "center" });
    y += 10;
    doc.setFontSize(12);
    doc.text("CONCESIÓN DE PERMISOS", pageWidth / 2, y, { align: "center" });
    y += 15;

    // ----- 1. SOLICITANTE -----
    doc.setFont("helvetica", "bold");
    doc.text("1. SOLICITANTE", marginLeft, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.text("Apellidos:", marginLeft, y);
    doc.text("Nombre:", marginLeft + 80, y);
    y += 8;
    doc.text("NIF:", marginLeft, y);
    y += 8;
    doc.text("Teléfono móvil:", marginLeft, y);
    doc.text("E-mail:", marginLeft + 80, y);
    y += 8;
    doc.text("Cuerpo:", marginLeft, y);
    doc.text("Grupo:", marginLeft + 60, y);
    doc.text("Subgrupo:", marginLeft + 110, y);
    y += 10;

    doc.text("Relación jurídica:", marginLeft, y);
    y += 6;
    const opciones = [
      "Personal funcionario de carrera",
      "Personal funcionario en prácticas",
      "Personal funcionario interino",
      "Personal laboral indefinido",
      "Personal laboral temporal",
    ];
    doc.setFontSize(10);
    opciones.forEach((texto, i) => {
      doc.rect(marginLeft, y - 3, 3.5, 3.5);
      doc.text(texto, marginLeft + 6, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(11);
    doc.text("Fecha:", marginLeft, y);
    y += 8;
    doc.text("Centro de destino:", marginLeft, y);
    doc.text("Jornada:", marginLeft + 90, y);
    y += 6;
    doc.rect(marginLeft + 110, y - 4.5, 3.5, 3.5);
    doc.text("Completa", marginLeft + 115, y);
    doc.rect(marginLeft + 150, y - 4.5, 3.5, 3.5);
    doc.text("Parcial", marginLeft + 155, y);
    y += 10;

    // ----- 2. PERMISO QUE SOLICITA -----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("2. PERMISO QUE SOLICITA", marginLeft, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const permisos = [
      "Por fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica de un familiar (art. 2).",
      "Por enfermedad propia (art. 3).",
      "Por traslado de domicilio (art. 4).",
      "Realización de exámenes prenatales y técnicas de preparación al parto (art. 7).",
      "Para el cumplimiento de un deber inexcusable de carácter público o personal (art. 11).",
      "Por asuntos particulares (art. 13).",
      "Para realización de funciones sindicales o de representación del personal (art. 14).",
      "Para concurrir a exámenes finales o pruebas selectivas en el empleo público (art. 15).",
      "Por reducción de jornada para mayores de 55 años (art. 32).",
      "Otras situaciones.",
    ];

    permisos.forEach((texto) => {
      if (y > 270) {
        doc.addPage();
        y = marginTop;
      }
      doc.rect(marginLeft, y - 3, 3.5, 3.5);
      doc.text(doc.splitTextToSize(texto, 160), marginLeft + 6, y);
      y += 8;
    });

    y += 10;

    // ----- 3. DOCUMENTACIÓN QUE SE APORTA -----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("3. DOCUMENTACIÓN QUE SE APORTA", marginLeft, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const docs = [
      "Fotocopia cotejada del libro de familia o certificaciones digitales que lo sustituyan/DNI.",
      "Certificado de empadronamiento.",
      "Certificado de defunción.",
      "Fotocopia cotejada de la inscripción en el Registro Oficial de Parejas de Hecho.",
      "Documento que acredite la hospitalización o intervención quirúrgica grave.",
      "Certificado de convivencia o informe del trabajador social.",
      "Documento acreditativo de la asistencia a la prueba o examen final.",
      "Documento justificativo de revisiones médicas dentro de la jornada laboral.",
      "Documento acreditativo de la donación de sangre, médula o plaquetas.",
      "Otros: _______________________________",
    ];

    docs.forEach((texto) => {
      if (y > 270) {
        doc.addPage();
        y = marginTop;
      }
      doc.rect(marginLeft, y - 3, 3.5, 3.5);
      doc.text(doc.splitTextToSize(texto, 160), marginLeft + 6, y);
      y += 8;
    });

    y += 15;
    doc.text(
      "___________________, _____ de _________________________ de 20_______",
      marginLeft,
      y
    );
    y += 10;
    doc.text("DIRECTOR/A DEL CENTRO", pageWidth / 2, y, { align: "center" });

    doc.save("anexo_v_concesion_permisos.pdf");
  };

  const [descripcion, setDescripcion] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setDescripcion("");
    }
  }, [open]);

  const handleGuardar = async () => {
    if (!descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }

    if (!user?.username) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/asuntos-propios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid: user.username,
          fecha,
          descripcion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error || "Error desconocido al insertar asunto propio"
        );
        return;
      }

      toast.success("Asunto propio insertado correctamente");
      generatePermisosPdf(); // 🔹 Generar el PDF automáticamente
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al insertar asunto propio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="p-0 overflow-hidden rounded-lg"
      >
        <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
          <DialogTitle className="text-lg font-semibold text-center leading-snug">
            Nuevo Asunto Propio ({new Date(fecha).toLocaleDateString("es-ES")})
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <Input
              placeholder="Descripción del asunto propio"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50">
          <Button onClick={handleGuardar}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
*/

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { jsPDF } from "jspdf";

export function DialogoInsertarAsunto({ open, onClose, fecha, onSuccess }) {
  const [descripcion, setDescripcion] = useState("");
  const [showPdfDialog, setShowPdfDialog] = useState(false); // 🔹 diálogo de confirmación
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setDescripcion("");
      setShowPdfDialog(false);
    }
  }, [open]);

  const generatePermisosPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = 210;
    const marginLeft = 20;
    const marginTop = 20;
    const tableX = marginLeft;
    const tableWidth = pageWidth - marginLeft - marginLeft; // 170mm
    const textPad = 3; // Pequeño padding para el texto dentro de las celdas
    let y = marginTop;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ANEXO V", pageWidth / 2, y, { align: "center" });
    y += 10;
    doc.setFontSize(12);
    doc.text("CONCESIÓN DE PERMISOS", pageWidth / 2, y, { align: "center" });
    y += 15;

    // --- 1. SOLICITANTE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    let startY = y;
    const row1Height = 8;

    // Fila 1: Título de la sección
    doc.text("1. SOLICITANTE", tableX + textPad, y + row1Height - 2);
    y += row1Height;
    doc.line(tableX, y, tableX + tableWidth, y); // Línea horizontal

    // Fila 2: Apellidos, Nombre, NIF
    const row2Height = 10;
    const col1Width = 70;
    const col2Width = 60;
    // const col3Width = 40; // 170 total
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Apellidos:", tableX + textPad, y + row2Height - 3);
    doc.line(tableX + col1Width, y, tableX + col1Width, y + row2Height); // V-line
    doc.text("Nombre:", tableX + col1Width + textPad, y + row2Height - 3);
    doc.line(
      tableX + col1Width + col2Width,
      y,
      tableX + col1Width + col2Width,
      y + row2Height
    ); // V-line
    doc.text(
      "NIF:",
      tableX + col1Width + col2Width + textPad,
      y + row2Height - 3
    );
    y += row2Height;
    doc.line(tableX, y, tableX + tableWidth, y); // H-line

    // Fila 3: Teléfono, E-mail
    const row3Height = 10;
    const col3_1Width = 85;
    doc.text("Teléfono móvil:", tableX + textPad, y + row3Height - 3);
    doc.line(tableX + col3_1Width, y, tableX + col3_1Width, y + row3Height); // V-line
    doc.text("E-mail:", tableX + col3_1Width + textPad, y + row3Height - 3);
    y += row3Height;
    doc.line(tableX, y, tableX + tableWidth, y); // H-line

    // Fila 4: Cuerpo, Grupo, Subgrupo
    const row4Height = 10;
    const col4_1Width = 70;
    const col4_2Width = 50;
    doc.text("Cuerpo:", tableX + textPad, y + row4Height - 3);
    doc.line(tableX + col4_1Width, y, tableX + col4_1Width, y + row4Height); // V-line
    doc.text("Grupo:", tableX + col4_1Width + textPad, y + row4Height - 3);
    doc.line(
      tableX + col4_1Width + col4_2Width,
      y,
      tableX + col4_1Width + col4_2Width,
      y + row4Height
    ); // V-line
    doc.text(
      "Subgrupo:",
      tableX + col4_1Width + col4_2Width + textPad,
      y + row4Height - 3
    );
    y += row4Height;
    doc.line(tableX, y, tableX + tableWidth, y); // H-line

    // Fila 5: Relación jurídica (Checkboxes)
    // Para que coincida con el original, he reestructurado tus 'opciones'
    const row5Height = 24;
    doc.setFontSize(11);
    doc.text(
      "(Marcar con una x el recuadro correspondiente)",
      tableX + 45,
      y + 6
    );
    doc.setFont("helvetica", "bold");
    doc.text("Relación jurídica:", tableX + textPad, y + 6);
    doc.setFont("helvetica", "normal");

    const opciones = [
      "Personal funcionario de carrera",
      "Personal funcionario en prácticas",
      "Personal funcionario interino",
      "Personal laboral indefinido",
      "Personal laboral temporal",
    ];
    doc.setFontSize(10);

    // Repartimos las opciones para que se parezca al original
    let checkY = y + 11;
    doc.rect(tableX + 5, checkY - 3, 3.5, 3.5);
    doc.text(opciones[0], tableX + 10, checkY); // Carrera
    doc.rect(tableX + 80, checkY - 3, 3.5, 3.5);
    doc.text(opciones[1], tableX + 85, checkY); // Prácticas

    checkY += 7;
    doc.rect(tableX + 5, checkY - 3, 3.5, 3.5);
    doc.text(opciones[2], tableX + 10, checkY); // Interino
    doc.rect(tableX + 80, checkY - 3, 3.5, 3.5);
    doc.text(opciones[3], tableX + 85, checkY); // Indefinido

    checkY += 7;
    doc.rect(tableX + 5, checkY - 3, 3.5, 3.5);
    doc.text(opciones[4], tableX + 10, checkY); // Temporal

    doc.setFontSize(11);
    y += row5Height;
    doc.line(tableX, y, tableX + tableWidth, y); // H-line

    // Fila 6: Fecha, Centro de destino, Jornada
    const row6Height = 10;
    const col6_1Width = 70;
    doc.text("Fecha:", tableX + textPad, y + row6Height - 3);
    doc.line(tableX + col6_1Width, y, tableX + col6_1Width, y + row6Height * 2); // V-line
    doc.text(
      "Centro de destino:",
      tableX + col6_1Width + textPad,
      y + row6Height - 3
    );
    y += row6Height;
    doc.line(tableX, y, tableX + tableWidth, y); // H-line

    // Fila 7: (Vacía) | Jornada
    const row7Height = 10;
    doc.text("Jornada:", tableX + col6_1Width + textPad, y + row7Height - 3);
    doc.rect(tableX + 95, y + row7Height - 7, 3.5, 3.5);
    doc.text("Completa", tableX + 100, y + row7Height - 3);
    doc.rect(marginLeft + 125, y + row7Height - 7, 3.5, 3.5);
    doc.text("Parcial", marginLeft + 130, y + row7Height - 3);
    y += row7Height;

    // Dibujar el contenedor exterior de la Sección 1
    doc.rect(tableX, startY, tableWidth, y - startY);

    y += 10;

    // --- 2. PERMISO QUE SOLICITA ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    startY = y;

    // Fila 1: Título
    const row2_1Height = 8;
    doc.text("2. PERMISO QUE SOLICITA", tableX + textPad, y + row2_1Height - 2);
    y += row2_1Height;
    doc.line(tableX, y, tableX + tableWidth, y); // H-line

    // Fila 2: Permisos (en dos columnas, como el original)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("PERMISOS:", tableX + textPad, y + 6);

    const permisos = [
      "Por fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica de un familiar (art. 2).",
      "Por enfermedad propia (art. 3).",
      "Por traslado de domicilio (art. 4).",
      "Realización de exámenes prenatales y técnicas de preparación al parto (art. 7).",
      "Para el cumplimiento de un deber inexcusable de carácter público o personal (art. 11).",
      "Por asuntos particulares (art. 13).",
      "Para realización de funciones sindicales o de representación del personal (art. 14).",
      "Para concurrir a exámenes finales o pruebas selectivas en el empleo público (art. 15).",
      "Por reducción de jornada para mayores de 55 años (art. 32).",
      "Otras situaciones.",
    ];

    // Dividimos los permisos en dos columnas (6 izquierda, 4 derecha)
    const permisosLeft = permisos.slice(0, 6);
    const permisosRight = permisos.slice(6);

    let yLeft = y + 12;
    let yRight = y + 12;
    const colSplitX = tableX + 85; // Punto medio para la línea vertical
    const rightColTextX = colSplitX + 6;
    const leftColTextX = tableX + 6;
    const textWidth = 75; // Ancho para el splitTextToSize

    permisosLeft.forEach((texto) => {
      doc.rect(leftColTextX - 4, yLeft - 3, 3.5, 3.5);
      doc.text(doc.splitTextToSize(texto, textWidth), leftColTextX, yLeft);
      yLeft += 15; // Aumentamos el espacio para evitar solapamientos
    });

    permisosRight.forEach((texto) => {
      doc.rect(rightColTextX - 4, yRight - 3, 3.5, 3.5);
      doc.text(doc.splitTextToSize(texto, textWidth), rightColTextX, yRight);
      yRight += 15;
    });

    // La altura de la fila es la de la columna más larga
    const maxHeight = Math.max(yLeft, yRight);
    y = maxHeight;

    // Dibujar el contenedor de la Sección 2
    doc.rect(tableX, startY, tableWidth, y - startY); // Contenedor exterior
    doc.line(colSplitX, startY + row2_1Height, colSplitX, y); // V-line (divisor de columnas)

    // --- 3. DOCUMENTACIÓN QUE SE APORTA ---

    // <<< ¡AQUÍ ESTÁ EL SALTO DE PÁGINA! >>>
    doc.addPage();
    y = marginTop; // Reiniciamos 'y' para la nueva página

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    startY = y;

    // Fila 1: Título
    const row3_1Height = 8;
    doc.text(
      "3. DOCUMENTACIÓN QUE SE APORTA",
      tableX + textPad,
      y + row3_1Height - 2
    );
    y += row3_1Height;
    doc.line(tableX, y, tableX + tableWidth, y); // H-line

    // Fila 2: Documentos (tu lista, en una sola columna como la tienes)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const docs = [
      "Fotocopia cotejada del libro de familia o certificaciones digitales que lo sustituyan/DNI.",
      "Certificado de empadronamiento.",
      "Certificado de defunción.",
      "Fotocopia cotejada de la inscripción en el Registro Oficial de Parejas de Hecho.",
      "Documento que acredite la hospitalización o intervención quirúrgica grave.",
      "Certificado de convivencia o informe del trabajador social.",
      "Documento acreditativo de la asistencia a la prueba o examen final.",
      "Documento justificativo de revisiones médicas dentro de la jornada laboral.",
      "Documento acreditativo de la donación de sangre, médula o plaquetas.",
      "Otros: _______________________________",
    ];

    let yDocs = y + 6;
    docs.forEach((texto) => {
      // Comprobación de página (aunque acabamos de saltar, es buena práctica)
      if (yDocs > 270) {
        doc.addPage();
        y = marginTop;
        startY = y; // Hay que reiniciar el startY si hay un salto
        // (Habría que redibujar el título, pero para este caso no pasará)
      }
      doc.rect(tableX + 2, yDocs - 3, 3.5, 3.5);
      doc.text(doc.splitTextToSize(texto, 160), tableX + 8, yDocs);
      yDocs += 10;
    });

    y = yDocs + 5; // Damos un poco de espacio al final

    // Dibujar el contenedor de la Sección 3
    doc.rect(tableX, startY, tableWidth, y - startY);

    // --- Firma ---
    y += 15;
    doc.text(
      "___________________, _____ de _________________________ de 20_______",
      marginLeft,
      y
    );
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("DIRECTOR/A DEL CENTRO", pageWidth / 2, y, { align: "center" });

    doc.save("anexo_v_concesion_permisos.pdf");
  };
  const handleGuardar = async () => {
    if (!descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return;
    }

    if (!user?.username) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/db/asuntos-propios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid: user.username,
          fecha,
          descripcion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error || "Error desconocido al insertar asunto propio"
        );
        return;
      }

      toast.success("Asunto propio insertado correctamente");
      onSuccess?.();
      setShowPdfDialog(true); // 🔹 mostramos el diálogo de confirmación
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al insertar asunto propio");
    }
  };

  const handleConfirmarPdf = () => {
    generatePermisosPdf();
    setShowPdfDialog(false);
    onClose(); // cerramos el diálogo principal
  };

  return (
    <>
      {/* Diálogo principal */}
      <Dialog open={open} onOpenChange={onClose} modal={true}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-0 overflow-hidden rounded-lg"
        >
          <DialogHeader className="bg-green-500 text-white rounded-t-lg flex items-center justify-center py-3 px-6">
            <DialogTitle className="text-lg font-semibold text-center leading-snug">
              Nuevo Asunto Propio ({new Date(fecha).toLocaleDateString("es-ES")}
              )
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <Input
                placeholder="Descripción del asunto propio"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50">
            <Button onClick={handleGuardar}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo secundario (confirmación de PDF) */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              Asunto insertado correctamente
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-gray-600">
            ¿Desea generar el documento PDF del permiso ahora?
          </p>
          <DialogFooter className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => setShowPdfDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarPdf}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
