const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require("ytdl-core");

var prefix = "-tb";
var zeneMost = "null";

function play(connection, message) {
	var server = servers[message.guild.id];
	
	server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
	
	zeneMost = server.queue;
	server.queue.shift();
	
	server.dispatcher.on("end", function() {
		if(server.queue[0]) play(connection, message);
		else connection.disconnect();
	});
}

var servers = {};

let initialMessage = `@everyone A rangok igénylése **automatikusan** működik így ha szeretnél egy rangot akkor csak reagálj rá! ;)`;
const roles = ["The Crew", "The Crew 2", "PC", "XBOX", "PS"];
const reactions = ["🆕", "🆕", "🆕", "🆕", "🆕"];

function generateMessages(){
    var messages = [];
    messages.push(initialMessage);
    for (let role of roles) messages.push(`**${role}**`);
    return messages;
}

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('-tb help | -tb liga', "https://twitch.tv/teddhun");
});

client.on('message', message => {	
	if(message.author.bot) return;
	if(message.content.indexOf(prefix) !== 0) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args[0];
		
	if(command === "help") {
		const embed = new Discord.RichEmbed()
		.setTitle("Segítség kell?! Itt megtalálod!")
		.setColor(0xFFFFFF)
		.setFooter("Fejlesztőm: TeddHUN", "https://support.discordapp.com/system/photos/3600/6196/6312/profile_image_116298876231_678183.jpg")
		.setTimestamp()
		
		.addField(prefix + " liga", "Lista az aktuális ligákról.")
		.addField(prefix + " play [url]", "Zene lejátszás Youtube-ról.")
		.addField(prefix + " skip", "Aktuális zene továbbléptetése.")
		.addField(prefix + " queue", "Lista az aktuális zenei várólistáról.")
		.addField(prefix + " stop", "Megtudod állítani a zenét.");
  		
		message.channel.send({embed});		
	}	

	if(command === "liga") {
		message.channel.send(message.author + ", **Akutális ligák:**\n\nThe Crew 2 Liga #1 - http://www.thecrew2liga.teddhun.ml/ - https://discord.gg/YVnBaKv - https://goo.gl/forms/1scwYF9o7mWW1wUr1\nRocket League Liga #1 - http://rocketleagueliga.teddhun.ml/ - https://discord.gg/QjU7KdD - https://goo.gl/forms/lwxwKLnZyqgX7AFJ3\nPUBG Liga #1 - *Hamarosan*");
	}

	if(command === "makerangget") {
		if(message.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "464233102143651840");
			let channel = guild.channels.find("id", "470963699796934656");

			message.delete(1);

			var toSend = generateMessages();
			let mappedArray = [[toSend[0], false], ...toSend.slice(1).map( (message, idx) => [message, reactions[idx]])];
			for (let mapObj of mappedArray){
			    channel.send(mapObj[0]).then( sent => {
				if (mapObj[1]){
				  sent.react(mapObj[1]);  
				} 
			    });
			}
		}
	}	

	if(command === "play") {
		if(!args[1]) {
			message.channel.send(message.author + ", Elsőnek adj meg egy linket!");
			return;
		}

		if(!message.member.voiceChannel) {
			message.channel.send(message.author + ", Nem tudok oda menni hozzád!");
			return;
		}
		
		if(!ytdl.validateURL(args[1])) {
			message.channel.send(message.author + ", Ez a link nem érvényes!");
			return;
		}

		if(!servers[message.guild.id]) servers[message.guild.id] = {
			queue: []
		};

		var server = servers[message.guild.id];

		server.queue.push(args[1]);
	
		if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
			play(connection, message);
		});
		
		let info = ytdl.getInfo(args[1]);
		
		message.channel.send("Most játszom: ${info.title}");
	}

	if(command === "skip") {
		var server = servers[message.guild.id];

		if(server.dispatcher) server.dispatcher.end();
	}

	if(command === "stop") {
		var server = servers[message.guild.id];

		if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();		
	}

	if(command === "queue") {
		var server = servers[message.guild.id];
		
		message.channel.send(message.author + ", Most: 
	}

	if(command === "addstream") {
		if(message.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "352591575639130112");
			let channel = guild.channels.find("id", "384300207933882370");		

			message.channel.send(message.author + ", Menetrend kiküldve!").then(sent => {
				message.delete(1);
				sent.delete(5000);

				var idoszak = "2018.07.23 - 2018.07.26";
				var streamek = 3; //Streamek száma
				//Visszafele kell megadni az adatokat
				streamNev = [ 
					"»PUBG« | Csirke szag, gránát robbanás... | #57 🐻",
					"»PUBG« | Winner winner chickön dínner! | #56 🐻",
					"»TC2« | Versengés New York-tól Los Angeles-ig! 🚗 | #11 🐻"
				];

				 streamDatum= [ 
					"júl. 26., csütörtök 17:30 – 19:30",
					"júl. 24., kedd 17:30 – 19:30",
					"júl. 23., hétfő 17:30 – 19:30"
				];

				streamKep = [ 
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/2c3d16de-a808-431c-b109-e4359d283093-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/3eb9c1ca-76cd-44c9-b518-bf40ebc38561-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/1d24b925-c968-40dd-9c58-a39875e9ad5c-350x150"
				];

				streamJatek = [ 
					"PLAYERUNKNOWN'S BATTLEGROUNDS",
					"PLAYERUNKNOWN'S BATTLEGROUNDS",
					"The Crew 2"
				];

				if(streamek > 1) {
					channel.send("@everyone :new: Streamek a láthatáron!\n**Időszak:** " + idoszak);	
				} else {
					channel.send("@everyone :new: Új stream a láthatáron!\n**Időszak:** " + idoszak);
				}				

				for (i = 0; i < streamek ; i++) { 
				    const embed = new Discord.RichEmbed()
					.setColor(0x6441A4)
					.setTitle(streamNev[i])
					.setDescription("**Kezdés:** " + streamDatum[i] + "\n**Játék:** " + streamJatek[i] + "\n**Közvetítés helyszíne:** https://twitch.tv/teddhun" + "\n" + ":heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign: :heavy_minus_sign:")
					.setImage(streamKep[i]);

				    channel.send({embed});
				}
			});
		}
	}
	
	
	if(command === "twitch") {
		if(message.guild.id == 471294084732944406) {
			message.channel.send(message.author + ", Gyere és nézz fel ide is: https://twitch.tv/teddhun");	
		}
	}
	
	if(command === "youtube") {
		if(message.guild.id == 471294084732944406) {		
			message.channel.send(message.author + ", https://www.youtube.com/channel/UC2Lbgg1O-Qv9Bq-VV1g6SVw");	
		}
	}	
});

client.on('raw', event => {
    if (event.t === 'MESSAGE_REACTION_ADD' || event.t == "MESSAGE_REACTION_REMOVE"){
        
        let channel = client.channels.get(event.d.channel_id);
        let message = channel.fetchMessage(event.d.message_id).then(msg=> {
        let user = msg.guild.members.get(event.d.user_id);
        
        if (msg.author.id == client.user.id && msg.content != initialMessage){
       
            var re = `\\*\\*"(.+)?(?="\\*\\*)`;
	    if(msg.content === "**The Crew**") {
		var role = "The Crew"    
	    } else if(msg.content === "**The Crew 2**") {
		var role = "The Crew 2"    
	    } else if(msg.content === "**PC**") {
		var role = "PC"    
	    } else if(msg.content === "**XBOX**") {
		var role = "XBOX"    
	    } else if(msg.content === "**PS**") {
		var role = "PS"    
	    }
        
            if (user != client.user.id){
                var roleObj = msg.guild.roles.find('name', role);
                var memberObj = msg.guild.members.get(user.id);
                
                if (event.t === "MESSAGE_REACTION_ADD"){
                    memberObj.addRole(roleObj);
                } else {
                    memberObj.removeRole(roleObj);
                }
            }
        }
        })
 
    }   
});
// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
