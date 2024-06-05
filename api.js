const express = require("express");
const WebSocket = require("ws");
const { create_event, update_event } = require("./controller");
const wsUrl = "wss://fstream.binance.com";
//const symbol = "btcusdt";
const app = express();
const port = 3000;
var events = [];
let btcEvents = [];
let ethEvents = [];
const runWebSocket = (symbol, events) => {
    const wsUrl = "wss://fstream.binance.com";
    //const symbol = "btcusdt";
    const ws = new WebSocket(
        `${wsUrl}/stream?streams=${symbol}@aggTrade/${symbol}@markPrice`
    );
    //console.log(ws)

    ws.on("open", function open() {
        console.log(`Connected to WebSocket for ${symbol}`);
    });

    ws.on("message", function incoming(data) {
        const dateTime = new Date();
        const message = JSON.parse(data);

        var obj = create_event(message, events, symbol);
        // console.log(obj)
        if (obj) {
            events.push(obj);
        }
        var updated_events = update_event(message, events);
        if (updated_events) {
            events = updated_events;
        }
        // console.log("Events:", events);
        //console.log(`${symbol} Events:`, events);
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

function received() {
    runWebSocket("btcusdt", btcEvents);
    runWebSocket("ethusdt", ethEvents);
    global.btcOddsData = btcEvents;
    global.ethOddsData = ethEvents;

    //console.log()
    //    runWebSocket();
    //     global.oddsData = events;
    // console.log('received');

}

module.exports = {
    received
}
