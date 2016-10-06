'use strict';
const Discord = require('discord.js');
const util = require('util');
const fs = require('fs');

const tools = require('./tools.js');
const config = require('../config.json');
const auth = require('../auth.json');

// create directories if they don't exist
if (!fs.existsSync('.' + config.logDir)) fs.mkdirSync(config.logdir);
if (!fs.existsSync('.' + config.serverDir)) fs.mkdirSync(config.serverDir);

// setup logging to the log directory
const log_file = fs.createWriteStream('.' + config.logDir + tools.getTimestamp().replace(/:/g, '') + '.log', { flags: 'w' });

console.log = function (d) {
    log_file.write(util.format(d) + '\r\n');
    process.stdout.write(util.format(d) + '\n');
};

try {
    const events = require('./events.js');

    const bot = new Discord.Client({ forceFetchUsers: true });
    exports['getBot'] = function () { return bot; }

    // load plugins
    fs.readdirSync(config.pluginDir).forEach(function (file) {
        var plugin = require('.' + config.pluginDir + file);
        if (plugin.commands) for (var i = 0; i < plugin.commands.length; i++) events.addCommand(plugin.commands[i], plugin[plugin.commands[i]]);
        if (plugin.events) for (var i = 0; i < plugin.events.length; i++) events.addEvent(plugin.events[i], plugin[plugin.events[i]]);
        if (plugin.flags) for (var i = 0; i < plugin.flags.length; i++) events.addFlag(plugin.flags[i], plugin[plugin.flags[i]]);
    });

    // event handlers
    for (var event in events.eventList) if (events[events.eventList[event]]) bot.on(events.eventList[event], events[events.eventList[event]]);

    bot.login(auth.discord_token);
} catch (e) {
    console.log(e.stack.replace(/\s\s\s\s/g, '\r\n    '));
}