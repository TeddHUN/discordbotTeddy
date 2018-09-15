const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require("ytdl-core");

var prefix = "-tb";

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

let initialMessage2 = `**Szertnél** egy játék rangot?!\nNyugodtan kattints arra amelyikkel játszol, automatikusan megkapod!`;
const roles2 = ["PUBG", "Rainbow Six Siege", "Warframe", "The Crew 2", "Deceit", "Dead by Daylight", "Rocket League"];
const reactions2 = ["🆕", "🆕", "🆕", "🆕", "🆕", "🆕", "🆕"];

function generateMessages2(){
    var messages = [];
    messages.push(initialMessage2);
    for (let role of roles2) messages.push(`**${role}**`);
    return messages;
}

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('-tb help', "https://twitch.tv/teddhun");
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
		message.channel.send(message.author + ", **Akutális ligák:**\n\nTeddy CUP: The Crew 2 #2 - http://www.thecrew2liga.teddhun.ml/ - Jelentkezés hamarosan indul!\nRocket League Liga #1 - http://rocketleagueliga.teddhun.ml/ - https://discord.gg/QjU7KdD - https://goo.gl/forms/lwxwKLnZyqgX7AFJ3");
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

	if(command === "makerangget2") {
		if(message.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "352591575639130112");
			let channel = guild.channels.find("id", "479913233277255731");

			message.delete(1);

			var toSend = generateMessages2();
			let mappedArray = [[toSend[0], false], ...toSend.slice(1).map( (message, idx) => [message, reactions2[idx]])];
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
		if(!args[1]) return message.channel.send(message.author + ", Elsőnek adj meg egy linket!");
		if(!message.member.voiceChannel) return message.channel.send(message.author + ", Nem tudok oda menni hozzád!");
		if(!ytdl.validateURL(args[1])) return message.channel.send(message.author + ", Ez a link nem érvényes!");

		let info = ytdl.getInfo(args[1]);
		
		if(!servers[message.guild.id]) servers[message.guild.id] = {
			videoTitle: info.title,
			requester: message.author,
			queue: []
		};

		var server = servers[message.guild.id];

		server.queue.push(args[1]);
	
		if(message.guild.voiceConnection) message.channel.send(message.author + `, ${server.videoTitle} hozzáadva a lejátszási listához! | Kérte: ${server.requester}`);
		else {
			message.member.voiceChannel.join().then(function(connection) {
				play(connection, message);
				message.channel.send(`Most játszom: ${server.videoTitle} | Kérte: ${server.requester}`);
			});
		}		
	}

	if(command === "skip") {
		var server = servers[message.guild.id];

		if(server.dispatcher) server.dispatcher.end();
	}

	if(command === "stop") {
		var server = servers[message.guild.id];

		if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();		
	}
	
	if(command === "addstream") {
		if(message.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "352591575639130112");
			let channel = guild.channels.find("id", "384300207933882370");	

			message.channel.send(message.author + ", Menetrend kiküldve!").then(sent => {
				message.delete(1);
				sent.delete(5000);

				var idoszak = "2018.09.17 - 2018.09.23";
				var streamek = 3; //Streamek száma
				//Visszafele kell megadni az adatokat
				streamNev = [
					"Már csak pár nap és Gator Rush!!!! 🚗 »TC2« | #18 🐻",
					"Reménytelen futkározás... »PUBG« | #82 🐻",
					"Csirke vadászat! »PUBG« | #81 🐻"
				];

				 streamDatum= [
					"szept. 22., szombat 14:30 – 16:30",
					"szept. 21., péntek 17:30 – 20:00",
					"szept. 19., szerda 17:30 – 19:30"
				];

				streamKep = [ 
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/cef42974-3aa5-432a-bc4e-89d0f013e9eb-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/ea925b4f-54c9-4183-b03d-9d23529b2d47-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/95eecaaf-caf9-48bf-b2e9-3de473798ab5-350x150"
				];

				streamJatek = [ 
					"The Crew 2",
					"PLAYERUNKNOWN'S BATTLEGROUNDS",
					"PLAYERUNKNOWN'S BATTLEGROUNDS"
				];

				if(streamek > 1) {
					channel.send("@everyone :new: Streamek a láthatáron!\n**Időszak:** " + idoszak);	
					//channel.send("@everyone :new: Streamek a láthatáron!\n**Időszak:** " + idoszak + "\n :exclamation: Nem végleges!");	
				} else {
					channel.send("@everyone :new: Új stream a láthatáron!\n**Időszak:** " + idoszak);
					//channel.send("@everyone :exclamation: Változás!\nÚj esemény!");
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
	
	if(command === "makemod") {
		if(!args[1]) return;
		let str = args[1];
		let id = str.replace(/[<@!>]/g, '');

		message.delete(1);
			
		client.fetchUser(id).then(user => {
			user.send({embed: {
					"description": "Kedves nézőm!\n\n**Esélyes** vagy egy moderátori posztra a [csatornámon](https://twitch.tv/teddhun)!\n\nHa érdekel az ajánlat akkor kérlek a következő kérdésekre esetleg kérésekre írd meg nekem a választ, amire legkésőbb 24 órán belül kapsz választ a medvezértől. 😉",
					  "url": "https://twitch.tv/teddhun",
					  "color": 12143959,
					  "footer": {
					"icon_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/9b58dffb-19db-4cc6-9b86-bc834e97ccf4-profile_image-70x70.jpg",
					"text": "Teddy"
				  },
				  "author": {
					"name": "TeddHUN üzenete",
					"url": "https://twitch.tv/teddhun",
					"icon_url": "https://yt3.ggpht.com/-VEDxUzQYjTo/AAAAAAAAAAI/AAAAAAAAAAA/69pOacOO5mk/nd/photo.jpg"
				  },
				  "fields": [
					{
					  "name": "Kérdés 1",
					  "value": "Mi a feladata egy moderátornak?"
					},
					{
					  "name": "Kérdés 2",
					  "value": "Mit tennél ha valaki elkezd szídni valakit a chatről?"
					},
					{
					  "name": "Kérdés 3",
					  "value": "Szerinted kellene-e változtatnom valamin?"
					},
					{
					  "name": "Kérdés 4",
					  "value": "Mely játékokból szereted nézni az élőadásaimat?"
					},
					{
					  "name": "Kérés 1",
					  "value": "Ha van észrevételed amit szerinted rosszúl csinálok, akkor írd meg azt!"
					}
				  ]
				}		
			});
		});
	}
	
	if(command === "makemod2") {
		if(!args[1]) return;
		let str = args[1];
		let id = str.replace(/[<@!>]/g, '');

		message.delete(1);

		client.fetchUser(id).then(user => {
			user.send({embed: {
					"description": "**Gratulálok, válaszaid meggyőzték a medvezért így átveheted a rangodat, ha szeretnéd!**\n\n Írj egy *köszönöm*-öt ahhoz, hogy megkapd.\n\n`Üdv a csapatban!` 😍 ",
					"url": "https://discordapp.com",
					"color": 8311585,
					"footer": {
					  "icon_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/9b58dffb-19db-4cc6-9b86-bc834e97ccf4-profile_image-70x70.jpg",
					  "text": "Teddy"
					},
					"image": {
					  "url": "https://media.tenor.com/images/85df88979b539ebc13d488454b232f6b/tenor.gif"
					},
					"author": {
					  "name": "TeddHUN üzenete",
					  "url": "https://twitch.tv/teddhun",
					  "icon_url": "https://static-cdn.jtvnw.net/jtv_user_pictures/7d72dde0f450abc2-profile_image-300x300.jpeg"
					}	
				}
			});
		});
	}
});

client.on("message", (message) => {
	if (message.channel.type === "dm") {
		if(message.author.username == "Teddy") return; 
		client.users.get("312631597222592522").send(message.author + " üzenete: " + message.content);
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
	    } else if(msg.content === "**PUBG**") {
		var role = "PUBG"    
	    } else if(msg.content === "**Warframe**") {
		var role = "Warframe"    
	    } else if(msg.content === "**Rainbow Six Siege**") {
		var role = "Rainbow Six Siege"    
	    } else if(msg.content === "**Deceit**") {
		var role = "Deceit"    
	    } else if(msg.content === "**Dead by Daylight**") {
		var role = "Dead by Daylight"    
	    } else if(msg.content === "**Rocket League**") {
		var role = "Rocket League"    
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
