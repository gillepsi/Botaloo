'use strict';
const fs = require('fs');

const tools = require('../app/tools.js');
const config = require('../config.json');

exports['commands'] = [
    'version',
    'pm',
    'say',
    'eval',
    'join-server'
]

exports['events'] = []

exports['flags'] = []

exports['version'] = {
    description: 'return the git commit this bot is running',
    process: function (bot, msg, arg) {
        var commit = require('child_process').spawn('git', ['log', '-n', '1']);

        commit.stdout.on('data', function (data) {
            bot.sendMessage(msg.channel, data);
        });

        commit.on('close', function (code) {
            if (code != 0) bot.sendMessage(msg.channel, 'Failed checking git version :cry:');
        });
    }
}

exports['pm'] = {
    usage: '<username> <message>',
    description: 'private message a user',
    process: function (bot, msg, arg) {
        if (!msg.server) return bot.sendMessage(msg.channel, 'Nope! :poop:');

        var whitespace = arg.indexOf(' ');
        var target = '';
        target = arg.substring(0, whitespace);

        var pm = arg.substring(whitespace + 1);
        if (pm == '') pm = 'Hello!';

        if (target == '') return bot.sendMessage(msg.channel, 'Supply a username.');

        var users = msg.channel.server.members.getAll('username', target);

        if (users.length == 1) {
            bot.sendMessage(users[0], pm);
        } else if (users.length > 1) {
            var response = 'multiple users found:';
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                response += '\nThe id of ' + user.username + ' is ' + user.id;
            }
            bot.sendMessage(msg.channel, response);
        } else {
            bot.sendMessage(msg.channel, 'No user ' + target + ' found!');
        }
    }
}

exports['say'] = {
    usage: '<message>',
    description: 'bot will repeat after you',
    process: function (bot, msg, arg) {
        bot.sendMessage(msg.channel, arg);
    }
}

exports['eval'] = {
    description: 'executes arbitrary javascript',
    usage: '<command>',
    process: function (bot, msg, arg) {
        if (msg.server.name === 'Ghost Horde') {
            var has_permission = msg.author.hasRole(msg.server.roles.get('name', 'Staff'));
            if (has_permission) eval(arg);
        } else {
            bot.sendMessage(msg.channel, '```' + eval(arg) + '```');
        }
    }
}

exports['join-server'] = {
    description: 'joins a server',
    usage: '<invite>',
    process: function (bot, msg, arg) {
        console.log(tools.getTimestamp() + ' ' + bot.joinServer(arg, function (error, server) {
            console.log(tools.getTimestamp() + ' callback: ' + arguments);
            if (error) {
                bot.sendMessage(msg.channel, 'failed to join: ' + error);
            } else {
                console.log(tools.getTimestamp + ' Joined server ' + server);
                bot.sendMessage(msg.channel, 'Successfully joined ' + server + ':ok_hand:');
            }
        }));
    }
}