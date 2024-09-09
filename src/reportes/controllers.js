const pool = require('../config');

async function uploadReporte(req, res) {
    try {
        const { id_reportado, id_usuario_reporto, motivo, detalles } = req.body;
        const query = `INSERT INTO reportes (id_reportado, id_usuario_reporto, motivo, detalles) VALUES ('${id_reportado}', '${id_usuario_reporto}', '${motivo}', '${detalles}')`; 
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);
    }
    catch {
        console.error('Error al obtener el universidades:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
module.exports = { uploadReporte };