"use strict";
const fs = require('fs');

const tools = require('../tools.js');
const config = require('../config.json');

var muted = {};

exports.getMuted = function () {
    return muted;
}

exports.setMuted = function (input) {
    muted = input;
}

exports.updateMuted = function (server) {
    fs.writeFile(config.serverDir + server.id + '/muted.json', JSON.stringify(muted[server.id], null, 2), null);
}

exports.commands = [
    'mute',
    'clear'
]

exports.events = [
    'ready',
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

        var list = exports.getMuted();
        if (list[msg.server.id][user.id]) {
            delete list[msg.server.id][user.id];
            exports.setMuted(list);
            exports.updateMuted(msg.server);
            bot.sendMessage(msg.channel, 'Unmuted ' + user.username + ' :ok_hand:');
        } else {
            list[msg.server.id][user.id] = {
                id: user.id,
                username: user.username
            };
            exports.setMuted(list);
            exports.updateMuted(msg.server);
            bot.sendMessage(msg.channel, 'Muted ' + user.username + ' :ok_hand:');
        }
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

exports.ready = function (bot) {
    for (var i = 0; i < bot.servers.length; i++) {
        var server = bot.servers[i];
        try {
            var list = exports.getMuted();
            list[server.id] = require(config.serverDir + server.id + '/muted.json');
            exports.setMuted(list);
        } catch (error) {
            var list = exports.getMuted();
            list[server.id] = {};
            exports.setMuted(list);
        }
    }
}

exports.message = function (bot, message) {
    if (!message.server) return;
    if (exports.getMuted()[message.server.id][message.author.id]) {
        message.delete(function (error) {
            bot.sendMessage(msg.channel, 'Error deleting ' + message.author.username + '\'s message :cry:');
        });
    }

    if (exports.getMuted()[message.server.id][bot.user.id]) {
        var list = exports.getMuted();
        delete list[message.server.id][bot.user.id];
        exports.setMuted(list);
    }
}

exports.m = {
    bool: false,
    description: 'bot will not send a response',
    process: function (bot, msg, arg) {
        if (!msg.server) return bot.sendMessage(msg.channel, 'Nope! :poop:');
        var list = exports.getMuted();
        list[msg.server.id][bot.user.id] = {
            id: bot.user.id,
            username: bot.user.username
        };
        exports.setMuted(list);
    }
}