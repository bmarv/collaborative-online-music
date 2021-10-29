const buffer = require('buffer');
const bson = require('bson');
const serialize = bson.serialize;
const Buffer = buffer.Buffer
const wsMessage = require('./utils/wsMessage');
const port = process.env.PORT || 3000;
let clientId = null;


// Open WebSocket connection as a Client.
const socket = new WebSocket(`ws://localhost:${port}`);

// Open Connection
socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server')
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const serverDataObj = JSON.parse(event.data);
    clientId = serverDataObj.receiverId;
    const messageType = serverDataObj.messageType;
    const messageContent = serverDataObj.messageContent;
    console.log('Message from server ', serverDataObj);
    if (messageType === 'Initiation') { document.getElementById("clientIDText").innerHTML = clientId; }
    document.getElementById("serverMessageTextArea").value = `Server-Message: ${messageContent}`;
});

// send Ping-Message to Server
const sendMessage = (id = clientId, messageType = 'Message', message = 'Client-Message to the Server') => {
    const packedMessage = wsMessage.packMessage(
        senderId = id,
        senderType = 'client', 
        receiverId = 'server', 
        messageType = messageType, 
        messageContent = message
    );
    if (messageType === 'Message') {
        messageObject= wsMessage.stringifyMessage(packedMessage);
    }
    // else if (messageType === 'File') {
    //     messageObject = wsMessage.serializeBsonMessage(packedMessage);
    // }
    socket.send(messageObject);
}
window.sendMessage = sendMessage;

// send File to Server
const sendFile = (id = clientId) => {
    const file = document.getElementById('fileInput').files[0];
    const fileName = file.name;
    const reader = new FileReader();
    let rawData = new ArrayBuffer();

    reader.onload = (e = file) => {
        rawData = e.target.result;
        const bufferData = Buffer.from(rawData);
        const bsonData = serialize({
            id: id,
            fileName: fileName,
            file: bufferData,
            route: 'TRANSFER',
            action: 'FILE_UPLOAD',
        });
        socket.send(bsonData);
    };
    reader.readAsArrayBuffer(file);
}
window.sendFile = sendFile;