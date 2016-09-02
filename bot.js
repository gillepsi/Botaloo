"use strict";
const Discord = require('discord.js');
const util = require('util');
const fs = require('fs');

const events = require('./utils/events.js');
const tools = require('./utils/tools.js');
const config = require('./config.json');
const auth = require('./auth.json');

try {
    const bot = new Discord.Client({forceFetchUsers: true});

    const discord_token = auth.discord_token;
    const log_file = fs.createWriteStream(config.logDir + tools.getTimestamp().replace(/:/g, '') + '.log', { flags: 'w' });
    const log_stdout = process.stdout;
    const log_stderr = process.stderr;

    // setup logging to the log directory
    console.log = function (d) {
        log_file.write(util.format(d) + '\r\n');
        log_stdout.write(util.format(d) + '\n');
    };

    exports.getBot = function () {
        return bot;
    }

    // create directories if they don't exist
    if (!fs.existsSync(config.fileDir)) fs.mkdirSync(config.fileDir);
    if (!fs.existsSync(config.logDir)) fs.mkdirSync(config.logdir);
    if (!fs.existsSync(config.serverDir)) fs.mkdirSync(config.serverDir);

    // load plugins
    fs.readdirSync(config.pluginDir).forEach(function (file) {
        var plugin = require(config.pluginDir + file);
        for (var i = 0; i < plugin.commands.length; i++) {
            var esc_c = tools.escape(plugin.commands[i]);
            events.addCommand(plugin.commands[i], plugin[esc_c]);
        }
        for (var i = 0; i < plugin.events.length; i++) events.addEvent(plugin.events[i], plugin[plugin.events[i]]);
        for (var i = 0; i < plugin.flags.length; i++) events.addFlag(plugin.flags[i], plugin[plugin.flags[i]]);
    });

    // event handlers
    bot.on('ready', events.ready);
    bot.on('disconnected', events.disconnected);
    //bot.on('warn', events.warn);
    bot.on('error', events.error);
    bot.on('debug', events.debug);
    bot.on('message', events.message);

    bot.loginWithToken(discord_token);
} catch (e) {
    console.log(e.stack.replace(/\s\s\s\s/g, '\r\n    '));
}