const Discord = require('discord.js');
const client = new Discord.Client();

var prefix = "~tb";

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('Fejlesztés alatt!', "https://twitch.tv/teddhun");
});

client.on('message', message => {		
	if(message.author.bot) return;
	if(message.content.indexOf(prefix) !== 0) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	if(command === "help") {
		message.channel.send("Még fejleszt engem a fejlesztőm, légy türelemmel! ;)");	
	}	
	
	if(command === "makerangget") {
		let guild = client.guilds.find("id", "464233102143651840");
		let channel = guild.channels.find("id", "469283523283517440");
		
		channel.send("**Figyelem**, mostantól (2018.07.20) a játék és platform rang igénylések *automatikusan* zajlanak le!\n**Ahhoz**, hogy igényeld az egyik rangot dobj egy 👍🏻 jelet az adott rangra és megkapod!");
		channel.send("**Játék:**");
		channel.send("     **The Crew**").then(sent => {
		    sent.react("👍");
		});
		channel.send("     **The Crew 2**").then(sent => {
		    sent.react("👍");
		});
		
		channel.send("\n**Platform:**");

		let pc = channel.send("     **PC**").then(sent => {
		    sent.react("👍");
		});
		let xbox = channel.send("     **XBOX**").then(sent => {
		    sent.react("👍");
		});
		let ps = channel.send("     **PS**").then(sent => {
		    sent.react("👍");
		});
				
		
	}
});

client.on('messageReactionAdd', (reaction, user) => {   
	reaction.emoji.remove(user);
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
