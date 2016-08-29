// setup
var Discord = require('discord.js');
var request = require('request');
var ytdl = require('ytdl-core');
var fs = require('fs');

// contains tokens and API Keys
var auth = require('./auth.json');

var bot = new Discord.Client();
var ytAPIKey = auth.youtube_api_key;
var discordToken = auth.discord_token; 

// unused
function sleep(miliseconds) {
    var currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}

// i forget why i have this here
function arrayIndexOf(myArray, searchTerm) {
    var index = 0;
    for (var i in myArray) {
        if (i === searchTerm) return index;
        index += 1;
    }
    return -1;
}

// command prefix
var prefix = 'botaloo ';

var flags = {
    'd': {
        description: 'deletes your command message'
    }
};

// commands
var commands = {
    'help': {
        description: 'lists all commands',
        process: function (msg, arg) {
            var response = 'Commands:```';
            for (var c in commands) {
                var desc = commands[c].description;
                var usage = commands[c].usage + ' ';

                if (usage === 'undefined ') usage = '';
                response += '\n' + c + ' ' + usage + '- ' + desc;
            }

            response += '```\n Flags:```';
            for (var flag in flags) {
                var desc = flags[flag].description;

                response += '\n-' + flag + ' - ' + desc;
            }
            response += '```';
            bot.sendMessage(msg.channel, response);
        }
    },

    'editme': {
        description: 'not working',
        process: function (msg, arg) {
            bot.updateMessage(msg, 'done!');
        }
    },

    'getbots': {
        description: 'lists all bots in your current channel',
        process: function (msg, arg) {
            var users = msg.channel.server.members.getAll('bot', true);
            var response = '';

            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                response += '\n' + user.username + ': \t\t' + user.id;
            }
            bot.sendMessage(msg.channel, response);
        }
    },

    'pm': {
        usage: '<username> <message>',
        description: 'private message a user',
        process: function (msg, arg) {
            var whitespace = arg.indexOf(' ');
            var target = '';
            target = arg.substring(0, whitespace);

            var pm = arg.substring(whitespace + 1);
            if (pm == '') pm = 'Hello!';

            if (target == '') {
                bot.sendMessage(msg.channel, 'Supply a username.');
                return;
            }

            var users = msg.channel.server.members.getAll('username', target);

            if (users.length == 1) {
                bot.sendMessage(users[0], pm);
            } else if (users.length > 1) {
                var response = 'multiple users found:';
                for (var i = 0; i < users.length; i++) {
                    var user = users[i];
                    response += '\nThe id of ' + user.username + ' is ' + user.id;
                }
                bot.sendMessage(msg.channel, response);
            } else {
                bot.sendMessage(msg.channel, 'No user ' + target + ' found!');
            }
        }
    },

    'say': {
        usage: '<message>',
        description: 'bot will repeat after you',
        process: function (msg, arg) {
            bot.sendMessage(msg.channel, arg);
        }
    },

    'servers': {
        description: 'lists servers bot is connected to',
        process: function (msg, arg) {
            bot.sendMessage(msg.channel, bot.servers);
        }
    },

    'joinvoice': {
        description: 'joins your voice channel',
        process: function (msg, arg) {
            bot.joinVoiceChannel(msg.author.voiceChannel);
        }
    },

    'leavevoice': {
        description: 'leaves current voice channel',
        process: function (msg, arg) {
            var connection = bot.voiceConnections.get('server', msg.server);
            if (connection != null) connection.destroy();
        }
    },

    'listvoice': {
        description: 'lists all current voice connections',
        process: function (msg, arg) {
            var response = '';
            var connections = bot.voiceConnections;

            for (var i = 0; i < connections.length; i++) {
                response += '' + connections[i].server.name;
            }
            bot.sendMessage(msg.channel, response);
        }
    },

    'add': {
        usage: '<video title>',
        description: 'add a youtube video to playlist',
        process: function (msg, arg) {
            var searchURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + encodeURI(arg) + '&key=' + ytAPIKey;
            request(searchURL, function (e, response) {
                var payload = JSON.parse(response.body);
                if (payload['items'].length == 0) {
                    bot.sendMessage(msg.channel, 'Didn\'t find anything :cry:!');
                    return;
                }

                var videos = payload.items.filter(item => item.id.kind === 'youtube#video');
                if (videos.length === 0) {
                    bot.sendMessage(msg.channel, 'Didn\'t find any video :cry:!');
                    return;
                }

                var video = videos[0];
                url = 'https://youtube.com/watch?v=' + video.id.videoId;

                ytdl(url, { filter: 'audioonly', quality: 'highest' }).pipe(fs.createWriteStream('./music/' + video.id.videoId + '.webm'));
            });
        }
    },

    'play': {
        description: 'start the playlist',
        process: function (msg, arg) {
            var connection = bot.voiceConnections.get('server', msg.server);
            connection.playFile('./music/' + arg, { volume: 2 });
        }
    },

    'listmusic': {
        description: 'lists all music available',
        process: function (msg, arg) {
            var dir = './music/';
            var response = '';

            fs.readdirSync(dir).forEach(function (file) {
                response += '\n' + file;
            });
            bot.sendMessage(msg.channel, response);
        }
    },

    'modpuffin': {
        description: 'hehexd',
        process: function (msg, arg) {
            var slypher = msg.channel.server.members.getAll('username', 'Slypher');
            var puffin = msg.channel.server.members.getAll('username', 'PuffinMuffins');
            if (!puffin[0]) console.log('\n\n\n\problem!');
            console.log();
            bot.addMemberToRole(puffin, msg.server.rolesOfUser(slypher[0])[0]);
        }
    },
}

// message event handler
bot.on('message', function (message) {
    if (message.content.substring(0, prefix.length).toLowerCase() === prefix) {
        var flagBools = [];
        for (flag in flags) {
            flagBools.push(false);
        }
        var cmd = message.content.substring(prefix.length);
        console.log('treating ' + cmd + ' from ' + message.author + ' as command');

        if (cmd === '') {
            bot.sendMessage(message.channel, 'That\'s me!');
            commands[0].process(message);
        }

        // check flags
        for (var flag in flags) {
            var flagpos = cmd.indexOf('-' + flag);
            if (flagpos != -1) {
                flagBools[arrayIndexOf(flags, flag)] = true;
                cmd = cmd.substring(0, flagpos - 1) + cmd.substring(flagpos + 2, cmd.length);
            }
        }

        // check commands
        for (var c in commands) {
            if (cmd.substring(0, c.length).toLowerCase() === c) commands[c].process(message, cmd.substring(c.length + 1, cmd.length));
        }

        // execute flags - probably a bad implementation need to rewrite
        if (flagBools[0]) message.delete();
    }
});

// bot start event handler
bot.on('ready', function () {
    console.log('Ready to begin! Serving in ' + bot.channels.length + ' channels and ' + bot.servers.length + ' servers');
    //require('./plugins.js').init();
});

// bot disconnected event handler
bot.on('disconnected', function () {
    console.log('Disconnected!');
    process.exit(1); //exit node.js with an error
});

bot.loginWithToken(discordToken);