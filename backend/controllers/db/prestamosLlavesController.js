/**
 * ================================================================
 *  Controller: prestamosLlavesController.js
 *  Proyecto: gestionIES
 * ================================================================
 *
 *  Descripción:
 *    Controlador para la gestión de préstamos de llaves.
 *    Maneja operaciones sobre la tabla "prestamos_llaves"
 *    de PostgreSQL, vinculando estancias con usuarios
 *    obtenidos desde LDAP.
 *
 *  Funcionalidades:
 *    - Obtener préstamos de llaves agrupados por profesor (getPrestamosLlavesAgrupados)
 *    - Registrar un nuevo préstamo de llave para un profesor (prestarLlave)
 *    - Devolver llaves y marcar fecha de devolución (devolverLlave)
 *
 *  Autor: Francisco Damian Mendez Palma
 *  Email: adminies.franciscodeorellana@educarex.es
 *  GitHub: https://github.com/Chisco77
 *  Repositorio: https://github.com/Chisco77/gestionIES.git
 *  IES Francisco de Orellana - Trujillo
 *
 *  Fecha de creación: 2025
 * ================================================================
 */



const pool = require("../../db");
const { buscarPorUid } = require("../ldap/usuariosController");

// Devuelve los préstamos de llaves agrupados por profesor
async function getPrestamosLlavesAgrupados(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const { rows: prestamos } = await pool.query(`
      SELECT pl.id, pl.idestancia, pl.uid, pl.unidades, pl.fechaentrega, pl.fechadevolucion,
             e.codigo AS codigo_estancia, e.planta as planta, e.descripcion AS nombre_estancia
      FROM prestamos_llaves pl
      JOIN estancias e ON e.id = pl.idestancia
      ORDER BY pl.fechaentrega DESC
    `);

    const agrupado = {};

    for (const p of prestamos) {
      if (!agrupado[p.uid]) {
        const nombre = await new Promise((resolve) => {
          buscarPorUid(ldapSession, p.uid, (err, datos) => {
            if (!err && datos)
              resolve(`${datos.sn || ""}, ${datos.givenName || ""}`.trim());
            else resolve("Profesor desconocido");
          });
        });
        agrupado[p.uid] = {
          uid: p.uid,
          nombre,
          prestamos: [],
        };
      }

      agrupado[p.uid].prestamos.push({
        id: p.id,
        idestancia: p.idestancia,
        nombreEstancia: p.nombre_estancia,
        codigoEstancia: p.codigo_estancia,
        unidades: p.unidades,
        fechaentrega: p.fechaentrega,
        fechadevolucion: p.fechadevolucion,
        planta: p.planta,
      });
    }

    res.json(Object.values(agrupado));
  } catch (error) {
    console.error("❌ Error al obtener préstamos de llaves:", error.message);
    res.status(500).json({ error: "Error al obtener préstamos de llaves" });
  }
}

// Inserta un nuevo préstamo de llave para un profesor
async function prestarLlave(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const { uid, idestancia, unidades = 1 } = req.body;
    if (!uid || !idestancia)
      return res.status(400).json({ error: "Datos incompletos" });

    // Comprobar llaves disponibles
    const [{ total_prestadas }] = (
      await pool.query(
        `
      SELECT COALESCE(SUM(unidades),0) AS total_prestadas
      FROM prestamos_llaves
      WHERE idestancia = $1 AND (fechadevolucion IS NULL)
    `,
        [idestancia]
      )
    ).rows;

    const { totalllaves } = (
      await pool.query(
        `
      SELECT totalllaves FROM estancias WHERE id = $1
    `,
        [idestancia]
      )
    ).rows[0];

    if (unidades > totalllaves - total_prestadas)
      return res
        .status(400)
        .json({ error: "No hay suficientes llaves disponibles" });

    const fechaentrega = new Date();

    const {
      rows: [nuevoPrestamo],
    } = await pool.query(
      `
      INSERT INTO prestamos_llaves (idestancia, uid, unidades, fechaentrega)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [idestancia, uid, unidades, fechaentrega]
    );

    res.json({ success: true, prestamo: nuevoPrestamo });
  } catch (error) {
    console.error("❌ Error al prestar llave:", error.message);
    res.status(500).json({ error: "Error al prestar llave" });
  }
}

// Devolver una llave, marcando fechadevolucion
async function devolverLlave(req, res) {
  try {
    const ldapSession = req.session?.ldap;
    if (!ldapSession) return res.status(401).json({ error: "No autenticado" });

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "No se especificaron préstamos" });

    const fechaDevolucion = new Date();

    await pool.query(
      `
      UPDATE prestamos_llaves
      SET fechadevolucion = $1
      WHERE id = ANY($2::int[])
    `,
      [fechaDevolucion, ids]
    );

    res.json({ success: true, cantidad: ids.length });
  } catch (error) {
    console.error("❌ Error al devolver llaves:", error.message);
    res.status(500).json({ error: "Error al devolver llaves" });
  }
}

module.exports = {
  getPrestamosLlavesAgrupados,
  prestarLlave,
  devolverLlave,
};
