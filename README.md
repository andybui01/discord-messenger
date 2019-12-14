# discord-messenger
Bot used to send discord/messenger cross-platform messages.
## Requirements
- NodeJS
- Discord developer account (and an Oauth2 token)
- Facebook account

## Dependencies
```
npm install
```
Running this command will download the necessary dependencies (found in package.json) from the npm repos.

## Setup
Navigate to the Bots section of your discord developer portal and copy your access token.

![image](https://user-images.githubusercontent.com/22631610/70366837-989e0f80-18ee-11ea-8234-f4ced43222c0.png)

After this you're ready to go! Use your favourite text editor to modify the .env file with your facebook credentials as well as the access token you copied down in the first step.

## Start the bot
```
FB_EMAIL=YOUREMAIL FB_PASS=YOURPASSWORD TOKEN=YOURACCESSTOKEN node index.js
```
## Start the bot (alternative)
You can also create a .env file and add these lines
```
FB_EMAIL=YOUREMAIL
FB_PASS=YOURPASSWORD
TOKEN=YOURACCESSTOKEN
```
then run
```
node index.js
```
