'use strict';
const fs = require('fs');

const tools = require('../app/tools.js');
const config = require('../config.json');

exports['commands'] = [
    'lfg'
]

exports['events'] = []

exports['flags'] = []

exports['lfg'] = {
    server: '191327605239054336',
    description: 'toggle the LFG group',
    process: function (bot, msg, arg) {
        if (!msg.server) return;
        var role = msg.server.roles.get('name', 'Looking for Group');
        if (!role) return;

        if (msg.author.hasRole(role)) msg.author.removeFrom(role);
        else msg.author.addTo(role);
    }
}