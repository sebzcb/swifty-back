const pool = require('../config');

const getHorario = async (req, res) => {
    const { idUsuario } = req.params;
    try {
        const horario = (await pool.query('SELECT * FROM horariosDisponibles where id_usuario = $1', [idUsuario])).rows;
        res.status(200).json(horario);
    } catch (error) {
        console.error('Error al obtener el horario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
const updateHorario = async (req, res) => {
    const { idUsuario } = req.params;
    const { horario } = req.body;
    console.log("horario", horario);
    console.log("idUsuario", idUsuario);
    // horario es un array de objetos con los sgtes. datos: dia (string), hora (string)
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction
        await client.query('DELETE FROM horariosDisponibles where id_usuario = $1', [idUsuario]);
        for (let i = 0; i < horario.length; i++) {
            const { dia, hora } = horario[i];
            await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora) VALUES ($1, $2, $3)', [idUsuario, dia, hora]);
        }
        await client.query('COMMIT'); // Commit transaction
        res.status(200).json({ message: 'Horario actualizado correctamente' });
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback transaction
        console.error('Error al actualizar el horario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        client.release(); // Release the client back to the pool
    }
}

module.exports = { getHorario, updateHorario };