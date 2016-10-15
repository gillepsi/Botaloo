'use strict';
const request = require('request');
const fs = require('fs');

const tools = require('../app/tools.js');
const events = require('../app/events.js');
const config = require('../config.json');

exports['commands'] = [
    'bnet',
    'bnet sort'
]

exports['events'] = []

exports['flags'] = []

exports['bnet'] = {
    description: 'return the users overwatch rating',
    usage: '<name-id>',
    process: function (bot, msg, arg) {
        var user = msg.guild.members.find('id', msg.author.id);
        
        if (!user) return msg.channel.sendMessage('Could not find you in this guild :cry:');

        var username = arg;
        var url = 'https://api.lootbox.eu/pc/us/' + username + '/profile';
        request(url, function (error, response) {
            var result = JSON.parse(response.body);
            if (error) return msg.channel.sendMessage(error);
            if (result.error) return msg.channel.sendMessage(result.error);

            var rank = parseInt(result.data.competitive.rank);
            msg.channel.sendMessage('**' + username + '**: ' + rank + ' SR');
        });
    }
}

exports['bnet sort'] = {
    guild: '230667021593870336',
    description: 'sort a user into ranks based on overwatch rating',
    usage: '<name-id>',
    process: function (bot, msg, arg) {
        var user = msg.guild.members.find('id', msg.author.id);
        var users = events.getUsers();
        var role_list = ['230674791848345600', '230674870076309504', '230674963143589889', '230675011386474497', '230675068013903873'];

        if (!user) return msg.channel.sendMessage('Could not find you in this guild :cry:');
        //if (users[msg.guild.id][user.user.id].hasOwnProperty('bnet') && users[msg.guild.id][user.user.id]['bnet'] !== arg) return msg.channel.sendMessage('You have already set your Battle.net :confused:');

        var username = arg;
        var url = 'https://api.lootbox.eu/pc/us/' + username + '/profile';
        request(url, function (error, response) {
            var result = JSON.parse(response.body);
            if (result.error) return msg.channel.sendMessage(result.error);

            var rank = parseInt(result.data.competitive.rank);
            users[msg.guild.id][user.user.id]['bnet'] = username;
            events.updateUsers(msg.guild.id, users);

            var roles = [];
            if (rank >= 2500) roles.push('230674791848345600');
            if (rank >= 2500 && rank < 3000) roles.push('230674870076309504');
            if (rank >= 3000 && rank < 3500) roles.push('230674963143589889');
            if (rank >= 3500 && rank < 4000) roles.push('230675011386474497');
            if (rank >= 4000 && rank <= 5000) roles.push('230675068013903873');

            for (var i = 0; i < user.roles.array().length; i++) if (role_list.indexOf(user.roles.array()[i].id) === -1) roles.push(user.roles.array()[i].id);

            user.setRoles(roles);
            // user.setNickname(arg.replace('-', '#'));
            msg.channel.sendMessage('Done :ok_hand:');
        });
    }
}