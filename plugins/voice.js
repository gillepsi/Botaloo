var request = require('request');
var ytdl = require('ytdl-core');

var ytAPIKey = require('../auth.json').youtube_api_key;

exports.commands = [
    'join',
    'leave',
    'dl',
    'list',
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

exports.dl = {
    usage: '<video title>',
    description: 'add a youtube video to playlist',
    process: function (bot, msg, arg) {
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
            url = 'https://youtube.com/watch?v=' + video.id.videoId;

            ytdl(url, { filter: 'audioonly', quality: 'highest' }).pipe(fs.createWriteStream('./music/' + video.id.videoId + '.webm'));
        });
    }
}

exports.list = {
    description: 'lists all music available',
    process: function (bot, msg, arg) {
        var dir = fileDir;
        var response = '';

        fs.readdirSync(dir).forEach(function (file) {
            response += '\n' + file;
        });
        bot.sendMessage(msg.channel, response);
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

        connection.playRawStream(request(arg), function (intent) {
            if (connection.playing) bot.sendMessage(msg.channel, 'Now playing :ok_hand:');
            intent.on('end', function () {
                bot.sendMessage(msg.channel, 'Finished playing :ok_hand:');
            });

            intent.on('error', function () {
                bot.sendMessage(msg.channel, 'Error during playback :cry:');
            })

            intent.on('time', function (time) {
                bot.sendMessage(msg.channel, '20ms checkpoint - ' + time + 'ms total');
            })
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
        connection.pause();

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
        connection.resume();
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
        connection.stopPlaying();
    }
}