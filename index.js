const express = require('express');
const uuid = require('uuid');
const bson = require('bson');
const deserialize = bson.deserialize;
const path = require('path');

const fileHandler = require('./helper/fileHandler');

const app = express();
const server = require('http').createServer(app);
const WebSocket = require('ws');
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server:server });

// TODO: handleRuntimeInput()
// TODO: ==> wsActions.js f. methods
wss.on('connection', function connection(ws, req) {
    ws.id = uuid.v4();

    // TODO: ==> initClientConnection()
    const serverMessageObj = {
        'message': 'Welcome New Client',
        'id': ws.id,
    };
    console.log(`New Connection: ClientID=${ws.id}`);
    ws.send(JSON.stringify(serverMessageObj));
    
    // TODO: broadcastToClients()


    // TODO: ==> handleInclomingClientMessage()
    ws.on('message', function incoming(message) {
        if (typeof(message) === 'string'){
            console.log('received: %s', message);
            // const clientMessageObj = JSON.parse(message);
        }
        else {
            console.log('received an other message');
            const dataFromClient = deserialize(message, {promoteBuffers: true});
            console.log(`client-id: ${(dataFromClient.id)} sended file: ${dataFromClient.fileName}`);
            fileHandler.saveBinaryFileInServerDirectory(dataFromClient.fileName, dataFromClient.file, 'output');
        }
    });
});

app.get('/', (req, res) => res.sendStatus(403));
app.get('/client', (req, res) => res.sendFile(path.join(__dirname, 'views/client.html')));

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'views')));

server.listen(port, () => console.log(`Listening on port: ${port}`));
