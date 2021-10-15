const express = require('express');
const uuid = require('uuid');
const buffer = require('buffer');
const bson = require('bson');
const deserialize = bson.deserialize;
const path = require('path');
const fs = require('fs');

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
    console.log(`New Connection: ClientID=${ws.id}`);
    ws.send(JSON.stringify(serverMessageObj));

    ws.on('message', function incoming(message) {
        console.log(`TYPE OF MESSAGE: ${typeof(message)}`);
        if (typeof(message) === 'string'){
            console.log('received: %s', message);
            const clientMessageObj = JSON.parse(message);
        }
        else {
            console.log('received an other message');
            const dataFromClient = deserialize(message, {promoteBuffers: true});
            console.log(`file from client-id: ${(dataFromClient.id)}`);

            console.log(dataFromClient.file);
            

            fs.writeFile(
                'downloadDoc',
                dataFromClient.file, // edited
                'binary',
                (err) => {
                  console.log('ERROR!!!!', err);
                }
            );
        }
           
    });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.use(express.static(path.join(__dirname)));

server.listen(port, () => console.log(`Listening on port: ${port}`))
