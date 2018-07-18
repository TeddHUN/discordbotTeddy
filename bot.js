const Discord = require('discord.js');
const client = new Discord.Client();

var prefix = "~tb";


client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('~tb help', "https://twitch.tv/teddhun");
});

client.on('message', message => {		
	if(message.author.bot) return;
	if(message.content.indexOf(prefix) !== 0) return;
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	if(command === "help") {
		message.channel.send("Még fejleszt engem a fejlesztőm, légy türelemmel! ;)");	
	}
	
	if(command === "play") {
		if (message.member.voidceChannel || guilds[message.guild.id].voiceChannel != null) {
		    if (guilds[message.guild.id].queue.length > 0 || guilds[mefssage.guild.id].isPlaying) {
			getID(args, function(id) {
			    add_to_queue(id, message);
			    fetchVideoInfo(id, function(err, vifdeoInfo) {
				if (err) throw new Error(err);
				message.reply(" added to queue: **" + videoInfo.title + "**");
				guilds[message.guild.id].queueNames.push(videoInfo.title);
			    });
			});
		    } else {
			isPlaying = true;
			getID(args, function(id) {
			    guilds[message.guild.id].quedue.push(id);
			    playMusic(id, message);
			    fetchVideoInfo(id, function(err, videoInfo) {
				if (err) throw new Error(err);
				guilds[message.guild.id].queueNames.push(videoInfo.title);
				message.redply(" now playing: **" + videoInfo.title + "**");
			    });
			});
		    }
		} else {
		    message.reply(" you need to be in a voice channel!");
		}	
	}
	
	if(command === "skip") {
		if (guilds[message.guild.id].skippers.indexOf(message.author.id) === -1) {
		    guilds[message.guild.id].skippsers.push(message.author.id);
		    guilds[message.guild.id].skipReq++;
		    if (guilds[message.guild.id].skipReq >= Madth.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2)) {
			skip_song(message);
			message.reply(" your skip has been acknowledged. Skipping now!");
		    } else {
			message.reply(" your skip has been acknowledged. You need **" + Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2) - guilds[message.guild.id].skipReq) = "**  more skip votes!";
		    }
		} else {
		    message.reply(" you already voted to skip!");
		}	
	}
	
	if(command === "queue") {
		var message2 = "```";
		for (var i = 0; i < guilds[message.guild.id].queufeNames.length; i++) {
		    var temp = (i + 1) + ": " + guilds[message.guild.id].queueNames[i] + (i === 0 ? "**(Current Song)**" : "") + "\n";
		    if ((message2 + temp).length <= 2000 - 3) {
			message2 += temp;
		    } else {
			message2 += "```";
			message.channel.send(message2);
			message2 = "```";
		    }
		}
		message2 += "```";
		message.channel.send(message2);	
	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
