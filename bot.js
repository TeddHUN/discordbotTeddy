const Discord = require('discord.js');
const client = new Discord.Client();

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
	if(message.author.bot) return;
	if(message.content.indexOf(config.prefix) !== 0) return;
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	if(command === "help") {
		
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
