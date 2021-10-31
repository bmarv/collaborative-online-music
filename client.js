const buffer = require('buffer');
const bson = require('bson');
const RecordRTC = require('recordrtc');
const Buffer = buffer.Buffer
const wsMessage = require('./utils/wsMessage');
const port = process.env.PORT || 3000;
exports.clientId = null;
exports.recorder = -1;

// Open WebSocket connection as a Client.
const socket = new WebSocket(`ws://localhost:${port}`);

// Open Connection
socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server')
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const serverDataObj = JSON.parse(event.data);
    exports.clientId = serverDataObj.receiverId;
    const messageType = serverDataObj.messageType;
    const messageContent = serverDataObj.messageContent;
    console.log('Message from server ', serverDataObj);
    if (messageType === 'Initiation') { 
        document.getElementById("clientIDText").innerHTML = exports.clientId; 
        sendMessage(exports.clientId,'Registering','Client Registration');
    }
    else if (messageType === 'Broadcast') {
        if (messageContent === 'Broadcast from Host: Start') {
            navigator.mediaDevices.getUserMedia(mediaConstraints)
                .then(startVideoRecording)
                .catch(errorCallbackVideoStream);
        }
        else if (messageContent === 'Broadcast from Host: Stop') {
            navigator.mediaDevices.getUserMedia(mediaConstraints)
                .then(stopVideoRecording)
                .catch(errorCallbackVideoStream);
        }
    }
    document.getElementById("serverMessageTextArea").value = `Server-Message: ${messageContent}`;
});

// send Ping-Message to Server
const sendMessage = (id = exports.clientId, messageType = 'Message', message = 'Client-Message to the Server', additionalContent = false) => {
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
const sendFile = (id = exports.clientId) => {
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

const streamWebcamVideoToBrowserClient = (stream) => {
    document.querySelector('video').srcObject = stream;
    document.querySelector('video').muted = true;
};

const startVideoRecording = (stream) => {
    exports.recorder = RecordRTC(stream, {
        type: 'video'
    });
    exports.recorder.startRecording();
};

const stopVideoRecording = (stream) => {
    exports.recorder.stopRecording(() => {
        let blob = exports.recorder.getBlob();
        let url = URL.createObjectURL(blob);
        document.querySelector('video').src = url;
        RecordRTC.invokeSaveAsDialog(blob);
    });
};

const errorCallbackVideoStream = (error) => {
    alert(error);
};

const mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(streamWebcamVideoToBrowserClient)
            .catch(errorCallbackVideoStream);