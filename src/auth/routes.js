const express = require('express');

const authControllers = require('./controllers');

const authRoutes = express.Router();

authRoutes.post('/registro', authControllers.crearCuenta);
authRoutes.post('/login', authControllers.iniciarSesion);
// docRoutes.post('/documento', middlewares.authGuard, docControllers.addDocs);

module.exports = authRoutes;