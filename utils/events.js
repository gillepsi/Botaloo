'use strict';
const fs = require('fs');

const main = require('../bot.js');
const tools = require('./tools.js');
const config = require('../config.json');

exports.event_list =  [ // TODO: use this list
    'channelCreate',
    'channelDelete',
    'channelPinsUpdate',
    'channelUpdate',
    'error',
    'guildBanAdd',
    'guildBanRemove',
    'guildCreate',
    'guildDelete',
    'guildMemberAdd',
    'guildMemberAvailable',
    'guildMemberRemove',
    'guildMembersChunk',
    'guildMemberSpeaking',
    'guildMemberUpdate',
    'guildRoleCreate',
    'guildRoleDelete',
    'guildRoleUpdate',
    'guildUnavailable',
    'guildUpdate',
    'message',
    'messageDelete',
    'messageDeleteBulk',
    'messageUpdate',
    'presenceUpdate',
    'ready',
    'reconnecting',
    'typingStart',
    'typingStop',
    'userUpdate',
    'voiceStateUpdate'
]

var events = {}

for (var event in module.exports.event_list) {
    events[event] = {};
}

var events = {
    'message': {},
    'ready': {},
    'disconnected': {},
    'warn': {},
    'error': {},
    'debug': {}
}

var flags = {
    'd': {
        bool: false,
        description: 'deletes your command message',
        process: function (bot, msg, arg) {
            msg.delete();
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
            bot.sendMessage(msg.channel, response, function (error) {
                if (error) console.log(error);
            });
        }
    }
};

var users = {}

exports['addCommand'] = function (name, object) {
    commands[name] = object;
}

exports['addEvent'] = function (event, process) {
    events[event][Object.keys(events[event]).length] = process;
}

exports['addFlag'] = function (name, object) {
    flags[name] = object;
}

exports['updateUsers'] = function (id, users) {
    fs.writeFile(config.serverDir + id + config.playerFile, JSON.stringify(users[id], null, 2), null);
}

exports['getUsers'] = function () {
    return users;
}

exports['setUsers'] = function (input) {
    users = input;
}

exports['message'] = function (message) {
    var stop = false;
    var bot = main.getBot();
    if (message.server) { // add user to storage
        if (!users[message.server.id].hasOwnProperty(message.author.id)) { // if user is not stored
            users[message.server.id][message.author.id] = {} // add new user object
            users[message.server.id][message.author.id]['username'] = message.author.username; // populate user object
        }
    }

    for (var i = 0; i < Object.keys(events['message']).length; i++) { // call all message events added by plugins
        var response = events['message'][i](bot, message);
        if (response === 'stop') stop = true;
    }

    if (stop) return;

    var msgPrefix = message.content.substring(0, config.prefix.length).replace(/\s/g, '').toLowerCase(); // get prefix from message and escape uppercase chars and whitespace
    if (msgPrefix === config.prefix.replace(/\s/g, '').toLowerCase()) { // if prefix is in message
        for (flag in flags) flags[flag].bool = false; // set all flags to false
        var cmd = message.content.substring(config.prefix.length); // get cmd from message
        console.log(tools.getTimestamp() + ' ' + cmd + ' from @' + message.author.username);

        if (cmd === '') return bot.sendMessage(message.channel, 'That\'s me!');

        for (var flag in flags) { // check flags
            var flagpos = cmd.indexOf('-' + flag);
            if (flagpos != -1) {
                flags[flag].bool = true;
                cmd = cmd.substring(0, flagpos - 1) + cmd.substring(flagpos + 2, cmd.length);
            }
        }

        for (var c in commands) { // check commands
            var whitespace = cmd.indexOf(' ');
            if (whitespace === -1) whitespace = cmd.length;

            try { // try execute command
                if (cmd.substring(0, whitespace).toLowerCase() === c) commands[c].process(bot, message, cmd.substring(c.length + 1, cmd.length));
            } catch (e) {
                console.log(tools.getTimestamp() + ' Error executing command:');
                console.log(e.stack.replace(/\s\s\s\s/g, '\r\n    '));
            }
        }

        for (flag in flags) if (flags[flag].bool) flags[flag].process(main.getBot(), message, cmd); // check flags
    }
}

exports['ready'] = function () {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['ready']).length; i++) events['ready'][i](bot);

    console.log(tools.getTimestamp() + ' Ready to begin');
    for (var i = 0; i < bot.servers.length; i++) {
        var server = bot.servers[i];
        console.log(server.name + ' (' + server.id + ') - ' + server.channels.length + ' channels');
        if (!fs.existsSync(config.serverDir + server.id)) fs.mkdirSync(config.serverDir + server.id);
        try {
            users[bot.servers[i].id] = require('.' + config.serverDir + server.id + config.playerFile);
        } catch (error) {
            console.log(tools.getTimestamp() + ' Error loading users:\n' + error);
            users[bot.servers[i].id] = {};
            module.exports.updateUsers(bot.servers[i].id, users);
        }
    }
    bot.setPlayingGame(config.game);
}

exports['disconnected'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['disconnected']).length; i++) events['disconnected'][i](bot, m);
    console.log(tools.getTimestamp() + ' [Disconnected] ' + m);
}

exports['warn'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['warn']).length; i++) events['warn'][i](bot, m);
    console.log(tools.getTimestamp() + ' [Warning] ' + m);
}

exports['error'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['error']).length; i++) events['error'][i](bot, m);
    console.log(tools.getTimestamp() + ' [Error] ' + m);
}

exports['debug'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['debug']).length; i++) events['debug'][i](bot, message);
    console.log(tools.getTimestamp() + ' [Debug] ' + m);
}