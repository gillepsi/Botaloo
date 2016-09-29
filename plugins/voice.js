'use strict';
const request = require('request');
const fs = require('fs');
const ytdl = require('ytdl-core');

const tools = require('../app/tools.js');
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
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        
        var voiceChannel = tools.getAuthorVoiceChannel(msg);
        if (voiceChannel) voiceChannel.join();
        else return msg.channel.sendMessage('You are not in a voice channel :confused:');
    }
}

exports['leave'] = {
    description: 'leaves current voice channel',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var connection = bot.voiceConnections.get(msg.guild.id);
        if (connection != null) connection.channel.leave();
        else return msg.channel.sendMessage('Not in a voice channel :confused:');
    }
}

exports['play'] = {
    description: 'play a youtube video',
    usage: '<url/title>',
    process: function (bot, msg, arg) {
        var playStream = function (bot, msg, stream) {
            connection.playStream(stream, function (intent) {
                if (connection.playing) msg.channel.sendMessage('Now playing :ok_hand:');
                intent.on('end', function () {
                    msg.channel.sendMessage('Finished playing :ok_hand:');
                });

                intent.on('error', function () {
                    msg.channel.sendMessage('Error during playback :cry:');
                });
            });
        }

        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var connection = bot.voiceConnections.get(msg.guild.id);

        if (!connection) return msg.channel.sendMessage('Not in a voice channel :confused:');

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
                if (payload['items'].length == 0) return msg.channel.sendMessage('Didn\'t find anything :cry:');

                var videos = payload.items.filter(item => item.id.kind === 'youtube#video');
                if (videos.length === 0) return msg.channel.sendMessage('Didn\'t find any video :cry:');

                var video = videos[0];
                var stream = ytdl('https://youtube.com/watch?v=' + video.id.videoId, { filter: 'audioonly', quality: 'highest' });
                msg.channel.sendMessage('https://youtube.com/watch?v=' + video.id.videoId);
                playStream(bot, msg, stream);
            });
        }
    }
}

exports['volume'] = {
    description: 'set the volume',
    usage: '<number>',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');

        var connection = bot.voiceConnections.get(msg.guild.id);
        if (!connection) return msg.channel.sendMessage('Not in a voice channel :confused:');

        if (arg) {
            if (connection.player.dispatcher) connection.player.dispatcher.setVolume(arg);
            else return msg.channel.sendMessage('Nothing to set the volume of :confused:');
        } else {
            msg.channel.sendMessage('Provide a volume percent in decimal :confused:');
        }
    }
}

exports['pause'] = {
    description: 'pause playing audio',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        
        var connection = bot.voiceConnections.get(msg.guild.id);
        if (!connection) return msg.channel.sendMessage('Not in a voice channel :confused:');
        if (connection.player.dispatcher) connection.player.dispatcher.pause();
        else return msg.channel.sendMessage('Nothing to pause :confused:');
    }
}

exports['resume'] = {
    description: 'resume playing audio',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        
        var connection = bot.voiceConnections.get(msg.guild.id);
        if (!connection) return msg.channel.sendMessage('Not in a voice channel :confused:');
        if (connection.player.dispatcher) connection.player.dispatcher.resume();
        else return msg.channel.sendMessage('Nothing to resume :confused:');
    }
}

exports['stop'] = {
    description: 'stop playing audio',
    process: function (bot, msg, arg) {
        if (!msg.guild) return msg.channel.sendMessage('Nope! :poop:');
        
        var connection = bot.voiceConnections.get(msg.guild.id);
        if (!connection) return msg.channel.sendMessage('Not in a voice channel :confused:');
        if (connection.player.dispatcher) connection.player.dispatcher.end();
        else return msg.channel.sendMessage('Nothing to stop :confused:');
    }
}