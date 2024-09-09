const express = require('express');

const authRoutes = require('./auth/routes');
const usuarioRoutes = require('./usuario/routes');
const asignaturasRoutes = require('./asignaturas/routes');
const horarioRoutes = require('./horario/routes');
const universidadesRoutes = require('./universidades/routes');
const reportesRoutes = require('./reportes/routes');
const router = express.Router();

// router.use('/',authRoutes, productoRoutes, pedidoRoutes);
router.use('/auth', authRoutes);
router.use('/usuario', usuarioRoutes);
router.use('/asignaturas', asignaturasRoutes);
router.use('/horario', horarioRoutes);
router.use('/universidades',universidadesRoutes)
router.use('/reportes', reportesRoutes);
//TEST
//test 2
// router.use('*', (req, res) => {
//     const rutaSolicitada = req.path;
//     console.log(req)
//     res.status(404).json({
//         error: 'Ruta no encontrada',
//         message: `La ruta ${rutaSolicitada} solicitada no existe o no está disponible temporalmente`,
//     });
// });


module.exports = router;