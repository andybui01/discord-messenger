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

    // Save facebook id of messenger bot ...
    const bot_id = api.getCurrentUserID();

    // Discord channel object
    const dc_channel = discord.channels.get(discordChannelID);


    console.log(bot_id)

    discord.once('ready', () => {
    	console.log('Discord bot ready!');
    });

    helpers.clearMessages();
    // Set messenger bot to listen to itself ...
    api.setOptions({selfListen: true});


    // Monitor events in facebook chat ...
    api.listenMqtt((err, event) => {
        console.log(event.type);
        switch(event.type){

            // If message was sent
            case "message":
                // Check to see if facebook message body is not empty ...
                if (event.body != undefined) {
                    // Check who message author is
                    console.log(event.senderID);
                    console.log(bot_id);
                    if (event.senderID != bot_id) {
                        // Write message to database
                        var msg_id = helpers.writeMessage(event.body, event.senderID, true);
                        // Log messenger id of message received
                        helpers.setFacebookId(msg_id, event.messageID);
                        // Send message in discord and log id of message sent
                        dc_channel.send(event.body)
                        .then(
                            sent => {
                                helpers.setDiscordId(msg_id, sent.id);
                            }
                        );
                    } else {
                        var msg_id = helpers.contentToMsgId(event.body);
                        helpers.setFacebookId(msg_id, event.messageID);
                    }

                }
                break;

            case "message_reply":
                // Check to see if facebook message body is not empty ...
                if (event.body != undefined) {
                    if (event.senderID != bot_id) {
                        // Log message received in database
                        var msg_id = helpers.writeMessage(event.body, event.senderID, true);
                        // Id of message being replied to
                        var replied_id = helpers.IdToMsgId(event.messageReply.messageID);

                        helpers.setReply(msg_id, replied_id);
                        // Log messenger id of message received
                        helpers.setFacebookId(msg_id, event.messageID);



                        dc_channel.fetchMessage(helpers.MsgIdToId(replied_id)["dc_id"])
                        .then(
                            replied => {
                                const replyEmbed = new Discord.RichEmbed()
                                    .setDescription("**[```"+event.messageReply.body+"```]("+replied.url+")**")
                                    .addField("\u200B", event.body);
                                replyEmbed.setURL(replied.url);
                                dc_channel.send(replyEmbed)
                                .then(
                                    sent => {
                                        helpers.setDiscordId(msg_id, sent.id);
                                    }
                                );
                            }
                        );
                        // Send message in discord and log id of message sent


                    } else {
                        console.log(event.body);
                        var msg_id = helpers.contentToMsgId(event.body);
                        console.log(msg_id);
                        console.log(event.messageID);
                        helpers.setFacebookId(msg_id, event.messageID);
                    }

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

        // Write message to database
        var msg_id = helpers.writeMessage(message.content, message.author.id, false);
        helpers.setDiscordId(msg_id, message.id);
        api.sendMessage(message.content, fbThreadID);
    });
});


discord.login(process.env.TOKEN)
