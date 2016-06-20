'use strict';

var CHANGE_ANIMATION_DURATION = 1000; // ms

//imports
var Ractive = require('ractive');
var ReconnectingWebSocket = require('reconnectingwebsocket');
var suffixes = require('./nth-suffix');
var _ = require('lodash');

var ractive = new Ractive({
    el: document.body,
    template: document.querySelector('#template-leaderboard').textContent,
    data: {
        leaders: [],
        suffixes: suffixes,
    },
});

window.ractive = ractive; // for debugging


ractive.observe('leaders.*.name', function (newValue, oldValue, keypath, i, key) {
    // this leader changed, triggers a css anim
    ractive.set(`leaders[${i}].changed`, true);
    // remove changed flag after anim has ended
    setTimeout(function removeChanged() {
        ractive.set(`leaders[${i}].changed`, false);
    }, CHANGE_ANIMATION_DURATION);
});

function setLeaders(leaders) {
    var sorted_leaders = _.sortBy(leaders, 'score').reverse();
    ractive.set('leaders', sorted_leaders);
}

/*--- websocket init and handlers ---*/

// var ws = new ReconnectingWebSocket('ws://localhost:9001/leaderboard');
var ws = new ReconnectingWebSocket('ws://gamebus-production.apps-test.redhatkeynote.com/leaderboard');
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
