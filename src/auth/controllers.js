const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config');
const ROL = require('../constants/Rol');

// const SECRET_KEY = process.env.JWT_SECRET_KEY ?? 'secretkey'; Variables de entorno
const SECRET_KEY = 'secretkey';



async function crearCuenta(req, res) {
  try{
    const { nombre, correo, contrasenia, id_universidad } = req.body;

    if (!nombre || !correo || !contrasenia) {
      res.status(400).json({ message: 'No se enviaron todos los datos' });
      return;
    }

    const existeUsuario = await pool.query('SELECT * FROM usuarios WHERE correo = ($1)', [correo]);

    if (existeUsuario.rows.length != 0) {
      console.log(existeUsuario.rows);
      res.status(400).json({ message: 'El correo ya existe' });
      return;
    }
    const existeUniversidad = await pool.query('SELECT * FROM universidades WHERE id = ($1)', [id_universidad]);
    if (existeUniversidad.rows.length == 0) {
      res.status(400).json({ message: 'La universidad no existe' });
      return;
    }
    const hashedPass = bcrypt.hashSync(contrasenia, 10); //Se crea la contraseña de 10 caracteres
    const fechaNacimiento = ''; //No permite null
    const genero = 'No especificado';
    const telefono = 'No especificado';
    const descripcion = '';

    // Iniciar transacción
    await pool.query('BEGIN');

    const resultado = await pool.query(
      'INSERT INTO usuarios (id, nombre, correo, contrasenia,fechanacimiento,genero,telefono,descripcion,id_universidad) VALUES (generar_id_usuarios(), $1, $2, $3,$4,$5,$6,$7,$8) RETURNING id',
      [nombre, correo, hashedPass, fechaNacimiento, genero, telefono, descripcion, id_universidad]
    );

    const id_usuario = resultado.rows[0].id;

    // Insertar el id del usuario en la tabla estudiantes
    await pool.query('INSERT INTO estudiantes (id) VALUES ($1)', [id_usuario]);

    // Actualizar la tabla usuarios con el id del estudiante
    await pool.query('UPDATE usuarios SET id_estudiante = $1 WHERE id = $1', [id_usuario]);

    // Finalizar transacción
    await pool.query('COMMIT');

    res.status(201).send({
      message: 'Usuario creado con éxito',
      usuario: resultado.rows[0],
    });
  }
  catch (error) {
    // Revertir transacción en caso de error
    await pool.query('ROLLBACK');
    console.error('Error al registrarse:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}



async function iniciarSesion(req, res) {
  try{
    const { correo, contrasenia } = req.body;
    if (!correo || !contrasenia) {
      res.status(400).send({
        message: 'Error: No se han recibido todos los datos necesarios',
      });
      return;
    }

    const usuario = (await pool.query('SELECT * FROM usuarios WHERE correo = ($1)', [correo])).rows[0];

    if (!usuario) {
      res.status(404).send({
        message: 'El usuario no existe',
      });
      return;
    }
    const isSame = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if(!isSame){
      res.status(401).send({
        message: 'Contraseña incorrecta',
      });
      return;
    }
    let rolUsuario = ROL.ESTUDIANTE;
    if (usuario.id_tutor) {
      rolUsuario = ROL.TUTOR
    }else if (usuario.id_administrador) {
      rolUsuario = ROL.ADMINISTRADOR
    }
    res.status(200).send({
      message: 'Inicio de sesión correcto',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        universidad: 'PUCV',
        fechaNacimiento: usuario.fechanacimiento,
        genero: usuario.genero,
        telefono: usuario.telefono,
        descripcion: usuario.descripcion,
        rol: rolUsuario//usuario.id_tutor ? 'tutor' : 'estudiante'
      },
    });
  }
  catch (error) {
    console.error('Error al Iniciar secion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

module.exports = { crearCuenta, iniciarSesion };