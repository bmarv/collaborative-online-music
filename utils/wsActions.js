const uuid = require('uuid');
const fs = require('fs');
const WebSocket = require('ws');
const buffer = require('buffer');
const Buffer = buffer.Buffer;
const path = require('path');

const fileHandler = require('./fileHandler');
const wsMessage = require('./wsMessage');
const videoHandler = require('./videoHandler');

exports.hostInstanceId = -1;
exports.clientPoolArray = [];
exports.mergingVideosCommand = null;
exports.outputFile = null;


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
                if (senderType === 'host'){
                    if (messageContent === 'Prepare Merging') {
                        console.log('---PREPARE MERGING: START---')
                        const prepareCommandDict = videoHandler.prepareVideoFilesAndCreateMergingCommand(
                            'output',
                            '480'
                            );
                        exports.mergingVideosCommand = prepareCommandDict['command'];
                        exports.outputFile = prepareCommandDict['output'];
                        console.log('---PREPARE MERGING: FINISHED---')
                    }
                    else if (messageContent === 'Merge Videos') {
                        console.log('---MERGING VIDEOS: START---');
                        videoHandler.executeMergingVideoTilesToOneOutputFile(
                        exports.mergingVideosCommand
                        );
                        console.log('---MERGING VIDEOS: FINISHED---');
                        exports.sendOutputVideoToHost(ws = ws, filePath= exports.outputFile);
                    }
                }
            }
            else if (senderType === 'host' && messageType === 'Broadcast') {
                let additionalContent = unpackedMessage.additionalContent;
                exports.broadcastToClients(webSocketServer = webSocketServer, message = messageContent, additionalContent = additionalContent, isBinary = false);
            }
        }
        else {
            const deserializedMessage = wsMessage.deserializeBsonMessage(message);
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
            
exports.broadcastToClients = (webSocketServer, message, additionalContent, isBinary) => {
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
                            messageContent = message,
                            additionalContent= additionalContent
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

exports.sendMessage = (ws, message, senderId = false, senderType = false, receiverId = false, messageType = false, additionalContent = false) => {
    if (messageType === 'File') {
        const packedMessage = wsMessage.packMessage(
            senderId = senderId,
            senderType = senderType, 
            receiverId = senderId, 
            messageType = messageType, 
            messageContent = message,
            additionalContent = additionalContent
        );
        stringifiedMessage = wsMessage.stringifyMessage(packedMessage)
        ws.send(stringifiedMessage);
    }
    else {
        ws.send(message)
    }
};

exports.sendOutputVideoToHost = (ws, filePath) => {
    file = fs.readFileSync(filePath).buffer
    fileBuffer = Buffer.from(file)
    const fileName = path.basename(filePath);

    exports.sendMessage(
        ws= ws,
        message= fileBuffer, 
        senderId = 'server',
        senderType = 'server', 
        receiverId = exports.hostInstanceId, 
        messageType = 'File', 
        additionalContent = fileName
    );
}