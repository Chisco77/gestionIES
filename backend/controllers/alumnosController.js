// alumnosController.js
const express = require('express');
const router = express.Router();
const db = require('../db');  // Importamos la conexión a la base de datos

// Obtener todos los alumnos junto con el grupo al que pertenecen
router.get('/alumnos', async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.nombre,
        a.apellido1,
        a.apellido2,
        a.nie,
        a.fecha_nacimiento,
        a.login_rayuela,
        a.id_rayuela,
        g.grupo
      FROM 
        api_alumnos a
      JOIN 
        api_grupos g ON a.idgrupo = g.id;
    `;
    
    const result = await db.query(query);
    
    // Devolver los resultados como JSON
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los alumnos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
