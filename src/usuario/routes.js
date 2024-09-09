const express = require('express');

const usuarioControllers = require('./controllers');

const usuarioRoutes = express.Router();

usuarioRoutes.get('/:id', usuarioControllers.getUsuario);
usuarioRoutes.get('/lista/tutores', usuarioControllers.getTutores);
usuarioRoutes.post('/lista/usuarios', usuarioControllers.getUsuariosPorPalabraClave);
usuarioRoutes.post('/solicitudes', usuarioControllers.getSolicitudesTutorias);
usuarioRoutes.put('/solicitudes/solicitud/estado/actualizar', usuarioControllers.updateEstadoSolicitud);
usuarioRoutes.post('/tutorias/subir', usuarioControllers.uploadTutoria);
usuarioRoutes.delete('/tutorias/eliminar/:id_tutoria', usuarioControllers.deleteTutoria);
usuarioRoutes.post('/tutorias/solicitudes/estudiantes',usuarioControllers.getSolicitudesEstudiantes);
usuarioRoutes.post('/lista/tutorias',usuarioControllers.getTutorias);
usuarioRoutes.put('/tutorias/editar', usuarioControllers.editarTutoria);
usuarioRoutes.post('/solicitudes/subir',usuarioControllers.uploadSolicitud);
usuarioRoutes.post('/calificar',usuarioControllers.calificarTutor);
usuarioRoutes.post('/comentarios',usuarioControllers.getComentariosTutor);
usuarioRoutes.post('/comentario',usuarioControllers.getComentarioTutorUsuario);
// docRoutes.post('/documento', middlewares.authGuard, docControllers.addDocs);
usuarioRoutes.put('/update',usuarioControllers.updateUsuario)
module.exports = usuarioRoutes;