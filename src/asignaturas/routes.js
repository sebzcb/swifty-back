const express = require('express');

const asignaturaController = require('./controllers');

const asignaturasRoutes = express.Router();

asignaturasRoutes.get('', asignaturaController.getAsignaturas);
asignaturasRoutes.get('/:id_universidad', asignaturaController.getAsignaturasPorUniversidad);
asignaturasRoutes.post('/impartir', asignaturaController.addAsignaturaImpartidaPorTutor);
asignaturasRoutes.get('/impartir/:id_tutor', asignaturaController.getAsignaturasImpartidasPorTutor);
asignaturasRoutes.put('/impartir', asignaturaController.editAsignaturaImpartidaPorTutor);
asignaturasRoutes.delete('/impartir/:codigo_asignatura/:id_tutor', asignaturaController.deleteAsignaturaImpartidaPorTutor);
// docRoutes.post('/documento', middlewares.authGuard, docControllers.addDocs);

module.exports = asignaturasRoutes;