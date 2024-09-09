const express = require('express');
const { json } = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require("body-parser");
const paginate = require("express-paginate");

const route = require('./routes');

const app = express();
const port = 3030; //3020
app.use(json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({origin: '*'}));
app.use(paginate.middleware(10, 100));
app.all(function (req, res, next) {
  // set default or minimum is 10 (as it was prior to v0.2.0)
  if (req.query.limit <= 10) {
    req.query.limit = 10;
  }
  next();
}); 
app.use(route);
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const server = http.createServer(app);
/*
const io = socketIO(server, {
    cors: { 
        origin: '*', // Especifica el origen de tu aplicación React en producción
        methods: ["GET", "POST"],
        // credentials: true // Si ne
    },
});

io.on('connection', (socket) => {
    console.log('Se ha conectado un cliente');

    socket.on('abrir_todos_casilleros_cafeteria', ()=>{
        io.emit('abrir_todos_casilleros');
    
    })

    socket.on('abrir_casillero_espesifico_cafeteria', (casillero)=>{
        io.emit('abrir_casillero_espesifico', casillero);
    
    })

    socket.on('abrir_pedido_cafeta', (pedido) => {
        // console.log('Se ha abierto un pedido cafeta');
        console.log(pedido);
        io.emit('abrir_pedido_casillero_cafeta', pedido);
    });

    socket.on('abrir_pedido_usuario', (pedido) => {
        console.log('Se ha abierto un pedido usuario');
        io.emit('abrir_pedido_casillero_usuario', pedido);
    });

    socket.on('disconnect', () => {
        console.log('Se ha desconectado un cliente');
    });
});*/
server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});