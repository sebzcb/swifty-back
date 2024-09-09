const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();
const port = 3030;

// Configurar livereload para observar la carpeta 'public'
const liveReloadServer = livereload.createServer();
// const publicDir = path.join(__dirname, 'public');

liveReloadServer.watch(path.join(__dirname, '../public'));

// Usar el middleware de livereload
app.use(connectLivereload());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Recargar la página cuando haya cambios en los archivos
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
