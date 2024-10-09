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

async function getAsignaturasPorUniversidad(req,res){
    const { id_universidad } = req.params;
    try {
        const query = `SELECT * FROM asignaturas where id_universidad = ${id_universidad}`;
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);        
    } catch (error) {
        console.error('Error al obtener el asignaturas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function addAsignaturaImpartidaPorTutor(req, res) {
    const { codigo_asignatura, id_universidad, precio, id_tutor,nombre } = req.body;
    console.log(codigo_asignatura);    //04805599
    console.log(id_universidad);    //04805599
    console.log(precio);    //04805599
    console.log(id_tutor);    //04805599
    console.log(nombre);    //048055
    try {
        const query = `INSERT INTO imparten(codigo_asignatura, id_universidad, id_tutor, precio,nombre_asignatura) 
        VALUES ('${codigo_asignatura}', ${id_universidad}, '${id_tutor}', ${precio},'${nombre}')`;
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);        
    } catch (error) {
        console.error('Error al obtener el asignaturas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function editAsignaturaImpartidaPorTutor(req, res) {
    const { codigo_asignatura, precio, id_tutor } = req.body;
    console.log(codigo_asignatura);    //04805599
    console.log(precio);    //04805599
    console.log(id_tutor);    //04805599
    try {
        const query = `UPDATE imparten SET precio = ${precio} WHERE codigo_asignatura = '${codigo_asignatura}' and id_tutor = '${id_tutor}'`;
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);        
    } catch (error) {
        console.error('Error al obtener el asignaturas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function deleteAsignaturaImpartidaPorTutor(req, res) {
    const { codigo_asignatura, id_tutor } = req.params;
    console.log(codigo_asignatura);    //04805599
    console.log(id_tutor);    //04805599
    try {
        const query = `DELETE FROM imparten WHERE codigo_asignatura = '${codigo_asignatura}' and id_tutor = '${id_tutor}'`;
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);        
    } catch (error) {
        console.error('Error al obtener el asignaturas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
async function getAsignaturasImpartidasPorTutor(req, res) {
    const { id_tutor } = req.params;
    console.log(id_tutor);
    try {
        const query = `SELECT * FROM imparten where id_tutor = '${id_tutor}'`;
        const data = (await pool.query(query)).rows;
        console.log(data);
        return res.status(200).json(data);        
    } catch (error) {
        console.error('Error al obtener el asignaturas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
module.exports = { getAsignaturas,getAsignaturasPorUniversidad,addAsignaturaImpartidaPorTutor,getAsignaturasImpartidasPorTutor ,editAsignaturaImpartidaPorTutor,deleteAsignaturaImpartidaPorTutor};
