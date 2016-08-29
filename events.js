var tools = require('./tools.js');

const prefix = 'botaloo ';

var main = require('./bot.js');

var flags = {
    'd': {
        description: 'deletes your command message'
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

        if (mutedusers.hasOwnProperty(message.author.id)) {
            message.delete(function (error) {
                bot.sendMessage(msg.channel, 'Error deleting ' + message.author.username + '\'s message :cry:');
            });
        }

        var msgPrefix = message.content.substring(0, prefix.length).replace(/\s/g, '').toLowerCase();
        if (msgPrefix === prefix.replace(/\s/g, '').toLowerCase()) {
            var flagBools = [];
            for (flag in flags) flagBools.push(false);
            var cmd = message.content.substring(prefix.length);
            console.log(tools.getTimestamp() + cmd + ' from @' + message.author.username);

            if (cmd === '') bot.sendMessage(message.channel, 'That\'s me!');

            // check flags
            for (var flag in flags) {
                var flagpos = cmd.indexOf('-' + flag);
                if (flagpos != -1) {
                    flagBools[tools.arrayIndexOf(flags, flag)] = true;
                    cmd = cmd.substring(0, flagpos - 1) + cmd.substring(flagpos + 2, cmd.length);
                }
            }

            // check commands
            for (var c in commands) {
                if (cmd.substring(0, c.length).toLowerCase() === c) commands[c].process(bot, message, cmd.substring(c.length + 1, cmd.length));
            }

            // execute flags - probably a bad implementation need to rewrite
            if (flagBools[0]) message.delete();
        }
    },

    ready: function () {
        var bot = main.getBot();

        console.log(tools.getTimestamp() + 'Ready to begin');
        for (var i = 0; i < bot.servers.length; i++) {
            console.log(bot.servers[i].name + ' - ' + bot.servers[i].channels.length + ' channels');
        }
        bot.setPlayingGame('github.com/slypher/botaloo');
    },

    disconnected: function () {
        console.log(tools.getTimeStamp() + 'Disconnected');
    },

    warn: function () {
        console.log(tools.getTimeStamp() + 'Warning');
    },

    error: function (error) {
        console.log(tools.getTimeStamp() + 'Error');
        console.log(error);
    }
}