var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var fs = require('fs');

var global = {
    "users": null,
    "commands": null,
    "messages": {
        "lackingPermissions": "ERROR: You do not have permission to use this command"
    }
};

//start the application
//display license
console.log('Copyright 2019 Peter Adam');
console.log('Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:');
console.log('The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.');
console.log('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.');


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

//actions to perform when bot is ready
bot.on('ready', function (evt) {


    //get all users who have sent messages
    global.users = JSON.parse(fs.readFileSync("users.json", "utf8"));

    //get all commands and associated permissions
    global.commands = JSON.parse(fs.readFileSync("commands.json"));

    //check if owner is on whitelists
    fs.readFile("owner.json", "utf8", function(err,data){
        if (err){
            logger.error(err);
        } else {
            var owner = JSON.parse(data);
            if (!owner.imported){
                //owner has not been imported yet
                addToPermissionList(global.commands.global, owner.profile, "white");
                
                //save new commands with updated whitelist
                fs.writeFile('commands.json', JSON.stringify(global.commands), function(err){
                    if (err){
                        logger.info(err);
                    } else { 
                        owner.imported = true;
                        
                        //overwrite owner file to prevent importing again at next launch
                        fs.writeFile('owner.json', JSON.stringify(owner), function(err){
                            if (err){
                                logger.info(err);
                            } else{ 
                                console.log('owner file updated');
                            }
                        })
                    }
                })
                logger.info("Server admin added to whitelists");
            }
        }
    })

    //log ready message
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//receive a command
bot.on('message', function (user, userID, channelID, message, evt) {

    //check if user has been collected yet
    if (!usersContains(userID)) {
        //collect new user
        usersAdd(user, userID);
    }
    //listen for commands that start with '!'
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        //commands accepted
        switch (cmd) {
            case 'debug':
                handleDebugCommand(args, user, userID, channelID, message);
                break;
            case 'vardump':
                handleVardumpCommand(args, user, userID, channelID);
                break;
        }
    }

});



/**
 * Check if users file currently contains a record for a user
 * Last update: 2019-02-03
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {string} userID The user's unique identifier
 * @returns {boolean} True if user is contained in user's file
 */
function usersContains(userID) {
    var found = false;
    for (var i = 0; i < global.users.users.length; i++) {
        if (global.users.users[i].userID === userID) {
            found = true;
            break;
        }
    }
    return found;
}

/**
 * Add a user to the record of all users who have sent a message read by the bot.
 * Updated both in memory and on disk.
 * Last updated: 2019-02-03
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {string} user The username of the user to add
 * @param {string} userID The user's unique identifier
 */
function usersAdd(user, userID) {
    var usr = {
        "user": user,
        "userID": userID
    }
    global.users.users.push(usr);
    //write to disk for persistence
    fs.writeFile("users.json", JSON.stringify(global.users), function (err) {
        if (err) {
            logger.error(err);
        } else {
            logger.info('New user added to configuration');
        }
    });
}

/**
 * Actions to perform when a user enters the debug command
 * Prints information about the user who sent the command
 * First checks for accepted arguments: full, user, userID, channel, or help
 * If no accepted arguments are found, instead sends a message suggesing the user use the help command
 * Last update: 2019-02-04
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {string[]} args The arguments given to the command
 * @param {string} user The command-giver's username
 * @param {string} userID The command-giver's unique ID number
 * @param {string} channelID The channel the command was received from
 * @param {string} message The full message body sent
 */
function handleDebugCommand(args, user, userID, channelID, message) {

    if (isCommandPermittedByUser(global.commands.global, userID, global.commands.debug.mode)
        && isCommandPermittedByUser(global.commands.debug, userID)) {
        var response = "__Printing debug information:__\n";
        var executed = false;
        var permissionDenied = false;
        if (args[1] === "full") {
            if (isCommandPermittedByUser(global.commands.debug.args[0], userID)){
                args = ['user', 'userID', 'channel'];
            } else {
                permissionDenied = true;
            }
            

        }

        if (args.includes('user')) {
            if (isCommandPermittedByUser(global.commands.debug.args[1], userID)){
                response += "**Username:** " + user + "\n";
                executed = true;
            } else {
                permissionDenied = true;
            }
            
        }

        if (args.includes('userID')) {
            if (isCommandPermittedByUser(global.commands.debug.args[2], userID)){
                response += "**User ID:** " + userID + "\n";
                executed = true;
            } else {
                permissionDenied = true;
            }
            
        }

        if (args.includes('channel')) {
            if (isCommandPermittedByUser(global.commands.debug.args[3], userID)){
                response += "**Channel:** " + channelID + "\n";
                executed = true;
            }
            
        }

        if (args.includes('help')
            || args.includes('info')
            || args.includes('?')) {
            //no recognized command found
            response = formatHelpMessage(global.commands.debug);
        } else if (permissionDenied){
            response = global.messages.lackingPermissions;
        } else if (!executed) {
            response = formatBadCommandMessage('debug');
        }
        logger.info(response);
        bot.sendMessage({
            to: channelID,
            message: response
        });
    }

}

/**
 * Actions to perform when a user enter the vardump command
 * Prints information about a variable the bot is holding in memory.
 * Accepted arguments include: users and help
 * If no accepted arguments are found, instead sends a message suggesting the user use the help command
 * Last Update: 2019-02-04
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {string[]} args Arguments supplied to the command
 * @param {string} user Name of user who sent command
 * @param {string} userID Identifier of user who sent command
 * @param {string} channelID Channel command was sent from
 */
function handleVardumpCommand(args, user, userID, channelID) {

    if (isCommandPermittedByUser(global.commands.global, userID, global.commands.vardump.mode)
        && isCommandPermittedByUser(global.commands.vardump, userID)) {

        //user is permitted to use command based on command and global white/blacklists
        var response;
        if (args[1] === "users") {
            if (isCommandPermittedByUser(global.commands.vardump.args[0], userID)) {
                //vardump of users
                response = "__Printing Users Vardump__\n";
                for (var i = 0; i < global.users.users.length; i++) {
                    response += "**Username:** " + global.users.users[i].user + "\n**UserID**: " + global.users.users[i].userID + "\n\n";

                }
            } else {
                //no permission for 'users' argument
                response = global.messages.lackingPermissions;
            }
        } else if (args.includes("help")
            || args.includes("info")
            || args.includes("?")) {
            response = formatHelpMessage(global.commands.vardump);
        } else {
            response = formatBadCommandMessage('vardump');
        }
        logger.info(response);
        bot.sendMessage({
            to: channelID,
            message: response
        });
    }

}

/**
 * Formats a command into a readable string. Uses discord markdown
 * Last updated: 2019-02-03
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {object} command The command to be formatted
 * @returns {string} A formatted help message
 */
function formatHelpMessage(command) {
    //name and description
    var output = "**" + command.name.toUpperCase() + "**\n";
    output += command.description + "\n";

    //argument descriptions
    if (command.args.length > 0) {
        output += "Arguments include:\n";
        for (var i = 0; i < command.args.length; i++) {
            var arg = command.args[i];
            output += "*" + arg.name + "* - " + arg.description + "\n";
        }
    }

    return output;

}

/**
 * Formats an error message for a command suggesting the user use the help argument
 * Last Updated: 2019-02-03
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {string} name The name of the command
 * @returns {string} Formatted error message 
 */
function formatBadCommandMessage(name) {
    return "Error: unrecognized command structure. Try `" + name + " help` for more information.";
}

/**
 * Check if a user is permitted to use a command
 * Last Update: 2019-02-04
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {Object} command The command to be evaluated, read from global.commands
 * @param {Object[]} command.whitelist Users on whitelist of command
 * @param {Object[]} command.blacklist Users on blacklist of command
 * @param {string} command.mode The command's default blacklist vs whitelist setting
 * @param {string} userID The identifier of the user to check for
 * @param {string} [mode] The list to check on, default to command.mode 
 * @returns {boolean} True if the user is permitted to use this command
 */
function isCommandPermittedByUser(command, userID, mode = command.mode) {
    var permitted = mode === "black" ? true : false;
    var list = permitted ? command.blacklist : command.whitelist;
    console.log("Command: " + command.name);
    console.log("Mode: " + mode);

    for (var i = 0; i < list.length; i++) {
        if (list[i].userID === userID) {
            permitted = !permitted;
            console.log("found in list");
            break;
        }
    }
    return permitted;
}

/**
 * Adds a user to a command's permission list. Adding a user to a list affects all children of that list as well
 * If the command is 'global' then permissions are updated for all commands
 * Last update: 2019-02-06
 * @author Peter Adam <padamckb@hotmail.com>
 * @param {Object} command The command to have permissions modified
 * @param {string} command.name The name of the command
 * @param {Object[]} command.whitelist The whitelist of this command
 * @param {Object[]} command.blacklist The blacklist of this command
 * @param {Object} user The user to add a record of
 * @param {string} user.user The user's name
 * @param {string} user.userID The user's unique identifier
 * @param {string} mode "white" for whitelist or "black" for blacklist
 */
function addToPermissionList(command, user, mode){
     
     
    if (command.name === "global"){
        if (mode==="white"){ 
            command.whitelist.push(user);
        } else {
            command.blacklist.push(user);
        }
        for (var cmd in global.commands){
            //add to every list
            if (cmd === "global"){
                console.log('global');
                continue;
            } 
            addToPermissionList(global.commands[cmd], user, mode);
        }
    } else {
        //add to list
        if (mode==="white"){
            command.whitelist.push(user);
        } else {
            command.blacklist.push(user);
        }
        if (typeof command.args !== "undefined"){
            for (var i = 0; i < command.args.length; i++){
                //add to child lists
                addToPermissionList(command.args[i], user, mode);
            }
        }
    }

}