const fs = require('fs');
const yaml = require('js-yaml');

exports.writeMessage = function(body, reacts, senderID, is_fb) {
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));
    // Assign message attributes to dictionary
    var newMsg = {id: messages.numMessages,
       body: body,
       reacts: reacts,
       senderID: senderID,
       is_fb: is_fb};

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

    return;
}

exports.clearMessages = function() {
    // Read messages file into js object
    let messages = yaml.load(fs.readFileSync('db/messages.yaml', 'utf8'));
    console.log(messages);
    // Reset message db to empty
    messages.messages = [];
    messages.numMessages = 0;

    // Write to file
    fs.writeFileSync('db/messages.yaml', yaml.dump(messages), (err) => {
        if (err) {
            console.log(err);
        }
    });
    console.log(messages);
}
