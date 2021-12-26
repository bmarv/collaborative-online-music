//    DON'T DELETE THIS FILE 
//    AND PRAY THAT THIS BUILD WON'T BREAK
//                            _
//                         _ooOoo_
//                        o8888888o
//                        88" . "88
//                        (| -_- |)
//                        O\  =  /O
//                     ____/`---'\____
//                   .'  \\|     |//  `.
//                  /  \\|||  :  |||//  \
//                 /  _||||| -:- |||||_  \
//                 |   | \\\  -  /'| |   |
//                 | \_|  `\`---'//  |_/ |
//                 \  .-\__ `-. -'__/-.  /
//               ___`. .'  /--.--\  `. .'___
//            ."" '<  `.___\_<|>_/___.' _> \"".
//           | | :  `- \`. ;`. _/; .'/ /  .' ; |
//           \  \ `-.   \_\_`. _.'_/_/  -' _.' /
// ===========`-.`___`-.__\ \___  /__.-'_.'_.-'================

const https = require('https');
const fs = require('fs');
const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const ip = require('ip');
require('dotenv').config()

const wsActions = require('./utils/wsActions');

// if exposed hosting is used, use public ip
const publicIpAddress = process.env.IP_ADDRESS;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'ssl.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

const app = express();

const server = https.createServer(sslOptions, app);
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server:server });

wsActions.websocketConnectionHandler(wss);

app.set('view engine', 'pug')
app.get('/', function (req, res) {
  console.log(`incomming connection on /: ${req.socket.remoteAddress}`);
  res.render(path.join(__dirname, 'views', 'pug-source', 'index'), { 
  });
});

app.get('/host', function (req, res) {
  console.log(`incomming connection on /host: ${req.socket.remoteAddress}`);
  res.render(path.join(__dirname, 'views', 'pug-source', 'host'), { 
    localAddress: publicIpAddress ? publicIpAddress : req.socket.localAddress,
  });
});

app.get('/client', function (req, res) {
  console.log(`incomming connection on /client ${req.socket.remoteAddress}`);
  res.render(path.join(__dirname, 'views', 'pug-source', 'client'), { 
    localAddress: publicIpAddress ? publicIpAddress : req.socket.localAddress,
  });
});

app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
  "/js", 
  express.static(path.join(__dirname, "node_modules/@popperjs/core/dist/umd"))
);
app.use(
  "/js", 
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'views', 'pug-source')));
app.use(express.static(path.join(__dirname, 'views', 'html-source')));

console.log(`Served on ${publicIpAddress ? `exposed address: >${publicIpAddress}< with local address >${ip.address()}<` : ip.address()}`);
server.listen(port, () => console.log(`Listening on port: ${port}`));
