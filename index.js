const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const wsActions = require('./utils/wsActions');

const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server:server });

wsActions.websocketConnectionHandler(wss);

app.set('view engine', 'pug')
app.get('/', function (req, res) {
    res.render('index', { port: port })
  })

app.get('/client', (req, res) => res.sendFile(path.join(__dirname, 'views', 'html-source', 'client.html')));
app.get('/host', (req, res) => res.sendFile(path.join(__dirname, 'views', 'html-source', 'host.html')));

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'views', 'html-source')));

server.listen(port, () => console.log(`Listening on port: ${port}`));
