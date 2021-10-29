const uuid = require('uuid');
const WebSocket = require('ws');

const fileHandler = require('./fileHandler');
const wsMessage = require('./wsMessage');

exports.hostInstanceId = -1;
let clientPoolArray = [];

exports.websocketConnectionHandler = (webSocketServer) => {


    webSocketServer.on('connection', function connection(ws, req) {
        ws.id = uuid.v4();
        clientPoolArray.push(ws.id);

        console.log(`clientPoolArray ${clientPoolArray}`);
        
        // TODO: registerNewServer in ServerInstance

        exports.initializeClient(ws = ws, receiverId = ws.id)

        hostAndClientConfigArray = exports.handleIncommingMessage(ws, exports.hostInstanceId, clientPoolArray);
        hostInstanceId = hostAndClientConfigArray[0]
        clientPoolArray = hostAndClientConfigArray[1]
            // TODO: handleIncommingHostMessage
                // TODO: broadcastToClients

        
        // exports.broadcastToClients(webSocketServer = webSocketServer, message = 'this is a broadcast message', isBinary = false);
    });
};

exports.sendMessage = (ws, message) => ws.send(message);

exports.handleIncommingMessage = (ws, hostInstanceId, clientPoolArray) => {
    ws.on('message', function incoming(message) {
        if (typeof(message) === 'string'){
            unpackedMessage = wsMessage.unpackMessage(message);
            const messageType = unpackedMessage.messageType;
            const senderId = unpackedMessage.senderId;
            const senderType = unpackedMessage.senderType;
            hostAndClientConfigArray = exports.setHostInstanceAndUpdateClientPoolArray(hostInstanceId, clientPoolArray, senderId, senderType)
            hostInstanceId = hostAndClientConfigArray[0]
            clientPoolArray = hostAndClientConfigArray[1]
            console.log(`host: ${hostInstanceId}`);
            console.log(`clientArr: ${clientPoolArray}`);
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
    return [hostInstanceId, clientPoolArray];
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
    });
};

exports.setHostInstanceAndUpdateClientPoolArray = (hostInstanceId, clientPoolArray, senderId, senderType) => {
    console.log(`\t old hostInstanceId: ${hostInstanceId}`);
    if (senderType === 'host') {
        hostInstanceId = senderId;
        exports.setHostInstanceId(hostInstanceId)
        hostIdIndex = clientPoolArray.indexOf(senderId);
        if (hostIdIndex !== -1){
            clientPoolArray.splice(hostIdIndex, 1);
        }
        console.log(`\t new hostInstanceId: ${hostInstanceId}`);
        return [hostInstanceId, clientPoolArray];
    }
    return [hostInstanceId, clientPoolArray];
}

exports.setHostInstanceId = (hostInstanceId) => exports.hostInstanceId = hostInstanceId;