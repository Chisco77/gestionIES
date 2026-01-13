import { jsPDF } from "jspdf";

export function generatePermisosPdf({ empleado, permiso }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 20;
  const marginTop = 20;
  const tableX = marginLeft;
  const tableWidth = pageWidth - marginLeft * 2;
  const textPad = 3;
  let y = marginTop;

  const apellidoUsuario = empleado?.sn || "";
  const nombreUsuario = empleado?.givenName || "";
  const employeeNumber = empleado?.dni || "";

  // --- Cabecera ---
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
  doc.text("1. SOLICITANTE", tableX + textPad, y + row1Height - 2);
  y += row1Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 2: Apellidos, Nombre, DNI
  const row2Height = 10;
  const col1Width = 70;
  const col2Width = 60;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Apellidos:", tableX + textPad, y + row2Height - 3);
  doc.text(apellidoUsuario, tableX + 22, y + row2Height - 3);
  doc.line(tableX + col1Width, y, tableX + col1Width, y + row2Height);

  doc.text("Nombre:", tableX + col1Width + textPad, y + row2Height - 3);
  doc.text(nombreUsuario, tableX + col1Width + 22, y + row2Height - 3);
  doc.line(
    tableX + col1Width + col2Width,
    y,
    tableX + col1Width + col2Width,
    y + row2Height
  );

  doc.text(
    "DNI:",
    tableX + col1Width + col2Width + textPad,
    y + row2Height - 3
  );
  doc.text(
    employeeNumber,
    tableX + col1Width + col2Width + 15,
    y + row2Height - 3
  );

  y += row2Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 3: Teléfono y email
  const row3Height = 10;
  const col3_1Width = 85;
  doc.text("Teléfono móvil:", tableX + textPad, y + row3Height - 3);
  doc.line(tableX + col3_1Width, y, tableX + col3_1Width, y + row3Height);
  doc.text("E-mail:", tableX + col3_1Width + textPad, y + row3Height - 3);
  y += row3Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 4: Cuerpo, Grupo, Subgrupo
  const row4Height = 10;
  const col4_1Width = 70;
  const col4_2Width = 50;
  doc.text("Cuerpo:", tableX + textPad, y + row4Height - 3);
  doc.line(tableX + col4_1Width, y, tableX + col4_1Width, y + row4Height);
  doc.text("Grupo:", tableX + col4_1Width + textPad, y + row4Height - 3);
  doc.line(
    tableX + col4_1Width + col4_2Width,
    y,
    tableX + col4_1Width + col4_2Width,
    y + row4Height
  );
  doc.text(
    "Subgrupo:",
    tableX + col4_1Width + col4_2Width + textPad,
    y + row4Height - 3
  );
  y += row4Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 5: Relación jurídica
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
  let checkY = y + 11;

  const tipoEmpleadoMap = {
    "funcionario de carrera": "Personal funcionario de carrera",
    "funcionario en prácticas": "Personal funcionario en prácticas",
    "funcionario interino": "Personal funcionario interino",
    "laboral indefinido": "Personal laboral indefinido",
    "laboral temporal": "Personal laboral temporal",
  };

  opciones.forEach((opcion, index) => {
    const xPos = index % 2 === 0 ? 5 : 80;
    doc.rect(tableX + xPos, checkY, 3.5, 3.5);
    doc.text(opcion, tableX + (index % 2 === 0 ? 10 : 85), checkY + 3);
    if (opcion === tipoEmpleadoMap[empleado.tipo_empleado]) {
      doc.text("X", tableX + xPos + 0.3, checkY + 2.8);
    }
    if (index === 5) checkY += 7;
    if (index % 2 === 1) checkY += 7;
  });

  y += row5Height + 10;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 6: Fecha, Centro de destino, Jornada
  const row6Height = 10;
  const col6_1Width = 70;
  doc.text("Fecha:", tableX + textPad, y + row6Height - 3);
  const fechaStr = new Date(permiso.fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.text(fechaStr, tableX + 30, y + row6Height - 3);
  doc.line(tableX + col6_1Width, y, tableX + col6_1Width, y + row6Height * 2);
  doc.text(
    `Centro de destino:    ${import.meta.env.VITE_IES_NAME}`,
    tableX + col6_1Width + textPad,
    y + row6Height - 3
  );
  y += row6Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // --- MARCAR JORNADA ---
  doc.text("Jornada:", tableX + col6_1Width + textPad, y + row6Height - 3);
  const completaX = tableX + 95;
  const parcialX = marginLeft + 125;
  const yJornada = y + row6Height - 7;
  doc.rect(completaX, yJornada, 3.5, 3.5);
  doc.text("Completa", completaX + 5, y + row6Height - 3);
  doc.rect(parcialX, yJornada, 3.5, 3.5);
  doc.text("Parcial", parcialX + 5, y + row6Height - 3);
  if (empleado.jornada === 0) doc.text("X", completaX + 0.3, yJornada + 2.8);
  else if (empleado.jornada === 1)
    doc.text("X", parcialX + 0.3, yJornada + 2.8);

  y += row6Height;
  doc.rect(tableX, startY, tableWidth, y - startY);

  // --- 2. PERMISO QUE SOLICITA ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  startY = y;
  const row2_1Height = 8;
  doc.text("2. PERMISO QUE SOLICITA", tableX + textPad, y + row2_1Height - 2);
  y += row2_1Height;
  doc.line(tableX, y, tableX + tableWidth, y);

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

  // --- Mapeo numérico de tipo de permiso ---
  const tipoPermisoMap = {
    2: permisos[0],
    3: permisos[1],
    4: permisos[2],
    7: permisos[3],
    11: permisos[4],
    13: permisos[5],
    14: permisos[6],
    15: permisos[7],
    32: permisos[8],
    99: permisos[9],
  };

  const permisosLeft = permisos.slice(0, 6);
  const permisosRight = permisos.slice(6);
  let yLeft = y + 12;
  let yRight = y + 12;
  const colSplitX = tableX + 85;
  const rightColTextX = colSplitX + 6;
  const leftColTextX = tableX + 6;
  const textWidth = 75;

  permisosLeft.forEach((texto, index) => {
    doc.rect(leftColTextX - 4, yLeft - 3, 3.5, 3.5);
    if (texto === tipoPermisoMap[permiso.tipo])
      doc.text("X", leftColTextX - 3.3, yLeft);
    doc.text(doc.splitTextToSize(texto, textWidth), leftColTextX, yLeft);
    yLeft += 15;
  });

  permisosRight.forEach((texto) => {
    doc.rect(rightColTextX - 4, yRight - 3, 3.5, 3.5);
    if (texto === tipoPermisoMap[permiso.tipo])
      doc.text("X", rightColTextX - 3.3, yRight);
    doc.text(doc.splitTextToSize(texto, textWidth), rightColTextX, yRight);
    yRight += 15;
  });

  y = Math.max(yLeft, yRight);
  doc.rect(tableX, startY, tableWidth, y - startY);
  doc.line(colSplitX, startY + row2_1Height, colSplitX, y);

  // --- 3. DOCUMENTACIÓN QUE SE APORTA ---
  doc.addPage();
  y = marginTop;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  startY = y;
  const row3_1Height = 8;
  doc.text(
    "3. DOCUMENTACIÓN QUE SE APORTA",
    tableX + textPad,
    y + row3_1Height - 2
  );
  y += row3_1Height;
  doc.line(tableX, y, tableX + tableWidth, y);

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
    if (yDocs > 270) {
      doc.addPage();
      yDocs = marginTop;
    }
    doc.rect(tableX + 2, yDocs - 3, 3.5, 3.5);
    doc.text(doc.splitTextToSize(texto, 160), tableX + 8, yDocs);
    yDocs += 10;
  });

  y = yDocs + 5;
  doc.rect(tableX, startY, tableWidth, y - startY);

  // --- Firma ---
  y += 15;
  doc.text(
    "Trujillo, _____ de _________________________ de 20_______",
    marginLeft,
    y
  );
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("DIRECTOR/A DEL CENTRO", pageWidth / 2, y, { align: "center" });

  doc.save("anexo_v_concesion_permisos.pdf");
}

/**
 * Genera un PDF de etiquetas genéricas
 *
 * @param {Object} params
 * @param {string} params.prefijo
 * @param {number} params.cantidad
 * @param {number} params.totalEtiquetas
 * @param {number} params.posicionInicial
 * @param {number} params.numeroInicial
 * @param {string} params.nombrePdf
 * @param {function} [params.onProgress]
 */
export async function generateEtiquetasGenericasPdf({
  prefijo,
  cantidad,
  totalEtiquetas,
  posicionInicial,
  numeroInicial,
  nombrePdf,
  onProgress = () => {},
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const layout = {
    40: {
      cols: 4,
      rows: 10,
      width: 52.5,
      height: 29.7,
      marginX: 0,
      marginY: 0,
      spacingX: 0,
      spacingY: 0,
    },
    24: {
      cols: 3,
      rows: 8,
      width: 70,
      height: 33.8,
      marginX: 7,
      marginY: 12.7,
      spacingX: 2.5,
      spacingY: 0,
    },
  }[cantidad];

  const labelsPerPage = layout.cols * layout.rows;

  const etiquetas = Array.from(
    { length: totalEtiquetas },
    (_, i) => `${prefijo}${i + numeroInicial}`
  );

  for (let i = 0; i < etiquetas.length; i++) {
    const globalIndex = i + (posicionInicial - 1);
    if (i > 0 && globalIndex % labelsPerPage === 0) doc.addPage();

    const indexInPage = globalIndex % labelsPerPage;
    const col = indexInPage % layout.cols;
    const row = Math.floor(indexInPage / layout.cols);

    let x = layout.marginX + col * (layout.width + layout.spacingX);

    // Corrección de columnas para 24 etiquetas
    if (cantidad === 24) {
      if (col === 1) x -= 1.5;
      if (col === 2) x -= 3;
    }

    const y = layout.marginY + row * (layout.height + layout.spacingY);

    const centerX = x + layout.width / 2;
    const centerY = y + layout.height / 2;

    const numero = i + numeroInicial;

    // ---- CÁLCULO DE ANCHOS ----
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    const prefijoWidth = doc.getTextWidth(prefijo);

    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    const numeroText = `${numero}`;
    const numeroWidth = doc.getTextWidth(numeroText);

    // ---- CENTRADO HORIZONTAL REAL ----
    const totalWidth = prefijoWidth + numeroWidth;
    let startX = centerX - totalWidth / 2;

    // Ajuste óptico SOLO para 24 etiquetas
    if (cantidad === 24) {
      startX -= 1.2;
    }

    // ---- DIBUJO DEL TEXTO ----
    // Prefijo
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(prefijo, startX, centerY, { baseline: "middle" });

    // Número
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text(numeroText, startX + prefijoWidth, centerY, {
      baseline: "middle",
    });

    if (i % 10 === 0) await new Promise((r) => setTimeout(r, 0));

    onProgress(Math.round(((i + 1) / etiquetas.length) * 100));
  }

  doc.save(nombrePdf.endsWith(".pdf") ? nombrePdf : `${nombrePdf}.pdf`);
}

/**
 * Genera un PDF con el listado de profesores
 *
 * @param {Array} profesores - Array de objetos profesor con propiedades `sn` y `givenName`
 */
export function generateListadoAPs(profesores = []) {
  if (!profesores || profesores.length === 0) {
    alert("No hay profesores para generar el listado.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  const marginTop = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Listado de Profesores", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(12);
  doc.text(`Total profesores: ${profesores.length}`, marginLeft, y);
  y += 10;

  // --- Encabezado de columnas ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const col1X = marginLeft; // Apellidos
  const col2X = marginLeft + 50; // Nombre
  const col3X = marginLeft + 100; // DNI
  const col4X = marginLeft + 140; // Asuntos propios

  doc.text("Apellidos", col1X, y);
  doc.text("Nombre", col2X, y);
  doc.text("DNI", col3X, y);
  doc.text("Asuntos Propios", col4X, y);
  y += 4;
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, pageWidth - marginLeft, y);
  y += 6;

  // --- Datos ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lineHeight = 7;

  profesores.forEach((profesor) => {
    if (y > 285) {
      // salto de página
      doc.addPage();
      y = marginTop;
    }

    doc.text(profesor.sn || "", col1X, y);
    doc.text(profesor.givenName || "", col2X, y);
    doc.text(profesor.dni || "", col3X, y);
    doc.text(String(profesor.asuntos_propios || 0), col4X, y);

    y += lineHeight;
  });

  doc.save("Listado_Profesores.pdf");
}
