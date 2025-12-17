export const MAPEO_TIPOS_PERMISOS = {
  2: "(Art. 2) Fallecimiento, accidente o enfermedad grave, hospitalización o intervención quirúrgica",
  3: "(Art. 3) Enfermedad propia",
  4: "(Art. 4) Traslado de domicilio",
  7: "(Art. 7) Exámenes prenatales y técnicas de preparación al parto",
  11: "(Art. 11) Deber inexcusable de carácter público o personal",
  14: "(Art. 14) Funciones sindicales / representación del personal",
  15: "(Art. 15) Exámenes finales o pruebas selectivas",
  32: "(Art. 32) Reducción de jornada para mayores de 55 años",
  13: "Asunto propio",
  0: "Otros",
};

// exportamos
export const textoTipoPermiso = (tipo) =>
  MAPEO_TIPOS_PERMISOS[tipo] || "Tipo desconocido";
