const Discord = require('discord.js');
const client = new Discord.Client();

var prefix = "~tb";

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('Fejlesztés alatt!', "https://twitch.tv/teddhun");
});

client.on('message', async message => {		
	if(message.author.bot) return;
	if(message.content.indexOf(prefix) !== 0) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	if(command === "help") {
		await message.channel.send("Még fejleszt engem a fejlesztőm, légy türelemmel! ;)");	
	}	
	
	if(command === "makerangget") {
		let guild = client.guilds.find("id", "464233102143651840");
		let channel = guild.channels.find("id", "469283523283517440");
		
		await channel.send("**Figyelem**, mostantól (2018.07.20) a játék és platform rang igénylések *automatikusan* zajlanak le!\n**Ahhoz**, hogy igényeld az egyik rangot írd be a `~tb rang` parancsot majd ezután 1 perced **van** reagálni, hogy melyiket is kéred!").then(sent => {
			message.delete(1);	
		});
	}
	
	if(command == "rang") {		
		let guild = client.guilds.find("id", "464233102143651840");
		let channel = guild.channels.find("id", "469283523283517440");
		
		if(message.channel === channel) {
			let uzenet = await channel.send(message.author + " Ahhoz, hogy megkapd az adott rangot válaszd ki a megfelelő Emojit!\n**Játék:**\n:one: The Crew\n:two: The Crew 2\n\n**Platform:**\n:three: PC\n:four: XBOX\n:five: PS").then(sent => {
				message.delete(1);
				
				await sent.react(":one:");
				
				sent.delete(10000);
			});				
		}
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
