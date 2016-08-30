var request = require('request');
var fs = require('fs');
var ytdl = require('ytdl-core');

var config = require('../config.json');
var ytAPIKey = require('../auth.json').youtube_api_key;

exports.commands = [
    'join',
    'leave',
    'play',
    'pause',
    'resume',
    'stop'
]

exports.join = {
    description: 'joins your voice channel',
    process: function (bot, msg, arg) {
        bot.joinVoiceChannel(msg.author.voiceChannel, function (error, connection) {
            if (error) bot.sendMessage(msg.channel, 'Error joining voice channel :cry:');
        });
    }
}

exports.leave = {
    description: 'leaves current voice channel',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (connection != null) connection.destroy();
    }
}

exports.play = {
    description: 'play a video',
    usage: '<url>',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) {
            bot.sendMessage(msg.channel, 'Not in a voice channel :cry:');
            return;
        }

        var stream = ytdl(arg, { filter: 'audioonly', quality: 'highest' });

        connection.playRawStream(stream, function (intent) {
            if (connection.playing) bot.sendMessage(msg.channel, 'Now playing :ok_hand:');
            intent.on('end', function () {
                bot.sendMessage(msg.channel, 'Finished playing :ok_hand:');
            });

            intent.on('error', function () {
                bot.sendMessage(msg.channel, 'Error during playback :cry:');
            });
        });
    }
}

exports.pause = {
    description: 'pause playing audio',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) {
            bot.sendMessage(msg.channel, 'Not in a voice channel :cry:');
            return;
        }
        if (connection.playing) connection.pause();
    }
}

exports.resume = {
    description: 'resume playing audio',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) {
            bot.sendMessage(msg.channel, 'Not in a voice channel :cry:');
            return;
        }
        if (connection.paused) connection.resume();
    }
}

exports.stop = {
    description: 'stop playing audio',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) {
            bot.sendMessage(msg.channel, 'Not in a voice channel :cry:');
            return;
        }
        if (connection.playing || connection.paused) connection.stopPlaying();
    }
}