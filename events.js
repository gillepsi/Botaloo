var fs = require('fs');

var main = require('./bot.js');
var tools = require('./tools.js');
var config = require('./config.json');

const prefix = 'botaloo ';

var flags = {
    'd': {
        bool: false,
        description: 'deletes your command message',
        process: function (bot, msg, arg) {
            msg.delete();
        }
    },

    'm': {
        bool: false,
        description: 'bot will not send a response',
        process: function (bot, msg, arg) {
            var list = tools.getMuted();
            list[msg.server.id][bot.user.id] = {
                id: bot.user.id,
                username: bot.user.username
            };
            tools.setMuted(list);
        }
    }
};

var commands = {
    'help': {
        description: 'lists all commands',
        process: function (bot, msg, arg) {
            var response = 'Commands:```';
            for (var c in commands) {
                var desc = commands[c].description;
                var usage = commands[c].usage + ' ';

                if (usage === 'undefined ') usage = '';
                response += '\n' + c + ' ' + usage + '- ' + desc;
            }

            response += '```\n Flags:```';
            for (var flag in flags) {
                var desc = flags[flag].description;

                response += '\n-' + flag + ' - ' + desc;
            }
            response += '```';
            bot.sendMessage(msg.channel, response);
        }
    }
};

module.exports = {
    addCommand: function (name, object) {
        commands[name] = object;
    },

    message: function (message) {
        var bot = main.getBot();

        if (message.server) {
            if (tools.getMuted()[message.server.id][message.author.id]) {
                message.delete(function (error) {
                    bot.sendMessage(msg.channel, 'Error deleting ' + message.author.username + '\'s message :cry:');
                });
            }

            if (tools.getMuted()[message.server.id][bot.user.id]) {
                var list = tools.getMuted();
                delete list[message.server.id][bot.user.id];
                tools.setMuted(list);
            }
        }

        var msgPrefix = message.content.substring(0, prefix.length).replace(/\s/g, '').toLowerCase();
        if (msgPrefix === prefix.replace(/\s/g, '').toLowerCase()) {
            for (flag in flags) flags[flag].bool = false;
            var cmd = message.content.substring(prefix.length);
            console.log(tools.getTimestamp() + ' ' + cmd + ' from @' + message.author.username);

            if (cmd === '') bot.sendMessage(message.channel, 'That\'s me!');

            // check flags
            for (var flag in flags) {
                var flagpos = cmd.indexOf('-' + flag);
                if (flagpos != -1) {
                    flags[flag].bool = true;
                    cmd = cmd.substring(0, flagpos - 1) + cmd.substring(flagpos + 2, cmd.length);
                }
            }

            // check commands
            for (var c in commands) {
                if (cmd.substring(0, c.length).toLowerCase() === c) commands[c].process(bot, message, cmd.substring(c.length + 1, cmd.length));
            }

            // execute flags - probably a bad implementation need to rewrite
            for (flag in flags) if (flags[flag].bool) flags[flag].process(main.getBot(), message, cmd);
        }
    },

    ready: function () {
        var bot = main.getBot();
        console.log(tools.getTimestamp() + ' Ready to begin');
        for (var i = 0; i < bot.servers.length; i++) {
            var server = bot.servers[i];
            console.log(server.name + ' - ' + server.channels.length + ' channels');
            if (!fs.existsSync(config.serverDir + server.id)) fs.mkdirSync(config.serverDir + server.id);
            try {
                var list = tools.getMuted();
                list[server.id] = require(config.serverDir + server.id + '/muted.json');
                tools.setMuted(list);
            } catch (error) {
                var list = tools.getMuted();
                list[server.id] = {};
                tools.setMuted(list);
            }
        }
        bot.setPlayingGame('github/slypher/botaloo');
    },

    disconnected: function (m) {
        console.log(tools.getTimestamp() + ' [Disconnected] ' + m);
    },

    warn: function (m) {
        console.log(tools.getTimestamp() + ' [Warning] ' + m);
    },

    error: function (m) {
        console.log(tools.getTimestamp() + ' [Error] ' + m);
    },

    debug: function (m) {
        console.log(tools.getTimestamp() + ' [Debug] ' + m);
    }
}