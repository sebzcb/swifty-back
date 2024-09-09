const express = require('express');

const universidadController = require('./controllers');

const universidadesRoutes = express.Router();

universidadesRoutes.get('', universidadController.getUniversidades);

module.exports = universidadesRoutes;