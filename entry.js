'use strict';
const child_process = require('child_process');
const util = require('util');

console.log = function (d) { process.stdout.write(util.format(d)); }; // remove newline from end of console.log

start();
function start() { // this function ensures that the bot restarts after an error
    var proc = child_process.spawn('node', ['./app/bot.js']);

    proc.stdout.on('data', function (data) { console.log(data.toString()); });
    proc.stderr.on('data', function (data) { console.log(data.toString()); });

    proc.on('exit', function (code) { // child process has exited
        console.log('Process exited: ' + code + '\n');
        delete(this.proc);
        if (code === 2) process.exit(code); // code 2 is exit
        else setTimeout(start, 5000); // any other code restarts
    });
}