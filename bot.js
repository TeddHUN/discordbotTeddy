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
		
		channel.send("**Figyelem**, mostantól (2018.07.20) a játék és platform rang igénylések *automatikusan* zajlanak le!\n**Ahhoz**, hogy igényeld az egyik rangot írd be a `~tb rang` parancsot majd ezután 1 perced **van** reagálni, hogy melyiket is kéred!");
	}
	
	if(command == "rang") {		
		let guild = client.guilds.find("id", "464233102143651840");
		let channel = guild.channels.find("id", "469283523283517440");
		
		if(channel === "tesztrang") {
			var uzenet = message.author + " Ahhoz, hogy megkapd az adott rangot válaszd ki a megfelelő Emojit!\n**Játék:**\n:one: The Crew\n:two: The Crew 2\n\n**Platform:**:three: PC\n:four: XBOX\n:five: PS");
			
			channel.send(uzenet).then(sent => {
			    sent.react(":one:");
			    sent.react(":two:");
			    sent.react(":three:");
			    sent.react(":four:");
			    sent.react(":five:");
			});			
		}
	}
});

client.on('messageReactionAdd', (reaction, user) => {
    console.log(reaction);
	
	/*if(reaction.emoji.name === "👍") {
        //console.log(reaction.users);
	let channel = reaction.message.channel;
	
	if(channel === "tesztrang") {
		reaction.remove(user);
		
		const usermessage = user + " rangodat megkaptad! ;)";
		
		channel.send(usermessage).then(sent => {
			sent.delete(10000);
		});
		
		if(reaction.message === "The Crew") {
			channel.send("The Crew");
		}
	}
    }*/
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
