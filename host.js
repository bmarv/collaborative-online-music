const wsMessage = require('./utils/wsMessage');
const metronome = require('./utils/metronome');

const port = process.env.PORT || 3000;
exports.hostId = null;
exports.metronomeInstanceActive = false;
exports.metronomeInstanceSoundActive = true;


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

const startMetronome = async() => {
    const bpmInput = document.getElementById('bpmInput').value;
    const nominatorInput = document.getElementById('nominatorInput').value;
    const denominatorInput = document.getElementById('denominatorInput').value;

    // visual container
    const metronomeIconsContainer = document.getElementById('metronomeIconsContainer');
    // delete lastly used Elements
    metronomeIconsContainer.innerHTML = '';

    bubbleElementsArray = []
    // create Elements
    for (let index = 0; index < nominatorInput; index += 1){
        const newBubbleElement = document.createElement('span');
        newBubbleElement.className = 'dot';
        newBubbleElement.id = `metronomeIcon-${index}`;
        bubbleElementsArray.push(newBubbleElement);
        metronomeIconsContainer.appendChild(newBubbleElement);
    }

    // if (Number.isInteger(bpmInput) && Number.isInteger(nominatorInput) && Number.isInteger(denominatorInput)) {
        exports.metronomeInstanceActive = true;
        let clockTicks = 0;
        tact = {'tactNominator': nominatorInput, 'tactDenominator': denominatorInput};
        let metronomeTimeout = metronome.setMetronomeTimeout(
            bpm = bpmInput,
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
}
window.startMetronome = startMetronome;
