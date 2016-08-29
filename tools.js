var fs = require('fs');

module.exports = {
    updateMuted: function () {
        fs.writeFile("../muted.json", JSON.stringify(mutedusers, null, 2), null);
    },

    sleep: function (milliseconds) { // unused
        var currentTime = new Date().getTime();

        while (currentTime + miliseconds >= new Date().getTime()) {
        }
    },

    arrayIndexOf: function (myArray, searchTerm) { // used in flags
        var index = 0;
        for (var i in myArray) {
            if (i === searchTerm) return index;
            index += 1;
        }
        return -1;
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

        return '[' + day + ':' + hour + ':' + min + ':' + sec + '] ';
    }
}