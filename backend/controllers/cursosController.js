// alumnosController.js
const express = require('express');
const router = express.Router();
const db = require('../db');  // Importamos la conexión a la base de datos

// Obtener todos los cursos
router.get('/cursos', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        curso
      FROM 
        cursos
    `;
    
    const result = await db.query(query);
    
    // Devolver los resultados como JSON
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;