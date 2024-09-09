const pool = require('../config');

async function getAsignaturas(req, res) {
    try {
        const query = `SELECT * FROM asignaturas`;
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);        
    } catch (error) {
        console.error('Error al obtener el asignaturas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = { getAsignaturas };
