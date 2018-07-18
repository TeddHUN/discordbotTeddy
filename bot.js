const Discord = require('discord.js');
const client = new Discord.Client();
const request = require("request");

var prefix = "~tb";


client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('~tb help', "https://twitch.tv/teddhun");
});


const commands = {
	'help': (msg) => {
	 	msg.channel.send("Még fejleszt engem a fejlesztőm, légy türelemmel! ;)\n");	
	}
};

client.on('message', msg => {	
   	if(msg.author.bot) return;
	if (!msg.content.startsWith(prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(prefix.length).split(' ')[0]](msg);
	
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
