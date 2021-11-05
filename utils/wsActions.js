const uuid = require('uuid');
const WebSocket = require('ws');

const fileHandler = require('./fileHandler');
const wsMessage = require('./wsMessage');

exports.hostInstanceId = -1;
exports.clientPoolArray = [];

exports.websocketConnectionHandler = (webSocketServer) => {


    webSocketServer.on('connection', function connection(ws, req) {
        ws.id = uuid.v4();
        exports.clientPoolArray.push(ws.id);

        exports.initializeClient(ws = ws, receiverId = ws.id)

        exports.communicationService(webSocketServer, ws);

    });
};

exports.communicationService = (webSocketServer, ws) => {
    ws.on('message', function incoming(message) {
        if (typeof(message) === 'string'){
            unpackedMessage = wsMessage.unpackMessage(message);
            const senderId = unpackedMessage.senderId;
            const senderType = unpackedMessage.senderType;
            const messageType = unpackedMessage.messageType;
            const messageContent = unpackedMessage.messageContent;
            if (messageType === 'Registering') {
                exports.setHostInstanceAndUpdateClientPoolArray(senderId, senderType)              
            }
            else if (messageType === 'Message'){
                console.log(`received Message from ${senderType} <${senderId}>: ${messageContent}`);
            }
            else if (senderType === 'host' && messageType === 'Broadcast') {
                exports.broadcastToClients(webSocketServer = webSocketServer, message = messageContent, isBinary = false);
            }
        }
        else {
            const deserializedMessage = wsMessage.deserializeBsonMessage(message)
            const messageType = deserializedMessage.messageType;
            const senderId = deserializedMessage.senderId;
            const senderType = deserializedMessage.senderType;
            if (messageType === 'File') {
                const messageContent = deserializedMessage.messageContent;
                const fileName = deserializedMessage.additionalContent;
                console.log(`received File from ${senderType} <${senderId}>: ${fileName}`);
                fileHandler.saveBinaryFileInServerDirectory(fileName, messageContent, 'output');
            }
            else console.log('ERR: unsupported Message');
        }
    });
};

exports.initializeClient = (ws, receiverId) => {
    const stringifiedMessage = wsMessage.stringifyMessage(
        wsMessage.packMessage(
            senderId = 'server',
            senderType = 'server', 
            receiverId = receiverId, 
            messageType = 'Initiation', 
            messageContent = 'Initiated Client'
        )
    );
    exports.sendMessage(ws, stringifiedMessage)
}
            
exports.broadcastToClients = (webSocketServer, message, isBinary) => {
    console.log(`Broadcast Message from Host: ${message}`);  
    webSocketServer.clients.forEach( (client) => {
        if (client.readyState == WebSocket.OPEN) {
            if (exports.clientPoolArray.includes(client.id)){
                client.send(
                    wsMessage.stringifyMessage(
                        wsMessage.packMessage(
                            senderId = 'server',
                            senderType = 'server', 
                            receiverId = client.id, 
                            messageType = 'Broadcast', 
                            messageContent = message
                        )
                    ),
                    {binary: isBinary}
                )
            }
        }
    });
};

exports.setHostInstanceAndUpdateClientPoolArray = (senderId, senderType) => {
    if (senderType === 'host') {
        hostInstanceId = senderId;
        exports.hostInstanceId = hostInstanceId;
        hostIdIndex = exports.clientPoolArray.indexOf(senderId);
        if (hostIdIndex !== -1){
            exports.clientPoolArray.splice(hostIdIndex, 1);
        }
    }
    console.log(`\t updated host: ${exports.hostInstanceId}`);
    console.log(`\t updated clients: ${exports.clientPoolArray}`);
}

exports.sendMessage = (ws, message) => ws.send(message);
