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

const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const wsActions = require('./utils/wsActions');

const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server:server });

wsActions.websocketConnectionHandler(wss);

app.set('view engine', 'pug')
app.get('/', function (req, res) {
    res.render('index', { port: port })
  })

app.get('/client', (req, res) => res.sendFile(path.join(__dirname, 'views', 'html-source', 'client.html')));
app.get('/host', (req, res) => res.sendFile(path.join(__dirname, 'views', 'html-source', 'host.html')));

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'views', 'html-source')));

server.listen(port, () => console.log(`Listening on port: ${port}`));
