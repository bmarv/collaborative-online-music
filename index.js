const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const wsActions = require('./utils/wsActions');
const metronome = require('./utils/metronome');

const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server:server });

wsActions.websocketConnectionHandler(wss);
metronome.startMetronome(bpm = 60, tact = {'tactNominator': 4, 'tactDenominator': 4});

app.set('view engine', 'pug')
app.get('/', function (req, res) {
    res.render('index', { port: port })
  })
  
// app.get('/host', function (req, res) {
//     res.render('host', { 
//         wss: wss,
//     })
// })

app.get('/client', (req, res) => res.sendFile(path.join(__dirname, 'views', 'html-source', 'client.html')));
app.get('/host', (req, res) => res.sendFile(path.join(__dirname, 'views', 'html-source', 'host.html')));

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'views', 'html-source')));

server.listen(port, () => console.log(`Listening on port: ${port}`));
