'use strict';

var CHANGE_ANIMATION_DURATION = 20; // ms

//imports
var Ractive = require('ractive');
var ReconnectingWebSocket = require('reconnectingwebsocket');
var suffixes = require('./nth-suffix');
var _ = require('lodash');

var data = {
    leaders: [],
    suffixes: suffixes,
};

var ractive = new Ractive({
    el: document.body,
    template: document.querySelector('#template-leaderboard').textContent,
    data: data,
});

window.ractive = ractive; // for debugging
window.data = data;


ractive.observe('leaders.*.username', function (newValue, oldValue, keypath, i, key) {
    // this leader changed, triggers a css anim
    ractive.set(`leaders[${i}].changed`, false);
    var timeStart = (new Date()).getTime();
    // remove changed flag after anim has ended
    setTimeout(function removeChanged() {
        ractive.set(`leaders[${i}].changed`, true);
        var timeEnd = (new Date()).getTime();
        console.log(`.change removed after ${timeEnd - timeStart} ms`);
    }, CHANGE_ANIMATION_DURATION);
});

function setLeaders(leaders) {
    var sorted_leaders = _.sortBy(leaders, 'score').reverse();
    ractive.set('leaders', sorted_leaders);
}

/*--- websocket init and handlers ---*/

// var ws = new ReconnectingWebSocket('ws://localhost:9001/leaderboard');
var ws = new ReconnectingWebSocket('ws://gamebus-boards-production.apps-test.redhatkeynote.com/leaderboard');
ws.onopen = function wsOpen() { console.log('websocket connection open'); };
ws.onclose = function wsClose() { console.log('websocket connection closed'); };
ws.onmessage = function wsMessage(msg) {
    try {
        var payload = JSON.parse(msg.data);
        if (payload.length) {
            setLeaders(payload);
        }
    } catch (e) {
        console.error(e);
    }
};
