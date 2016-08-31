"use strict";

const config = require('./config');

module.exports = { // used to escape bad characters in a command
    sleep: function (ms) {
        return new Promise((resolve) => setTimeout(resolve, time));
    },

    regex_quote: function (str) {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    },

    escape: function (c) {
        var esc_c = c;
        var chars = config.chars.split(' ');
        for (var i = 0; i < chars.length; i++) {
            var re = RegExp(module.exports.regex_quote(chars[i]), 'g');
            if (esc_c.includes(chars[i])) esc_c = esc_c.replace(re, '');
        }

        return esc_c;
    },

    getTimestamp: function () { // used for timestamp in console / log
        var date = new Date();

        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        return '[' + day + ':' + hour + ':' + min + ':' + sec + ']';
    }
}