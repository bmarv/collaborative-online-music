const wsMessage = require('./utils/wsMessage');
const port = process.env.PORT || 3000;
let hostId = null;


// Open WebSocket connection as a Client.
const socket = new WebSocket(`ws://localhost:${port}`);

// Open Connection
socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server')
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const serverDataObj = JSON.parse(event.data);
    hostId = serverDataObj.receiverId;
    const messageType = serverDataObj.messageType;
    const messageContent = serverDataObj.messageContent;
    console.log('Message from server ', serverDataObj);
    if (messageType === 'Initiation') { 
        document.getElementById("hostIDText").innerHTML = hostId; 
        sendMessage(hostId,'Registering','Host Registration');
    }
});

// send Ping-Message to Server
const sendMessage = (id = hostId, messageType = 'Message', message = 'Host-Message to the Server', additionalContent = false) => {
    const packedMessage = wsMessage.packMessage(
        senderId = id,
        senderType = 'host', 
        receiverId = 'server', 
        messageType = messageType, 
        messageContent = message,
        additionalContent = additionalContent
    );
    if (messageType === 'Message' || messageType === 'Registering') {
        messageObject= wsMessage.stringifyMessage(packedMessage);
    }
    else if (messageType === 'File') {
        messageObject = wsMessage.serializeBsonMessage(packedMessage);
    }
    socket.send(messageObject);
}
window.sendMessage = sendMessage;

// send Broadcast via Server to Clients
const sendBroadcast = (message = 'Broadcast from Host', additionalContent = false) => {
    const packedMessage = wsMessage.packMessage(
        senderId = hostId,
        senderType = 'host', 
        receiverId = 'server', 
        messageType = 'Broadcast', 
        messageContent = message,
        additionalContent = additionalContent
    );
    messageObject= wsMessage.stringifyMessage(packedMessage);
    socket.send(messageObject);
}
window.sendBroadcast = sendBroadcast;