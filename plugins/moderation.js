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
    description: 'mute a user',
    usage: '<username>',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var user = tools.findUserByName(msg, arg)[0];

        if (!user) return msg.channel.sendMessage('User not found :cry:');

        var users = events.getUsers();
        if (users[msg.guild.id][user.id].hasOwnProperty('muted')) {
            if (users[msg.guild.id][user.id]['muted'] == true) {
                users[msg.guild.id][user.id]['muted'] = false;
                msg.channel.sendMessage('Unmuted ' + user.user.username + ' :ok_hand:');
            } else {
                users[msg.guild.id][user.id]['muted'] = true;
                msg.channel.sendMessage('Muted ' + user.user.username + ' :ok_hand:');
            }
        } else {
            users[msg.guild.id][user.id] = {};
            users[msg.guild.id][user.id]['muted'] = true;
            msg.channel.sendMessage('Muted ' + user.user.username + ' :ok_hand:');
        }
        events.updateUsers(msg.guild.id, users);
    }
}

exports['disable'] = {
    usage: '<username>',
    description: 'disable a user from using this bot',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var user = tools.findUserByName(msg, arg)[0];

        if (!user) return msg.channel.sendMessage('User not found :cry:');

        var users = events.getUsers();
        if (users[msg.guild.id][user.id].hasOwnProperty('disabled')) {
            if (users[msg.guild.id][user.id]['disabled'] == true) {
                users[msg.guild.id][user.id]['disabled'] = false;
                msg.channel.sendMessage('Enabled ' + user.user.username + ' :ok_hand:');
            } else {
                users[msg.guild.id][user.id]['disabled'] = true;
                msg.channel.sendMessage('Disabled ' + user.user.username + ' :ok_hand:');
            }
        } else {
            users[msg.guild.id][user.id] = {};
            users[msg.guild.id][user.id]['disabled'] = true;
            msg.channel.sendMessage('Disabled ' + user.user.username + ' :ok_hand:');
        }
        events.updateUsers(msg.guild.id, users);
    }
}

exports['clear'] = {
    description: 'clear messages from current channel',
    usage: '<number>',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        if (arg > 100) return msg.channel.sendMessage('Nope! :poop:');
        if (arg === '') arg = '2';
        msg.channel.fetchMessages({ limit: arg })
            .then(function (messages) {
                for (var i = 0; i < messages.size; i++) {
                    var message = messages.array()[i];
                    message.delete()
                        .catch(function (e) {
                            msg.channel.sendMessage('Error deleting message :cry:');
                        });
                }
                msg.channel.sendMessage('Deleted ' + (messages.size - 1) + ' messages :ok_hand:');
            })
            .catch(function (error) {
                msg.channel.sendMessage('Error getting logs :cry:');
            });
    }
}

exports['message'] = function (bot, message) {
    if (!message.guild) return;
    var users = events.getUsers();
    var val = undefined;
    if (users[message.guild.id][message.author.id].hasOwnProperty('muted')) {
        if (users[message.guild.id][message.author.id]['muted'] == true) {
            message.delete(function (error) {
                msg.channel.sendMessage('Error deleting ' + message.author.username + '\'s message :cry:');
            });
            if (message.author.id === bot.user.id) users[message.guild.id][bot.user.id]['muted'] = false;
        }
    } else users[message.guild.id][message.author.id]['muted'] = false;

    if (users[message.guild.id][message.author.id].hasOwnProperty('disabled')) {
        if (users[message.guild.id][message.author.id]['disabled'] == true) {
            val = 'stop';
            if (message.author.id === bot.user.id) users[message.guild.id][bot.user.id]['disabled'] = false;
        }
    } else users[message.guild.id][message.author.id]['disabled'] = false

    events.updateUsers(message.guild.id, users);
    return val;
}

exports['m'] = {
    bool: false,
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