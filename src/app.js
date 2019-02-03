var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var fs = require('fs');

//start the application
console.log('Copyright 2019 Peter Adam');
console.log('Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:');
console.log('The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.');
console.log('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.');
try {

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
 });
//log message when bot is ready
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//receive a command
bot.on('message', function (user, userID, channelID, message, evt){
    //listen for commands that start with '!'
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        switch(cmd){
            case 'debug':
                handleDebugCommand(args, user, userID, channelID, message);
        }
    }
});
} catch (error){
    console.error(error);
}

function handleDebugCommand(args, user, userID, channelID, message){
    var response = "__Printing debug information:__\n";
    var executed = false;
    if (args[1] === "full"){
        args = ['user', 'userID', 'channel'];
        
    }

    if (args.includes('user')){
        response += "**Username:** " + user + "\n";
        executed = true;
    }

    if (args.includes('userID')){
        response += "**User ID:** " + userID + "\n";
        executed = true;
    }

    if (args.includes('channel')){
        response += "**Channel:** " + channelID + "\n";
        executed = true;
    }

    if (args.includes('help') 
        || args.includes('info')
        || args.includes('?')){
        //no recognized command found
        response = ("**DEBUG**\nPrints information about the message received. Supply one or more arguments to specify the data you would like to see. Arguments include:\n"
        + "*user* - Prints the username of the messenger\n"
        + "*userID* - prints the identifying number of the messenger\n"
        + "*channel* - prints the identifying number of the channel the message was sent to\n"
        + "*full* - performs all above commands");
    } else if (!executed){
        response = ("Error: unrecognized command structure. Try `debug help` for more information.");
    }
    logger.info(response);
    bot.sendMessage({
        to: channelID,
        message: response
    });
}