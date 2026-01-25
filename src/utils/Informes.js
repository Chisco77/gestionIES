import { jsPDF } from "jspdf";

import { MAPEO_TIPOS_PERMISOS } from "./mapeoTiposPermisos";

import * as XLSX from "xlsx";

const getDescripcionTipoPermiso = (tipo) =>
  MAPEO_TIPOS_PERMISOS[tipo] ?? "Otros";

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
  const telefono = empleado?.telefono || "";
  const email = empleado?.email || "";

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
    y + row2Height,
  );

  doc.text(
    "DNI:",
    tableX + col1Width + col2Width + textPad,
    y + row2Height - 3,
  );
  doc.text(
    employeeNumber,
    tableX + col1Width + col2Width + 15,
    y + row2Height - 3,
  );

  y += row2Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 3: Teléfono y email
  const row3Height = 10;
  const col3_1Width = 85;
  doc.text("Teléfono móvil:", tableX + textPad, y + row3Height - 3);
  doc.text(telefono, tableX + 35, y + row3Height - 3);
  doc.line(tableX + col3_1Width, y, tableX + col3_1Width, y + row3Height);
  doc.text("E-mail:", tableX + col3_1Width + textPad, y + row3Height - 3);
  doc.text(email, tableX + col3_1Width + 18, y + row3Height - 3);
  y += row3Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 4: Cuerpo, Grupo, Subgrupo
  const row4Height = 10;
  const col4_1Width = 70;
  const col4_2Width = 50;
  doc.text(
    "Cuerpo: Profesores de Secundaria",
    tableX + textPad,
    y + row4Height - 3,
  );
  doc.line(tableX + col4_1Width, y, tableX + col4_1Width, y + row4Height);
  doc.text("Grupo:", tableX + col4_1Width + textPad, y + row4Height - 3);
  doc.line(
    tableX + col4_1Width + col4_2Width,
    y,
    tableX + col4_1Width + col4_2Width,
    y + row4Height,
  );
  doc.text(
    "Subgrupo:",
    tableX + col4_1Width + col4_2Width + textPad,
    y + row4Height - 3,
  );
  y += row4Height;
  doc.line(tableX, y, tableX + tableWidth, y);

  // Fila 5: Relación jurídica
  const row5Height = 24;
  doc.setFontSize(11);
  doc.text(
    "(Marcar con una x el recuadro correspondiente)",
    tableX + 45,
    y + 6,
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
    y + row6Height - 3,
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

  const PERMISOS_CHECKLIST = [
    {
      tipo: 2,
      texto:
        "Por fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica de un familiar (art. 2).",
    },
    { tipo: 3, texto: "Por enfermedad propia (art. 3)." },
    { tipo: 4, texto: "Por traslado de domicilio (art. 4)." },
    {
      tipo: 7,
      texto:
        "Realización de exámenes prenatales y técnicas de preparación al parto (art. 7).",
    },
    {
      tipo: 11,
      texto:
        "Para el cumplimiento de un deber inexcusable de carácter público o personal (art. 11).",
    },
    { tipo: 13, texto: "Por asuntos particulares (art. 13)." },
    {
      tipo: 14,
      texto:
        "Para realización de funciones sindicales o de representación del personal (art. 14).",
    },
    {
      tipo: 15,
      texto:
        "Para concurrir a exámenes finales o pruebas selectivas en el empleo público (art. 15).",
    },
    {
      tipo: 32,
      texto: "Por reducción de jornada para mayores de 55 años (art. 32).",
    },
    { tipo: 0, texto: "Otras situaciones." },
  ];

  const permisosLeft = PERMISOS_CHECKLIST.slice(0, 6);
  const permisosRight = PERMISOS_CHECKLIST.slice(6);

  let yLeft = y + 12;
  let yRight = y + 12;
  const colSplitX = tableX + 85;
  const rightColTextX = colSplitX + 6;
  const leftColTextX = tableX + 6;
  const textWidth = 75;

  permisosLeft.forEach(({ tipo, texto }) => {
    doc.rect(leftColTextX - 4, yLeft - 3, 3.5, 3.5);
    if (permiso.tipo === tipo) {
      doc.text("X", leftColTextX - 3.3, yLeft);
    }
    doc.text(doc.splitTextToSize(texto, textWidth), leftColTextX, yLeft);
    yLeft += 15;
  });

  permisosRight.forEach(({ tipo, texto }) => {
    doc.rect(rightColTextX - 4, yRight - 3, 3.5, 3.5);
    if (permiso.tipo === tipo) {
      doc.text("X", rightColTextX - 3.3, yRight);
    }
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
    y + row3_1Height - 2,
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
    y,
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
    (_, i) => `${prefijo}${i + numeroInicial}`,
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

/**
 * Genera un PDF con los asuntos propios agrupados por profesor
 *
 * @param {Array} permisos - Array de asuntos propios (filtrados)
 */
export function generateListadoPermisosProfesores(permisos = []) {
  if (!permisos || permisos.length === 0) {
    alert("No hay permisos para generar el informe.");
    return;
  }

  const estadosMap = { 0: "Pendiente", 1: "Aceptado", 2: "Rechazado" };

  const permisosPorProfesor = permisos.reduce((acc, permiso) => {
    const nombre = permiso.nombreProfesor || "Sin nombre";
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(permiso);
    return acc;
  }, {});

  Object.values(permisosPorProfesor).forEach((lista) =>
    lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
  );

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  const espacioEntreProfesores = 8;
  const lineHeight = 5;
  const resumenHeight = 14 + 3 + 6;

  // --- Cabecera general ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Listado de Permisos por Profesor", pageWidth / 2, y, {
    align: "center",
  });
  y += 12;

  const nombresProfesores = Object.keys(permisosPorProfesor).sort();
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total profesores: ${nombresProfesores.length}`, marginLeft, y);
  y += 10;

  const colFechaX = marginLeft;
  const colTipoX = marginLeft + 28;
  const colEstadoX = marginLeft + 115;
  const colDescX = marginLeft + 145;

  // --- Contenido ---
  nombresProfesores.forEach((nombreProfesor) => {
    const listaPermisos = permisosPorProfesor[nombreProfesor];

    // --- Calcular altura mínima para evitar huérfanos ---
    const firstRow = listaPermisos[0];
    const tipoLinesFirst = doc.splitTextToSize(
      getDescripcionTipoPermiso(firstRow.tipo),
      80,
    ).length;
    const estadoLinesFirst = doc.splitTextToSize(
      estadosMap[firstRow.estado] ?? "—",
      25,
    ).length;
    const descLinesFirst = doc.splitTextToSize(
      firstRow.descripcion || "",
      50,
    ).length;
    const firstRowHeight =
      Math.max(tipoLinesFirst, estadoLinesFirst, descLinesFirst, 1) *
      lineHeight;

    const headerHeight = 8; // encabezado tabla
    const nombreHeight = 10; // nombre + línea
    const minSpaceNeeded =
      nombreHeight + headerHeight + firstRowHeight + resumenHeight;

    if (y + minSpaceNeeded > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }

    // --- Nombre profesor ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(nombreProfesor, marginLeft, y);
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
    function printTableHeader() {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Fecha", colFechaX, y);
      doc.text("Tipo de permiso", colTipoX, y);
      doc.text("Estado", colEstadoX, y);
      doc.text("Descripción", colDescX, y);
      y += 4;
      doc.setLineWidth(0.3);
      doc.line(marginLeft, y, pageWidth - marginLeft, y);
      y += 4;
    }

    printTableHeader();

    // --- Filas ---
    listaPermisos.forEach((permiso) => {
      const fechaTxt = new Date(permiso.fecha).toLocaleDateString();
      const tipoTxt = getDescripcionTipoPermiso(permiso.tipo);
      const estadoTxt = estadosMap[permiso.estado] ?? "—";
      const descTxt = permiso.descripcion || "";

      const tipoLines = doc.splitTextToSize(tipoTxt, 80).join("\n");
      const estadoLines = doc.splitTextToSize(estadoTxt, 25).join("\n");
      const descLines = doc.splitTextToSize(descTxt, 50).join("\n");

      const rowLines = Math.max(
        tipoLines.split("\n").length,
        estadoLines.split("\n").length,
        descLines.split("\n").length,
        1,
      );
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight + resumenHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
        printTableHeader();
      }

      // Color según estado
      if (permiso.estado === 1) doc.setTextColor(0, 120, 0);
      else if (permiso.estado === 2) doc.setTextColor(180, 0, 0);
      else doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "normal");
      doc.text(fechaTxt, colFechaX, y);
      doc.text(tipoLines, colTipoX, y);
      doc.text(estadoLines, colEstadoX, y);
      doc.text(descLines, colDescX, y);

      y += rowHeight + 2;
    });

    y += 4;

    // --- Resumen ---
    const permisosAP = listaPermisos.filter((p) => p.tipo === 13);
    const solicitados = permisosAP.length;
    const aceptados = permisosAP.filter((p) => p.estado === 1).length;
    const rechazados = permisosAP.filter((p) => p.estado === 2).length;
    const apTotal = listaPermisos[0]?.ap_total ?? 0;
    const disponibles = apTotal - aceptados;

    const boxWidth = 120;
    const boxHeight = 14;
    const labelHeight = 3;
    const totalHeightNeeded = boxHeight + labelHeight + 6;

    if (y + totalHeightNeeded > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }

    const boxX = pageWidth - marginLeft - boxWidth;
    const boxY = y + labelHeight;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumen Asuntos Propios", boxX + boxWidth, y + 1, {
      align: "right",
    });

    doc.setLineWidth(0.4);
    doc.rect(boxX, boxY, boxWidth, boxHeight);

    const colWidth = boxWidth / 4;
    const headerY = boxY + 5;
    const valueY = boxY + 10;

    doc.setFontSize(9);
    doc.text("Solicitados", boxX + colWidth * 0.5, headerY, {
      align: "center",
    });
    doc.text("Aceptados", boxX + colWidth * 1.5, headerY, { align: "center" });
    doc.text("Rechazados", boxX + colWidth * 2.5, headerY, { align: "center" });
    doc.text("Disponibles", boxX + colWidth * 3.5, headerY, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(String(solicitados), boxX + colWidth * 0.5, valueY, {
      align: "center",
    });
    doc.text(String(aceptados), boxX + colWidth * 1.5, valueY, {
      align: "center",
    });
    if (rechazados > 0) doc.setTextColor(180, 0, 0);
    doc.text(String(rechazados), boxX + colWidth * 2.5, valueY, {
      align: "center",
    });
    doc.setTextColor(disponibles > 0 ? 0 : 0, disponibles > 0 ? 120 : 0, 0);
    doc.text(String(disponibles), boxX + colWidth * 3.5, valueY, {
      align: "center",
    });

    doc.setTextColor(0, 0, 0);
    y += totalHeightNeeded + espacioEntreProfesores;
  });

  // --- Pie de página ---
  const totalPages = doc.getNumberOfPages();
  const now = new Date();
  const fecha = now.toLocaleDateString();
  const hora = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const yPie = pageHeight - 10;

    // Línea horizontal sobre el pie
    doc.setLineWidth(0.3);
    doc.line(marginLeft, yPie - 3, pageWidth - marginLeft, yPie - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    // Fecha y hora a la izquierda
    doc.text(`Informe generado el ${fecha} a las ${hora}`, marginLeft, yPie);

    // Número de página a la derecha
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginLeft, yPie, {
      align: "right",
    });
  }

  doc.save("Listado_Asuntos_Propios_Profesores.pdf");
}

/*
Listado de actividades extraescolares, agrupadas por profesor.
*/
export function generateListadoExtraescolaresPorProfesor(actividades = []) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  // --- Mapas auxiliares ---
  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  // --- Ordenar por fecha de celebración ---
  const actividadesOrdenadas = [...actividades].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
  );

  // --- Agrupar por profesor ---
  const actividadesPorProfesor = actividadesOrdenadas.reduce((acc, act) => {
    const nombre = act.nombreProfesor || "Sin profesor";
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(act);
    return acc;
  }, {});

  const profesores = Object.keys(actividadesPorProfesor).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );

  // --- PDF base ---
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "Listado de Actividades Extraescolares por Profesor",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFontSize(11);
  doc.text(`Total profesores: ${profesores.length}`, marginLeft, y);
  y += 10;

  // --- Columnas ---
  const colFechaX = marginLeft;
  const colTituloX = marginLeft + 28;
  const colCursosX = marginLeft + 110;
  const colEstadoX = marginLeft + 170;

  const colTituloWidth = 80;
  const colCursosWidth = 55;
  const lineHeight = 5;

  // --- Contenido ---
  profesores.forEach((profesor) => {
    const lista = actividadesPorProfesor[profesor];

    if (y > 260) {
      doc.addPage();
      y = marginTop;
    }

    // --- Nombre profesor ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(profesor, marginLeft, y);
    y += 4;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
    doc.setFontSize(10);
    doc.text("Fecha", colFechaX, y);
    doc.text("Actividad", colTituloX, y);
    doc.text("Cursos", colCursosX, y);
    doc.text("Estado", colEstadoX, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 4;

    doc.setFont("helvetica", "normal");

    // --- Filas ---
    lista.forEach((act) => {
      const fechaTxt = new Date(act.fecha_inicio).toLocaleDateString("es-ES");
      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);

      const cursosTxt =
        Array.isArray(act.cursos) && act.cursos.length
          ? act.cursos.map((c) => c.nombre).join(", ")
          : "-";
      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";

      const rowLines = Math.max(tituloLines.length, cursosLines.length, 1);
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > 297 - marginBottom) {
        doc.addPage();
        y = marginTop;
      }

      doc.text(fechaTxt, colFechaX, y);
      doc.text(tituloLines, colTituloX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoTxt, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 8;
  });

  doc.save("Listado_Extraescolares_por_Profesor.pdf");
}

/*
Genera listado extraescolares agrupadas por fecha inicio
con columnas: Actividad, Profesor, Departamento, Cursos y Estado
*/
export function generateListadoExtraescolaresPorFecha(actividades = []) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  // --- Mapas auxiliares ---
  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  // --- Ordenar por fecha_inicio ---
  const ordenadas = [...actividades].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
  );

  // --- Agrupar por fecha_inicio (YYYY-MM-DD) ---
  const actividadesPorFecha = ordenadas.reduce((acc, act) => {
    const fechaKey = new Date(act.fecha_inicio).toISOString().slice(0, 10);
    if (!acc[fechaKey]) acc[fechaKey] = [];
    acc[fechaKey].push(act);
    return acc;
  }, {});

  const fechas = Object.keys(actividadesPorFecha).sort();

  // --- PDF base ---
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "Listado de Actividades Extraescolares por Fecha",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFontSize(11);
  doc.text(`Total actividades: ${ordenadas.length}`, marginLeft, y);
  y += 10;

  // --- Columnas (ancho ajustado según petición) ---
  const colTituloX = marginLeft; // Actividad
  const colProfesorX = colTituloX + 55; // Profesor
  const colDepartamentoX = colProfesorX + 47; // Departamento
  const colCursosX = colDepartamentoX + 30; // Cursos
  const colEstadoX = colCursosX + 40; // Estado

  const colTituloWidth = 55;
  const colProfesorWidth = 47;
  const colDepartamentoWidth = 30;
  const colCursosWidth = 40;
  const colEstadoWidth = 18;

  const lineHeight = 5;

  // --- Contenido ---
  fechas.forEach((fechaKey) => {
    const lista = actividadesPorFecha[fechaKey];
    const fechaLegible = new Date(fechaKey).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (y > 260) {
      doc.addPage();
      y = marginTop;
    }

    // --- Cabecera fecha ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(fechaLegible, marginLeft, y);
    y += 4;

    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
    doc.setFontSize(10);
    doc.text("Actividad", colTituloX, y);
    doc.text("Profesor", colProfesorX, y);
    doc.text("Departamento", colDepartamentoX, y);
    doc.text("Cursos", colCursosX, y);
    doc.text("Estado", colEstadoX, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 4;

    doc.setFont("helvetica", "normal");

    // --- Filas ---
    lista.forEach((act) => {
      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);
      const profesorLines = doc.splitTextToSize(
        act.nombreProfesor || "",
        colProfesorWidth,
      );
      const departamentoLines = doc.splitTextToSize(
        act.departamento?.nombre || "-",
        colDepartamentoWidth,
      );

      const cursosTxt =
        Array.isArray(act.cursos) && act.cursos.length
          ? act.cursos.map((c) => c.nombre).join(", ")
          : "-";
      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";
      const estadoLines = doc.splitTextToSize(estadoTxt, colEstadoWidth);

      const rowLines = Math.max(
        tituloLines.length,
        profesorLines.length,
        departamentoLines.length,
        cursosLines.length,
        estadoLines.length,
        1,
      );
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > 297 - marginBottom) {
        doc.addPage();
        y = marginTop;
      }

      doc.text(tituloLines, colTituloX, y);
      doc.text(profesorLines, colProfesorX, y);
      doc.text(departamentoLines, colDepartamentoX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoLines, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 8;
  });

  doc.save("Listado_Extraescolares_por_Fecha.pdf");
}

/*
Genera listado extraescolares agrupadas por departamento
*/

export function generateListadoExtraescolaresPorDepartamento(actividades = []) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  // --- Mapas auxiliares ---
  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  // --- Agrupar por departamento ---
  const actividadesPorDepartamento = actividades.reduce((acc, act) => {
    const depto = act.departamento?.nombre || "Departamento desconocido";

    if (!acc[depto]) acc[depto] = [];
    acc[depto].push(act);
    return acc;
  }, {});

  // --- Ordenar departamentos alfabéticamente ---
  const departamentos = Object.keys(actividadesPorDepartamento).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );

  // --- PDF base ---
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 20;
  let y = marginTop;

  // --- Cabecera ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "Listado de Actividades Extraescolares por Departamento",
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFontSize(11);
  doc.text(`Total actividades: ${actividades.length}`, marginLeft, y);
  y += 10;

  // --- Columnas
  const colFechaX = marginLeft;
  const colProfesorX = marginLeft + 25;
  const colTituloX = marginLeft + 75;
  const colCursosX = marginLeft + 125;
  const colEstadoX = marginLeft + 170;

  const colProfesorWidth = 45;
  const colTituloWidth = 45;
  const colCursosWidth = 40;

  const lineHeight = 5;

  // --- Contenido ---
  departamentos.forEach((depto) => {
    const lista = [...actividadesPorDepartamento[depto]];

    // --- Orden interno: fecha - profesor ---
    lista.sort((a, b) => {
      const fDiff = new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
      if (fDiff !== 0) return fDiff;

      return (a.nombreProfesor || "").localeCompare(
        b.nombreProfesor || "",
        "es",
        { sensitivity: "base" },
      );
    });

    if (y > 260) {
      doc.addPage();
      y = marginTop;
    }

    // --- Cabecera departamento ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(depto, marginLeft, y);
    y += 4;

    doc.setLineWidth(0.6);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // --- Encabezado tabla ---
    doc.setFontSize(10);
    doc.text("Fecha", colFechaX, y);
    doc.text("Profesor", colProfesorX, y);
    doc.text("Actividad", colTituloX, y);
    doc.text("Cursos", colCursosX, y);
    doc.text("Estado", colEstadoX, y);
    y += 4;

    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 4;

    doc.setFont("helvetica", "normal");

    // --- Filas ---
    lista.forEach((act) => {
      const fechaTxt = act.fecha_inicio
        ? new Date(act.fecha_inicio).toLocaleDateString("es-ES")
        : "—";

      const profesorLines = doc.splitTextToSize(
        act.nombreProfesor || "",
        colProfesorWidth,
      );

      const tituloLines = doc.splitTextToSize(act.titulo || "", colTituloWidth);

      const cursosTxt = Array.isArray(act.cursos)
        ? act.cursos.map((c) => c.nombre).join(", ")
        : "";

      const cursosLines = doc.splitTextToSize(cursosTxt, colCursosWidth);

      const estadoTxt = estadosMap[act.estado] ?? "—";

      const rowLines = Math.max(
        profesorLines.length,
        tituloLines.length,
        cursosLines.length,
        1,
      );
      const rowHeight = rowLines * lineHeight;

      if (y + rowHeight > 297 - marginBottom) {
        doc.addPage();
        y = marginTop;
      }

      doc.text(fechaTxt, colFechaX, y);
      doc.text(profesorLines, colProfesorX, y);
      doc.text(tituloLines, colTituloX, y);
      doc.text(cursosLines, colCursosX, y);
      doc.text(estadoTxt, colEstadoX, y);

      y += rowHeight + 2;
    });

    y += 10;
  });

  doc.save("Listado_Extraescolares_por_Departamento.pdf");
}

/*
Genera listado extraescolares en ODS con columnas:
Departamento, Fecha, Actividad, Profesor, Cursos, Estado
*/
export function generateListadoExtraescolaresPorDepartamentoXLS(
  actividades = [],
) {
  if (!actividades.length) {
    alert("No hay actividades para generar el listado.");
    return;
  }

  const estadosMap = {
    0: "Pendiente",
    1: "Aceptada",
    2: "Rechazada",
  };

  // Construir datos para la hoja
  const wsData = [];

  // --- Fila de encabezado ---
  wsData.push([
    "Departamento",
    "Fecha",
    "Actividad",
    "Profesor",
    "Cursos",
    "Estado",
  ]);

  // --- Ordenar primero por departamento alfabéticamente, luego por fecha y profesor ---
  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    const deptA = a.departamento?.nombre || "";
    const deptB = b.departamento?.nombre || "";
    const deptComp = deptA.localeCompare(deptB, "es", { sensitivity: "base" });
    if (deptComp !== 0) return deptComp;

    const fechaDiff = new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
    if (fechaDiff !== 0) return fechaDiff;

    return (a.nombreProfesor || "").localeCompare(
      b.nombreProfesor || "",
      "es",
      { sensitivity: "base" },
    );
  });

  // --- Rellenar filas ---
  actividadesOrdenadas.forEach((act) => {
    const depto = act.departamento?.nombre || "Departamento desconocido";
    const fechaTxt = act.fecha_inicio
      ? new Date(act.fecha_inicio).toLocaleDateString("es-ES")
      : "—";
    const titulo = act.titulo || "-";
    const profesor = act.nombreProfesor || "-";
    const cursosTxt =
      Array.isArray(act.cursos) && act.cursos.length
        ? act.cursos.map((c) => c.nombre).join(", ")
        : "-";
    const estadoTxt = estadosMap[act.estado] ?? "—";

    wsData.push([depto, fechaTxt, titulo, profesor, cursosTxt, estadoTxt]);
  });

  // --- Crear workbook y sheet ---
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Anchos de columnas aproximados
  ws["!cols"] = [
    { wch: 20 }, // Departamento
    { wch: 15 }, // Fecha
    { wch: 35 }, // Actividad
    { wch: 25 }, // Profesor
    { wch: 30 }, // Cursos
    { wch: 12 }, // Estado
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Extraescolares");

  // Generar ODS
  const oidata = XLSX.write(wb, { bookType: "ods", type: "array" });
  const blob = new Blob([oidata], {
    type: "application/vnd.oasis.opendocument.spreadsheet",
  });

  // Descargar
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Listado_Extraescolares.ods";
  a.click();
  URL.revokeObjectURL(url);
}
