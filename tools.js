module.exports = {
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