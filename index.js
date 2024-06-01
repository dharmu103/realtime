const api = require('./api');
const emitter = require('./emitter');
require('dotenv/config');
const mongoose = require('./database');
mongoose.Promise = global.Promise;

global.oddsData = {};
console.log("Starting the application...")
api.received();
emitter.emit();

// const WebSocket = require("ws");
// const wsUrl = "wss://fstream.binance.com";
// const symbol = "btcusdt";
// const binanceWS = new WebSocket(
//     `${wsUrl}/stream?streams=${symbol}@aggTrade/${symbol}@markPrice`
// );
// // const binanceWS = new WebSocket("wss://stream.binance.com:9443/ws/eosbtc@trade");

// var websocketList = [];

// binanceWS.on("open", function open() {
//     console.log("open action");
// });

// binanceWS.on("message", function incoming(data) {
//     // console.log(JSON.parse(data));
//     var data = JSON.parse(data);
//     // send data to every websocket client
//     websocketList.forEach(ws => {
//         ws.send(data);
//     });
// });

// const wss = new WebSocket.Server({ port: 8080 });

// wss.on("connection", function connection(ws) {

//     // add ws handle to websocket list.
//     websocketList.push(ws);

//     ws.on("close", function close() {
//         console.log("Disconnected");
//     });
// });

