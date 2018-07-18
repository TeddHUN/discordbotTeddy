const Discord = require('discord.js');
const client = new Discord.Client();
var prefix = "~tb";

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('~tb help', "https://twitch.tv/teddhun");
});

client.on('message', message => {
    if(message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    if(command === "help") {
        message.channel.send("Még fejleszt engem a fejlesztőm, légy türelemmel! ;)\n```🐻 Teddhun beszéldéje >> TeddHUN```");
    }
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
