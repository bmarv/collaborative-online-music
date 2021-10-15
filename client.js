const buffer = require('buffer');
const bson = require('bson');
const serialize = bson.serialize;
const Buffer = buffer.Buffer

const port = process.env.PORT || 3000;
let clientID = null;


// Open WebSocket connection as a Client.
const socket = new WebSocket(`ws://localhost:${port}`);

// Open Connection
socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server')
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const serverDataObj = JSON.parse(event.data);
    console.log('Message from server ', serverDataObj);
    clientID = serverDataObj.id;
    document.getElementById("clientIDText").innerHTML = clientID;
});

const sendMessage = (id = clientID) => {
    const clientMessageObj = {
        'message': 'Hello Server, Regards Client',
        'id': id,
    };
    socket.send(JSON.stringify(clientMessageObj));
}
window.sendMessage = sendMessage;

const sendFile = (id = clientID) => {
    var file = document.getElementById('fileInput').files[0];
    // socket.send(file);
    var reader = new FileReader();
    var rawData = new ArrayBuffer();
    reader.onload = (e = file) => {
        rawData = e.target.result;
        const bufferData = Buffer.from(rawData);
        console.log(`type of file ${typeof(file)}`);
        const bsonData = serialize({
            id: id,
            file: bufferData,
            route: 'TRANSFER',
            action: 'FILE_UPLOAD',
        });
        socket.send(bsonData);
    };
    reader.readAsArrayBuffer(file);
}
window.sendFile = sendFile;