var request = require('superagent');
var fs = require('fs');
var ytdl = require('ytdl-core');

var config = require('../config.json');
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

            ytdl(url, { filter: 'audioonly', quality: 'highest' }).pipe(fs.createWriteStream(config.fileDir + video.id.videoId + '.webm'));
        });
    }
}

exports.list = {
    description: 'lists all music available',
    process: function (bot, msg, arg) {
        var dir = config.fileDir;
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

        /*connection.playRawStream(request(arg), function (intent) {
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
        });*/
        console.log('[' + arg + ']');
        //var connection = bot.internal.voiceConnection;
			// ...get the request module which will be used to load the URL...
			var request = require("request");
			// ...get the stream from the URL...
			var stream = request(arg);
			// ...and play it back
			connection.playRawStream(stream).then(intent => {
				// If the playback has started successfully, reply with a "playing"
				// message...
				bot.reply(msg, "playing!").then((message) => {
					// and add an event handler that tells the user when the song has
					// finished
					intent.on("end", () => {
						// Edit the "playing" message to say that the song has finished
						bot.updateMessage(message, "that song has finished now.");
					});
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