const bson = require('bson');

exports.packMessage = (senderId, senderType, receiverId, messageType, messageContent) => {
    const messageObject = {
        'senderId': senderId,
        'senderType': senderType,
        'receiverId': receiverId,
        'messageType': messageType,
        'messageContent': messageContent,
    };
    return messageObject;
}

exports.stringifyMessage = (messageObject) => JSON.stringify(messageObject);

exports.unpackMessage = (message) => JSON.parse(message);

exports.serializeBsonMessage = bsonMessage => bson.serialize(bsonMessage);

exports.deserializeBsonMessage = (bsonMessage) => bson.deserialize(bsonMessage, {promoteBuffers: true});

exports.getMessageAttribute = (messageObject, attribute) => messageObject[String(attribute)];