const express = require('express');
const uuid = require('uuid');

const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server:server });

wss.on('connection', function connection(ws, req) {
    ws.id = uuid.v4();
    const serverMessageObj = {
        'message': 'Welcome New Client',
        'id': ws.id,
    };
    console.log(`New Connection: Client-Id=${ws.id}`);
    ws.send(JSON.stringify(serverMessageObj));

    ws.on('message', function incoming(message) {
        console.log('received: %s', message); 
    });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

server.listen(port, () => console.log(`Listening on port: ${port}`))
