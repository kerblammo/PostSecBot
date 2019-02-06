# PostSecBot

PostSecBot is a Discord bot designed for post-secondary users. It is a bot built around permissions, and is flexible between using both a whitelist and blacklist. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.



### Prerequisites

What things you need to install the software and how to install them

* [Node JS](https://nodejs.org/en/download/)
* [Discord](https://discordapp.com/)

### Installing

To begin, you will need to clone your branch and download dependencies. If you already have Node installed, navigate to the src directory and run the commands:
```
npm install discord.io winston -save
npm install https://github.com/woor/discord.io/tarball/gateway_v6
```
After installing dependencies, you must make your Discord token available to the project. Create a file in the *src* directory called *auth.json* with the following contents:
```
{
    "token": "REDACTED"
}
```
 Replace the word "REDACTED" with your token. If you don't know what your Discord token is, [this site](https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/) has a great tutorial.

 While you're creating files, within the *src* directory create *users.json* with these contents:
 ```
{
    "users": []
}
 ```

 Once again inside *src* directory, you will need to update *owner.json* to include your username and id number. To get your id number, activate developer mode in discord (Settings > Appearance > Developer Mode) then right click on your profile and select 'Copy ID'. 

 Note that when making changes to your branch, you **never** want to copy your bot token or the contents of users.

 To run the bot, navigate to the open a shell in the *src* directory and run the command:
 ```
node app.js
 ```

## Running the tests

Coming soon!

## Deployment

It is recommended that your deployed bot is different than your development bot. Simply follow the steps in *Installing* with a new bot and target the server you would like to run it on.

You can keep the default settings for the bot in *src/commands.json* or you may modify them to your liking. By default, the **debug** command is enabled for all users so you may get your user ID and add it to the whitelists.

## Built With

* [Discord.io](https://www.npmjs.com/package/discord.io) and the [Woor Branch](https://github.com/woor/discord.io)
* [Winston](https://www.npmjs.com/package/winston)

## Contributing

Feel free to contribute through feature suggestions and tackling open issues. Your code should be readable and documented to be accepted.



## Authors

* **Peter Adam** - *Initial work* - [Kerblammo](https://github.com/kerblammo)

See also the list of [contributors](https://github.com/kerblammo/PostSecBot/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [Billie Thompson](https://github.com/PurpleBooth) for writing a [this](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2) fabulous ReadMe template
* [Phil Hornshaw](https://www.digitaltrends.com/users/phornshaw/) for his tutorial on digitaltrends.com that helped create my first bot
* Mom