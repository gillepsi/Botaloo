var fs = require('fs');

var tools = require('../tools.js');
var config = require('../config.json');

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
    'version',
    'pm',
    'say',
    'mute',
    'eval'
]

exports.events = [
    'ready',
    'message'
]

exports.flags = [
    'm'
]

exports.version = {
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

exports.pm = {
    usage: '<username> <message>',
    description: 'private message a user',
    process: function (bot, msg, arg) {
        var whitespace = arg.indexOf(' ');
        var target = '';
        target = arg.substring(0, whitespace);

        var pm = arg.substring(whitespace + 1);
        if (pm == '') pm = 'Hello!';

        if (target == '') {
            bot.sendMessage(msg.channel, 'Supply a username.');
            return;
        }

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

exports.say = {
    usage: '<message>',
    description: 'bot will repeat after you',
    process: function (bot, msg, arg) {
        bot.sendMessage(msg.channel, arg);
    }
}

exports.mute = {
    description: 'mute a user',
    usage: '<username>',
    process: function (bot, msg, arg) {
        if (!msg.server) return;

        var user = msg.channel.server.members.get('username', arg);

        if (!user) {
            bot.sendMessage(msg.channel, 'User not found :cry:');
            return;
        }

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

exports.eval = {
    description: 'executes arbitrary javascript',
    usage: '<command>',
    process: function (bot, msg, arg) {
        if (msg.server) if (msg.author.hasRole(msg.server.roles.get('name', 'Staff'))) eval(arg);
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
    if (message.server) {
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
}

exports.m = {
    bool: false,
    description: 'bot will not send a response',
    process: function (bot, msg, arg) {
        var list = exports.getMuted();
        list[msg.server.id][bot.user.id] = {
            id: bot.user.id,
            username: bot.user.username
        };
        exports.setMuted(list);
    }
}