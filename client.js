const buffer = require('buffer');
const bson = require('bson');
const RecordRTC = require('recordrtc');
const Buffer = buffer.Buffer

const wsMessage = require('./utils/wsMessage');
const metronome = require('./utils/metronome');

const port = process.env.PORT || 3000;

exports.clientId = null;
exports.recorder = -1;
exports.metronomeInstanceActive = false;
exports.metronomeInstanceSoundActive = true;
exports.bpmInput = null;
exports.nominatorInput = null;
exports.denominatorInput = null;

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
        else if (messageContent === 'Broadcast from Host: Start Metronome') {
            console.log('START METRONOME');
            let additionalContent = serverDataObj.additionalContent;
            exports.bpmInput = additionalContent.bpm;
            exports.nominatorInput = additionalContent.nominator;
            exports.denominatorInput = additionalContent.denominator;

            startClientMetronome();
        }
        else if (messageContent === 'Broadcast from Host: Stop Metronome') {
            console.log('STOP METRONOME');
            exports.metronomeInstanceActive = false;
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

const startClientMetronome = async() => {
    // visual container
    const metronomeIconsContainer = document.getElementById('metronomeIconsContainer');
    // delete lastly used Elements
    metronomeIconsContainer.innerHTML = '';

    let bubbleElementsArray = []
    // create Elements
    for (let index = 0; index < exports.nominatorInput; index += 1){
        const newBubbleElement = document.createElement('span');
        newBubbleElement.className = 'dot';
        newBubbleElement.id = `metronomeIcon-${index}`;
        bubbleElementsArray.push(newBubbleElement);
        metronomeIconsContainer.appendChild(newBubbleElement);
    }
    // activate metronome
    exports.metronomeInstanceActive = true;
    let clockTicks = 0;
    let tact = {'tactNominator': exports.nominatorInput, 'tactDenominator': exports.denominatorInput};
    let metronomeTimeout = metronome.setMetronomeTimeout(
        bpm = exports.bpmInput,
        tact = tact
    );
    while (exports.metronomeInstanceActive === true){
        // run one metronome Iteration
        clockTicks = await metronome.runOneMetronomeIteration(
            metronomeTimeout = metronomeTimeout,
            tact = tact,
            clockTicks = clockTicks,
            soundActive = exports.metronomeInstanceSoundActive,
            bubbleElementsArray = bubbleElementsArray
        )
        // mute Metronome
        document.getElementById('muteMetronomeButton').addEventListener(
            'click', 
            () => {
                exports.metronomeInstanceSoundActive = ! exports.metronomeInstanceSoundActive;
            }
        );

        // stop Metronome on Button Click
        document.getElementById('stopMetronomeButton').addEventListener(
            'click', 
            () => {
                exports.metronomeInstanceActive = false;
                metronomeIconsContainer.innerHTML = '';
            }
        );
    }
    if (exports.metronomeInstanceActive === false){
        metronomeIconsContainer.innerHTML = '';
    }
}