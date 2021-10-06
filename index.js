const express = require('express');
const uuid = require('uuid');
const buffer = require('buffer')
const bson = require('bson')
// import { serialize } from 'bson';
// import { Buffer } from 'buffer';

const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const port = process.env.PORT || 3000;
const serialize = bson.serialize;
const Buffer = buffer.Buffer


const wss = new WebSocket.Server({ server:server });

wss.on('connection', function connection(ws, req) {
    ws.id = uuid.v4();
    const serverMessageObj = {
        'message': 'Welcome New Client',
        'id': ws.id,
    };
    console.log(`New Connection: ClientID=${ws.id}`);
    ws.send(JSON.stringify(serverMessageObj));

    ws.on('message', function incoming(message) {
        console.log(`TYPE OF MESSAGE: ${typeof(message)}`);
        console.log('received: %s', message);
        if (typeof(message) === 'string'){
            const clientMessageObj = JSON.parse(message);
        }
       
        
    });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

server.listen(port, () => console.log(`Listening on port: ${port}`))
