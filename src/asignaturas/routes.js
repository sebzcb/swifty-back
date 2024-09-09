const express = require('express');

const asignaturaController = require('./controllers');

const asignaturasRoutes = express.Router();

asignaturasRoutes.get('', asignaturaController.getAsignaturas);
// docRoutes.post('/documento', middlewares.authGuard, docControllers.addDocs);

module.exports = asignaturasRoutes;