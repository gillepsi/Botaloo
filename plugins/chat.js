'use strict';
const fs = require('fs');
const util = require('util');
const which = require('which');
const spawn = require('child_process').spawn;

const tools = require('../app/tools.js');
const events = require('../app/events.js');
const config = require('../config.json');
const auth = require('../auth.json')

exports['commands'] = [
    'url',
    'version',
    'restart',
    'exit',
    'pm',
    'say',
    'prefix',
    'eval',
    'exec'
]

exports['events'] = [
    'message'
]

exports['flags'] = []

exports['url'] = {
    description: 'get the Bot invite URL',
    process: function (bot, msg, arg) {
        return msg.channel.sendMessage('https://discordapp.com/oauth2/authorize?client_id=' + auth.client_id + '&scope=bot');
    }
}

exports['version'] = {
    description: 'return the git commit this bot is running',
    process: function (bot, msg, arg) {
        var commit = require('child_process').spawn('git', ['log', '-n', '1']);

        commit.stdout.on('data', function (data) {
            msg.channel.sendMessage(data);
        });

        commit.on('close', function (code) {
            if (code != 0) msg.channel.sendMessage('Failed checking git version :cry:');
        });
    }
}

exports['restart'] = {
    user: '178482006320087042',
    description: 'bot will perform a git pull and restart',
    process: function (bot, msg, suffix) {
        msg.channel.sendMessage('Fetching updates...').then(function (sentMsg) {
            console.log('Updating...');
            const fetch = spawn('git', ['fetch']);
            fetch.stdout.on('data', function (data) {
                console.log(data.toString());
            });
            fetch.on('error', function (error) { throw error; })
            fetch.on('close', function (code) {
                const reset = spawn('git', ['reset', '--hard', 'origin/master']);
                reset.stdout.on('data', function (data) {
                    console.log(data.toString());
                });
                reset.on('error', function (error) { throw error; });
                reset.on('close', function (code) {
                    const npmKeyword = which.sync('npm');
                    const npm = spawn(npmKeyword, ['install', '--loglevel=warn']);
                    npm.on('error', function (error) { throw error; });
                    npm.stdout.on('data', function (data) {
                        console.log(data.toString().replace('\n', ''));
                    });
                    npm.on('close', function (code) {
                        console.log('Restarting...');
                        sentMsg.edit('Restarting...').then(function () {
                            sentMsg.edit('Done :ok_hand:');
                            bot.destroy().then(function () {
                                const nodeKeyword = which.sync('node');
                                const node = spawn(nodeKeyword, ['./']);

                                console.log = function (d) {
                                    process.stdout.write(util.format(d));
                                };

                                node.stdout.on('data', function (data) {
                                    console.log(data.toString());
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}

exports['exit'] = {
    user: '178482006320087042',
    description: 'bot will exit',
    process: function (bot, msg, suffix) {
        msg.channel.sendMessage('Bye :smiley:');
        console.log('Exiting via command...');
        process.exit();
    }
}

exports['pm'] = {
    usage: '<username> <message>',
    description: 'private message a user',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var whitespace = arg.indexOf(' ');
        var target = arg.substring(0, whitespace);
        var pm = arg.substring(whitespace + 1);

        if (pm == '') pm = 'Hello!';
        if (target == '') return msg.channel.sendMessage('Supply a username.');

        var user = tools.findUserByName(msg, target)[0];

        if (!user) return msg.channel.sendMessage('No user ' + target + ' found!');
        user.sendMessage(pm);
    }
}

exports['say'] = {
    usage: '<message>',
    description: 'bot will repeat after you',
    process: function (bot, msg, arg) {
        msg.channel.sendMessage(arg);
    }
}

exports['prefix'] = {
    usage: '<prefix>',
    description: 'modify the additional prefix you use in this server to access this bot',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var users = events.getUsers();
        users[msg.guild.id][msg.author.id]['prefix'] = arg;
        msg.channel.sendMessage('Changed your prefix to **' + arg + '** :ok_hand:');
        events.updateUsers(msg.guild.id, users);
    }
}

exports['eval'] = {
    role: '191447208959279106',
    description: 'evaluate arbitrary javascript',
    usage: '<command>',
    process: function (bot, msg, arg) {
        try {
            msg.channel.sendMessage('```' + eval(arg) + '```');
        } catch (e) {
            msg.channel.sendMessage('```' + e + '```');
        }
    }
}

exports['exec'] = {
    user: '178482006320087042',
    description: 'execute arbitrary javascript',
    usage: '<command>',
    process: function (bot, msg, arg) {
        eval(arg);
    }
}

exports['message'] = function (bot, message) {
    if (!message.guild) return;
    var users = events.getUsers();
    var val = undefined;
    if (users[message.guild.id][message.author.id].hasOwnProperty('prefix')) val = 'prefix';

    return val;
}