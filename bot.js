const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');

var prefix = "--";

const youtube = new YouTube("AIzaSyBKR_t85ukmSb6C7Bm-ZMmH6nrfi9j9hJ4");
const queue = new Map();

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
    client.user.setGame('Folyamatos fejlesztés alatt...', "https://twitch.tv/teddhun");
});

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(prefix)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(prefix.length);

	if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send(msg.author + " , Nem tudok csatlakozni a csatornádhoz mert nincs jogom a csatlakozáshoz!");
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send(msg.author +  ", Nem tudok zenét lejátszani a csatornádon mert nincs jogom hozzá!");
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id);
				await handleVideo(video2, url, voiceChannel, true);
			}
			return msg.channel.send(`✅ Zene hozzáadva a lejátszási listához: **${playlist.title}**`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.send(msg.author + `, Több találatot találtam!\n
__**Válasz az alábbiak közül:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
A válaszodat 1-10 -es számozással várom válaszban.
					`);
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('Nem érkezett válasz ezért nem történik lejátszás.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 Nem tudok lejátszani az alábbi listából. Írj a fejlesztőmnek! (TeddHUN)');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send(msg.author + ', Nem vagy hangcsatornában!');
		if (!serverQueue) return msg.channel.send('A semmit nem tudom átugroni!');
		serverQueue.connection.dispatcher.end('Atugorva!');
		return undefined;
	} else if (command === 'stop') {
		if (!msg.member.voiceChannel) return msg.channel.send(msg.author + ', Nem vagy hangcsatornában!');
		if (!serverQueue) return msg.channel.send('A semmit nem tudom megállítani!');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Leallitva!');
		return undefined;
	} else if (command === 'volume') {
		if (!msg.member.voiceChannel) return msg.channel.send(msg.author + ', Nem vagy hangcsatornában!');
		if (!serverQueue) return msg.channel.send('Jelenleg nem játszom semmit.');
		if (!args[1]) return msg.channel.send(`Jelenlegi hangerő: **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return msg.channel.send(`I set the volume to: **${args[1]}**`);
	} else if (command === 'np') {
		if (!serverQueue) return msg.channel.send('Jelenleg nem játszom semmit.');
		return msg.channel.send(`🎶 Jelenleg megy: **${serverQueue.songs[0].title}**`);
	} else if (command === 'queue') {
		if (!serverQueue) return msg.channel.send('Nincs itt semmi.');
		let index = 0;
		return msg.channel.send(`
__**Várakozó zenék:**__
${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}
**Now playing:** ${serverQueue.songs[0].title}
		`);
	} else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('⏸ A zene megállítva!');
		}
		return msg.channel.send('Jelenleg nem játszom semmit.');
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('▶ A zene folytatva!');
		}
		return msg.channel.send('Jelenleg nem játszom semmit.');
	}

	//New version commands
	if(command === "szerverek") {
		let szoveg = "**A következő szervereken vagyok elérhető:** \n\n";
		client.guilds.forEach(guild => {
			szoveg += "Szerver neve: **" + guild.name + "**\n";	
		});
		
		msg.channel.send(msg.author + " " + szoveg);
	}
		
	if(command === "help") {
		const embed = new Discord.RichEmbed()
		.setTitle("Segítség kell?! Itt megtalálod!")
		.setColor(0xFFFFFF)
		.setFooter("Fejlesztőm: TeddHUN", "https://support.discordapp.com/system/photos/3600/6196/6312/profile_image_116298876231_678183.jpg")
		.setTimestamp()
		
		.addField(prefix + "liga", "Lista az aktuális ligákról.")
		.addField(prefix + "play [url]", "Zene lejátszás Youtube-ról.")
		.addField(prefix + "skip", "Aktuális zene továbbléptetése.")
		.addField(prefix + "queue", "Lista az aktuális zenei várólistáról.")
		.addField(prefix + "stop", "Megtudod állítani a zenét.");
  		
		msg.channel.send({embed});		
	}	

	if(command === "liga") {
		msg.channel.send(msg.author + ", **Akutális ligák:**\n\nTeddy CUP: The Crew 2 #2 - http://www.thecrew2liga.teddhun.ml/ - Jelentkezés hamarosan indul!\nRocket League Liga #1 - http://rocketleagueliga.teddhun.ml/ - https://discord.gg/QjU7KdD - https://goo.gl/forms/lwxwKLnZyqgX7AFJ3");
	}

	if(command === "makerangget") {
		if(msg.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "464233102143651840");
			let channel = guild.channels.find("id", "470963699796934656");

			msg.delete(1);

			var toSend = generateMessages();
			let mappedArray = [[toSend[0], false], ...toSend.slice(1).map( (msg, idx) => [msg, reactions[idx]])];
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
		if(msg.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "352591575639130112");
			let channel = guild.channels.find("id", "479913233277255731");

			msg.delete(1);

			var toSend = generateMessages2();
			let mappedArray = [[toSend[0], false], ...toSend.slice(1).map( (msg, idx) => [msg, reactions2[idx]])];
			for (let mapObj of mappedArray){
			    channel.send(mapObj[0]).then( sent => {
				if (mapObj[1]){
				  sent.react(mapObj[1]);  
				} 
			    });
			}
		}
	}

	if(command === "addstream") {
		if(msg.author.id == 312631597222592522) {	
			let guild = client.guilds.find("id", "352591575639130112");
			let channel = guild.channels.find("id", "384300207933882370");	

			msg.channel.send(msg.author + ", Menetrend kiküldve!").then(sent => {
				msg.delete(1);
				sent.delete(5000);

				var idoszak = "2018.11.05 - 2018.11.11";
				var streamek = 4; //Streamek száma
				//Visszafele kell megadni az adatokat
				streamNev = [
					"Sötétben való borzongás🔪 »DBD« | #10 🐻",
					"Versenyek ACE módra való húzása... 🚗 »TC2« | #23 🐻",
					"Dara, dara hátán! »R6S« | #22 🐻",
					"Hétfői öldöklés! »PUBG« | #95 🐻"
				];

				 streamDatum= [
					"nov. 9., péntek 20:00 – 22:00",
					"nov. 7., szerda 17:30 – 18:30",
					"nov. 6., kedd 17:30 – 19:30",
					"nov. 5., hétfő 17:30 – 19:30"
				];

				streamKep = [ 
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/459525a6-6270-4392-80bc-cdb8ad294945-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/ca31d1ef-04ca-44a4-9f0b-a623816094e6-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/ec8eb0a4-e735-4e35-86c6-9401566e2a6f-350x150",
					"https://static-cdn.jtvnw.net/twitch-event-images-v2/94cc9583-3123-4527-b2e1-51f21f42455c-350x150"
				];

				streamJatek = [
					"Dead by Daylight",
					"The Crew 2",
					"Tom Clancy's Rainbow Six: Siege",
					"PLAYERUNKNOWN'S BATTLEGROUNDS"
				];

				if(streamek > 1) {
					channel.send("@everyone :new: Streamek a láthatáron!\n**Időszak:** " + idoszak);	
					//channel.send("@everyone :new: Streamek a láthatáron!\n**Időszak:** " + idoszak + "\n :exclamation: Hétvége még változhat!");	
				} else {
					//channel.send("@everyone :new: Új stream a láthatáron!\n**Időszak:** " + idoszak);
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
		if(msg.guild.id == 471294084732944406) {
			msg.channel.send(msg.author + ", Gyere és nézz fel ide is: https://twitch.tv/teddhun");	
		}
	}
	
	if(command === "youtube") {
		if(msg.guild.id == 471294084732944406) {		
			msg.channel.send(msg.author + ", https://www.youtube.com/channel/UC2Lbgg1O-Qv9Bq-VV1g6SVw");	
		}
	}	
	
	if(command === "makemod") {
		if(!args[1]) return;
		let str = args[1];
		let id = str.replace(/[<@!>]/g, '');

		msg.delete(1);
			
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

		msg.delete(1);

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
	
	if(command == "frissit") {
		if(msg.guild.id == 326001549711114241) {
			let guild = client.guilds.find("id", "326001549711114241");// zozi dcje
			let membercount = "Tagok: " + guild.members.size;
			let usercount = "Emberek: " + guild.members.filter(member => !member.user.bot).size;
			let botcount = "Botok: " + guild.members.filter(member => member.user.bot).size;
			const membercountch = guild.channels.find("id", "510797260389482496");	
			let usercountch = guild.channels.find("id", "510797263593799690");	
			let botcountch = guild.channels.find("id", "510797264260694018");	
			membercountch.setName(membercount);
			usercountch.setName(usercount);
			botcountch.setName(botcount);
			msg.channel.sendMessage(message.author + " Átírva!").then(sent => {
				msg.delete(1);
				sent.delete(5000);
			});
		}
	}
	
	return undefined;
});


client.on("guildMemberAdd", (member) => {
  	const guild = member.guild;
	serverStats(guild);
});

client.on('guildMemberRemove', (member) => {
  	const guild = member.guild;
	serverStats(guild);
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

function serverStats(guild) {
	let membercount = "Tagok: " + guild.members.size;
	let usercount = "Emberek: " + guild.members.filter(member => !member.user.bot).size;
	let botcount = "Botok: " + guild.members.filter(member => member.user.bot).size;
	
	if(guild.id == 326001549711114241) { //Zozi DC
		const membercountch = guild.channels.find("id", "510797260389482496");	
		let usercountch = guild.channels.find("id", "510797263593799690");	
		let botcountch = guild.channels.find("id", "510797264260694018");	
		membercountch.setName(membercount);
		usercountch.setName(usercount);
		botcountch.setName(botcount);
	}
}

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	const song = {
		id: video.id,
		title: video.title,
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			queue.delete(msg.guild.id);
			return msg.channel.send(`Nem tudok csatlakozni: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		if (playlist) return undefined;
		else return msg.channel.send(`✅ Zene hozzáadva a lejátszási listához: **${song.title}**`);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`🎶 Zene elindítva: **${song.title}**`);
}

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
