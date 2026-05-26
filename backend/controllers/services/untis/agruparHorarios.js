exports.agruparHorarios = (horarios) => {

  const mapa = new Map();

  horarios.forEach((h) => {

    const clave =
      `${h.uid}-${h.dia_semana}-${h.idperiodo}`;

    if (!mapa.has(clave)) {

      mapa.set(clave, h);

    } else {

      const existente = mapa.get(clave);

      h.gidnumbers.forEach((gid) => {

        if (
          !existente.gidnumbers.includes(gid)
        ) {
          existente.gidnumbers.push(gid);
        }
      });
    }
  });

  return Array.from(mapa.values());
};