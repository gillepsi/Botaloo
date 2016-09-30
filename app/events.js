'use strict';
const fs = require('fs');

const main = require('../bot.js');
const tools = require('./tools.js');
const config = require('../config.json');

exports.eventList = [
    'raw',
    'debug',
    'warn',
    'error',
    'ready',
    'reconnecting',
    'disconnected',
    'serverCreated',
    'serverDeleted',
    'message',
    'messageDeleted',
    'messageUpdated',
    'channelCreated',
    'channelDeleted',
    'channelPinsUpdate',
    'channelUpdated',
    'serverRoleCreated',
    'serverRoleDeleted',
    'serverRoleUpdated',
    'serverNewMember',
    'serverMemberRemoved',
    'serverMemberUpdated',
    'presence',
    'userTypingStarted',
    'userTypingStopped',
    'userBanned',
    'userUnbanned',
    'noteUpdated',
    'voiceJoin',
    'voiceSwitch',
    'voiceLeave',
    'voiceStateUpdate',
    'voiceSpeaking'
]

var events = {}

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
                if (!commands[c].guild || msg.guild.id === commands[c].guild) response += '\n' + c + ' ' + usage + '- ' + desc;
            }

            response += '```\n Flags:```';
            for (var flag in flags) {
                var desc = flags[flag].description;

                response += '\n-' + flag + ' - ' + desc;
            }
            response += '```';
            msg.author.sendMessage( response);
        }
    }
};

var users = {}

// add all events from eventList as objects to events variable
for (var event in module.exports.eventList) events[module.exports.eventList[event]] = {};

// functions used by bot.js to add plugin features
exports['addCommand'] = function (name, object) { commands[name] = object; }
exports['addEvent'] = function (event, process) { events[event][Object.keys(events[event]).length] = process; }
exports['addFlag'] = function (name, object) { flags[name] = object; }

// functions used to manage the users array
exports['updateUsers'] = function (id, users) { fs.writeFile(config.serverDir + id + config.playerFile, JSON.stringify(users[id], null, 2), null); }
exports['getUsers'] = function () { return users; }
exports['setUsers'] = function (input) { users = input; }

// ----- start default event handlers -----

exports['message'] = function (message) {
    var stop = false; // TODO: move to plugin responses object
    var newPrefix = ''; // TODO: move to plugin responses object
    var bot = main.getBot();
    if (message.guild) { // add user to storage
        if (!users[message.guild.id].hasOwnProperty(message.author.id)) { // if user is not stored
            users[message.guild.id][message.author.id] = {} // add new user object
            users[message.guild.id][message.author.id]['username'] = message.author.username; // populate user object
        }
    }

    for (var i = 0; i < Object.keys(events['message']).length; i++) { // call events added by plugins
        var response = events['message'][i](bot, message); // get response from plugin event
        if (response === 'stop') stop = true; // stop response
        if (response === 'prefix') newPrefix = users[message.guild.id][message.author.id]['prefix']; // add a prefix
    }

    if (stop) return; // 'stop' response stops further execution of this event

    var msgPrefix = message.content.substring(0, config.prefix.length).replace(/\s/g, '').toLowerCase(); // get prefix from message and escape uppercase chars and whitespace
    var msgNewPrefix = (newPrefix !== '' ? message.content.substring(0, newPrefix.length) : ' ') // get new prefix from message
    if (msgPrefix === config.prefix.replace(/\s/g, '').toLowerCase() || msgNewPrefix === newPrefix) { // if prefix is in message
        for (flag in flags) flags[flag].bool = false; // set all flags to false

        var cmd_start = (msgNewPrefix === newPrefix ? newPrefix.length : config.prefix.length);
        while (message.content[cmd_start] === ' ') cmd_start += 1;

        var cmd = message.content.substring(cmd_start); // get cmd from message
        console.log(tools.getTimestamp() + ' ' + cmd + ' from @' + message.author.username);

        if (cmd === '') return message.channel.sendMessage('That\'s me!'); // default response

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
            if (commands[c].guild && message.guild.id !== commands[c].guild) continue
            if (commands[c].user && message.author.id !== commands[c].user) continue

            if (commands[c].role) {
                if (!message.guild) continue;
                if (!message.guild.roles.get('id', commands[c].role)) continue
                if (!message.author.hasRole(message.guild.roles.get('id', commands[c].role))) continue
            }

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
    for (var i = 0; i < Object.keys(events['ready']).length; i++) events['ready'][i](bot); // call events added by plugins

    console.log(tools.getTimestamp() + ' Ready to begin');
    for (var i = 0; i < bot.guilds.size; i++) { // for each guild
        var guild = bot.guilds.array()[i];
        console.log(guild.name + ' (' + guild.id + ') - ' + guild.channels.size + ' channels');
        if (!fs.existsSync(config.serverDir + guild.id)) fs.mkdirSync(config.serverDir + guild.id); // create guild directory
        try { // attempt to load guild users
            users[guild.id] = require('.' + config.serverDir + guild.id + config.playerFile);
        } catch (error) { // create fresh guild user file
            console.log(tools.getTimestamp() + ' Error loading users:\n' + error);
            users[guild.id] = {};
            module.exports.updateUsers(guild.id, users);
        }
    }
    bot.user.setStatus('online', config.game);
}

exports['reconnecting'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['reconnecting']).length; i++) events['reconnecting'][i](bot, m); // call events added by plugins
    console.log(tools.getTimestamp() + ' [Reconnecting] ' + m);
}

exports['disconnected'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['disconnected']).length; i++) events['disconnected'][i](bot, m); // call events added by plugins
    console.log(tools.getTimestamp() + ' [Disconnected] ' + m);
}

exports['serverCreated'] = function (guild) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['serverCreated']).length; i++) events['serverCreated'][i](bot); // call events added by plugins'

    console.log(guild.name + ' (' + guild.id + ') - ' + guild.channels.length + ' channels');
    if (!fs.existsSync(config.serverDir + guild.id)) fs.mkdirSync(config.serverDir + guild.id); // create server directory
    try { // attempt to load server users
        users[guild.id] = require('.' + config.serverDir + guild.id + config.playerFile);
    } catch (error) { // create fresh server user file
        console.log(tools.getTimestamp() + ' Error loading users:\n' + error);
        users[guild.id] = {};
        module.exports.updateUsers(guild.id, users);
    }
}

exports['warn'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['warn']).length; i++) events['warn'][i](bot, m); // call events added by plugins
    console.log(tools.getTimestamp() + ' [Warning] ' + m);
}

exports['error'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['error']).length; i++) events['error'][i](bot, m); // call events added by plugins
    console.log(tools.getTimestamp() + ' [Error] ' + m);
}

exports['debug'] = function (m) {
    var bot = main.getBot();
    for (var i = 0; i < Object.keys(events['debug']).length; i++) events['debug'][i](bot, message); // call events added by plugins
    console.log(tools.getTimestamp() + ' [Debug] ' + m);
}