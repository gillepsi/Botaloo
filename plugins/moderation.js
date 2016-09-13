'use strict';
const fs = require('fs');

const events = require('../utils/events.js');
const tools = require('../utils/tools.js');
const config = require('../config.json');

exports.commands = [
    'mute',
    'clear'
]

exports.events = [
    'message'
]

exports.flags = [
    'm'
]

exports.mute = {
    description: 'mute a user',
    usage: '<username>',
    process: function (bot, msg, arg) {
        if (!msg.server) return bot.sendMessage(msg.channel, 'Nope! :poop:');

        var user = msg.channel.server.members.get('username', arg);

        if (!user) return bot.sendMessage(msg.channel, 'User not found :cry:');

        var users = events.getUsers();
        if (users[msg.server.id][user.id].hasOwnProperty('muted')) {
            if (users[msg.server.id][user.id]['muted'] == true) {
                users[msg.server.id][user.id]['muted'] = false;
                bot.sendMessage(msg.channel, 'Unmuted ' + user.username + ' :ok_hand:');
            } else {
                users[msg.server.id][user.id]['muted'] = true;
                bot.sendMessage(msg.channel, 'Muted ' + user.username + ' :ok_hand:');
            }
        } else {
            users[msg.server.id][user.id] = {};
            users[msg.server.id][user.id]['muted'] = true;
            bot.sendMessage(msg.channel, 'Muted ' + user.username + ' :ok_hand:');
        }
        events.updateUsers(msg.server.id, users);
    }
}

exports.clear = {
    description: 'clear messages from current channel',
    usage: '<number>',
    process: function (bot, msg, arg) {
        if (!msg.server) return bot.sendMessage(msg.channel, 'Nope! :poop:');
        if (arg > 100) return bot.sendMessage(msg.channel, 'Nope! :poop:');
        msg.channel.getLogs((arg != '' ? arg = parseInt(arg) + 1 : arg = '2'), function (error, messages) {
            if (error) return bot.sendMessage(msg.channel, 'Error getting logs :cry:');
            bot.deleteMessages(messages, function (error) {
                if (error) return bot.sendMessage(msg.channel, 'Error deleting messages :cry:');
                bot.sendMessage(msg.channel, 'Deleted ' + messages.length - 1 + ' messages :ok_hand:');
            });
        });
    }
}

exports.message = function (bot, message) {
    if (!message.server) return;
    var users = events.getUsers();
    if (users[message.server.id][message.author.id].hasOwnProperty('muted')) {
        if (users[message.server.id][message.author.id]['muted'] == true) {
            message.delete(function (error) {
                bot.sendMessage(msg.channel, 'Error deleting ' + message.author.username + '\'s message :cry:');
            });
            if (message.author.id === bot.user.id) users[message.server.id][bot.user.id]['muted'] = false;
        }
    } else users[message.server.id][message.author.id]['muted'] = false;

    
    events.updateUsers(message.server.id, users);
}

exports.m = {
    bool: false,
    description: 'bot will not send a response',
    process: function (bot, msg, arg) {
        if (!msg.server) return bot.sendMessage(msg.channel, 'Nope! :poop:');
        var users = events.getUsers();
        try {
            users[msg.server.id][bot.user.id]['muted'] = true;
        } catch (error) {
            users[msg.server.id][bot.user.id] = {};
            users[msg.server.id][bot.user.id]['muted'] = true;
        }
        events.updateUsers(msg.server.id, users);
    }
}