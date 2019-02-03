var Discord = require('discord.io');
var logger = require('winson');
var auth = require('./auth.json');
var fs = require('fs');

//start the application
console.log('Copyright <YEAR> <COPYRIGHT HOLDER>');
console.log('Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:');
console.log('The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.');
console.log('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.');

//logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level ='debug';

//initialize discord bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
//log message when bot is ready
bot.on('ready', function(evt){
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//receive a command
bot.on('message', function (user, userID, channelID, message, evt){
    //the bot has received a message. Log it for study
    var bulkMessage = {
        'user': user,
        'userID': userID,
        'channelID': channelID,
        'message': message
    };
    fs.writeFile('log.json', JSON.stringify(bulkMessage), function(err){
        if (err){
            console.log(err);
        }
        console.log('message received');
    });
})