const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const wsActions = require('./utils/wsActions');

const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server:server });

// TODO: handleRuntimeInput()
wsActions.websocketConnectionHandler(WebSocket, wss);

app.get('/', (req, res) => res.sendStatus(403));
app.get('/client', (req, res) => res.sendFile(path.join(__dirname, 'views/client.html')));

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'views')));

server.listen(port, () => console.log(`Listening on port: ${port}`));
