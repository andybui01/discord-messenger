require("dotenv").config();

const fs = require('fs');
const yaml = require('js-yaml');
const login = require("facebook-chat-api");
const Discord = require("discord.js");
const discord = new Discord.Client();

const helpers = require('./helpers');
const reacts = yaml.safeLoad(fs.readFileSync('db/reacts.yaml','utf8'))

const discordChannelID = '652674650861731841'
const fbThreadID = '100005639376179'

login({email: process.env.FB_EMAIL, password: process.env.FB_PASS}, (err, api) => {
    if(err) return console.error(err);
    console.log(reacts.reacts[0].unicode)

    discord.once('ready', () => {
    	console.log('Discord bot ready!');
    });

    helpers.clearMessages();


    // Monitor events in facebook chat ...
    api.listenMqtt((err, event) => {
        console.log(event.type);
        switch(event.type){
            // If message was sent
            case "message":
                // Check to see if facebook message body is not empty ...
                if (event.body != undefined) {
                    helpers.writeMessage(event.body, null, event.senderID, true);
                    discord.channels.get(discordChannelID).send(event.body);
                }
                break;

            case "message_reply":
                // Check to see if facebook message body is not empty ...
                if (event.body != undefined) {
                    discord.channels.get(discordChannelID).send(event.body)
                }
                break;
            // If a message reaction occurred
            case "message_reaction":
                console.log("Someone reacted!");
                break;
        }
    });

    discord.on('message', message => {
        // Ignore messages from bot ...
        if (message.author.bot) return;
        helpers.writeMessage(message.content, null, message.author.id, false);
        api.sendMessage(message.content, fbThreadID);
    });
});


discord.login(process.env.TOKEN)
