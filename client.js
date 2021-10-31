const buffer = require('buffer');
const bson = require('bson');
const RecordRTC = require('recordrtc');
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
    if (messageType === 'Initiation') { 
        document.getElementById("clientIDText").innerHTML = clientId; 
        sendMessage(clientId,'Registering','Client Registration');
    }
    else if (messageType === 'Broadcast') {
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(recordClientOnSuccess)
            .catch(errorCallbackForRecordingClient);
    }
    document.getElementById("serverMessageTextArea").value = `Server-Message: ${messageContent}`;
});

// send Ping-Message to Server
const sendMessage = (id = clientId, messageType = 'Message', message = 'Client-Message to the Server', additionalContent = false) => {
    const packedMessage = wsMessage.packMessage(
        senderId = id,
        senderType = 'client', 
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

// send File to Server
const sendFile = (id = clientId) => {
    const file = document.getElementById('fileInput').files[0];
    const fileName = file.name;
    const reader = new FileReader();
    let rawData = new ArrayBuffer();

    reader.onload = (e = file) => {
        rawData = e.target.result;
        const bufferData = Buffer.from(rawData);
        sendMessage(id = id, messageType = 'File', message= bufferData, additionalContent = fileName)
    };
    reader.readAsArrayBuffer(file);
}
window.sendFile = sendFile;

const recordClientOnSuccess = (stream) => {
    document.querySelector('video').srcObject = stream;
    document.querySelector('video').muted = true;

    let recorder = RecordRTC(stream, {
        type: 'video'
    });
    recorder.startRecording();

    setTimeout(function() {
        recorder.stopRecording(function() {
            let blob = recorder.getBlob();
            let url = URL.createObjectURL(blob);
            document.querySelector('video').src = url;
            RecordRTC.invokeSaveAsDialog(blob)
            // recorder.save('video-record.webm');
        });
    }, 5 * 1000);
    document.querySelector('video').muted = true;
};

const errorCallbackForRecordingClient = (error) => {
    alert(error);
}

const mediaConstraints = { video: true, audio: true };

