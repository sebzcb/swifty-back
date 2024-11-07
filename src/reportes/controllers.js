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
const buildWhereQuery = (keyword, states) => {
    console.log("buildWhereQuery===========================================")
    //let whereQuery = keyword ? `WHERE (u.nombre ILIKE '%${keyword}%' or uu.nombre ILIKE '%${keyword}%')` : '';
    let whereQuery="";
    if (states) {
        whereQuery += ' WHERE ';
        //Separar states por ","
        let statesArray = states.split(",");
        //Si hay un keyword, se agrega un AND
       /* if (keyword) {
            whereQuery += ' AND ';
        } else {
            whereQuery += ' WHERE ';
        }*/
        //Se agrega el filtro de estados
        whereQuery += '(';
        statesArray.forEach((state, index) => {
            whereQuery += `estado = '${state}'`;
            if (index < statesArray.length - 1) {
                whereQuery += ' OR ';
            }
        });
        whereQuery += ')';
    }
    return whereQuery;
};
//Tiene que conseguir los reportes con Paginacion.
async function getReportes(req, res) {
    try {
        const { keyword, page, limit,states } = req.query;
        const whereQuery = buildWhereQuery(keyword,states);
        let query ='select *,COUNT(*) OVER() as total_count from reportes '+whereQuery;
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
async function editReporte(req,res){
    try{
        const {id,estado}=req.body;
        const query = `UPDATE reportes SET estado = '${estado}' WHERE id = ${id}`;
        const data = (await pool.query(query)).rows;
        return res.status(200).json(data);
    }catch(error){
        console.error('Error al obtener el reporte:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
module.exports = { uploadReporte, getReportes ,editReporte};