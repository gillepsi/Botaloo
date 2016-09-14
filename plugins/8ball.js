'use strict';

exports['commands'] = []

exports['flags'] = []

exports['events'] = []

exports['8ball'] = {
    usage: '',
    description: '',
    process: function (bot, msg, arg) {
        bot.sendMessage(msg.channel, 'it works');
    }
}
