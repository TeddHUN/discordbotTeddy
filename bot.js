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
		
		channel
		
		channel.send("**Figyelem**, mostantól (2018.07.20) a játék és platform rang igénylések *automatikusan* zajlanak le!\n**Ahhoz**, hogy igényeld az egyik rangot dobj egy 👍🏻 jelet az adott rangra és megkapod!");
		channel.send("**Játék:**");
		let crew1 = channel.send("     **The Crew**");
		let crew2 = channel.send("     **The Crew 2**");
		
		channel.send("\n**Platform:**");
		
		crew1.react("👍🏻");
		crew2.react("👍🏻");
	
		let pc = channel.send("     **PC**");
		let xbox = channel.send("     **XBOX**");
		let ps = channel.send("     **PS**");
				
		pc.react("👍🏻");
		xbox.react("👍🏻");
		ps.react("👍🏻");
	}
});

client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.emoji.name === "👍🏻") {
    	console.log(reaction.emoji.users);
    }
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
