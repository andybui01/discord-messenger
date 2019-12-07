require("dotenv").config();

const login = require("facebook-chat-api");
const Discord = require("discord.js");

const discord = new Discord.Client();


login({email: process.env.FB_EMAIL, password: process.env.FB_PASS}, (err, api) => {
    if(err) return console.error(err);

    discord.once('ready', () => {
    	console.log('Discord bot ready!');
    });

    api.listenMqtt((err, message) => {
        // Check to see if facebook message body is not empty ...
        if (message.body != undefined) {
            discord.channels.get('652674650861731841').send(message.body)
        }
    });

    discord.on('message', message => {
        // Ignore messages from bot ...
        if (message.author.bot) return;
        api.sendMessage(message.content, '100005639376179');
    });
});


// discord.once('ready', () => {
//     	console.log('Ready!');
//     });
//
// discord.on('message', message => {
//     // Ignore messages from bot ...
//     if (message.author.bot) return;
//     console.log(message.channel.id)
// 	message.channel.send('Pong.');
// });

discord.login(process.env.TOKEN)
