const pool = require('../config');
const paginate = require("express-paginate");
const { ORDER, DIRECTION } = require('../utils/sort');
/*
Para saber las funciones que se han creado en la BD:
SELECT proname
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proowner = (SELECT oid FROM pg_roles WHERE rolname = 'postgres');
*/
const buildOrderByQuery = (orderBy, direction) => {
  let orderByQuery = 'ORDER BY ';
  console.log("orderBy", orderBy);
  console.log("direction", direction);
  console.log("price:", ORDER.PRICE);
  if (orderBy === ORDER.PRICE) {
      orderByQuery += 't.precioporhora ';
  } else if (orderBy === ORDER.VALORACION) {
      orderByQuery += 'obtener_promedio_calificacion(tu.id) ';
  } 
  orderByQuery += direction === DIRECTION.DESC ? 'DESC, ' : 'ASC, ';
  return orderByQuery.slice(0, -2);
};
const buildWhereQuery = (keyword, filters) => {
  console.log("buildWhereQuery===========================================")
  let whereQuery = keyword ? `WHERE (u.nombre ILIKE '%${keyword}%')` : '';
  if (filters) {
      const filterConditions = [];
      if (filters.universidades?.length) {
          filterConditions.push(`uni.id IN (${filters.universidades.join(',')})`);
      }
      if (filters.valoraciones?.length) {
        const valoraciones = filters.valoraciones;
        console.log("valoraciones:",valoraciones)
        filterConditions.push(`obtener_promedio_calificacion(tu.id,true,0.5) IN (${filters.valoraciones.join(',')})`);
      }
      if(filters.asignaturas?.length){
          const codigos_asignaturas = filters.asignaturas.map(id => `'${id}'`).join(',');
          filterConditions.push(`u.id_tutor IN (
              SELECT tu.id_tutor FROM tutorias tu
              WHERE tu.codigoasignatura IN (${codigos_asignaturas})
          )`);
      }
      if (filterConditions.length) {
          whereQuery += whereQuery ? ` AND ${filterConditions.join(' AND ')}` : `WHERE ${filterConditions.join(' AND ')}`;
      }
  }
  return whereQuery;
};
async function getUsuariosPorPalabraClave(req, res) {
  try {
    const { filters } = req.body;
    const { keyword, page, limit, orderBy, direction } = req.query;
    // console.log("palabra:", palabra);
    console.log("filters:", filters);
    console.log("keyword:", keyword);
    //console.log("page:", page);
    //console.log("limite:", limit);
   // console.log("orderBy:", orderBy);
    //console.log("direction:", direction);
    const orderByQuery = buildOrderByQuery(orderBy, direction);
    const whereQuery = buildWhereQuery(keyword, filters);

    let query = `
SELECT u.*, 
       uni.nombre as universidad, 
       t.precioporhora, 
       t.horafinal, 
       a.asignaturas, 
       obtener_promedio_calificacion(tu.id) as valoracion_promedio,
       COUNT(*) OVER() as total_count
FROM usuarios u 
INNER JOIN tutores tu ON u.id_tutor = tu.id 
INNER JOIN universidades uni ON uni.id = u.id_universidad 
LEFT JOIN LATERAL get_tutoria_precio_mas_bajo(u.id_tutor) t ON TRUE 
LEFT JOIN LATERAL (SELECT STRING_AGG(nombreasignatura, ',') AS asignaturas 
                  FROM get_asignaturas_tutor(u.id_tutor)) a ON TRUE 
${whereQuery}
${orderByQuery}
`;

/*    filters?.forEach(filter => {
      if (filter.ids) {
        if (filter.ids.length > 0) {
          if (filter.type === 'universidades') {
            const uniIds = filter.ids.join(',');
            query += ` AND uni.id IN (${uniIds})`;
          }
          if (filter.type === 'valoracion') {
            const valoraciones = filter.ids.join(',');
            console.log("valoraciones", valoraciones)
            query += ` AND obtener_promedio_calificacion(tu.id) IN (${valoraciones})`;
          }

          if (filter.type === 'asignatura') {
            const codigos_asignaturas = filter.ids.map(id => `'${id}'`).join(',');
            console.log("CODIGOS ASIG:", codigos_asignaturas);
            query += ` AND u.id_tutor IN (
                SELECT tu.id_tutor FROM tutorias tu 
                WHERE tu.codigoasignatura IN (${codigos_asignaturas})
            )`;
          }
        }
      }
    });*/
    /*
    // Ordenamiento
    if (order.mayorValoracion) {
      query += ' ORDER BY obtener_promedio_calificacion(tu.id) DESC ';
    } else if (order.menorPrecio) {
      query += ' ORDER BY t.precioporhora ASC';
    }*/
    //console.log("query count:", query);
      const dataCount = (await pool.query(query)).rows;
    const totalCount = dataCount[0]?.total_count || 0;
    query += ` LIMIT ${limit} OFFSET ${req.skip}`;
   // console.log("query:", query)
    const data = (await pool.query(query)).rows;
    const itemCount = totalCount;

    //console.log("count:", totalCount);
    const pageCount = Math.ceil(totalCount / limit);
    //console.log("res:", data);
    //return res.status(200).json(data);

    return res.status(200).send({
      data: data,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(req)(3, pageCount, page),
    });

  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}



//asignatura: Encontrar usuarios que impartan esa asignatura.

async function getUsuario(req, res) {
  try {
    const { id } = req.params;
    const usuario = (await pool.query('SELECT * FROM usuarios WHERE id = $1', [id])).rows[0];
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function getTutores(req, res) {
  try {
    console.log("entro get tutores=====================");
    const tutores = (await pool.query('SELECT * FROM usuarios WHERE id_tutor is not null limit 6')).rows;
    res.status(200).json(tutores);
  } catch (error) {
    console.error('Error al obtener los tutores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }

}

async function solicitarTutoria(req, res) {
  try {
    const { idEstudiante, idTutoria } = req.body;
    await pool.query('INSERT INTO solicitudes (id_estudiante, id_tutoria) VALUES ($1, $2)', [idEstudiante, idTutoria]);
    res.status(201).json({ message: 'Solicitud enviada con éxito' });
  } catch (error) {
    console.error('Error al solicitar tutoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
//usuario/solicitudes
async function getSolicitudesTutorias(req, res) {
  try {
    const { id_tutor } = req.body;
    console.log("id_tutor", id_tutor)
    const solicitudes = (await pool.query(
      "SELECT s.*,u.nombre as nombre_estudiante,a.nombreasignatura FROM solicitudes s inner join usuarios u on u.id_estudiante = s.id_estudiante inner join asignaturas a on s.id_asignatura = a.codigo where s.id_tutor = $1 and s.estado = 'Pendiente' ", [id_tutor])).rows;
    res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error al obtener las solicitudes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function updateEstadoSolicitud(req, res) {
  try {
    const { id_solicitud, estado } = req.body;
    await pool.query('UPDATE solicitudes SET estado = $1 WHERE id = $2', [estado, id_solicitud]);
    res.status(200).json({ message: 'Estado actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el estado de la solicitud:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function uploadTutoria(req, res) {
  try {
    const { horaInicio, horaFin, fecha, codigo_asignatura, descripcion, precioHora, modalidad, id_estudiante, id_tutor, maxEstudiantes } = req.body;
    await pool.query('INSERT INTO tutorias (hora, horafinal,fecha, codigoasignatura, descripcion, precioporhora, modalidad, id_estudiante, id_tutor, cantidadmaximaestudiantes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [horaInicio, horaFin, fecha, codigo_asignatura, descripcion, precioHora, modalidad, id_estudiante, id_tutor, maxEstudiantes]);
    res.status(201).json({ message: 'Tutoría subida con éxito' });
  } catch (error) {
    console.error('Error al subir la tutoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function getSolicitudesEstudiantes(req, res) {
  try {
    const { id_tutor } = req.body;
    console.log("(getSolicitudesEstudiantes) id_tutor", id_tutor);
    const data = await pool.query("select distinct u.id, u.nombre from usuarios u join solicitudes s on s.id_estudiante = u.id where s.estado = 'Aceptado' and s.id_tutor = $1;", [id_tutor]);
    return res.status(200).json(data.rows);
  } catch (error) {
    console.error('Error al solicitar estudiantes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function getTutorias(req, res) {
  try {
    const { id_tutor } = req.body;
    const tutorias = (await pool.query('SELECT t.*,a.nombreasignatura FROM tutorias t inner join asignaturas a on t.codigoasignatura = a.codigo WHERE id_tutor = $1', [id_tutor])).rows;
    return res.status(200).json(tutorias);
  } catch (error) {
    console.error('Error al conseguir tutorias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }

}
async function deleteTutoria(req, res) {
  try {
    const id_tutoria = req.params.id_tutoria; // Accede al id_tutoria desde req.params
    console.log("id_tutoria", id_tutoria);
    await pool.query('DELETE FROM tutorias WHERE id = $1', [id_tutoria]);

    res.status(201).json({ message: 'Tutoría eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar tutoria:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function editarTutoria(req, res) {
  try {
    const { id_tutoria, hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes } = req.body;
    await pool.query('UPDATE tutorias SET hora = $1, horafinal = $2, fecha = $3, descripcion = $4, modalidad = $5, cantidadmaximaestudiantes = $6 WHERE id = $7', [hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes, id_tutoria]);
    res.status(200).json({ message: 'Tutoría actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar la tutoría:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }

}

async function uploadSolicitud(req, res) {
  try {
    const { id_estudiante, id_tutor, descripcion, id_asignatura, modalidad, fecha, hora } = req.body;
    await pool.query('INSERT INTO solicitudes (id_estudiante, id_tutor, descripcion, id_asignatura,modalidad,fecha,hora) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id_estudiante, id_tutor, descripcion, id_asignatura, modalidad, fecha, hora]);

    res.status(201).json({ message: 'Solicitud subida con éxito' });
  } catch (error) {
    console.error('Error al subir la solicitud:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function calificarTutor(req, res) {
  const { id_estudiante, id_tutor, comentario, calificacion } = req.body;
  try {
    await pool.query(`
      INSERT INTO comentarios (id_estudiante, id_tutor, comentario, calificacion) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_estudiante, id_tutor)
      DO UPDATE SET comentario = $3, calificacion = $4
    `, [id_estudiante, id_tutor, comentario, calificacion]);
    res.status(201).json({ message: 'Calificación subida con éxito' });
  }
  catch (error) {
    console.error('Error al subir la calificación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}


async function getComentariosTutor(req, res) {
  const { id_tutor } = req.body;
  try {
    const comentarios = (await pool.query('select c.comentario,c.calificacion,u.nombre from comentarios c inner join estudiantes e on c.id_estudiante=e.id inner join usuarios u on u.id = e.id where c.id_tutor = $1', [id_tutor])).rows;
    return res.status(200).json(comentarios);
  } catch (error) {
    console.error('Error al obtener los comentarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function getComentarioTutorUsuario(req, res) {
  const { id_tutor, id_estudiante } = req.body;
  try {
    const comentarios = (await pool.query('select c.comentario,c.calificacion,u.nombre from comentarios c inner join estudiantes e on c.id_estudiante=e.id inner join usuarios u on u.id = e.id where c.id_tutor = $1 and c.id_estudiante = $2', [id_tutor, id_estudiante])).rows;
    return res.status(200).json(comentarios);
  } catch (error) {
    console.error('Error al obtener los comentarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
async function updateUsuario(req, res) {
  const { id, descripcion, telefono, genero } = req.body;
  try {
    await pool.query('UPDATE usuarios SET descripcion = $1, telefono = $2, genero = $3 WHERE id = $4', [descripcion, telefono, genero, id]);
    res.status(200).json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
module.exports = { getUsuario, getTutores, getUsuariosPorPalabraClave, solicitarTutoria, getSolicitudesTutorias, updateEstadoSolicitud, uploadTutoria, getSolicitudesEstudiantes, getTutorias, deleteTutoria, editarTutoria, uploadSolicitud, calificarTutor, getComentariosTutor, getComentarioTutorUsuario, updateUsuario };
