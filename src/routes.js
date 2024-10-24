const express = require('express');

const authRoutes = require('./auth/routes');
const usuarioRoutes = require('./usuario/routes');
const asignaturasRoutes = require('./asignaturas/routes');
const horarioRoutes = require('./horario/routes');
const universidadesRoutes = require('./universidades/routes');
const reportesRoutes = require('./reportes/routes');
const emailHelper = require('../emailHelper');
const router = express.Router();

// Rutas existentes
router.use('/auth', authRoutes);
router.use('/usuario', usuarioRoutes);
router.use('/asignaturas', asignaturasRoutes);
router.use('/horario', horarioRoutes);
router.use('/universidades', universidadesRoutes);
router.use('/reportes', reportesRoutes);

// Ruta para verificar el estado del servidor
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});
// Routes
router.post("/send-email", async (req, res) => {
    const { to, subject, text } = req.body;
    console.log("to:", to, "subject:", subject, "text:", text);
    try {
      let info = await emailHelper(to, subject, text);
      res.status(200).send(`Email sent: ${info.response}`);
    } catch (error) {
      res.status(500).send("Error sending email");
    }
});
module.exports = router;