'use strict';
const fs = require('fs');

const events = require('../app/events.js');
const config = require('../config.json');

exports['commands'] = [
    'exp'
]

exports['events'] = [
    'message'
]

exports['flags'] = []

var convertExp = function (experience) {
    // todo
}
// todo: config.json per server defining levels

exports['exp'] = {
    description: 'bot will show your current exp',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        msg.channel.sendMessage(events.getUsers()[msg.guild.id][msg.author.id]['experience']);
    }
}

exports['message'] = function (bot, message) {
    if (!message.guild) return;
    var users = events.getUsers();
    if (users[message.guild.id][message.author.id].hasOwnProperty('experience')) {
        users[message.guild.id][message.author.id]['experience'] += Math.floor(Math.random() * (config.experience.max - config.experience.min) + config.experience.min);
    } else {
        users[message.guild.id][message.author.id]['experience'] = 0;
    }
    events.updateUsers(message.guild.id, users);
    // check if leveled
}