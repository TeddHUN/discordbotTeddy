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
		
		await channel.send("**Figyelem**, mostantól (2018.07.20) a játék és platform rang igénylések *automatikusan* zajlanak le!\n**Ahhoz**, hogy igényeld az egyik rangot írd be a `~tb rang` parancsot majd ezután 1 perced **van** reagálni, hogy melyiket is kéred!").then(sent => {
			message.delete(1);	
		});
	}
	
	if(command === "rang") {		
		let guild = client.guilds.find("id", "464233102143651840");
		let channel = guild.channels.find("id", "469283523283517440");
		
		if(message.channel === channel) {
			let uzenet = channel.send(message.author + " Ahhoz, hogy megkapd az adott rangot válaszd ki a megfelelő Emojit!\n**Játék:**\n:one: The Crew\n:two: The Crew 2\n\n**Platform:**\n:three: PC\n:four: XBOX\n:five: PS").then(sent => {
				message.delete(1);
				
				sent.react(":one:");
				
				sent.delete(10000);
			});				
		}
	}
	
	if(command === "addstream") {
		if(message.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "352591575639130112");
			let channel = guild.channels.find("id", "384300207933882370");		
			
			message.reply(message.author + ", Menetrend kiküldve!").then(sent => {
				message.delete(1);
				sent.delete(5000);
				
				var idoszak = "2018.07.16 - 2018.07.19";
				var streamek = 2; //Streamek száma
				//Visszafele kell megadni az adatokat
				streamNev = [ 
					"»TC2« | Drag, Drift, Race, Amerika. Mi kell ide még?! 🚗 | #10 🐻",
					"»PUBG« | Ismét szeretem ezt a játékot!44! | #55 🐻"
				];
				
				 streamDatum= [ 
					"júl. 21., szombat 17:00 – 19:00",
					"júl. 20., péntek 17:00 – 19:00"
				];
				
				streamKep = [ 
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/af9c77c7-fcd3-4d4f-b92f-2ac711c85644-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/b46a9d4a-3172-47e5-a906-1e64f1efaefb-350x150"
				];
				
				streamJatek = [ 
					"The Crew 2",
					"PLAYERUNKNOWN'S BATTLEGROUNDS"
				];
				
				if(streamek > 1) {
					channel.send("@everyone :new: Streamek a láthatáron!\n**Időszak:** " + idoszak);	
				} else {
					channel.send("@everyone :new: Új stream a láthatáron!\n**Időszak:** " + idoszak);
				}				
								
				for (i = 0; i < streamek ; i++) { 
				    const embed = new Discord.RichEmbed()
				    	.setColor(0x6441A4)
				    	.setTitle(streamNev[i]))
					.setDescription("**Kezdés:** " + streamDatum[i] + "\n**Játék:** " + streamJatek[i] + "\n**Közvetítés helyszíne:** https://twitch.tv/teddhun" + "\n" + ":heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign:")
					.setImage(streamKep[i]);
				    
				    channel.send({embed});
				}
			});
		}
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);

/*const embed = new Discord.RichEmbed()
  .setTitle("This is your title, it can hold 256 characters")
  .setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png")
  /*
   * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
   
  .setColor(0x00AE86)
  .setDescription("This is the main body of text, it can hold 2048 characters.")
  .setFooter("This is the footer text, it can hold 2048 characters", "http://i.imgur.com/w1vhFSR.png")
  .setImage("http://i.imgur.com/yVpymuV.png")
  .setThumbnail("http://i.imgur.com/p2qNFag.png")
  /*
   * Takes a Date object, defaults to current date.
   
  .setTimestamp()
  .setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
  .addField("This is a field title, it can hold 256 characters",
    "This is a field value, it can hold 2048 characters.")
  /*
   * Inline fields may not display as inline if the thumbnail and/or image is too big.
   
  .addField("Inline Field", "They can also be inline.", true)
  /*
   * Blank field, useful to create some space.
   
  .addBlankField(true)
  .addField("Inline Field 3", "You can have a maximum of 25 fields.", true);

  message.channel.send({embed});*/
