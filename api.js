const express = require("express");
const WebSocket = require("ws");
const { create_event , update_event } = require("./controller");
const wsUrl = "wss://fstream.binance.com";
const symbol = "btcusdt";
const app = express();
const port = 3000;
var events = [];
const runWebSocket = () => {
    const wsUrl = "wss://fstream.binance.com";
    const symbol = "btcusdt";
    const ws = new WebSocket(
        `${wsUrl}/stream?streams=${symbol}@aggTrade/${symbol}@markPrice`
    );

    ws.on("open", function open() {
        console.log("Connected to WebSocket");
    });

    ws.on("message", function incoming(data) {
        const dateTime = new Date();
        const message = JSON.parse(data);

        var obj = create_event(message, events);
        if (obj) {
            events.push(obj);
        }
       var updated_events = update_event(message, events);
       if(updated_events){
        events = updated_events;
       }
        // console.log("Events:", events);
    });

    ws.on("error", function error(err) {
        console.error("WebSocket error:", err);
    });

    ws.on("close", function close() {
        console.log("WebSocket connection closed");
    });
};

const updateQuestion = function (question) {
    console.log("Question:", question);
};

runWebSocket();

function received(){
   runWebSocket();
    global.oddsData = events;
    // console.log('received');

}

module.exports= {
    received
}
