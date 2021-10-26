const uuid = require('uuid');
const bson = require('bson');
const WebSocket = require('ws');

const fileHandler = require('./fileHandler');

const deserialize = bson.deserialize;

exports.websocketConnectionHandler = (webSocketServer) => {   
    webSocketServer.on('connection', function connection(ws, req) {
        ws.id = uuid.v4();
        
        exports.sendMessageToClient(ws, message='Welcome New Client');
        console.log(`New Connection: ClientID=${ws.id}`);
        
        // exports.broadcastToClients(webSocketServer = webSocketServer, message = 'this is a broadcast message', isBinary = false);
        
        exports.handleIncommingClientMessage(ws);
    });
};

exports.packMessageForClient = (wsId, message) => {
    const serverMessageObj = {
        'id': wsId,
        'message': message,
    };
    return serverMessageObj;
}

exports.sendMessageToClient = (ws, message) => {
    const serverMessageObj = exports.packMessageForClient(ws.id, message)
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

exports.broadcastToClients = (webSocketServer, message, isBinary) => {
    webSocketServer.clients.forEach( (client) => {
        if (client.readyState == WebSocket.OPEN) {
            client.send(JSON.stringify(this.packMessageForClient('BROADCAST-MESSAGE', message)), {binary: isBinary});
        }
    } )
};