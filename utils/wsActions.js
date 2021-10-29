const uuid = require('uuid');
const WebSocket = require('ws');

const fileHandler = require('./fileHandler');
const wsMessage = require('./wsMessage');


exports.websocketConnectionHandler = (webSocketServer) => {

    var hostInstanceId = undefined;
    let clientPoolList = [];

    webSocketServer.on('connection', function connection(ws, req) {
        ws.id = uuid.v4();
        clientPoolList.push(ws.id);

        console.log(`clientPoolList ${clientPoolList}`);
        
        // TODO: registerNewServer in ServerInstance

        exports.initializeClient(ws = ws, receiverId = ws.id)

        exports.handleIncommingClientMessage(ws);
        // TODO: handleIncommingServerMessage
            // TODO: broadcastToClients

        
        // exports.broadcastToClients(webSocketServer = webSocketServer, message = 'this is a broadcast message', isBinary = false);
    });
};

exports.sendMessage = (ws, message) => ws.send(message);

exports.handleIncommingClientMessage = (ws) => {
    ws.on('message', function incoming(message) {
        if (typeof(message) === 'string'){

            unpackedMessage = wsMessage.unpackMessage(message);
            const messageType = unpackedMessage.messageType;
            const senderId = unpackedMessage.senderId;
            const senderType = unpackedMessage.senderType;
            if (messageType === 'Message'){
                const messageContent = unpackedMessage.messageContent;
                console.log(`received Message from ${senderType} <${senderId}>: ${messageContent}`);
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
    webSocketServer.clients.forEach( (client) => {
        if (client.readyState == WebSocket.OPEN) {
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
    } )
};