const pool = require('../config');

async function getUniversidades(req, res) {
    try {
        const query = `SELECT * FROM universidades`;
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);
    }
    catch {
        console.error('Error al obtener el universidades:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
module.exports = { getUniversidades };