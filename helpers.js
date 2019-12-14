const fs = require('fs');
const yaml = require('js-yaml');

// Convert id to database-friendly msg_id
exports.IdToMsgId = function(id) {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    // Find platform_id
    var i;
    var ret = null
    for (i = messages.numMessages - 1; i >= 0; i--) {
        if (messages.messages[i]["platform_id"]["fb_id"] == id || messages.messages[i]["platform_id"]["dc_id"] == id) {
            ret = messages.messages[i]["msg_id"];
            break;
        }
    }

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });

    return ret
}

// Converts msg_id to platform id requested, returns dictionary to unpack
exports.MsgIdToId = function(msg_id) {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    // Find platform_id
    var i;
    var ret = null
    for (i = messages.numMessages - 1; i >= 0; i--) {
        if (messages.messages[i]["msg_id"] == msg_id) {
            ret = messages.messages[i]["platform_id"];
            break;
        }
    }

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });

    return ret
}

// Convert message content to msg_id
exports.contentToMsgId = function(content) {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    // Find platform_id
    var i;
    var ret = null
    for (i = messages.numMessages - 1; i >= 0; i--) {
        if (content == messages.messages[i]["body"]) {
            ret = messages.messages[i]["msg_id"];
            break;
        }
    }

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });

    return ret
}

exports.setFacebookId = function(msg_id, fb_id) {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    // Reset
    var i;
    for (i = messages.numMessages - 1; i >= 0; i--) {
        if (messages.messages[i]["msg_id"] == msg_id) {
            messages.messages[i]["platform_id"]["fb_id"] = fb_id;
            break;
        }
    }

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });
}

exports.setDiscordId = function(msg_id, dc_id) {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    // Reset
    var i;
    for (i = messages.numMessages - 1; i >= 0; i--) {
        if (messages.messages[i]["msg_id"] == msg_id) {
            messages.messages[i]["platform_id"]["dc_id"] = dc_id;
            break;
        }
    }

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });
}

exports.writeMessage = function(body,  senderID, is_fb) {

    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));
    var msg_id = messages.numMessages;

    // Assign message attributes to dictionary
    var newMsg = {msg_id: msg_id,
       body: body,
       senderID: senderID,
       isFb: is_fb,
       platform_id: {
           fb_id: null,
           dc_id: null
       },
       reacts: null,
       replyTo: null};

    // Increment total number of messages stored
    messages.numMessages++;

    // Add new messsage
    messages.messages.push(newMsg);

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });

    return msg_id;
}

exports.setReply = function(msg_id, replied_id) {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    // Reset
    var i;
    for (i = messages.numMessages - 1; i >= 0; i--) {
        if (messages.messages[i]["msg_id"] == msg_id) {
            messages.messages[i]["replyTo"] = replied_id;
        }
    }

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });
}

exports.clearMessages = function() {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    // Reset message db to empty
    messages.messages = [];
    messages.numMessages = 0;

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });
}

exports.MsgToSender = function (msg_id) {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));

    var i;
    var ret = null;
    for (i = messages.numMessages - 1; i >= 0; i--) {
        if (messages.messages[i]["msg_id"] == msg_id) {
            ret = messages.messages[i]["senderID"];
            break;
        }
    }

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });

    return ret;
}
