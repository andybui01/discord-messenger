require("dotenv").config();

const fs = require('fs');
const yaml = require('js-yaml');
const login = require("facebook-chat-api");
const Discord = require("discord.js");
const discord = new Discord.Client();

const helpers = require('./helpers');

const discordChannelID = '652674650861731841'
const fbThreadID = '100005639376179'

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    // Save facebook id of messenger bot ...
    const bot_id = api.getCurrentUserID();

    // Discord channel object
    const dc_channel = discord.channels.get(discordChannelID);

    discord.once('ready', () => {
    	console.log('Discord bot ready!');
    });

    helpers.clearMessages();
    // Set messenger bot to listen to itself ...
    api.setOptions({
        selfListen: true,
        listenEvents: true
    });

    // Monitor events in facebook chat ...
    api.listenMqtt((err, event) => {
        console.log(event.type);
        switch(event.type){
            // If message was sent
            case "message":
                // Check to see if facebook message body is not empty ...
                if (event.body != undefined) {
                    // Check who message author is
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
                    } else {
                        var msg_id = helpers.contentToMsgId(event.body);
                        helpers.setFacebookId(msg_id, event.messageID);
                    }
                }
                break;
            // If a message reaction occurred
            case "message_reaction":
                if (event.reaction != undefined) {
                    if (event.userID != bot_id) {
                        var msg_id = helpers.IdToMsgId(event.messageID);
                        var dc_id = helpers.MsgIdToId(msg_id)["dc_id"];
                        dc_channel.fetchMessage(dc_id).then(
                            dc_message => {
                                dc_message.react(event.reaction);
                            }
                        );
                        break;
                    }
                } else {
                    console.log("Removing emoji");
                    console.log(event);
                }

        }
    });

    discord.on('message', message => {
        // Ignore messages from bot
        if (message.author.bot) return;

        var sent_msg = message.content;
        // Split message to detect commands
        var msg_array = message.content.split(" ");

        // If message is of type reply
        if (msg_array[0] == "/reply" && msg_array.length >= 2) {
            var replied_id = msg_array[1];

            // Grab the facebook id of message from database
            var replied_msg_id = helpers.IdToMsgId(replied_id);
            var fb_id = helpers.MsgIdToId(replied_msg_id)["fb_id"];
            // Join message without reply and id of message being replied to
            sent_msg = msg_array.slice(2).join(" ");

            // TODO: FIX CODE REPETITION
            var msg_id = helpers.writeMessage(sent_msg, message.author.id, false);
            helpers.setReply(msg_id, replied_msg_id);
        } else {
            var msg_id = helpers.writeMessage(sent_msg, message.author.id, false);
        }
        helpers.setDiscordId(msg_id, message.id);
        api.sendMessage(sent_msg, fbThreadID, fb_id);
    });

    // React
    discord.on('messageReactionAdd', (reaction, user) => {
        if (user.bot) return;

        var msg_id = helpers.IdToMsgId(reaction.message.id);
        var fb_id = helpers.MsgIdToId(msg_id)["fb_id"];
        api.setMessageReaction(reaction.emoji.name, fb_id);
    });

    // Unreact
    discord.on('messageReactionRemove', (reaction, user) => {
        if (user.bot) return;

        var msg_id = helpers.IdToMsgId(reaction.message.id);
        var fb_id = helpers.MsgIdToId(msg_id)["fb_id"];
        api.setMessageReaction("", fb_id);
    });
});


discord.login(process.env.TOKEN)
