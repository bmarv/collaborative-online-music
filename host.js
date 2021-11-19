const wsMessage = require('./utils/wsMessage');
const metronome = require('./utils/metronome');

const port = process.env.PORT || 3000;

exports.ipAdress = null;
exports.hostId = null;
exports.metronomeInstanceActive = false;
exports.metronomeInstanceSoundActive = true;
exports.bpmInput = null;
exports.nominatorInput = null;
exports.denominatorInput = null;
exports.metronomeConstraints = null;
exports.mergingVideosCommand = null;

const setIpAdress = () => {
    const reqIpSplittedArray = localAddress.split(':');
    exports.ipAdress = reqIpSplittedArray[reqIpSplittedArray.length - 1];
    return exports.ipAdress;
}

setIpAdress();

// Open WebSocket connection as a Client.
const socket = new WebSocket(`wss://${exports.ipAdress}:${port}`);


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
    if (messageType === 'File') {
        senderType = serverDataObj.senderType
        senderId = serverDataObj.senderId
        fileName = serverDataObj.additionalContent;
        console.log(`received File from ${senderType} <${senderId}>: ${fileName}`);
        var bytes = new Uint8Array(messageContent.data);
        var blob=new Blob([bytes]);
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link.download=fileName;
        link.click();
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


// TODO: UNIFY BROADCAST MESSAGE
const sendBroadcastStart = (message = 'Broadcast from Host: Start', additionalContent = exports.metronomeConstraints) => sendBroadcast(message, additionalContent);
window.sendBroadcastStart = sendBroadcastStart;

const sendBroadcastStop = (message = 'Broadcast from Host: Stop', additionalContent = false) => sendBroadcast(message, additionalContent);
window.sendBroadcastStop = sendBroadcastStop;

const startMetronome = async() => {
    exports.bpmInput = Number(document.getElementById('bpmInput').value);
    exports.nominatorInput = Number(document.getElementById('nominatorInput').value);
    exports.denominatorInput = Number(document.getElementById('denominatorInput').value);
    exports.metronomeConstraints = {
        'bpm': exports.bpmInput,
        'nominator': exports.nominatorInput, 
        'denominator': exports.denominatorInput
    };

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

    if (Number.isInteger(exports.bpmInput) && Number.isInteger(exports.nominatorInput) && Number.isInteger(exports.denominatorInput)) {
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
    }
    else {
        alert('The Metronome Input needs to be of the Type: Integer');
    }
}
window.startMetronome = startMetronome;

const prepareMergingVideos = () => {
    sendMessage(id = exports.hostId, messageType = 'Message', message = 'Prepare Merging', additionalContent = false);
}
window.prepareMergingVideos = prepareMergingVideos;

const mergeVideos = () => {
    sendMessage(id = exports.hostId, messageType = 'Message', message = 'Merge Videos', additionalContent = false);
}
window.mergeVideos = mergeVideos;
