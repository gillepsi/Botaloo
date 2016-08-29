var Discord = require('discord.js');
var fs = require('fs');

var events = require('./events.js');
var tools = require('./tools.js');
var bot = new Discord.Client();

exports.getBot = function () {
    return bot;
}

// contains tokens and API Keys
var auth = require('./auth.json');
var ytAPIKey = auth.youtube_api_key;
var discordToken = auth.discord_token;

const logDir = './logs/';
const fileDir = './files/';
const pluginDir = './plugins/';

// create files directory if it does not exist
if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir);

// create logs directory if it does not exist
if (!fs.existsSync(logDir)) fs.mkdirSync(logdir);

// load plugins
fs.readdirSync(pluginDir).forEach(function (file) {
    plugin = require(pluginDir + file);
    for (var i = 0; i < plugin.commands.length; i++) {
        events.addCommand(plugin.commands[i], plugin[plugin.commands[i]]);
    }
});

// event handlers
bot.on('message', events.message);
bot.on('ready', events.ready);
bot.on('disconnected', events.disconnected);
bot.on('warn', events.warn);
bot.on('error', events.error);

bot.loginWithToken(discordToken);