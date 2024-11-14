const express = require('express');

const horarioControllers = require('./controllers');

const horarioRoutes = express.Router();

horarioRoutes.get('/:idUsuario/week/:semana/year/:anio', horarioControllers.getHorario);
horarioRoutes.put('/:idUsuario', horarioControllers.updateHorario);
horarioRoutes.get('/claves', horarioControllers.getClaves);
// docRoutes.post('/documento', middlewares.authGuard, docControllers.addDocs);

module.exports = horarioRoutes;