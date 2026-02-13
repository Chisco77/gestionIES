/**
 * permisosPdf.js
 *
 * Funciones para generar PDFs relacionados con los permisos del personal docente.
 * Permite exportar tanto el ANEXO V de concesión de permisos como listados agrupados
 * por profesor, incluyendo información detallada de fechas, tipo de permiso, estado
 * y descripción, así como resúmenes de Asuntos Propios.
 *
 * Funciones exportadas:
 *
 * 1. generatePermisosPdf({ empleado, permiso })
 *    - Genera el ANEXO V para un empleado.
 *    - Incluye datos del solicitante (apellidos, nombre, DNI, teléfono, email),
 *      relación jurídica, cuerpo, grupo, subgrupo y jornada.
 *    - Muestra los permisos solicitados con opción marcada según tipo.
 *    - Añade documentación aportada y firma del director/a.
 *
 * 2. generateListadoPermisosProfesores(permisos)
 *    - Genera un listado PDF de todos los permisos agrupados por profesor.
 *    - Columnas: Fecha, Tipo de permiso, Estado y Descripción.
 *    - Ordena permisos cronológicamente dentro de cada profesor.
 *    - Colorea estados: Pendiente = negro, Aceptado = verde, Rechazado = rojo.
 *    - Añade resumen de Asuntos Propios (Solicitados, Aceptados, Rechazados, Disponibles).
 *    - Gestiona paginación automática y evita huérfanos.
 *
 * Utilidades internas:
 * - drawHeader(doc, title), drawFooter(doc), addPageWithHeader(doc, title): funciones auxiliares
 *   para cabecera, pie de página y paginación automática.
 * - getDescripcionTipoPermiso(tipo): devuelve la descripción legible del tipo de permiso.
 *
 * Características generales:
 * - Maneja saltos de página automáticos si no hay espacio suficiente.
 * - Ajusta tamaño de columnas y filas según contenido.
 * - Compatible con jsPDF para generación de PDFs.
 *
 * Uso:
 * generatePermisosPdf({ empleado, permiso });
 * generateListadoPermisosProfesores(listaDePermisos);
 *
 * ------------------------------------------------------------
 * Autor: Francisco Damian Mendez Palma
 * Email: adminies.franciscodeorellana@educarex.es
 * GitHub: https://github.com/Chisco77
 * Repositorio: https://github.com/Chisco77/gestionIES.git
 * IES Francisco de Orellana - Trujillo
 * ------------------------------------------------------------
 */

import { jsPDF } from "jspdf";
import { drawHeader, drawFooter, addPageWithHeader } from "./utils";

import { MAPEO_TIPOS_PERMISOS } from "@/utils/mapeoTiposPermisos";

const getDescripcionTipoPermiso = (tipo) =>
  MAPEO_TIPOS_PERMISOS[tipo] ?? "Otros";

/*
 *
 * Genera el ANEXO V de los permisos
 *
 */

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
    y + row4Height - 3
  );
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

export function generateListadoPermisosProfesores(permisos = []) {
  if (!permisos?.length) {
    alert("No hay permisos para generar el informe.");
    return;
  }

  const estadosMap = { 0: "Pendiente", 1: "Aceptado", 2: "Rechazado" };
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginTop = 20;
  const marginBottom = 15;

  let y = 0;
  const lineHeight = 5;
  const espacioEntreProfesores = 8;
  const resumenHeight = 14 + 3 + 6; // altura estimada del cuadro resumen

  // 🔹 Función para restaurar estilos base
  const resetContentStyle = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
  };

  // 🔹 Agrupar permisos por profesor
  const permisosPorProfesor = permisos.reduce((acc, permiso) => {
    const nombre = permiso.nombreProfesor || "Sin nombre";
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(permiso);
    return acc;
  }, {});

  Object.values(permisosPorProfesor).forEach((lista) =>
    lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  );

  const nombresProfesores = Object.keys(permisosPorProfesor).sort();

  // 🔹 Cabecera corporativa inicial
  y = drawHeader(doc, "Listado de Permisos por Profesor");
  resetContentStyle();

  // 🔹 Información resumen inicial
  doc.setFontSize(11);
  doc.text(`Total profesores: ${nombresProfesores.length}`, marginLeft, y);
  y += 10;

  // 🔹 Posiciones columnas
  const colFechaX = marginLeft;
  const colTipoX = marginLeft + 28;
  const colEstadoX = marginLeft + 115;
  const colDescX = marginLeft + 145;

  const printTableHeader = () => {
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
    resetContentStyle();
  };

  nombresProfesores.forEach((nombreProfesor) => {
    resetContentStyle();
    const listaPermisos = permisosPorProfesor[nombreProfesor];

    // 🔹 Calcular altura mínima para evitar huérfanos
    const firstRow = listaPermisos[0];
    const firstRowHeight =
      Math.max(
        doc.splitTextToSize(getDescripcionTipoPermiso(firstRow.tipo), 80)
          .length,
        doc.splitTextToSize(estadosMap[firstRow.estado] ?? "—", 25).length,
        doc.splitTextToSize(firstRow.descripcion || "", 50).length,
        1
      ) * lineHeight;

    const minSpaceNeeded = 10 + 8 + firstRowHeight + resumenHeight;
    if (y + minSpaceNeeded > pageHeight - marginBottom) {
      doc.addPage();
      y = drawHeader(doc, "Listado de Permisos por Profesor");
      resetContentStyle();
    }

    // 🔹 Nombre del profesor
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(nombreProfesor, marginLeft, y);
    y += 4;
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;

    // 🔹 Encabezado de tabla
    printTableHeader();

    // 🔹 Filas
    listaPermisos.forEach((permiso) => {
      const fechaTxt = new Date(permiso.fecha).toLocaleDateString("es-ES");
      const tipoTxt = getDescripcionTipoPermiso(permiso.tipo);
      const estadoTxt = estadosMap[permiso.estado] ?? "—";
      const descTxt = permiso.descripcion || "";

      const tipoLines = doc.splitTextToSize(tipoTxt, 80);
      const estadoLines = doc.splitTextToSize(estadoTxt, 25);
      const descLines = doc.splitTextToSize(descTxt, 50);

      const rowHeight =
        Math.max(tipoLines.length, estadoLines.length, descLines.length, 1) *
        lineHeight;

      if (y + rowHeight + resumenHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = drawHeader(doc, "Listado de Permisos por Profesor");
        resetContentStyle();
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
      resetContentStyle();
    });

    y += 4;

    // 🔹 Resumen al pie del profesor
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
      y = drawHeader(doc, "Listado de Permisos por Profesor");
      resetContentStyle();
    }

    const boxX = pageWidth - marginLeft - boxWidth;
    const boxY = y + labelHeight;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
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

  // 🔹 Pie de página
  drawFooter(doc);

  doc.save("Listado_Permisos_Profesores.pdf");
}
