'use strict';
const request = require('request');
const fs = require('fs');
const ytdl = require('ytdl-core');

const config = require('../config.json');
const ytAPIKey = require('../auth.json').youtube_api_key;

exports['commands'] = [
    'join',
    'leave',
    'play',
    'volume',
    'pause',
    'resume',
    'stop'
]

exports['events'] = []

exports['flags'] = []

exports['join'] = {
    description: 'joins your voice channel',
    process: function (bot, msg, arg) {
        bot.joinVoiceChannel(msg.author.voiceChannel, function (error, connection) {
            if (error) bot.sendMessage(msg.channel, 'Error joining voice channel :cry:');
        });
    }
}

exports['leave'] = {
    description: 'leaves current voice channel',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (connection != null) connection.destroy();
    }
}

exports['play'] = {
    description: 'play a youtube video',
    usage: '<url/title>',
    process: function (bot, msg, arg) {
        var playStream = function (bot, msg, stream) {
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

        var connection = bot.voiceConnections.get('server', msg.server);

        if (!connection) return bot.sendMessage(msg.channel, 'Not in a voice channel :confused:');

        if (arg === '') if (connection.paused) return connection.resume();
        if (connection.playing) return bot.sendMessage(msg.channel, 'Already playing :confused:');

        if (arg.substring(0, 7).toLowerCase() === 'http://' || arg.substring(0, 8).toLowerCase() === 'https://') {
            var stream;
            if (arg.includes('youtube.com') || arg.includes('youtu.be')) {
                stream = ytdl(arg, { filter: 'audioonly', quality: 'highest' });
            } else {
                stream = request.get(arg);
            }
            playStream(bot, msg, stream, arg);
        } else {
            var searchURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + encodeURI(arg) + '&key=' + ytAPIKey;
            request(searchURL, function (error, response) {
                var payload = JSON.parse(response.body);
                if (payload['items'].length == 0) return bot.sendMessage(msg.channel, 'Didn\'t find anything :cry:');

                var videos = payload.items.filter(item => item.id.kind === 'youtube#video');
                if (videos.length === 0) return bot.sendMessage(msg.channel, 'Didn\'t find any video :cry:');

                var video = videos[0];
                var stream = ytdl('https://youtube.com/watch?v=' + video.id.videoId, { filter: 'audioonly', quality: 'highest' });
                bot.sendMessage(msg.channel, 'https://youtube.com/watch?v=' + video.id.videoId);
                playStream(bot, msg, stream);
            });
        }
    }
}

exports['volume'] = {
    description: 'set the volume',
    usage: '<number>',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) return bot.sendMessage(msg.channel, 'Not in a voice channel :confused:');

        if (arg) connection.setVolume(arg);
    }
}

exports['pause'] = {
    description: 'pause playing audio',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) return bot.sendMessage(msg.channel, 'Not in a voice channel :confused:');
        if (connection.playing) connection.pause();
    }
}

exports['resume'] = {
    description: 'resume playing audio',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) return bot.sendMessage(msg.channel, 'Not in a voice channel :confused:');
        if (connection.paused) connection.resume();
    }
}

exports['stop'] = {
    description: 'stop playing audio',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) return bot.sendMessage(msg.channel, 'Not in a voice channel :confused:');
        if (connection.playing || connection.paused) connection.stopPlaying();
    }
}