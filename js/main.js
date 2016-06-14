'use strict';

//imports
var Ractive = require('ractive');
var ReconnectingWebSocket = require('reconnectingwebsocket');
var suffixes = require('./nth-suffix');

var ractive = new Ractive({
    el: document.body,
    template: document.querySelector('#template-leaderboard').textContent,
    data: {
        leaders: [],
        suffixes: suffixes,
    },
});

function setLeaders(leaders) {
    ractive.set('leaders', leaders);
}

/*--- websocket init and handlers ---*/

var ws = new ReconnectingWebSocket('ws://localhost:9001/leaderboard');
ws.onopen = function wsOpen() { console.log('websocket connection open'); };
ws.onclose = function wsClose() { console.log('websocket connection closed'); };
ws.onmessage = function wsMessage(msg) {
    try {
        var payload = JSON.parse(msg.data);
        setLeaders(payload);
    } catch (e) {
        console.error(e);
    }
};

/*--- set fake data initially ---*/

var fake_leaders = [
    {
        "name": "Mercury Slice",
        "score": 2729,
        "cheeves": {
            "streak5": true,
            "streak10": true,
            "streak15": true,
            "points50": false,
            "points100": false,
            "points300": false,
            "snitch": false
        }
    },
    {
        "name": "Platinum Serrano",
        "score": 1929,
        "cheeves": {
            "streak5": true,
            "streak10": false,
            "streak15": false,
            "points50": false,
            "points100": false,
            "points300": false,
            "snitch": true
        }
    },
];

setLeaders(fake_leaders);
