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

const wsActions = require('./utils/wsActions');


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
    localAddress: req.socket.localAddress,
  });
});

app.get('/client', function (req, res) {
  console.log(`incomming connection on /client ${req.socket.remoteAddress}`);
  res.render(path.join(__dirname, 'views', 'pug-source', 'client'), { 
    localAddress: req.socket.localAddress,
  });
});

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'views', 'pug-source')));
app.use(express.static(path.join(__dirname, 'views', 'html-source')));

server.listen(port, () => console.log(`Listening on port: ${port}`));
