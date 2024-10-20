const pool = require('../config');
const paginate = require("express-paginate");

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
const buildWhereQuery = (keyword, filters) => {
    console.log("buildWhereQuery===========================================")
    let whereQuery = keyword ? `WHERE (u.nombre ILIKE '%${keyword}%' or uu.nombre ILIKE '%${keyword}%')` : '';
    return whereQuery;
};
//Tiene que conseguir los reportes con Paginacion.
async function getReportes(req, res) {
    try {
        const { keyword, page, limit } = req.query;
        const whereQuery = buildWhereQuery(keyword);
        /*let query =
            `
            SELECT 
            r.*, 
            u.nombre AS nombre_reportado, 
            u.id_tutor AS id_tutor_reportado, 
            u.id_estudiante AS id_estudiante_reportado, 
            u.id_administrador AS id_administrador_reportado, 
            uu.nombre AS nombre_reporto, 
            uu.id_tutor AS id_tutor_reporto, 
            uu.id_estudiante AS id_estudiante_reporto, 
            uu.id_administrador AS id_administrador_reporto,
            COUNT(*) OVER() as total_count 
            FROM reportes r
            INNER JOIN usuarios u ON r.id_reportado = u.id
            INNER JOIN usuarios uu ON r.id_usuario_reporto = uu.id 
            ${whereQuery} 
        `;*/
        let query ='select *,COUNT(*) OVER() as total_count from reportes';
        console.log("query count:", query);
        const dataCount = (await pool.query(query)).rows;
        const totalCount = dataCount[0]?.total_count || 0;
        query += ` LIMIT ${limit} OFFSET ${req.skip}`;
        console.log("query:", query)
        const data = (await pool.query(query)).rows;
        const itemCount = totalCount;

        //console.log("count:", totalCount);
        const pageCount = Math.ceil(totalCount / limit);
        //console.log("res:", data);
        return res.status(200).send({
            data: data,
            pageCount,
            itemCount,
            pages: paginate.getArrayPages(req)(3, pageCount, page),
        });
    } catch (error) {
        console.error('Error al obtener el reporte:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
module.exports = { uploadReporte, getReportes };