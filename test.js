require("dotenv").config();

const login = require("facebook-chat-api");

login({email: process.env.FB_EMAIL, password: process.env.FB_PASS}, (err, api) => {
    if(err) return console.error(err);

    api.listenMqtt((err, message) => {
        console.log(message.threadID)
        api.sendMessage(message.body, message.threadID);
    });
});
