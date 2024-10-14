const pool = require('../config');
const paginate = require("express-paginate");
const { ORDER, DIRECTION } = require('../utils/sort');
const { getClave } = require('../utils/getClave');
const { getDay } = require('../utils/getDia');
const ROL = require('../constants/Rol');
const { getFutureWeeks } = require('../utils/getFutureWeeks');
const { getWeekNumber } = require('../utils/getWeekNumber');
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
      console.log("valoraciones:", valoraciones)
      filterConditions.push(`obtener_promedio_calificacion(tu.id,true,0.5) IN (${filters.valoraciones.join(',')})`);
    }
    if (filters.asignaturas?.length) {
      const codigos_asignaturas = filters.asignaturas.map(id => `'${id}'`).join(',');
      filterConditions.push(`u.id_tutor IN (
              SELECT tu.id_tutor FROM imparten tu
              WHERE tu.codigo_asignatura IN (${codigos_asignaturas})
          )`);
    }
    if (filterConditions.length) {
      whereQuery += whereQuery ? ` AND ${filterConditions.join(' AND ')}` : `WHERE ${filterConditions.join(' AND ')}`;
    }
  }
  return whereQuery;
};
const getTypeUserQuery = (typeUser) => {
  let query = ''; // query estudiante por defecto
  switch (typeUser) {
    case ROL.TUTOR:
      query = 'INNER JOIN tutores tu ON u.id_tutor = tu.id';
      break;
    case ROL.ADMINISTRADOR:
      query = 'INNER JOIN administradores tu ON u.id_administrador = tu.id';
      break;
    default:
      break;
  }
  return query;
}
async function getUsuariosPorPalabraClave(req, res) {
  try {
    const { filters, typeUser = ROL.TUTOR } = req.body;
    const { keyword, page, limit, orderBy, direction } = req.query;
    // console.log("palabra:", palabra);
    console.log("filters:", filters);
    console.log("keyword:", keyword);
    console.log("typeUser", typeUser);
    //console.log("page:", page);
    //console.log("limite:", limit);
    // console.log("orderBy:", orderBy);
    //console.log("direction:", direction);
    const orderByQuery = buildOrderByQuery(orderBy, direction);
    const whereQuery = buildWhereQuery(keyword, filters);
    //    --INNER JOIN tutores tu ON u.id_tutor = tu.id
    const typeUserQuery = getTypeUserQuery(typeUser);
    console.log("typeUserQuery:", typeUserQuery);
    const obtenerPromedioQuery = typeUser == ROL.ESTUDIANTE ? 'obtener_promedio_calificacion(u.id) as valoracion_promedio,' : 'obtener_promedio_calificacion(tu.id) as valoracion_promedio,';
    console.log("obtenerPromedioQuery:", obtenerPromedioQuery);
    let query = `
    SELECT u.*, 
       uni.nombre as universidad, 
       t.precioporhora, 
       t.horafinal, 
       ${obtenerPromedioQuery}
       a.asignaturas_impartidas, 
       COUNT(*) OVER() as total_count
    FROM usuarios u 
    ${typeUserQuery}
    INNER JOIN universidades uni ON uni.id = u.id_universidad 
    LEFT JOIN LATERAL get_tutoria_precio_mas_bajo(u.id_tutor) t ON TRUE 
    LEFT JOIN LATERAL get_tutorias_impartidas(u.id_tutor) a ON TRUE 
    ${whereQuery} 
    ${typeUser == ROL.ESTUDIANTE ? '' : orderByQuery}
    `
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
}/*
async function uploadTutoria(req, res) {
  const client = await pool.connect();
  try {
    // Iniciar transacción
    await client.query('BEGIN');
    const { horaInicio, horaFin, fecha, codigo_asignatura, descripcion, precioHora, modalidad, id_estudiante, id_tutor, maxEstudiantes } = req.body;
    await client.query('INSERT INTO tutorias (hora, horafinal,fecha, codigoasignatura, descripcion, precioporhora, modalidad, id_estudiante, id_tutor, cantidadmaximaestudiantes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [horaInicio, horaFin, fecha, codigo_asignatura, descripcion, precioHora, modalidad, id_estudiante, id_tutor, maxEstudiantes]);
    const hora = getClave(horaInicio, horaFin);
    const dia = getDay(fecha);
    const idUsuario = id_tutor;
    console.log("hora:", hora);
    console.log("dia:", dia);
    //verificar si ya existe un horario ocupado del tutor
    const horarioOcupado = await client.query(
      'SELECT * from horariosDisponibles where id_usuario = $1 and dia = $2 and hora=$3',[idUsuario, dia, hora]);
    if (!horarioOcupado.rows.length > 0) {
      console.log("no hay horario ocupado");
      await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora) VALUES ($1, $2, $3)', [idUsuario, dia, hora]);
    }else{
      await client.query('ROLLBACK'); // Rollback transaction
      return res.status(409).json({ message: 'Error al subir la tutoría: El tutor ya tiene una tutoría en ese horario' });
    }
    await client.query('COMMIT'); // Commit transaction
    res.status(201).json({ message: 'Tutoría subida con éxito' });
  } catch (error) {
    console.error('Error al subir la tutoría:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    client.release(); // Release the client back to the pool
  }
}*/

/*
Agregue nuevas columnas en mi tabla tutorias las cuales son: semana(integer) y anio (integer)
*/
async function uploadTutoria(req, res) {
  const client = await pool.connect();
  try {
    // Iniciar transacción
    await client.query('BEGIN');
    const { horaInicio, horaFin, fecha, codigo_asignatura, descripcion, precioHora, modalidad, id_estudiante, id_tutor, maxEstudiantes } = req.body;
    await client.query('INSERT INTO tutorias (hora, horafinal, fecha, codigoasignatura, descripcion, precioporhora, modalidad, id_estudiante, id_tutor, cantidadmaximaestudiantes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [horaInicio, horaFin, fecha, codigo_asignatura, descripcion, precioHora, modalidad, id_estudiante, id_tutor, maxEstudiantes]);
    //PROCESO INSERTAR EN HORARIOS DISPONIBLES
    //fecha formato: 2024-10-10
    console.log("======================== subiur a horarios disponibles =========================");
    console.log("FECHA SUBIR TUTORIA:", fecha);
    const clavesOcupadas = getClave(horaInicio, horaFin);
    const dia = getDay(fecha);
    const idUsuario = id_tutor;
    console.log("clavesOcupadas:", clavesOcupadas);
    console.log("dia:", dia);
    //obtener futuras semanas de la fecha
    const futureWeeks = getFutureWeeks(new Date(fecha), 4);
    const weekUploadTutoria = getWeekNumber(new Date(fecha)); //semana de la tutoria a subir
    const anioUploadTutoria = new Date(fecha).getFullYear(); //año de la tutoria a subir
    console.log("weekUploadTutoria:", weekUploadTutoria, "anioUploadTutoria:", anioUploadTutoria);
    //recorro las semanas futuras
    for (const week of futureWeeks) {
      console.log(weekUploadTutoria + "==" + week.week + "&&" + week.year + "==" + anioUploadTutoria);
      const canCheck = weekUploadTutoria == week.week && week.year == anioUploadTutoria;
      console.log("canCheck:", canCheck);
      if (canCheck) {
        // Verificar si alguna de las claves ya está ocupada en la semana y año
        for (const clave of clavesOcupadas) {
          const horarioOcupado = await client.query(
            'SELECT * FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3 and semana = $4 and anio = $5',
            [idUsuario, dia, clave, week.week, week.year]
          );
          if (horarioOcupado.rows.length > 0) {
            await client.query('ROLLBACK'); // Rollback transaction
            return res.status(409).json({ message: 'Error al subir la tutoría: El tutor ya tiene una tutoría en ese horario' });
          }
        }
      }
    }
    for (const week of futureWeeks) {
      console.log(weekUploadTutoria + "==" + week.week + "&&" + week.year + "==" + anioUploadTutoria);
      const canCheck = weekUploadTutoria == week.week && week.year == anioUploadTutoria;
      console.log("canCheck:", canCheck);
      if (canCheck) {
        // Verificar si alguna de las claves ya está ocupada en la semana y año
        for (const clave of clavesOcupadas) {
          console.log("insertando en horarios disponibles...");
          await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora, semana, anio) VALUES ($1, $2, $3, $4, $5)', [idUsuario, dia, clave, week.week, week.year]);    
        }
      }
    }
    /*
        // Insertar las nuevas claves ocupadas
        console.log("insertando en horarios disponibles...");
        await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora, semana, anio) VALUES ($1, $2, $3, $4, $5)', [idUsuario, dia, clave, week.week, week.year]);
        break;
    */
    // Verificar si alguna de las claves ya está ocupada
    /* for (const clave of clavesOcupadas) {
       const horarioOcupado = await client.query(
         'SELECT * FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3',
         [idUsuario, dia, clave]
       );
       if (horarioOcupado.rows.length > 0) {
         await client.query('ROLLBACK'); // Rollback transaction
         return res.status(409).json({ message: 'Error al subir la tutoría: El tutor ya tiene una tutoría en ese horario' });
       }
     }*/
    /*    console.log("No hay horario ocupado");
        console.log("insertando en horarios disponibles...");
        // Insertar las nuevas claves ocupadas
        for (const week of futureWeeks) {
          if (weekUploadTutoria == week.week && week.year == anioUploadTutoria) {
            for (const clave of clavesOcupadas) {
              await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora, semana, anio) VALUES ($1, $2, $3, $4, $5)', [idUsuario, dia, clave, week.week, week.year]);
            }
          }
        }*/
    console.log("==============================00 subiur a horarios disponibles fin =========================");
    await client.query('COMMIT'); // Commit transaction
    res.status(201).json({ message: 'Tutoría subida con éxito' });
  } catch (error) {
    console.error('Error al subir la tutoría:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    client.release(); // Release the client back to the pool
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
    //const tutorias = (await pool.query('SELECT t.*,a.nombreasignatura FROM tutorias t inner join asignaturas a on t.codigoasignatura = a.codigo WHERE id_tutor = $1', [id_tutor])).rows;
    const query = `
    SELECT t.*,a.nombreasignatura,u.nombre as nombre_estudiante 
    FROM tutorias t 
    inner join asignaturas a on t.codigoasignatura = a.codigo 
    inner join usuarios u on t.id_estudiante = u.id_estudiante 
    WHERE t.id_tutor='${id_tutor}'`;
    console.log(query)
    const tutorias = (await pool.query(query)).rows;
    return res.status(200).json(tutorias);
  } catch (error) {
    console.error('Error al conseguir tutorias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }

}/*
async function deleteTutoria(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id_tutoria = req.params.id_tutoria; // Accede al id_tutoria desde req.params
    console.log("id_tutoria", id_tutoria);
    const tutoriaDelete = await client.query('SELECT * FROM tutorias WHERE id = $1', [id_tutoria]);
    const tutoria = tutoriaDelete.rows[0];
    console.log("tutoria:", tutoria);
    const hora = getClave(tutoria.hora, tutoria.horafinal);
    const dia = getDay(tutoria.fecha);
    const idUsuario = tutoria.id_tutor;
      // Seleccionar el id de la fila que deseas eliminar
      const result = await client.query(
        'SELECT id FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3 LIMIT 1',
        [idUsuario, dia, hora]
      );
      const idHorario = result.rows[0]?.id;
  
      if (idHorario) {
        console.log("idHorario eliminar", idHorario);
        // Eliminar la fila específica utilizando el id seleccionado
        await client.query('DELETE FROM horariosDisponibles WHERE id = $1', [idHorario]);
      }

    await client.query('DELETE FROM tutorias WHERE id = $1', [id_tutoria]);
    await client.query('COMMIT'); // Commit transaction
    res.status(201).json({ message: 'Tutoría eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar tutoria:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}*/
async function deleteTutoria(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id_tutoria = req.params.id_tutoria; // Accede al id_tutoria desde req.params
    console.log("id_tutoria", id_tutoria);
    const tutoriaDelete = await client.query('SELECT * FROM tutorias WHERE id = $1', [id_tutoria]);
    const tutoria = tutoriaDelete.rows[0];
    console.log("tutoria:", tutoria);
    const clavesOcupadas = getClave(tutoria.hora, tutoria.horafinal);
    const fechaTutoriaEliminar = tutoria.fecha;
    const dia = getDay(fechaTutoriaEliminar);
    const idUsuario = tutoria.id_tutor;
    console.log("clavesOcupadas:", clavesOcupadas);
    console.log("dia:", dia);
    const weekDelete = getWeekNumber(new Date(fechaTutoriaEliminar));
    const anioEliminar = new Date(fechaTutoriaEliminar).getFullYear();
    if(isNaN(weekDelete) || isNaN(anioEliminar)){
      await client.query('ROLLBACK'); // Rollback transaction
      return res.status(409).json({ message: 'Error al eliminar la tutoría: No se pudo obtener la semana y año de la tutoría' });
    }
    // Eliminar todas las claves ocupadas
    for (const clave of clavesOcupadas) {
      const result = await client.query(
        'SELECT id FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3 and semana = $4 and anio = $5 LIMIT 1',
        [idUsuario, dia, clave, weekDelete, anioEliminar]
      );
      const idHorario = result.rows[0]?.id;

      if (idHorario) {
        console.log("idHorario eliminar", idHorario);
        // Eliminar la fila específica utilizando el id seleccionado
        await client.query('DELETE FROM horariosDisponibles WHERE id = $1', [idHorario]);
      }
    }

    await client.query('DELETE FROM tutorias WHERE id = $1', [id_tutoria]);
    await client.query('COMMIT'); // Commit transaction
    res.status(201).json({ message: 'Tutoría eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar tutoria:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
/*
async function editarTutoria(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id_tutoria, hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes } = req.body;
    const tutoriaEdit = await client.query('SELECT * FROM tutorias WHERE id = $1', [id_tutoria]);
    const tutoria = tutoriaEdit.rows[0];
    console.log("tutoria:", tutoria);
    const horaObtenida = getClave(tutoria.hora, tutoria.horafinal);
    const dia = getDay(tutoria.fecha);
    const idUsuario = tutoria.id_tutor;

    const horaNueva = getClave(hora, horaFin);
    const diaNuevo = getDay(fecha);
    await client.query('DELETE FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3', [idUsuario, dia, horaObtenida]);
    await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora) VALUES ($1, $2, $3)', [idUsuario, diaNuevo, horaNueva]);
    await client.query('UPDATE tutorias SET hora = $1, horafinal = $2, fecha = $3, descripcion = $4, modalidad = $5, cantidadmaximaestudiantes = $6 WHERE id = $7', [hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes, id_tutoria]);
    await client.query('COMMIT'); // Commit transaction
    res.status(200).json({ message: 'Tutoría actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar la tutoría:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
*//*
async function editarTutoria(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id_tutoria, hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes } = req.body;
    const tutoriaEdit = await client.query('SELECT * FROM tutorias WHERE id = $1', [id_tutoria]);
    const tutoria = tutoriaEdit.rows[0];
    console.log("tutoria:", tutoria);
    const clavesObtenidas = getClave(tutoria.hora, tutoria.horafinal);
    const dia = getDay(tutoria.fecha);
    const idUsuario = tutoria.id_tutor;

    const clavesNuevas = getClave(hora, horaFin);
    const diaNuevo = getDay(fecha);

    // Eliminar las claves ocupadas anteriores
    for (const clave of clavesObtenidas) {
      await client.query('DELETE FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3', [idUsuario, dia, clave]);
    }

    // Verificar si alguna de las nuevas claves ya está ocupada
    for (const clave of clavesNuevas) {
      const horarioOcupado = await client.query(
        'SELECT * FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3',
        [idUsuario, diaNuevo, clave]
      );
      if (horarioOcupado.rows.length > 0) {
        await client.query('ROLLBACK'); // Rollback transaction
        return res.status(409).json({ message: 'Error al actualizar la tutoría: El tutor ya tiene una tutoría en ese horario' });
      }
    }

    // Insertar las nuevas claves ocupadas
    for (const clave of clavesNuevas) {
      await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora) VALUES ($1, $2, $3)', [idUsuario, diaNuevo, clave]);
    }

    await client.query('UPDATE tutorias SET hora = $1, horafinal = $2, fecha = $3, descripcion = $4, modalidad = $5, cantidadmaximaestudiantes = $6 WHERE id = $7', [hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes, id_tutoria]);
    await client.query('COMMIT'); // Commit transaction
    res.status(200).json({ message: 'Tutoría actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar la tutoría:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
*/
async function editarTutoria(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id_tutoria, hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes } = req.body;
    const tutoriaEdit = await client.query('SELECT * FROM tutorias WHERE id = $1', [id_tutoria]);
    const tutoria = tutoriaEdit.rows[0];
    console.log("tutoria:", tutoria);
    const clavesObtenidas = getClave(tutoria.hora, tutoria.horafinal);
    const dia = getDay(tutoria.fecha);
    const idUsuario = tutoria.id_tutor;

    const clavesNuevas = getClave(hora, horaFin);
    const diaNuevo = getDay(fecha);

    // Obtener semana y año de la tutoría actual
    const weekActual = getWeekNumber(new Date(tutoria.fecha));
    const anioActual = new Date(tutoria.fecha).getFullYear();

    // Obtener semana y año de la nueva fecha de la tutoría
    const weekNueva = getWeekNumber(new Date(fecha));
    const anioNuevo = new Date(fecha).getFullYear();

    // Eliminar las claves ocupadas anteriores
    for (const clave of clavesObtenidas) {
      await client.query('DELETE FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3 AND semana = $4 AND anio = $5', [idUsuario, dia, clave, weekActual, anioActual]);
    }

    // Verificar si alguna de las nuevas claves ya está ocupada
    for (const clave of clavesNuevas) {
      const horarioOcupado = await client.query(
        'SELECT * FROM horariosDisponibles WHERE id_usuario = $1 AND dia = $2 AND hora = $3 AND semana = $4 AND anio = $5',
        [idUsuario, diaNuevo, clave, weekNueva, anioNuevo]
      );
      if (horarioOcupado.rows.length > 0) {
        await client.query('ROLLBACK'); // Rollback transaction
        return res.status(409).json({ message: 'Error al actualizar la tutoría: El tutor ya tiene una tutoría en ese horario' });
      }
    }

    // Insertar las nuevas claves ocupadas
    for (const clave of clavesNuevas) {
      await client.query('INSERT INTO horariosDisponibles (id_usuario, dia, hora, semana, anio) VALUES ($1, $2, $3, $4, $5)', [idUsuario, diaNuevo, clave, weekNueva, anioNuevo]);
    }

    await client.query('UPDATE tutorias SET hora = $1, horafinal = $2, fecha = $3, descripcion = $4, modalidad = $5, cantidadmaximaestudiantes = $6 WHERE id = $7', [hora, horaFin, fecha, descripcion, modalidad, maxEstudiantes, id_tutoria]);
    await client.query('COMMIT'); // Commit transaction
    res.status(200).json({ message: 'Tutoría actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar la tutoría:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    client.release(); // Release the client back to the pool
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
function getTypeUser(user) {
  if (user.id_tutor) {
    return ROL.TUTOR;
  } else if (user.id_administrador) {
    return ROL.ADMINISTRADOR;
  } else if (user.id_estudiante) {
    return ROL.ESTUDIANTE;
  }
}
async function deleteTutorThings(client, id) {
  await client.query('DELETE FROM imparten WHERE id_tutor = $1', [id]);
  await client.query('DELETE FROM solicitudes WHERE id_tutor = $1', [id]);
  await client.query('DELETE FROM comentarios WHERE id_tutor = $1', [id]);
  await client.query('DELETE FROM horariosdisponibles WHERE id_usuario = $1', [id]);
  await client.query('DELETE FROM tutorias WHERE id_tutor = $1', [id]);
}
//typeUser : estudiante, tutor, administrador
async function deleteUsuario(req, res) {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    await client.query('BEGIN'); // Start transaction
    const userActual = (await client.query('SELECT * FROM usuarios WHERE id = $1', [id])).rows[0];
    if (!userActual) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const typeUser = getTypeUser(userActual);
    if (!typeUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    console.log("typeUser:", typeUser);

    // Eliminar comentarios y valoraciones
    await client.query('DELETE FROM comentarios WHERE id_estudiante = $1', [id]);
    // Eliminar solicitudes hechas de ese estudiante
    await client.query('DELETE FROM solicitudes WHERE id_estudiante = $1', [id]);
    // Eliminar tutorías impartidas a ese estudiante
    await client.query('DELETE FROM tutorias WHERE id_estudiante = $1', [id]);
    //TANTO estudiante, administrador y tutor estan en tabla estudiantes siempre
    console.log("eliminando estudiante...");
    //Actualizar la referencia de la clave foránea en la tabla usuarios 
    await client.query('UPDATE usuarios SET id_estudiante = NULL, id_administrador = NULL, id_tutor = NULL WHERE id_estudiante = $1', [id]);
    await client.query('DELETE FROM estudiantes WHERE id = $1', [id]);
    console.log("eliminado estudiante");

    if (typeUser == ROL.TUTOR) {
      await deleteTutorThings(client, id);
      /* await client.query('DELETE FROM imparten WHERE id_tutor = $1', [id]);
       await client.query('DELETE FROM solicitudes WHERE id_tutor = $1', [id]);
       await client.query('DELETE FROM comentarios WHERE id_tutor = $1', [id]);
       await client.query('DELETE FROM horariosdisponibles WHERE id_usuario = $1', [id]);
       await client.query('DELETE FROM tutorias WHERE id_tutor = $1', [id]);*/

      console.log("eliminando tutor...");
      await client.query('DELETE FROM tutores WHERE id = $1', [id]);
      console.log("tutor eliminado");
    } else if (typeUser == ROL.ADMINISTRADOR) {
      console.log("eliminando administrador...");
      await client.query('DELETE FROM administradores WHERE id = $1', [id]);
      console.log("administrador eliminado");
    }

    console.log("eliminando usuario...");
    await client.query('DELETE FROM usuarios WHERE id = $1', [id]);
    console.log("usuario eliminado");

    await client.query('COMMIT'); // Commit transaction
    res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    await client.query('ROLLBACK'); // Rollback transaction
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    client.release(); // Release the client back to the pool
  }
}
async function updateRolUsuario(req, res) {
  const client = await pool.connect();
  try {
    client.query('BEGIN');
    const { id, rol } = req.body;
    const userEdit = (await client.query('SELECT * FROM usuarios WHERE id = $1', [id])).rows[0];
    if (!userEdit) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const rolActual = getTypeUser(userEdit);
    if (rolActual == rol) {
      return res.status(409).json({ message: 'El usuario ya tiene ese rol' });
    }
    if (rolActual == ROL.ADMINISTRADOR) {
      await client.query('UPDATE usuarios SET id_administrador = NULL WHERE id_estudiante = $1', [id]);
      await client.query('DELETE FROM administradores WHERE id = $1', [id]);
    } else if (rolActual == ROL.TUTOR) {
      await client.query('UPDATE usuarios SET id_tutor = NULL WHERE id_estudiante = $1', [id]);
      await client.query('DELETE FROM tutores WHERE id = $1', [id]);
      //Eliminar todo lo relacionado con el tutor
      await deleteTutorThings(client, id);
    }
    let query = '';
    switch (rol) {
      case ROL.TUTOR:
        //inserta a tabla tutores
        await client.query('INSERT INTO tutores (id) VALUES ($1)', [id]);
        query = 'UPDATE usuarios SET id_tutor = $1 WHERE id = $1';
        break;
      case ROL.ADMINISTRADOR:
        //inserta a tabla administradores
        await client.query('INSERT INTO administradores (id) VALUES ($1)', [id]);
        query = 'UPDATE usuarios SET id_administrador = $1 WHERE id = $1';
        break;
      default:
        break;
    }
    await client.query(query, [id]);
    client.query('COMMIT');
    res.status(200).json({ message: 'Rol actualizado con éxito' });
  } catch (error) {
    client.query('ROLLBACK');
    console.error('Error al actualizar el rol del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    client.release();
  }
}

module.exports = { getUsuario, getTutores, getUsuariosPorPalabraClave, solicitarTutoria, getSolicitudesTutorias, updateEstadoSolicitud, uploadTutoria, getSolicitudesEstudiantes, getTutorias, deleteTutoria, editarTutoria, uploadSolicitud, calificarTutor, getComentariosTutor, getComentarioTutorUsuario, updateUsuario, deleteUsuario, updateRolUsuario };
