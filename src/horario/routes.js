const express = require('express');

const horarioControllers = require('./controllers');

const horarioRoutes = express.Router();

horarioRoutes.get('/:idUsuario', horarioControllers.getHorario);
horarioRoutes.put('/:idUsuario', horarioControllers.updateHorario);
// docRoutes.post('/documento', middlewares.authGuard, docControllers.addDocs);

module.exports = horarioRoutes;