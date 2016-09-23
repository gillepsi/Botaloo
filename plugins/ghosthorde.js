'use strict';
const fs = require('fs');

const tools = require('../app/tools.js');
const config = require('../config.json');

exports['commands'] = [
    'lfg',
    'exec'
]

exports['events'] = []

exports['flags'] = []

exports['lfg'] = {
    server: '191327605239054336',
    description: 'toggle the LFG group',
    process: function (bot, msg, arg) {
        if (!msg.server) return bot.sendMessage(msg.channel, 'Nope! :poop:');
        var role = msg.server.roles.get('name', 'Looking for Group');
        if (!role) return;

        if (msg.author.hasRole(role)) {
            msg.author.removeFrom(role);
            bot.sendMessage(msg.channel, 'Removed from LFG :ok_hand:');
        } else {
            msg.author.addTo(role);
            bot.sendMessage(msg.channel, 'Added to LFG :ok_hand:');
        }
    }
}

exports['exec'] = {
    server: '191327605239054336',
    description: 'execute arbitrary javascript',
    process: function (bot, msg, arg) {
        var has_permission = msg.author.hasRole(msg.server.roles.get('name', 'Staff'));
        if (has_permission) eval(arg);
        if (!has_permission) bot.sendMessage(msg.channel, 'Nope! :poop:');
    }
}