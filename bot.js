/*const express = require("express");
const app = express();

app.get("/", (request, response) => {
  console.log("BotReindítás");
  response.sendStatus(200);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Figyelés az adott porton: ' + listener.address().port);
});*/

const Discord = require('discord.js');
const client = new Discord.Client();

const mysql = require('mysql');
var prefix = "-";

const config = require('./config.json');
const szabalyEmbed = require('./szabalyzat.json');
const TwitchMonitor = require("./twitch-monitor");

const rangs = require('./rangs.json');
var maxRang = 2;

let initialMessage = `@everyone A rangok igénylése **automatikusan** működik így ha szeretnél egy rangot akkor csak reagálj rá! ;)`;
const roles = ["The Crew", "The Crew 2", "PC", "XBOX", "PS"];
const reactions = ["🆕", "🆕", "🆕", "🆕", "🆕"];

function generateMessages(){
    var messages = [];
    messages.push(initialMessage);
    for (let role of roles) messages.push(`**${role}**`);
    return messages;
}

var con;

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setActivity('Értesítés, Statisztika...', { type: 'WATCHING' });
    //client.user.setActivity('In Test Period', { type: 'WATCHING' });
	
    StreamActivity.init(client);
    TwitchMonitor.start();
	
    /*con.connect(function(err) {
  	if (err) return console.log(""+err);
   	console.log("MySQL: Csatlakozva!");
    });*/
});

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(prefix)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(prefix.length);
	
	if (command === 'leaveserver') {
		if(msg.author.id != "312631597222592522") {
			return msg.channel.send("Nincs hozzá jogod, bibíbí!");	
		}

		if (!args[1]) return msg.channel.send("**Használat:** --leaveserver `[SzerverID]`");
		let guild = client.guilds.find("id", args[1]);
   		if(!guild) return msg.channel.send("Nincs ilyen szerver!");
		
		guild.leave()
		msg.channel.send("A szerverről leléptem!");
	}

	if(command === "szerverek") {
	    const embed = new Discord.RichEmbed()
	    .setColor(8311585);

	    var i = 0;

			client.guilds.forEach(guild => {
	      i++;
	      embed.addField(i + ". Szerver neve", "**" + guild.name + "**")
	      .addField("ID", "**" + guild.id + "**", true)
	      .addField("Tulajdonos", "**" + guild.owner.toString() + "**", true);
			});
        
		msg.channel.send(msg.author + ", **A következő szervereken vagyok elérhető:**", { embed });
	}
		
	/*if(command === "help") {
		const embed = new Discord.RichEmbed()
		.setTitle("MusicBOT")
		.setColor(0xFFFFFF)
		.setFooter("Fejlesztőm: TeddHUN", "https://support.discordapp.com/system/photos/3600/6196/6312/profile_image_116298876231_678183.jpg")
		.setTimestamp()
		
		//.addField(prefix + "liga", "Lista az aktuális ligákról.")
		.addField(prefix + "play [url/név]", "Zene lejátszás Youtube-ról.")
		.addField(prefix + "skip", "Aktuális zene továbbléptetése.")
		.addField(prefix + "queue", "Lista az aktuális zenei várólistáról.")
		.addField(prefix + "stop", "Megtudod állítani a zenét.")
		.addField(prefix + "volume", "A hangerő állítása.");
  		
		msg.channel.send("A segítséget elküldtem privát üzenetben!");
		msg.author.send({embed});		
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
	}*/	
	
	if(command === "uzenet" || command === "üzenet") {		
		
		if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Ehhez nincs jogod!").then(sent => {
				sent.delete(10000);					
			});
		
		let dUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
		if (!dUser) return msg.channel.send("**HIBA:** A felhasználó nem található!").then(sent => {
				sent.delete(10000);					
			});
		
		let dMessage = msg.content.slice(9);
		dMessage = dMessage.replace(dUser, " ");
		if(dMessage.length < 1) return msg.channel.send("**Használat:** `--üzenet @Felhasználó [Szöveg]").then(sent => {
				sent.delete(10000);					
			});

		dUser.send("**Üzenet érkezett a `Sloth Gang` discord szerverről!**\n\nKüldő: " + msg.author + "\nÜzenet:" + dMessage);
		msg.channel.send("**Üzenet elküldve!**").then(sent => {
				msg.delete(1);
				sent.delete(5000);					
			});
	}	
	
	if(command === "simi") {		
		
		/*if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Ehhez nincs jogod!").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});*/
		
		let dUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
		if (!dUser) return msg.channel.send("**Használat:** `--simi @Felhasználó").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});
		
		msg.channel.send(msg.author + ", megsimizte " + dUser + "-t!").then(sent => {
				msg.delete(1);					
			});
	}
	
	if(command === "puszi") {		
		
		/*if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Ehhez nincs jogod!").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});*/
		
		let dUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
		if (!dUser) return msg.channel.send("**Használat:** `--puszi @Felhasználó").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});
		
		msg.channel.send(msg.author + ", adott egy puszit " + dUser + "-nak/nek!").then(sent => {
				msg.delete(1);					
			});
	}
	
	if(command === "jebemta") {		
		
		/*if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Ehhez nincs jogod!").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});*/
		
		let dUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
		if (!dUser) return msg.channel.send("**Használat:** `--jebemta @Felhasználó").then(sent => {
				msg.delete(1);	
				sent.delete(10000);					
			});
		
		msg.channel.send(msg.author + ", jebem ta " + dUser + "-t!").then(sent => {
				msg.delete(1);					
			});
	}
	
	if(command === "ban") {		
		
		/*if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Ehhez nincs jogod!").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});*/
		
		let dUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
		if (!dUser) return msg.channel.send("**Használat:** `-ban @Felhasználó").then(sent => {
				msg.delete(1);	
				sent.delete(10000);					
			});
		
		msg.channel.send(msg.author + " ellopta Thanos kesztyűjét majd a kövek segítségével elcsettintette " + dUser + "-t!").then(sent => {
				msg.delete(1);					
			});
	}
	
	if(command === "pofon") {		
		
		/*if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Ehhez nincs jogod!").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});*/
		
		let dUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
		if (!dUser) return msg.channel.send("**Használat:** `-pofon @Felhasználó").then(sent => {
				msg.delete(1);	
				sent.delete(10000);					
			});
		
		msg.channel.send(msg.author + " ellopta Thanos kesztyűjét majd a kövek erejével adott egy sajtos-tejfölöst " + dUser + " számára!").then(sent => {
				msg.delete(1);					
			});
	}
	
	if(command === "csók") {		
		
		/*if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Ehhez nincs jogod!").then(sent => {
				msg.delete(1);
				sent.delete(10000);					
			});*/
		
		let dUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(args[0]);
		if (!dUser) return msg.channel.send("**Használat:** `-csók @Felhasználó").then(sent => {
				msg.delete(1);	
				sent.delete(10000);					
			});
		
		msg.channel.send(msg.author + " küldött egy virtuális csókot " + dUser + " számára!").then(sent => {
				msg.delete(1);					
			});
	}
	
	/*if(command === "stats") {
		
		if(!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("**HIBA:** Tesztelés alatt!").then(sent => {
			msg.delete(1);
			sent.delete(10000);					
		});
		
		con.query("SELECT * FROM rangs WHERE id = '" + msg.member.user.id + "'", function (err, result) {
			if(result[0] == undefined) {
				const embed = new Discord.RichEmbed()
				    .setColor('#70EA6A')
				    .setThumbnail(msg.member.user.avatarURL)
				    .setAuthor(`${msg.member.user.username}#${msg.member.user.discriminator}`, msg.member.user.avatarURL)
				   // .addField("ID:", `${msg.member.user.id}`, true)
				    .addField("Becenév", msg.member.nickname || 'Még nincs', true)
				    .addField("Fiók létrehozva", `${msg.member.user.createdAt}`)
				    .addField("Csatlakozás dátuma", `(${msg.member.joinedAt})`)
				    .addField("Rangok", msg.member.roles.map(roles => `${roles.name}`).join(', '))
				    .addField("Rang", rangs[0].rang, true)
				    .addField("XP", "0/100", true)
				
				msg.channel.send(msg.member + ", itt a statisztikád! :P", {
				    embed: embed
				}).then(sent => {
					msg.delete(1);					
				});	
				
				con.query("INSERT INTO rangs (id, xp, rang) VALUES ('" + msg.member.user.id + "', 0, 0)");
			} else {
				//console.log("" + result[0].xp + ", " + result[0].rang);
				var rang = result[0].rang;
				var xp = result[0].xp;
				//console.log("" + rangs[rang].rang); 
				
				
				const embed = new Discord.RichEmbed()
				    .setColor('#70EA6A')
				    .setThumbnail(msg.member.user.avatarURL)
				    .setAuthor(`${msg.member.user.username}#${msg.member.user.discriminator}`, msg.member.user.avatarURL)
				   // .addField("ID:", `${msg.member.user.id}`, true)
				    .addField("Becenév", msg.member.nickname || 'Még nincs', true)
				    .addField("Fiók létrehozva", `${msg.member.user.createdAt}`)
				    .addField("Csatlakozás dátuma", `(${msg.member.joinedAt})`)
				    .addField("Rangok", msg.member.roles.map(roles => `${roles.name}`).join(', '))
				    .addField("Rang", rangs[rang].rang, true)
				    .addField("XP", xp + "/" + rangs[rang].xp, true)
				
				msg.channel.send(msg.member + ", itt a statisztikád! :P", {
				    embed: embed
				}).then(sent => {
					msg.delete(1);					
				});	
			}
		});
		/*
		
		
		msg.channel.send(msg.member + ", itt a statisztikád! :P", {
		    embed: embed
		});	
	}
	
	/*if(command === "addstream") {
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
	}*/
	
	if(command == "frissit") {
		if(msg.author.id != "312631597222592522") {
			return msg.channel.send("Nincs hozzá jogod, bibíbí!");
		}
		
		serverStats(client.guilds.find("id", "547498318834565130"));//klandc
		serverStats(client.guilds.find("id", "588833384936112157"));//zozi
		msg.channel.sendMessage(msg.author + " Átírva!").then(sent => {
			msg.delete(1);
			sent.delete(5000);
		});		
	}
	
	if(command == "szabalyzat") {
		if(msg.author.id != "312631597222592522") {
			return msg.channel.send("Nincs hozzá jogod, bibíbí!");
		}
		let guild = client.guilds.find("id", "547498318834565130");
   		let targetChannel = guild.channels.find("id", "572146712114757637");//
	
		targetChannel.send({ embed: szabalyEmbed });
	}
	return undefined;
});


client.on("guildMemberAdd", (member) => {
  	const guild = member.guild;
	serverStats(guild);
	if(guild.id == "547498318834565130") {//Sloth Gang
		member.send("*Bíp-búp. Búp Bíp*\n\n**Üdv, " + member + "!**\nLátom, hogy csatlakoztál a **Sloth Gang** discord szerverére és mivel az ott lévő családi / baráti hangulat miatt szeretnélek megkérni arra, hogy egy kisebb mondatba bemutatkozz az ott lévő `Moderátorok` és `Adminok` felé.\nA bemutatkozó szöveged küld el számomra, **itt**!\n**Fontos, hogy a bemutatkozásodban tüntesd fel a Twitch nevedet is!**\n\n**Hirtelen nem tudod mit is írj?**\nPár példa, hogy segítsem a fogalmazásodat: `Mi a hobbid?`, `Kiket nézel közölünk?`, `Melyek a kedvenc játékaid?`, `Hogy hívnak, hány éves vagy?`.\nA fentebb említett példáknak nem kötelező szerepelnie a bemutatkozásban ezek csak segítő jelleggel szerepelnek.\n\nAmint egy `Moderátor` vagy `Admin`  beállította a becenevedet a Twitch nevedre és kaptál `Tag` rangot akkor már is elérhető lesz számodra a discord szerveren lévő szobák és beszélgetések.\n\nÜdvözlettel, **Sloth Gang**\n||NewC, Natrex, Skecci, JoeFlash, TeddHUN||");
		let channel = guild.channels.find("id", "547557423318040603");
		const embed = new Discord.RichEmbed()
		    .setColor('#70EA6A')
		    .setThumbnail(member.user.avatarURL)
		    .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.avatarURL)
		    .addField("ID:", `${member.user.id}`, true)
		    .addField("Becenév", member.nickname || 'Még nincs', true)
		    .addField("Fiók létrehozva", `${member.user.createdAt}`)
		    .addField("Csatlakozás dátuma", `(${member.joinedAt})`)
		    .addField("Rangok", member.roles.map(roles => `${roles.name}`).join(', '), true)
		    .addField("Utolsó üzenete", member.user.lastMessage)
	
		channel.send(member + ", csatlakozott a szerverre!", {
		    embed: embed
		});
		
		/*con.query("SELECT * FROM rangs WHERE id = '" + member.user.id + "'", function (err, result) {
			if(result[0] == undefined) {
				con.query("INSERT INTO rangs (id, xp, rang) VALUES ('" + member.user.id + "', 0, 0)");
			}
		});*/
	} else if(guild.id == "588833384936112157") {//Sloth Gang
		//member.send("*Bíp-búp. Búp Bíp*\n\n**Üdv, " + member + "!**\nLátom, hogy csatlakoztál a **Sloth Gang** discord szerverére és mivel az ott lévő családi / baráti hangulat miatt szeretnélek megkérni arra, hogy egy kisebb mondatba bemutatkozz az ott lévő `Moderátorok` és `Adminok` felé.\nA bemutatkozó szöveged küld el számomra, **itt**!\n**Fontos, hogy a bemutatkozásodban tüntesd fel a Twitch nevedet is!**\n\n**Hirtelen nem tudod mit is írj?**\nPár példa, hogy segítsem a fogalmazásodat: `Mi a hobbid?`, `Kiket nézel közölünk?`, `Melyek a kedvenc játékaid?`, `Hogy hívnak, hány éves vagy?`.\nA fentebb említett példáknak nem kötelező szerepelnie a bemutatkozásban ezek csak segítő jelleggel szerepelnek.\n\nAmint egy `Moderátor` vagy `Admin`  beállította a becenevedet a Twitch nevedre és kaptál `Tag` rangot akkor már is elérhető lesz számodra a discord szerveren lévő szobák és beszélgetések.\n\nÜdvözlettel, **Sloth Gang**\n||NewC, Natrex, Skecci, JoeFlash, TeddHUN||");
		let channel = guild.channels.find("id", "588834837532770335");
		const embed = new Discord.RichEmbed()
		    .setColor('#70EA6A')
		    .setThumbnail(member.user.avatarURL)
		    .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.avatarURL)
		    .addField("ID:", `${member.user.id}`, true)
		    .addField("Becenév", member.nickname || 'Még nincs', true)
		    .addField("Fiók létrehozva", `${member.user.createdAt}`)
		    .addField("Csatlakozás dátuma", `(${member.joinedAt})`)
		    .addField("Rangok", member.roles.map(roles => `${roles.name}`).join(', '), true)
		    .addField("Utolsó üzenete", member.user.lastMessage)
	
		channel.send(member + ", csatlakozott a szerverre!", {
		    embed: embed
		});
	}
});

client.on('guildMemberRemove', (member) => {
  	const guild = member.guild;
	serverStats(guild);
	if(guild.id == "547498318834565130") {//Sloth Gang
//		member.send("*Bíp-búp. Búp Bíp*\n\n**Üdv, " + member + "!**\nLátom, hogy csatlakoztál a **Sloth Gang** discord szerverére és mivel az ott lévő családi / baráti hangulat miatt szeretnélek megkérni arra, hogy egy kisebb mondatba bemutatkozz az ott lévő `Moderátorok` és `Adminok` felé.\nA bemutatkozó szöveged küld el számomra, **itt**!\n**Fontos, hogy a bemutatkozásodban tüntesd fel a Twitch nevedet is!**\n\n**Hirtelen nem tudod mit is írj?**\nPár példa, hogy segítsem a fogalmazásodat: `Mi a hobbid?`, `Kiket nézel közölünk?`, `Melyek a kedvenc játékaid?`, `Hogy hívnak, hány éves vagy?`.\nA fentebb említett példáknak nem kötelező szerepelnie a bemutatkozásban ezek csak segítő jelleggel szerepelnek.\n\nAmint egy `Moderátor` vagy `Admin`  beállította a becenevedet a Twitch nevedre és kaptál `Tag` rangot akkor már is elérhető lesz számodra a discord szerveren lévő szobák és beszélgetések.\n\nÜdvözlettel, **Sloth Gang**\n||NewC, Natrex, Skecci, JoeFlash, TeddHUN||");
		let channel = guild.channels.find("id", "547557423318040603");

		channel.send("**" + member.user.username + "#" + member.user.discriminator + "**, lelépett. :(");
	} else 
	if(guild.id == "588833384936112157") {//Sloth Gang
//		member.send("*Bíp-búp. Búp Bíp*\n\n**Üdv, " + member + "!**\nLátom, hogy csatlakoztál a **Sloth Gang** discord szerverére és mivel az ott lévő családi / baráti hangulat miatt szeretnélek megkérni arra, hogy egy kisebb mondatba bemutatkozz az ott lévő `Moderátorok` és `Adminok` felé.\nA bemutatkozó szöveged küld el számomra, **itt**!\n**Fontos, hogy a bemutatkozásodban tüntesd fel a Twitch nevedet is!**\n\n**Hirtelen nem tudod mit is írj?**\nPár példa, hogy segítsem a fogalmazásodat: `Mi a hobbid?`, `Kiket nézel közölünk?`, `Melyek a kedvenc játékaid?`, `Hogy hívnak, hány éves vagy?`.\nA fentebb említett példáknak nem kötelező szerepelnie a bemutatkozásban ezek csak segítő jelleggel szerepelnek.\n\nAmint egy `Moderátor` vagy `Admin`  beállította a becenevedet a Twitch nevedre és kaptál `Tag` rangot akkor már is elérhető lesz számodra a discord szerveren lévő szobák és beszélgetések.\n\nÜdvözlettel, **Sloth Gang**\n||NewC, Natrex, Skecci, JoeFlash, TeddHUN||");
		let channel = guild.channels.find("id", "588834837532770335");

		channel.send("**" + member.user.username + "#" + member.user.discriminator + "**, lelépett. :(");
	}
});

client.on("message", (message) => {
	if (message.channel.type === "dm") {
		if(message.author.username == "Teddy") return; 
		
		let userclient = message.client;
		let slothgang = userclient.guilds.find("id", "547498318834565130");
		let user = slothgang.members.find("id", message.author.id);
		
		if(slothgang.id == "547498318834565130") {
			let bemutatkozok = slothgang.channels.find("id", "553337569127956480");	

			if(user.nickname == "null" || user.nickname == null) {
				bemutatkozok.send(message.author + " bemutatkozó üzenete: ```" + message.content + "```**Ha írt Twitch nevet akkor a beceneved állítsd be rá és adj neki tag rangot, majd rakj egy ✅ reakciót ha kész!** 😃\n**Esetleg ha nem írt megfelelő bemutatkozást akkor a `-uzenet Megemlítés [Szöveg]` paranccsal tudsz neki üzenni!**");
			} else client.users.get("312631597222592522").send(message.author + " üzenete: " + message.content);
		} else client.users.get("312631597222592522").send(message.author + " üzenete: " + message.content);		
	}/* else {
		con.query("SELECT * FROM rangs WHERE id = '" + message.member.user.id + "'", function (err, result) {
			if(result[0] == undefined) {
				con.query("INSERT INTO rangs (id, xp, rang) VALUES ('" + message.member.user.id + "', 0, 0)");
			} else {
				var xp2 = result[0].xp + 1;
				var rang = result[0].rang;
				
				if(rang < maxRang) {				
					if(xp2 >= rangs[rang].xp) {
						rang++;
						con.query("UPDATE rangs SET xp = '0', rang = '" + rang + "' WHERE id = '" + message.member.user.id + "'"); 
						
						const embed = {
							  "description": "**Gratulálok, fejlődtél egy szintet!**",
							  "color": 16312092,
							  "author": {
							    "name": ""+message.author,
							    "icon_url": ""+message.member.user.avatarURL
							  },
							  "fields": [
							    {
							      "name": "Régi rangod:",
							      "value": ""+rangs[rang-1].rang,
							      "inline": true
							    },
							    {
							      "name": "Új rang:",
							      "value": ""+rangs[rang].rang,
							      "inline": true
							    }
							  ]
						};
						message.channel.send(message.author + ", szintet léptél!", { embed });	
					} else {
						con.query("UPDATE rangs SET xp = '" + xp2 + "' WHERE id = '" + message.member.user.id + "'");  
					}
				}
			}
		});	
	}*/
});

/*client.on('raw', event => {
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
});*/

function serverStats(guild) {	
	if(guild.id == 547498318834565130) {//klandC	
		let membercountch = guild.channels.find("id", "547811561654190085");	

		let usercount = "E: " + guild.members.filter(member => !member.user.bot).size + " / B: " + guild.members.filter(member => member.user.bot).size;
		membercountch.setName(usercount);
	} else if(guild.id == 588833384936112157) {//zozi	
		let membercountch = guild.channels.find("id", "588842382980808726");	
		let emberch = guild.channels.find("id", "588842385736335417");	
		let botch = guild.channels.find("id", "588842389217738783");	

		let usercount = "Tagok: " + guild.members.size;
		membercountch.setName(usercount);
		
		usercount = "Emberek: " + guild.members.filter(member => !member.user.bot).size;
		emberch.setName(usercount);
		
		usercount = "Botok: " + guild.members.filter(member => member.user.bot).size;
		botch.setName(usercount);
	}
}

class StreamActivity {
    static setChannelOnline(channel) {
        this.onlineChannels[channel.name] = channel;
    }

    static setChannelOffline(channel) {
	delete this.onlineChannels[channel.name];
	/*if(this.activeChannel2 == channel.name) {
		this.activeChannel2 = null;	
	}*/
    }

    static getDisplayChannel() {
        let lastChannel = null;
	var csatornak = [];
	     
	for (let channelName in this.onlineChannels) {
		if (typeof channelName !== "undefined" && channelName) {
			csatornak.push(channelName);
		} 
	}
	var rand = Math.floor(Math.random() * csatornak.length);

	console.log('[Debug]', rand, csatornak.length);
	lastChannel = csatornak[rand];
        /*for (let channelName in this.onlineChannels) {
            if (typeof channelName !== "undefined" && channelName) {
                lastChannel = this.onlineChannels[channelName];
            }
        }*/

        return lastChannel;
    }

    static updateActivity() {
/*        let displayChannel = this.getDisplayChannel();
        if (displayChannel) {
	    if(this.activeChannel2 !== displayChannel) {
		    this.discordClient.user.setActivity("📡 " + displayChannel + " 📡", {
			"url": "https://twitch.tv/"+displayChannel,
			"type": "STREAMING"
		    });
		    this.activeChannel2 = displayChannel;
		    console.log('[Aktivitás]', `Aktivitás frissítve: ${displayChannel} nézése.`);
	    }
        } else {
	    if(this.activeChannel2 !== null) {
	    	this.activeChannel2 = null;
            	console.log('[Aktivitás]', 'Nincs aktív streamer!');
		
	    	this.discordClient.user.setActivity('Értesítés, MusicBOT, Statisztika...', { type: 'WATCHING' });
	    }
        }*/
    }

    static init(discordClient) {
        this.discordClient = discordClient;
        this.onlineChannels = { };
	//this.activeChannel2 = null;

       // setInterval(this.updateActivity.bind(this), 5 * 60 * 1000);
    }
}

let oldMsgs = { };
TwitchMonitor.onChannelLiveUpdate((twitchChannel, twitchStream, twitchChannelIsLive) => {
    try {
        syncServerList(false);
    } catch (e) { }

    StreamActivity.setChannelOnline(twitchChannel);
/*
Hé @here, natrex_official közvetítésbe kezdett https://www.twitch.tv/natrex_official ! Kukkantsatok be hozzá!
*/
    let msgFormatted = `Hé @here, ** ${twitchChannel.display_name} ** közvetítésbe kezdett!\nKukkantsatok be hozzá!`;
	
    let cacheBustTs = (Date.now() / 1000).toFixed(0);

    const msgEmbed = new Discord.RichEmbed()
	.setColor(0x6441A4)
        .setTitle(twitchChannel.status)
        .setURL("https://twitch.tv/" + twitchChannel.name)
	.setAuthor(twitchChannel.display_name, twitchChannel.logo, "https://twitch.tv/" + twitchChannel.name)    
  	.setThumbnail(twitchChannel.logo)
    	.addField("Játék", twitchStream.game || "Nincs beállítva")
    	.addField("Nézők", twitchStream.viewers || "Az adás most indult.", true)
    	.addField("Követők", twitchChannel.followers, true)
    	.addField("Összmegtekintés", twitchChannel.views, true)
    	.addField("Link", "https://twitch.tv/" + twitchChannel.name, true)
	.setImage(twitchStream.preview.medium + "?t=" + cacheBustTs)
    	.setFooter("Értesítés időpontja", twitchChannel.logo)
    	.setTimestamp();

    let anySent = false;
    let didSendVoice = false;

    let guild = client.guilds.find("id", "547498318834565130");
    let targetChannel = guild.channels.find("id", process.env.dcstreamnotify);//
    
    /*let statusz = 0;
    let uzenet = '';
    con.connect(function(err) {
      if (err) return console.log(""+err);
      console.log("MySQL: Csatlakozva!");
    });
	//console.log(twitchChannel);	  
    */	
 con.query("SELECT * FROM streamerek WHERE twitch = '" + twitchChannel.name + "'", function (err, result) {  
	//console.log(""+result[0].status);
	//statusz = result[0].status;
	//uzenet = result[0].dcmessage;
	    if (!twitchChannelIsLive) {
	       if(result[0].status == 1) {
	  targetChannel.fetchMessage(result.dcmessage).then(message => message.delete());
	  var sql = "UPDATE streamerek SET status = '0' WHERE twitch = '" + twitchChannel.name + "'";
	  con.query(sql, function (err, result) {
	  if (err) throw err;
	    console.log(result.affectedRows + " record(s) updated");
	  });
	       }	
	    } else {
		    console.log("check");
	       if(result[0].status == 0) {

	    let sql = `UPDATE streamerek SET status = ?, dcmessage = ? WHERE twitch = ?`;

	    targetChannel.send(msgFormatted, {
	    embed: msgEmbed
	     }).then((message) => {	
	     let data = [1, message.id, twitchChannel.name];
	      //var sql = "UPDATE streamerek SET status = '1', dcmessage = '" + message.id + "' WHERE twitch = '" + twitchChannel.name + "'";
	      var query = con.query(sql, data, function (err, result) { 	
		console.log(result); });
	      console.log(query);
	      console.log('[Discord]', `Értesítés kiküldve a(z) ${targetChannel.guild.name} szerveren a(z) #${targetChannel.name} szobában ${twitchChannel.display_name}-ról/ről!`);
	    });   
	       }
	    }
    });
  
  //sleep(5000);
  //con.end();	*/
  anySent = true;
 /*   try {
	let messageDiscriminator = `${targetChannel.guild.id}_${targetChannel.name}_${twitchChannel.name}_${twitchStream.created_at}`;
	let existingMessage = oldMsgs[messageDiscriminator] || null;
	if (existingMessage) {
	    if (!twitchChannelIsLive) {
	        existingMessage.delete();
		delete oldMsgs[messageDiscriminator];		
	    }
	} else {
	    if (twitchChannelIsLive) {
		    let msgToSend = msgFormatted + ` @here`;
		    targetChannel.send(msgToSend, {
			embed: msgEmbed
		    })
		    .then((message) => {
			oldMsgs[messageDiscriminator] = message;
			console.log('[Discord]', `Értesítés kiküldve a(z) ${targetChannel.guild.name} szerveren a(z) #${targetChannel.name} szobában ${twitchChannel.display_name}-ról/ről!`);
		    });
	    }
	}
	anySent = true;
    } catch (e) {
	console.warn('[Discord]', 'Üzenet küldési hiba:', e);
    }*/
    return anySent;
});

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

var db_config = {
	host: process.env.mysqlhost,
	user: process.env.mysqluser,
	password: process.env.mysqlpassword,
	database: process.env.mysqldatabase
};

function handleDisconnect() {
  con = mysql.createConnection(db_config);

  con.connect(function(err) {
    if(err) {
	console.log('MySQL error, database: ', err);
	setTimeout(handleDisconnect, 2000);
    } else {
	console.log("MySQL: Csatlakozva!");
    }
  }); 

  con.on('error', function(err) {
    console.log('MySQL error: ', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

client.login(process.env.BOT_TOKEN);

handleDisconnect();
