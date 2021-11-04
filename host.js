const wsMessage = require('./utils/wsMessage');
const metronome = require('./utils/metronome');

const port = process.env.PORT || 3000;
exports.hostId = null;


// Open WebSocket connection as a Client.
const socket = new WebSocket(`ws://localhost:${port}`);

// Open Connection
socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server')
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const serverDataObj = JSON.parse(event.data);
    exports.hostId = serverDataObj.receiverId;
    const messageType = serverDataObj.messageType;
    const messageContent = serverDataObj.messageContent;
    console.log('Message from server ', serverDataObj);
    if (messageType === 'Initiation') { 
        document.getElementById("hostIDText").innerHTML = exports.hostId; 
        sendMessage(exports.hostId,'Registering','Host Registration');
    }
});

// send Ping-Message to Server
const sendMessage = (id = exports.hostId, messageType = 'Message', message = 'Host-Message to the Server', additionalContent = false) => {
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
        senderId = exports.hostId,
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

const sendBroadcastStart = (message = 'Broadcast from Host: Start', additionalContent = false) => sendBroadcast(message, additionalContent);
window.sendBroadcastStart = sendBroadcastStart;

const sendBroadcastStop = (message = 'Broadcast from Host: Stop', additionalContent = false) => sendBroadcast(message, additionalContent);
window.sendBroadcastStop = sendBroadcastStop;


new Promise(res => metronome.startMetronome(
    bpm = 80,
    tact = {'tactNominator': 3, 'tactDenominator': 4},
    audio = true
  ));