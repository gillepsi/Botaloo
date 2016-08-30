var Discord = require('discord.js');
var util = require('util');
var fs = require('fs');

var events = require('./events.js');
var tools = require('./tools.js');
var config = require('./config.json');
var auth = require ('./auth.json');

var bot = new Discord.Client();

var discord_token = auth.discord_token;
var log_file = fs.createWriteStream(config.logDir + tools.getTimestamp().replace(/:/g, '') + '.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) {
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
    plugin = require(config.pluginDir + file);
    for (var i = 0; i < plugin.commands.length; i++) {
        events.addCommand(plugin.commands[i], plugin[plugin.commands[i]]);
    }
});

// event handlers
bot.on('ready', events.ready);
bot.on('disconnected', events.disconnected);
bot.on('warn', events.warn);
bot.on('error', events.error);
bot.on('debug', events.debug);
bot.on('message', events.message);

bot.loginWithToken(discord_token);