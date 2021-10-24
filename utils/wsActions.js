const uuid = require('uuid');
const bson = require('bson');
const deserialize = bson.deserialize;

const fileHandler = require('./fileHandler');


exports.websocketConnectionHandler = (wss) => {   
    wss.on('connection', function connection(ws, req) {
        ws.id = uuid.v4();

        exports.initClientConnection(ws);
        
        // TODO: broadcastToClients()
        
        exports.handleIncommingClientMessage(ws);
    });
};

exports.initClientConnection = (ws) => {
    const serverMessageObj = {
        'message': 'Welcome New Client',
        'id': ws.id,
    };
    console.log(`New Connection: ClientID=${ws.id}`);
    ws.send(JSON.stringify(serverMessageObj));
};

exports.handleIncommingClientMessage = (ws) => {
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
};