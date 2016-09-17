# Botaloo
Another chat bot for Discord using [discord.js] (https://github.com/hydrabolt/discord.js/)

## Features

### Commands

#### Chat
- `version` Returns git commit the bot is running
- `pm <username> <message>` Private message a username
- `eval <command>` Execute specified javascript and output result
- `join-server <invite>` Doesn't work :disappointed:

#### Voice
- `join` Join your current voice channel
- `leave` Bot will leave current voice channel
- `play <url/title>` Play audio from the provided source
- `volume <number>` Change current audio volume
- `pause` Pause playing audio
- `resume` Resume playing audio
- `stop` Stop playing audio entirely

#### Moderation
- `mute <username>` Delete any messages from the specified username
- `disable <username>` Disallow a user from using this bot
- `clear <number>` Clear the specified number of messages from current channel

#### Levels - work in progress  
- `exp` Returns your current experience

### Command flags
- `-d` Deletes the message containing your commands
- `-m` Deletes any following response from the bot

## How to use
1. `git clone https://github.com/slypher/botaloo.git`
2. Create auth.json with the following format:

        {
            "youtube_api_key": "INSERT_HERE",
            "discord_token": "INSERT_HERE"
        }
3. `npm install`
4. `node bot.js`

## Helpful links
[Node.js] (http://nodejs.org/)  
[Troubleshooting] (http://discordjs.readthedocs.io/en/latest/troubleshooting.html)