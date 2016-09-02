"use strict";
const fs = require('fs');

const events = require('../utils/events.js');
const config = require('../config.json');

exports.commands = [
    'exp'
]

exports.events = [
    'message'
]

exports.flags = []

var convertExp = function (experience) {
    // todo
}
// todo: config.json per server defining levels

exports.exp = {
    description: 'bot will show your current exp',
    process: function (bot, msg, arg) {
        if (!msg.server) return bot.sendMessage(msg.channel, 'Nope! :poop:');
        bot.sendMessage(msg.channel, events.getUsers()[msg.server.id][msg.author.id]['experience']);
    }
}

exports.message = function (bot, message) {
    var users = events.getUsers();
    if (users[message.server.id][message.author.id].hasOwnProperty('experience')) {
        users[message.server.id][message.author.id]['experience'] += Math.floor(Math.random() * (config.experience.max - config.experience.min) + config.experience.min);
    } else {
        users[message.server.id][message.author.id]['experience'] = 0;
    }
    events.updateUsers(message.server.id, users);
    // check if leveled
}
// yet to be implemented