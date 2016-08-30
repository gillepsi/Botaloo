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
    'stop',
    'setvolume'
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
        playUrl = function (bot, msg, url) {
            var stream = ytdl(url, { filter: 'audioonly', quality: 'highest' });

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

        if (!connection) {
            bot.sendMessage(msg.channel, 'Not in a voice channel :cry:');
            return;
        }

        if (arg === '') {
            if (connection.paused) connection.resume();
            return;
        }

        if (!arg.includes('youtube.com')) {
            var searchURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + encodeURI(arg) + '&key=' + ytAPIKey;
            request(searchURL, function (error, response) {
                var payload = JSON.parse(response.body);
                if (payload['items'].length == 0) {
                    bot.sendMessage(msg.channel, 'Didn\'t find anything :cry:');
                    return;
                }

                var videos = payload.items.filter(item => item.id.kind === 'youtube#video');
                if (videos.length === 0) {
                    bot.sendMessage(msg.channel, 'Didn\'t find any video :cry:');
                    return;
                }

                var video = videos[0];
                playUrl(bot, msg, 'https://youtube.com/watch?v=' + video.id.videoId);
            });
        } else {
            playUrl(bot, msg, arg);
        }
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

exports.setvolume = {
    description: 'set the volume of the current audio',
    usage: '<volume>',
    process: function (bot, msg, arg) {
        var connection = bot.voiceConnections.get('server', msg.server);
        if (!connection) {
            bot.sendMessage(msg.channel, 'Not in a voice channel :cry:');
            return;
        }
        connection.setVolume(arg);
    }
}