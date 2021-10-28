// const wsActions = require('./utils/wsActions');

// const { sendServerBroadcasts } = require(".");

// wsActions.broadcastToClients(webSocketServer = wss, message = 'this is a broadcast message', isBinary = false);


$.getscript('./utils/wsActions', () => {
    sendServerBroadcasts()
})