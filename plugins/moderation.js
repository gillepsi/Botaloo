'use strict';
const fs = require('fs');

const events = require('../app/events.js');
const tools = require('../app/tools.js');
const config = require('../config.json');

exports['commands'] = [
    'mute',
    'disable',
    'clear'
]

exports['events'] = [
    'message'
]

exports['flags'] = [
    'm'
]

exports['mute'] = {
    role: '191447208959279106',
    description: 'mute a user',
    usage: '<username>',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var user = tools.findUserByName(msg, arg)[0];

        if (!user) return msg.channel.sendMessage('User not found :cry:');

        var users = events.getUsers();
        if (users[msg.guild.id][user.id].hasOwnProperty('muted')) {
            delete users[msg.guild.id][user.id]['muted'];
            msg.channel.sendMessage('Unmuted **' + user.user.username + '** :ok_hand:');
        } else {
            users[msg.guild.id][user.id]['muted'] = true;
            msg.channel.sendMessage('Muted **' + user.user.username + '** :ok_hand:');
        }
        events.updateUsers(msg.guild.id, users);
    }
}

exports['disable'] = {
    role: '191447208959279106',
    usage: '<username>',
    description: 'disable a user from using this bot',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var user = tools.findUserByName(msg, arg)[0];

        if (!user) return msg.channel.sendMessage('User not found :cry:');

        var users = events.getUsers();
        if (users[msg.guild.id][user.id].hasOwnProperty('disabled')) {
            delete users[msg.guild.id][user.id]['disabled'];
            msg.channel.sendMessage('Enabled **' + user.user.username + '** :ok_hand:');
        } else {
            users[msg.guild.id][user.id]['disabled'] = true;
            msg.channel.sendMessage('Disabled **' + user.user.username + '** :ok_hand:');
        }
        events.updateUsers(msg.guild.id, users);
    }
}

exports['clear'] = {
    role: '191447208959279106',
    description: 'clear messages from current channel',
    usage: '[name] <number>',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        if (arg === '') return msg.channel.sendMessage('Provide a number of messages to clear :confused:');

        var args = arg.split(' ');
        var number = arg;
        if (args.length > 1) number = args[1]; 

        msg.channel.fetchMessages({ limit: number, before: msg.id })
            .then(function (messages) {
                var messagesToDelete = (args.length > 1 ? messages.filter(function(message) { return message.author.username === args[0] }) : messages);
                msg.channel.bulkDelete(messagesToDelete)
                    .catch(function (error) {
                        msg.channel.sendMessage('Error deleting message :cry:');
                    })
                    .then(function (messagesDeleted) {
                        msg.channel.sendMessage('Deleted **' + (messagesDeleted.size) + '** messages :ok_hand:');
                    });
            });
    }
}

exports['message'] = function (bot, message) {
    if (!message.guild) return;
    var users = events.getUsers();
    var val = undefined;
    if (users[message.guild.id][message.author.id].hasOwnProperty('muted')) {
        message.delete(function (error) {
            msg.channel.sendMessage('Error deleting **' + message.author.username + '**\'s message :cry:');
        });
        if (message.author.id === bot.user.id) delete users[message.guild.id][bot.user.id]['muted'];
    }

    if (users[message.guild.id][message.author.id].hasOwnProperty('disabled')) {
        val = 'stop';
        if (message.author.id === bot.user.id) delete users[message.guild.id][bot.user.id]['disabled'];
    }

    events.updateUsers(message.guild.id, users);
    return val;
}

exports['m'] = {
    description: 'bot will not send a response',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        var users = events.getUsers();
        try {
            users[msg.guild.id][bot.user.id]['muted'] = true;
        } catch (error) {
            users[msg.guild.id][bot.user.id] = {};
            users[msg.guild.id][bot.user.id]['muted'] = true;
        }
        events.updateUsers(msg.guild.id, users);
    }
}