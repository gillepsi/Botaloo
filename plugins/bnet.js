'use strict';
const request = require('request');
const fs = require('fs');

const tools = require('../app/tools.js');
const events = require('../app/events.js');
const config = require('../config.json');

exports['commands'] = [
    'bnet',
    'user'
]

exports['events'] = []

exports['flags'] = []

exports['bnet'] = {
    server: '230667021593870336',
    description: 'placeholder',
    usage: '<name-id>',
    process: function (bot, msg, arg) {
        var url = 'https://api.lootbox.eu/pc/us/' + arg + '/profile';
        request(url, function (error, response) {
                var result = JSON.parse(response.body);
                if (result.error) return msg.channel.sendMessage(result.error);
                
                msg.channel.sendMessage('Retrieved profile for **'
                    + arg
                    + '**:\nLevel '
                    + result.data['level'] + '\nSR '
                    + result.data['competitive']['rank'] + '\n'
                    + result.data['competitive']['rank_img']);
                var rank = parseInt(result.data.competitive.rank);
                var users = events.getUsers();
                if (!users[msg.server.id][msg.author.id].hasOwnProperty(bnet)) users[msg.server.id][msg.author.id]['bnet'] = arg;
                events.setUsers(users);
                events.updateUsers(msg.server.id, users);

                //if (rank <= 2500)
                //if (rank > 2500 && rank <= 3000)
                //if (rank > 3000 && rank <= 3500)
                //if (rank > 3500 && rank <= 4000)
                //if (rank > 4000 && rank <= 4500)
                //if (rank > 4500 && rank <= 5000)
            });
    }
}

exports['user'] = {
    description: '',
    usage: '',
    process: function (bot, msg, arg) {
        console.log(msg.guild.members.get(msg.author.id));
    }
}