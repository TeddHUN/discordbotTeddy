const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const {YTSearcher} = require('ytsearcher');
const ytpl = require('ytpl');

var prefix = "-tb";

/*function play(connection, message) {
	var server = servers[message.guild.id];
	
	server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

	server.queue.shift();
	
	server.dispatcher.on("end", function() {
		if(server.queue[0]) play(connection, message);
		else connection.disconnect();
	});
}

var servers = {};*/



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

client.on("message", (msg) => {
    const message = msg.content.trim();
    const command = message.substring(musicbot.botPrefix.length).split(/[ \n]/)[0].trim();
    const suffix = message.substring(musicbot.botPrefix.length + command.length).trim();
    const args = message.slice(musicbot.botPrefix.length + command.length).trim().split(/ +/g);
    let prefix = musicbot.botPrefix;
    if (typeof prefix === 'object') prefix = prefix.has(msg.guild.id) ? prefix.get(msg.guild.id) : musicbot.botPrefix;

    if (message.startsWith(musicbot.botPrefix) && !msg.author.bot && msg.channel.type == "text") {
      if (musicbot.commands.has(command)) {
        let tCmd = musicbot.commands.get(command);
        if (musicbot.recentTalk.has(msg.author.id) && !musicbot.cooldown.disabled && !musicbot.cooldown.exclude.includes(tCmd.masked)) return msg.channel.send(musicbot.note("fail", "You must wait to use music commands again."));
        if (!tCmd.disabled) {
          if (!musicbot.cooldown.disabled) musicbot.recentTalk.add(msg.author.id);
          setTimeout(() => { musicbot.recentTalk.delete(msg.author.id) }, musicbot.cooldown.timer);
          return musicbot[tCmd.run](msg, suffix, args);
        }
      } else if (musicbot.aliases.has(command)) {
        let aCmd = musicbot.aliases.get(command);
        if (musicbot.recentTalk.has(msg.author.id) && !musicbot.cooldown.disabled && !musicbot.cooldown.exclude.includes(aCmd.masked)) return msg.channel.send(musicbot.note("fail", "You must wait to use music commands again."));
        if (!aCmd.disabled) {
          if (!musicbot.cooldown.disabled) musicbot.recentTalk.add(msg.author.id);
          setTimeout(() => { musicbot.recentTalk.delete(msg.author.id) }, musicbot.cooldown.timer);
          return aCmd.run(msg, suffix, args);
        }
      };
    };
});

musicbot.playFunction = (msg, suffix, args) => {
    if (msg.member.voiceChannel === undefined) return msg.channel.send(musicbot.note('fail', `You're not in a voice channel.`));
    if (!suffix) return msg.channel.send(musicbot.note('fail', 'No video specified!'));
    let q = musicbot.getQueue(msg.guild.id)
    if (q.songs.length >= musicbot.maxQueueSize && musicbot.maxQueueSize !== 0) return msg.channel.send(musicbot.note('fail', 'Maximum queue size reached!'));
    var searchstring = suffix.trim();
    msg.channel.send(musicbot.note("search", `\`Searching: ${searchstring}\`~`));

    new Promise(async (resolve, reject) => {
      let result = await musicbot.searcher.search(searchstring, { type: 'video' });
      resolve(result.first)
    }).then((res) => {
      if (!res) return msg.channel.send(musicbot.note("fail", "Something went wrong. Try again!"));
      res.requester = msg.author.id;
      res.channelURL = `https://www.youtube.com/channel/${res.channelId}`;
      res.queuedOn = new Date().toLocaleDateString(musicbot.dateLocal, { weekday: 'long', hour: 'numeric' });
      if (musicbot.requesterName) res.requesterAvatarURL = msg.author.displayAvatarURL;
      const queue = musicbot.getQueue(msg.guild.id)
      res.position = queue.songs.length ? queue.songs.length : 0;
      queue.songs.push(res);

      if (msg.channel.permissionsFor(msg.guild.me).has('EMBED_LINKS')) {
        const embed = new Discord.RichEmbed();
        try {
          embed.setAuthor('Adding To Queue', client.user.avatarURL);
          var songTitle = res.title.replace(/\\/g, '\\\\')
          .replace(/\`/g, '\\`')
          .replace(/\*/g, '\\*')
          .replace(/_/g, '\\_')
          .replace(/~/g, '\\~')
          .replace(/`/g, '\\`');
          embed.setColor(musicbot.embedColor);
          embed.addField(res.channelTitle, `[${songTitle}](${res.url})`, musicbot.inlineEmbeds);
          embed.addField("Queued On", res.queuedOn, musicbot.inlineEmbeds);
          if (!musicbot.bigPicture) embed.setThumbnail(`https://img.youtube.com/vi/${res.id}/maxresdefault.jpg`);
          if (musicbot.bigPicture) embed.setImage(`https://img.youtube.com/vi/${res.id}/maxresdefault.jpg`);
          const resMem = client.users.get(res.requester);
          if (musicbot.requesterName && resMem) embed.setFooter(`Requested by ${client.users.get(res.requester).username}`, res.requesterAvatarURL);
          if (musicbot.requesterName && !resMem) embed.setFooter(`Requested by \`UnknownUser (ID: ${res.requester})\``, res.requesterAvatarURL);
          msg.channel.send({
            embed
          });
        } catch (e) {
          console.error(`[${msg.guild.name}] [playCmd] ` + e.stack);
        };
      } else {
        try {
          var songTitle = res.title.replace(/\\/g, '\\\\')
          .replace(/\`/g, '\\`')
          .replace(/\*/g, '\\*')
          .replace(/_/g, '\\_')
          .replace(/~/g, '\\~')
          .replace(/`/g, '\\`');
          msg.channel.send(`Now Playing: **${songTitle}**\nRequested By: ${client.users.get(res.requester).username}\nQueued On: ${res.queuedOn}`)
        } catch (e) {
          console.error(`[${msg.guild.name}] [npCmd] ` + e.stack);
        };
      };
      if (queue.songs.length === 1 || !client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id)) musicbot.executeQueue(msg, queue);
    }).catch((res) => {
      throw res;
    })
  };

  musicbot.helpFunction = (msg, suffix, args) => {
    let command = suffix.trim();
    if (!suffix) {
      if (msg.channel.permissionsFor(msg.guild.me)
        .has('EMBED_LINKS')) {
        const embed = new Discord.RichEmbed();
        embed.setAuthor("Commands", msg.author.displayAvatarURL);
        embed.setDescription(`Use \`${musicbot.botPrefix}${musicbot.help.name} command name\` for help on usage. Anyone with a role named \`${musicbot.djRole}\` can use any command.`);
        // embed.addField(musicbot.helpCmd, musicbot.helpHelp);
        const newCmds = Array.from(musicbot.commands);
        let index = 0;
        let max = musicbot.commandsArray.length;
        embed.setColor(musicbot.embedColor);
        for (var i = 0; i < musicbot.commandsArray.length; i++) {
          if (!musicbot.commandsArray[i].exclude) embed.addField(musicbot.commandsArray[i].name, musicbot.commandsArray[i].help);
          index++;
          if (index == max) {
            if (musicbot.messageHelp) {
              let sent = false;
              msg.author.send({
                  embed
                })
                .then(() => {
                  sent = true;
                });
              setTimeout(() => {
                if (!sent) return msg.channel.send({
                  embed
                });
              }, 1200);
            } else {
              return msg.channel.send({
                embed
              });
            };
          }
        };
      } else {
        var cmdmsg = `= Music Commands =\nUse ${musicbot.botPrefix}${musicbot.help.name} [command] for help on a command. Anyone with a role named \`${musicbot.djRole}\` can use any command.\n`;
        let index = 0;
        let max = musicbot.commandsArray.length;
        for (var i = 0; i < musicbot.commandsArray.length; i++) {
          if (!musicbot.commandsArray[i].disabled || !musicbot.commandsArray[i].exclude) {
            cmdmsg = cmdmsg + `\n• ${musicbot.commandsArray[i].name}: ${musicbot.commandsArray[i].help}`;
            index++;
            if (index == musicbot.commandsArray.length) {
              if (musicbot.messageHelp) {
                let sent = false;
                msg.author.send(cmdmsg, {
                    code: 'asciidoc'
                  })
                  .then(() => {
                    sent = true;
                  });
                setTimeout(() => {
                  if (!sent) return msg.channel.send(cmdmsg, {
                    code: 'asciidoc'
                  });
                }, 500);
              } else {
                return msg.channel.send(cmdmsg, {
                  code: 'asciidoc'
                });
              };
            }
          };
        };
      };
    } else if (musicbot.commands.has(command) || musicbot.aliases.has(command)) {
      if (msg.channel.permissionsFor(msg.guild.me)
        .has('EMBED_LINKS')) {
        const embed = new Discord.RichEmbed();
        command = musicbot.commands.get(command) || musicbot.aliases.get(command);
        if (command.exclude) return msg.channel.send(musicbot.note('fail', `${suffix} is not a valid command!`));
        embed.setAuthor(command.name, msg.client.user.avatarURL);
        embed.setDescription(command.help);
        if (command.alt.length > 0) embed.addField(`Aliases`, command.alt.join(", "), musicbot.inlineEmbeds);
        if (command.usage && typeof command.usage == "string") embed.addFieldd(`Usage`, command.usage.replace(/{{prefix}})/g, musicbot.botPrefix), musicbot.inlineEmbeds);
        embed.setColor(musicbot.embedColor);
        msg.channel.send({
          embed
        });
      } else {
        command = musicbot.commands.get(command) || musicbot.aliases.get(command);
        if (command.exclude) return msg.channel.send(musicbot.note('fail', `${suffix} is not a valid command!`));
        var cmdhelp = `= ${command.name} =\n`;
        cmdhelp + `\n${command.help}`;
        if (command.usage !== null) cmdhelp = cmdhelp + `\nUsage: ${command.usage.replace(/{{prefix}})/g, musicbot.botPrefix)}`;
        if (command.alt.length > 0) cmdhelp = cmdhelp + `\nAliases: ${command.alt.join(", ")}`;
        msg.channel.send(cmdhelp, {
          code: 'asciidoc'
        });
      };
    } else {
      msg.channel.send(musicbot.note('fail', `${suffix} is not a valid command!`));
    };
  };

  musicbot.skipFunction = (msg, suffix, args) => {
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) return msg.channel.send(musicbot.note('fail', 'No music being played.'));
    const queue = musicbot.getQueue(msg.guild.id);
    if (!musicbot.canSkip(msg.member, queue)) return msg.channel.send(musicbot.note('fail', `You cannot skip this as you didn't queue it.`));

    if (musicbot.queues.get(msg.guild.id).loop == "song") return msg.channel.send(musicbot.note("fail", "Cannot skip while loop is set to single."));

    const dispatcher = voiceConnection.player.dispatcher;
    if (!dispatcher || dispatcher === null) {
      if (musicbot.logging) return console.log(new Error(`dispatcher null on skip cmd [${msg.guild.name}] [${msg.author.username}]`));
      return msg.channel.send(musicbot.note("fail", "Something went wrong running skip."));
    };
    if (voiceConnection.paused) dispatcher.end();
    dispatcher.end();
    msg.channel.send(musicbot.note("note", "Skipped song."));
  };

  musicbot.pauseFunction = (msg, suffix, args) => {
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) return msg.channel.send(musicbot.note('fail', 'No music being played.'));
    if (!musicbot.isAdmin(msg.member) && !musicbot.anyoneCanPause) return msg.channel.send(musicbot.note('fail', 'You cannot pause queues.'));

    const dispatcher = voiceConnection.player.dispatcher;
    if (dispatcher.paused) return msg.channel.send(musicbot.note(`fail`, `Music already paused!`))
    else dispatcher.pause();
    msg.channel.send(musicbot.note('note', 'Playback paused.'));
  };

  musicbot.resumeFunction = (msg, suffix, args) => {
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) return msg.channel.send(musicbot.note('fail', 'No music is being played.'));
    if (!musicbot.isAdmin(msg.member) && !musicbot.anyoneCanPause) return msg.channel.send(musicbot.note('fail', `You cannot resume queues.`));

    const dispatcher = voiceConnection.player.dispatcher;
    if (!dispatcher.paused) return msg.channel.send(musicbot.note('fail', `Music already playing.`))
    else dispatcher.resume();
    msg.channel.send(musicbot.note('note', 'Playback resumed.'));
  };

  musicbot.leaveFunction = (msg, suffix) => {
    if (musicbot.isAdmin(msg.member) || musicbot.anyoneCanLeave === true) {
      const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
      if (voiceConnection === null) return msg.channel.send(musicbot.note('fail', 'I\'m not in a voice channel.'));
      musicbot.emptyQueue(msg.guild.id);

      if (!voiceConnection.player.dispatcher) return;
      voiceConnection.player.dispatcher.end();
      voiceConnection.disconnect();
      msg.channel.send(musicbot.note('note', 'Successfully left the voice channel.'));

      setTimeout(() => {
        let vc = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
        if (!vc.player.dispatcher) return;
        try {
          vc.player.dispatcher.end();
          vc.disconnect();
        } catch (e) {
          console.error(`[leaevCmd] [${msg.guild.name}] ${e.stack}`);
        }
      }, 2500);
    } else {
      const chance = Math.floor((Math.random() * 100) + 1);
      if (chance <= 10) return msg.channel.send(musicbot.note('fail', `I'm afraid I can't let you do that, ${msg.author.username}.`))
      else return msg.channel.send(musicbot.note('fail', 'Sorry, you\'re not allowed to do that.'));
    }
  }

  musicbot.npFunction = (msg, suffix, args) => {
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    const queue = musicbot.getQueue(msg.guild.id, true);
    if (voiceConnection === null && queue.length > 0) return msg.channel.send(musicbot.note('fail', 'No music is being played, but an ongoing queue is avainable.'));
    else if (voiceConnection === null) return msg.channel.send(musicbot.note('fail', 'No music is being played.'));
    const dispatcher = voiceConnection.player.dispatcher;

    if (musicbot.queues.get(msg.guild.id).songs.length <= 0) return msg.channel.send(musicbot.note('note', 'Queue empty.'));

    if (msg.channel.permissionsFor(msg.guild.me)
      .has('EMBED_LINKS')) {
      const embed = new Discord.RichEmbed();
      try {
        embed.setAuthor('Now Playing', client.user.avatarURL);
        var songTitle = queue.last.title.replace(/\\/g, '\\\\')
          .replace(/\`/g, '\\`')
          .replace(/\*/g, '\\*')
          .replace(/_/g, '\\_')
          .replace(/~/g, '\\~')
          .replace(/`/g, '\\`');
        embed.setColor(musicbot.embedColor);
        embed.addField(queue.last.channelTitle, `[${songTitle}](${queue.last.url})`, musicbot.inlineEmbeds);
        embed.addField("Queued On", queue.last.queuedOn, musicbot.inlineEmbeds);
        if (!musicbot.bigPicture) embed.setThumbnail(`https://img.youtube.com/vi/${queue.last.id}/maxresdefault.jpg`);
        if (musicbot.bigPicture) embed.setImage(`https://img.youtube.com/vi/${queue.last.id}/maxresdefault.jpg`);
        const resMem = client.users.get(queue.last.requester);
        if (musicbot.requesterName && resMem) embed.setFooter(`Requested by ${client.users.get(queue.last.requester).username}`, queue.last.requesterAvatarURL);
        if (musicbot.requesterName && !resMem) embed.setFooter(`Requested by \`UnknownUser (ID: ${queue.last.requester})\``, queue.last.requesterAvatarURL);
        msg.channel.send({
          embed
        });
      } catch (e) {
        console.error(`[${msg.guild.name}] [npCmd] ` + e.stack);
      };
    } else {
      try {
        var songTitle = queue.last.title.replace(/\\/g, '\\\\')
          .replace(/\`/g, '\\`')
          .replace(/\*/g, '\\*')
          .replace(/_/g, '\\_')
          .replace(/~/g, '\\~')
          .replace(/`/g, '\\`');
        msg.channel.send(`Now Playing: **${songTitle}**\nRequested By: ${client.users.get(queue.last.requester).username}\nQueued On: ${queue.last.queuedOn}`)
      } catch (e) {
        console.error(`[${msg.guild.name}] [npCmd] ` + e.stack);
      };
    }
  };

  musicbot.queueFunction = (msg, suffix, args) => {
    if (!musicbot.queues.has(msg.guild.id)) return msg.channel.send(musicbot.note("fail", "Could not find a queue for this server."));
    else if (musicbot.queues.get(msg.guild.id).songs.length <= 0) return msg.channel.send(musicbot.note("fail", "Queue is empty."));
    const queue = musicbot.queues.get(msg.guild.id);
    if (suffix) {
      let video = queue.songs.find(s => s.position == parseInt(suffix) - 1);
      if (!video) return msg.channel.send(musicbot.note("fail", "Couldn't find that video."));
      const embed = new Discord.RichEmbed()
      .setAuthor('Queued Song', client.user.avatarURL)
      .setColor(musicbot.embedColor)
      .addField(video.channelTitle, `[${video.title.replace(/\\/g, '\\\\').replace(/\`/g, '\\`').replace(/\*/g, '\\*').replace(/_/g, '\\_').replace(/~/g, '\\~').replace(/`/g, '\\`')}](${video.url})`, musicbot.inlineEmbeds)
      .addField("Queued On", video.queuedOn, musicbot.inlineEmbeds)
      .addField("Position", video.position + 1, musicbot.inlineEmbeds);
      if (!musicbot.bigPicture) embed.setThumbnail(`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`);
      if (musicbot.bigPicture) embed.setImage(`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`);
      const resMem = client.users.get(video.requester);
      if (musicbot.requesterName && resMem) embed.setFooter(`Requested by ${client.users.get(video.requester).username}`, video.requesterAvatarURL);
      if (musicbot.requesterName && !resMem) embed.setFooter(`Requested by \`UnknownUser (ID: ${video.requester})\``, video.requesterAvatarURL);
      msg.channel.send({embed});
    } else {
      if (queue.songs.length > 11) {
        let pages = [];
        let page = 1;
        const newSongs = queue.songs.musicArraySort(10);
        newSongs.forEach(s => {
          var i = s.map((video, index) => (
            `**${video.position + 1}:** __${video.title.replace(/\\/g, '\\\\').replace(/\`/g, '\\`').replace(/\*/g, '\\*').replace(/_/g, '\\_').replace(/~/g, '\\~').replace(/`/g, '\\`')}__`
          )).join('\n\n');
          if (i !== undefined) pages.push(i)
        });

        const embed = new Discord.RichEmbed();
        embed.setAuthor('Queued Songs', client.user.avatarURL);
        embed.setColor(musicbot.embedColor);
        embed.setFooter(`Page ${page} of ${pages.length}`);
        embed.setDescription(pages[page - 1]);
        msg.channel.send(embed).then(m => {
          m.react('⏪').then( r => {
            m.react('⏩')
            let forwardsFilter = m.createReactionCollector((reaction, user) => reaction.emoji.name === '⏩' && user.id === msg.author.id, { time: 120000 });
            let backFilter = m.createReactionCollector((reaction, user) => reaction.emoji.name === '⏪' && user.id === msg.author.id, { time: 120000 });

            forwardsFilter.on('collect', r => {
              if (page === pages.length) return;
              page++;
              embed.setDescription(pages[page - 1]);
              embed.setFooter(`Page ${page} of ${pages.length}`, msg.author.displayAvatarURL);
              m.edit(embed);
            })
            backFilter.on('collect', r => {
              if (page === 1) return;
              page--;
              embed.setDescription(pages[page - 1]);
              embed.setFooter(`Page ${page} of ${pages.length}`);
              m.edit(embed);
            })
          })
        })
      } else {
        var newSongs = musicbot.queues.get(msg.guild.id).songs.map((video, index) => (`**${video.position + 1}:** __${video.title.replace(/\\/g, '\\\\').replace(/\`/g, '\\`').replace(/\*/g, '\\*').replace(/_/g, '\\_').replace(/~/g, '\\~').replace(/`/g, '\\`')}__`)).join('\n\n');
        const embed = new Discord.RichEmbed();
        embed.setAuthor('Queued Songs', client.user.avatarURL);
        embed.setColor(musicbot.embedColor);
        embed.setDescription(newSongs);
        embed.setFooter(`Page 1 of 1`, msg.author.displayAvatarURL);
        return msg.channel.send(embed);
      };
    };
  };

  musicbot.searchFunction = (msg, suffix, args) => {
    if (msg.member.voiceChannel === undefined) return msg.channel.send(musicbot.note('fail', `You're not in a voice channel~`));
    if (!suffix) return msg.channel.send(musicbot.note('fail', 'No video specified!'));
    const queue = musicbot.getQueue(msg.guild.id);
    if (queue.songs.length >= musicbot.maxQueueSize && musicbot.maxQueueSize !== 0) return msg.channel.send(musicbot.note('fail', 'Maximum queue size reached!'));

    let searchstring = suffix.trim();
    msg.channel.send(musicbot.note('search', `Searching: \`${searchstring}\``))
      .then(response => {
        musicbot.searcher.search(searchstring, {
            type: 'video'
          })
          .then(searchResult => {
            if (!searchResult.totalResults || searchResult.totalResults === 0) return response.edit(musicbot.note('fail', 'Failed to get search results.'));

            const startTheFun = async (videos, max) => {
              if (msg.channel.permissionsFor(msg.guild.me).has('EMBED_LINKS')) {
                const embed = new Discord.RichEmbed();
                embed.setTitle(`Choose Your Video`);
                embed.setColor(musicbot.embedColor);
                var index = 0;
                videos.forEach(function(video) {
                  index++;
                  embed.addField(`${index} (${video.channelTitle})`, `[${musicbot.note('font', video.title)}](${video.url})`, musicbot.inlineEmbeds);
                });
                embed.setFooter(`Search by: ${msg.author.username}`, msg.author.displayAvatarURL);
                msg.channel.send({
                  embed
                })
                .then(firstMsg => {
                  var filter = null;
                  if (max === 0) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 1) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 2) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 3) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 4) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 5) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 6) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 7) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.includes('8') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 8) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.includes('8') ||
                    m.content.includes('9') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 9) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.includes('8') ||
                    m.content.includes('9') ||
                    m.content.includes('10') ||
                    m.content.trim() === (`cancel`);
                  }
                  msg.channel.awaitMessages(filter, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                  })
                  .then(collected => {
                    const newColl = Array.from(collected);
                    const mcon = newColl[0][1].content;

                    if (mcon === "cancel") return firstMsg.edit(musicbot.note('note', 'Searching canceled.'));
                    const song_number = parseInt(mcon) - 1;
                    if (song_number >= 0) {
                      firstMsg.delete();

                      videos[song_number].requester == msg.author.id;
                      videos[song_number].position = queue.songs.length ? queue.songs.length : 0;
                      var embed = new Discord.RichEmbed();
                      embed.setAuthor('Adding To Queue', client.user.avatarURL);
                      var songTitle = videos[song_number].title.replace(/\\/g, '\\\\')
                      .replace(/\`/g, '\\`')
                      .replace(/\*/g, '\\*')
                      .replace(/_/g, '\\_')
                      .replace(/~/g, '\\~')
                      .replace(/`/g, '\\`');
                      embed.setColor(musicbot.embedColor);
                      embed.addField(videos[song_number].channelTitle, `[${songTitle}](${videos[song_number].url})`, musicbot.inlineEmbeds);
                      embed.addField("Queued On", videos[song_number].queuedOn, musicbot.inlineEmbeds);
                      if (!musicbot.bigPicture) embed.setThumbnail(`https://img.youtube.com/vi/${videos[song_number].id}/maxresdefault.jpg`);
                      if (musicbot.bigPicture) embed.setImage(`https://img.youtube.com/vi/${videos[song_number].id}/maxresdefault.jpg`);
                      const resMem = client.users.get(videos[song_number].requester);
                      if (musicbot.requesterName && resMem) embed.setFooter(`Requested by ${client.users.get(videos[song_number].requester).username}`, videos[song_number].requesterAvatarURL);
                      if (musicbot.requesterName && !resMem) embed.setFooter(`Requested by \`UnknownUser (ID: ${videos[song_number].requester})\``, videos[song_number].requesterAvatarURL);
                      msg.channel.send({
                        embed
                      }).then(() => {
                        queue.songs.push(videos[song_number]);
                        if (queue.songs.length === 1 || !client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id)) musicbot.executeQueue(msg, queue);
                      })
                      .catch(console.log);
                    };
                  })
                  .catch(collected => {
                    if (collected.toString()
                    .match(/error|Error|TypeError|RangeError|Uncaught/)) return firstMsg.edit(`\`\`\`xl\nSearching canceled. ${collected}\n\`\`\``);
                    return firstMsg.edit(`\`\`\`xl\nSearching canceled.\n\`\`\``);
                  });
                })
              } else {
                const vids = videos.map((video, index) => (
                  `**${index + 1}:** __${video.title.replace(/\\/g, '\\\\').replace(/\`/g, '\\`').replace(/\*/g, '\\*').replace(/_/g, '\\_').replace(/~/g, '\\~').replace(/`/g, '\\`')}__`
                )).join('\n\n');
                msg.channel.send(`\`\`\`\n= Pick Your Video =\n${vids}\n\n= Say Cancel To Cancel =`).then(firstMsg => {
                  var filter = null;
                  if (max === 0) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 1) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 2) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 3) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 4) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 5) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 6) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 7) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.includes('8') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 8) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.includes('8') ||
                    m.content.includes('9') ||
                    m.content.trim() === (`cancel`);
                  } else if (max === 9) {
                    filter = m => m.author.id === msg.author.id &&
                    m.content.includes('1') ||
                    m.content.includes('2') ||
                    m.content.includes('3') ||
                    m.content.includes('4') ||
                    m.content.includes('5') ||
                    m.content.includes('6') ||
                    m.content.includes('7') ||
                    m.content.includes('8') ||
                    m.content.includes('9') ||
                    m.content.includes('10') ||
                    m.content.trim() === (`cancel`);
                  }
                  msg.channel.awaitMessages(filter, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                  })
                  .then(collected => {
                    const newColl = Array.from(collected);
                    const mcon = newColl[0][1].content;

                    if (mcon === "cancel") return firstMsg.edit(musicbot.note('note', 'Searching canceled.'));
                    const song_number = parseInt(mcon) - 1;
                    if (song_number >= 0) {
                      firstMsg.delete();

                      videos[song_number].requester == msg.author.id;
                      videos[song_number].position = queue.songs.length ? queue.songs.length : 0;
                      var embed = new Discord.RichEmbed();
                      embed.setAuthor('Adding To Queue', client.user.avatarURL);
                      var songTitle = videos[song_number].title.replace(/\\/g, '\\\\')
                      .replace(/\`/g, '\\`')
                      .replace(/\*/g, '\\*')
                      .replace(/_/g, '\\_')
                      .replace(/~/g, '\\~')
                      .replace(/`/g, '\\`');
                      embed.setColor(musicbot.embedColor);
                      embed.addField(videos[song_number].channelTitle, `[${songTitle}](${videos[song_number].url})`, musicbot.inlineEmbeds);
                      embed.addField("Queued On", videos[song_number].queuedOn, musicbot.inlineEmbeds);
                      if (!musicbot.bigPicture) embed.setThumbnail(`https://img.youtube.com/vi/${videos[song_number].id}/maxresdefault.jpg`);
                      if (musicbot.bigPicture) embed.setImage(`https://img.youtube.com/vi/${videos[song_number].id}/maxresdefault.jpg`);
                      const resMem = client.users.get(videos[song_number].requester);
                      if (musicbot.requesterName && resMem) embed.setFooter(`Requested by ${client.users.get(videos[song_number].requester).username}`, videos[song_number].requesterAvatarURL);
                      if (musicbot.requesterName && !resMem) embed.setFooter(`Requested by \`UnknownUser (ID: ${videos[song_number].requester})\``, videos[song_number].requesterAvatarURL);
                      msg.channel.send({
                        embed
                      }).then(() => {
                        queue.songs.push(videos[song_number]);
                        if (queue.songs.length === 1 || !client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id)) musicbot.executeQueue(msg, queue);
                      })
                      .catch(console.log);
                    };
                  })
                  .catch(collected => {
                    if (collected.toString()
                    .match(/error|Error|TypeError|RangeError|Uncaught/)) return firstMsg.edit(`\`\`\`xl\nSearching canceled. ${collected}\n\`\`\``);
                    return firstMsg.edit(`\`\`\`xl\nSearching canceled.\n\`\`\``);
                  });
                })
              }
            };

            const max = searchResult.totalResults >= 10 ? 9 : searchResult.totalResults - 1;
            var videos = [];
            for (var i = 0; i < 99; i++) {
              var result = searchResult.currentPage[i];
              result.requester = msg.author.id;
              if (musicbot.requesterName) result.requesterAvatarURL = msg.author.displayAvatarURL;
              result.channelURL = `https://www.youtube.com/channel/${result.channelId}`;
              result.queuedOn = new Date().toLocaleDateString(musicbot.dateLocal, { weekday: 'long', hour: 'numeric' });
              videos.push(result);
              if (i === max) {
                i = 101;
                startTheFun(videos, max);
              }
            };
          });
      })
      .catch(console.log);
  };

  musicbot.volumeFunction = (msg, suffix, args) => {
    const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
    if (voiceConnection === null) return msg.channel.send(musicbot.note('fail', 'No music is being played.'));
    if (!musicbot.canAdjust(msg.member, musicbot.queues.get(msg.guild.id))) return msg.channel.send(musicbot.note('fail', `Only admins or DJ's may change volume.`));
    const dispatcher = voiceConnection.player.dispatcher;

    if (!suffix) return msg.channel.send(musicbot.note('fail', 'No volume specified.'));
    suffix = parseInt(suffix);
    if (suffix > 200 || suffix <= 0) return msg.channel.send(musicbot.note('fail', 'Volume out of range, must be within 1 to 200'));

    dispatcher.setVolume((suffix / 100));
    musicbot.queues.get(msg.guild.id).volume = suffix;
    msg.channel.send(musicbot.note('note', `Volume changed to ${suffix}%.`));
  };

  musicbot.clearFunction = (msg, suffix, args) => {
    if (!musicbot.queues.has(msg.guild.id)) return msg.channel.send(musicbot.note("fail", "No queue found for this server."));
    musicbot.emptyQueue(msg.guild.id).then(res => {
      msg.channel.send(musicbot.note("note", "Queue cleared."));
      const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
      if (voiceConnection !== null) {
        const dispatcher = voiceConnection.player.dispatcher;
        if (!dispatcher || dispatcher === null) {
          if (musicbot.logging) return console.log(new Error(`dispatcher null on skip cmd [${msg.guild.name}] [${msg.author.username}]`));
          return msg.channel.send(musicbot.note("fail", "Something went wrong."));
        };
        if (voiceConnection.paused) dispatcher.end();
        dispatcher.end();
      }
    }).catch(res => {
      console.error(new Error(`[clearCmd] [${msg.guild.id}] ${res}`))
      return msg.channel.send(musicbot.note("fail", "Something went wrong clearing the queue."));
    })
  };

  musicbot.removeFunction = (msg, suffix, args) => {
    if (!musicbot.queues.has(msg.guild.id)) return msg.channel.send(musicbot.note('fail', `No queue for this server found!`));
    if (!suffix)  return msg.channel.send(musicbot.note("fail", "No video position given."));
    if (!musicbot.canSkip(msg.member, musicbot.queues.get(msg.guild.id))) return msg.channel.send(musicbot.note("fail", "You can't remove that as you didn't queue it."));
    if (parseInt(suffix - 1) == 0) return msg.channel.send(musicbot.note("fail", "You cannot clear the currently playing music."));
    let test = musicbot.queues.get(msg.guild.id).songs.find(x => x.position == parseInt(suffix - 1));
    if (test) {
      let newq = musicbot.queues.get(msg.guild.id).songs.filter(s => s !== test);
      musicbot.updatePositions(newq, msg.guild.id).then(res => {
        musicbot.queues.get(msg.guild.id).songs = res;
        msg.channel.send(musicbot.note("note", `Removed:  \`${test.title.replace(/`/g, "'")}\``));
      })
    } else {
      msg.channel.send(musicbot.note("fail", "Couldn't find that video or something went wrong."));
    }
  };

  musicbot.loopFunction = (msg, suffix, args) => {
    if (!musicbot.queues.has(msg.guild.id)) return msg.channel.send(musicbot.note('fail', `No queue for this server found!`));
    if (musicbot.queues.get(msg.guild.id).loop == "none" || musicbot.queues.get(msg.guild.id).loop == null) {
      musicbot.queues.get(msg.guild.id).loop = "song";
      msg.channel.send(musicbot.note('note', 'Looping single enabled! :repeat_one:'));
    } else if (musicbot.queues.get(msg.guild.id).loop == "song") {
      musicbot.queues.get(msg.guild.id).loop = "queue";
      msg.channel.send(musicbot.note('note', 'Looping queue enabled! :repeat:'));
    } else if (musicbot.queues.get(msg.guild.id).loop == "queue") {
      musicbot.queues.get(msg.guild.id).loop = "none";
      msg.channel.send(musicbot.note('note', 'Looping disabled! :arrow_forward:'));
      const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
      const dispatcher = voiceConnection.player.dispatcher;
      let wasPaused = dispatcher.paused;
      if (wasPaused) dispatcher.pause();
      let newq = musicbot.queues.get(msg.guild.id).songs.slice(musicbot.queues.get(msg.guild.id).last.position - 1);
      if (newq !== musicbot.queues.get(msg.guild.id).songs) musicbot.updatePositions(newq, msg.guild.id).then(res => { musicbot.queues.get(msg.guild.id).songs = res; })
      if (wasPaused) dispatcher.resume();
    }
  };

  musicbot.loadCommand = (obj) => {
    return new Promise((resolve, reject) => {
      let props = {
        disabled: obj.disabled,
        run: obj.run,
        alt: obj.alt,
        help: obj.help,
        name: obj.name,
        exclude: obj.exclude,
        masked: obj.masked
      };
      if (obj.alt.length > 0) {
        obj.alt.forEach((a) => {
          musicbot.aliases.set(a, props);
        })
      };
      musicbot.commands.set(obj.name, props);
      musicbot.commandsArray.push(props);
      if (musicbot.logging) console.log(`[MUSIC_LOADCMD] Loaded ${obj.name}`);
      resolve(musicbot.commands.get(obj.name));
    });
  }

  musicbot.executeQueue = (msg, queue) => {
    if (queue.songs.length <= 0) {
      msg.channel.send(musicbot.note('note', 'Playback finished~'));
      musicbot.emptyQueue(msg.guild.id);
      const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
      if (voiceConnection !== null) return voiceConnection.disconnect();
    };

    new Promise((resolve, reject) => {
        const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
        if (voiceConnection === null) {
          if (msg.member.voiceChannel && msg.member.voiceChannel.joinable) {
            msg.member.voiceChannel.join()
              .then(connection => {
                resolve(connection);
              })
              .catch((error) => {
                console.log(error);
              });
          } else if (!msg.member.voiceChannel.joinable) {
            msg.channel.send(musicbot.note('fail', 'I do not have permission to join your voice channel!'))
            reject();
          } else {
            musicbot.emptyQueue(msg.guild.id).then(() => {
              reject();
            })
          }
        } else {
          resolve(voiceConnection);
        }
      }).then(connection => {
        let video;
        if (!queue.last) {
          video = queue.songs[0];
        } else {
          if (queue.loop == "queue") {
            video = queue.songs.find(s => s.position == queue.last.position + 1);
            if (!video || video && !video.url) video = queue.songs[0];
          } else if (queue.loop == "single") {
            video = queue.last;
          } else {
            video = queue.songs.find(s => s.position == queue.last.position + 1);
          };
        }
        if (!video) {
          video = queue.songs[0];
          if (!video) {
            msg.channel.send(musicbot.note('note', 'Playback finished!'));
            musicbot.emptyQueue(msg.guild.id);
            const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
            if (voiceConnection !== null) return voiceConnection.disconnect();
          }
        }

        try {
          musicbot.setLast(msg.guild.id, video);

          let dispatcher = connection.playStream(ytdl(video.url, {
            filter: 'audioonly'
          }), {
            volume: (musicbot.queues.get(msg.guild.id).volume / 100)
          })

          connection.on('error', (error) => {
            console.log(`Dispatcher/connection: ${error}`);
            if (msg && msg.channel) msg.channel.send(musicbot.note('fail', `Something went wrong with the connection. Retrying queue...`));
            console.error(error);
            musicbot.executeQueue(msg, musicbot.queues.get(msg.guild.id));
          });

          dispatcher.on('error', (error) => {
            console.log(`Dispatcher: ${error.stack}`);
            if (msg && msg.channel) msg.channel.send(musicbot.note('fail', `Something went wrong while playing music. Retrying queue...`));
            console.error(error);
            musicbot.executeQueue(msg, musicbot.queues.get(msg.guild.id));
          });

          dispatcher.on('end', () => {
            setTimeout(() => {
              let loop = musicbot.queues.get(msg.guild.id).loop;
              if (musicbot.queues.get(msg.guild.id).songs.length > 0) {
                if (loop == "none" || loop == null) {
                  musicbot.queues.get(msg.guild.id).songs.shift();
                  musicbot.updatePositions(musicbot.queues.get(msg.guild.id).songs, msg.guild.id).then(res => {
                    musicbot.queues.get(msg.guild.id).songs = res;
                    musicbot.executeQueue(msg, musicbot.queues.get(msg.guild.id));
                  }).catch(() => { console.error(new Error("something went wrong moving the queue")); });
                } else if (loop == "queue" || loop == "song") {
                  musicbot.executeQueue(msg, musicbot.queues.get(msg.guild.id));
                };
              } else if (musicbot.queues.get(msg.guild.id).songs.length <= 0) {
                if (msg && msg.channel) msg.channel.send(musicbot.note('note', 'Playback finished.'));
                musicbot.emptyQueue(msg.guild.id);
                const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
                if (voiceConnection !== null) return voiceConnection.disconnect();
              }
            }, 1250);
          });
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });

  }

  musicbot.setPrefix = (server, prefix) => {
    return new Promise((resolve, reject) => {
      if (!server || !prefix) reject(new Error("invalid argument"));
      if (typeof server !== 'string' || typeof prefix !== 'string') reject(new TypeError("did not equal string"));

      if (typeof musicbot.botPrefix === "object") {
        musicbot.botPrefix.set(server, prefix);
      } else {
        musicbot.botPrefix = new Map();
        musicbot.botPrefix.set(server, prefix);
      }
    });
  };

  musicbot.note = (type, text) => {
    if (type === 'wrap') {
      let ntext = text
      .replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203))
      .replace(client.token, 'REMOVED');
      return '```\n' + ntext + '\n```';
    } else if (type === 'note') {
      return ':musical_note: | ' + text.replace(/`/g, '`' + String.fromCharCode(8203));
    } else if (type === 'search') {
      return ':mag: | ' + text.replace(/`/g, '`' + String.fromCharCode(8203));
    } else if (type === 'fail') {
      return ':no_entry_sign: | ' + text.replace(/`/g, '`' + String.fromCharCode(8203));
    } else if (type === 'font') {
      return text.replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203))
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`');
    } else {
      console.error(new Error(`${type} was an invalid type`));
    }
  };

  musicbot.loadCommands = async () => {
    try {
      await musicbot.loadCommand(musicbot.play);
      await musicbot.loadCommand(musicbot.remove);
      await musicbot.loadCommand(musicbot.help);
      await musicbot.loadCommand(musicbot.skip);
      await musicbot.loadCommand(musicbot.leave);
      await musicbot.loadCommand(musicbot.search);
      await musicbot.loadCommand(musicbot.pause);
      await musicbot.loadCommand(musicbot.resume);
      await musicbot.loadCommand(musicbot.volume);
      await musicbot.loadCommand(musicbot.queue);
      await musicbot.loadCommand(musicbot.loop);
      await musicbot.loadCommand(musicbot.clearqueue);
      await musicbot.loadCommand(musicbot.np);
    } catch (e) {
      throw e;
    };
  }
  musicbot.loadCommands();

/*client.on('message', message => {	
	if(message.author.bot) return;
	if(message.content.indexOf(prefix) !== 0) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args[0];
		
	//New version commands
	if(command === "szerverek") {
		let szoveg = "**A következő szervereken vagyok elérhető:** \n\n";
		client.guilds.forEach(guild => {
			szoveg += "Szerver neve: **" + guild.name + "**\n";	
		});
		
		message.channel.send(message.author + " " + szoveg);
	}
	
	//--------------------
	
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
	
	if(command == "frissit") {
		if(message.guild.id == 326001549711114241) {
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
			message.channel.sendMessage(message.author + " Átírva!").then(sent => {
				message.delete(1);
				sent.delete(5000);
			});
		}
	}
});*/

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

class Music {
    constructor(client, options) {
      // Data Objects
      this.commands = new Map();
      this.commandsArray = [];
      this.aliases = new Map();
      this.queues = new Map();

      // Play Command options
      this.play = {
        disabled: Boolean((options && options.play && options.play.disabled)),
        run: "playFunction",
        alt: (options && options.play && options.play.alt) || [],
        help: (options && options.play && options.play.help) || "Queue a song/playlist by URL or name.",
        name: (options && options.play && options.play.name) || "play",
        usage: (options && options.play && options.play.usage) || null,
        exclude: Boolean((options && options.play && options.play.exclude)),
        masked: "play"
      };

      // Help Command options
      this.help = {
        disabled: Boolean((options && options.help && options.help.disabled)),
        run: "helpFunction",
        alt: (options && options.help && options.help.alt) || [],
        help: (options && options.help && options.help.help) || "Help for commands.",
        name: (options && options.help && options.help.name) || "help",
        usage: (options && options.help && options.help.usage) || null,
        exclude: Boolean((options && options.help && options.help.exclude)),
        masked: "help"
      };

      // Pause Command options
      this.pause = {
        disabled: Boolean((options && options.pause && options.pause.disabled)),
        run: "pauseFunction",
        alt: (options && options.pause && options.pause.alt) || [],
        help: (options && options.pause && options.pause.help) || "Pauses playing music.",
        name: (options && options.pause && options.pause.name) || "pause",
        usage: (options && options.pause && options.pause.usage) || null,
        exclude: Boolean((options && options.pause && options.pause.exclude)),
        masked: "pause"
      };

      // Resume Command options
      this.resume = {
        disabled: Boolean((options && options.resume && options.resume.disabled)),
        run: "resumeFunction",
        alt: (options && options.resume && options.resume.alt) || [],
        help: (options && options.resume && options.resume.help) || "Resumes a paused queue.",
        name: (options && options.resume && options.resume.name) || "resume",
        usage: (options && options.resume && options.resume.usage) || null,
        exclude: Boolean((options && options.resume && options.resume.exclude)),
        masked: "resume"
      };

      // Leave Command options
      this.leave = {
        disabled: Boolean((options && options.leave && options.leave.disabled)),
        run: "leaveFunction",
        alt: (options && options.leave && options.leave.alt) || [],
        help: (options && options.leave && options.leave.help) || "Leaves the voice channel.",
        name: (options && options.leave && options.leave.name) || "leave",
        usage: (options && options.leave && options.leave.usage) || null,
        exclude: Boolean((options && options.leave && options.leave.exclude)),
        masked: "leave"
      };

      // Queue Command options
      this.queue = {
        disabled: Boolean((options && options.queue && options.queue.disabled)),
        run: "queueFunction",
        alt: (options && options.queue && options.queue.alt) || [],
        help: (options && options.queue && options.queue.help) || "View the current queue.",
        name: (options && options.queue && options.queue.name) || "queue",
        usage: (options && options.queue && options.queue.usage) || null,
        exclude: Boolean((options && options.queue && options.queue.exclude)),
        masked: "queue"
      };

      // Nowplaying Command options
      this.np = {
        disabled: Boolean((options && options.np && options.np.disabled)),
        run: "npFunction",
        alt: (options && options.np && options.np.alt) || [],
        help: (options && options.np && options.np.help) || "Shows the now playing text.",
        name: (options && options.np && options.np.name) || "np",
        usage: (options && options.np && options.np.usage) || null,
        exclude: Boolean((options && options.np && options.np.exclude)),
        masked: "np"
      };

      // Loop Command options
      this.loop = {
        disabled: Boolean((options && options.loop && options.loop.disabled)),
        run: "loopFunction",
        alt: (options && options.loop && options.loop.alt) || [],
        help: (options && options.loop && options.loop.help) || "Sets the loop state for the queue.",
        name: (options && options.loop && options.loop.name) || "loop",
        usage: (options && options.loop && options.loop.usage) || null,
        exclude: Boolean((options && options.loop && options.loop.exclude)),
        masked: "loop"
      };

      // Search Command options
      this.search = {
        disabled: Boolean((options && options.search && options.search.disabled)),
        run: "searchFunction",
        alt: (options && options.search && options.search.alt) || [],
        help: (options && options.search && options.search.help) || "Searchs for up to 10 videos from YouTube.",
        name: (options && options.search && options.search.name) || "search",
        usage: (options && options.search && options.search.usage) || null,
        exclude: Boolean((options && options.search && options.search.exclude)),
        masked: "search"
      };

      // Clear Command options
      this.clearqueue = {
        disabled: Boolean((options && options.clear && options.clear.disabled)),
        run: "clearFunction",
        alt: (options && options.clear && options.clear.alt) || [],
        help: (options && options.clear && options.clear.help) || "Clears the entire queue.",
        name: (options && options.clear && options.clear.name) || "clear",
        usage: (options && options.clear && options.clear.usage) || null,
        exclude: Boolean((options && options.clearqueue && options.clearqueue.exclude)),
        masked: "clearqueue"
      };

      // Volume Command options
      this.volume = {
        disabled: Boolean((options && options.volume && options.volume.disabled)),
        run: "volumeFunction",
        alt: (options && options.volume && options.volume.alt) || [],
        help: (options && options.volume && options.volume.help) || "Changes the volume output of the bot.",
        name: (options && options.volume && options.volume.name) || "volume",
        usage: (options && options.volume && options.volume.usage) || null,
        exclude: Boolean((options && options.volume && options.volume.exclude)),
        masked: "volume"
      };

      this.remove = {
        disabled: Boolean((options && options.remove && options.remove.disabled)),
        run: "removeFunction",
        alt: (options && options.remove && options.remove.alt) || [],
        help: (options && options.remove && options.remove.help) || "Remove a song from the queue by position in the queue.",
        name: (options && options.remove && options.remove.name) || "remove",
        usage: (options && options.remove && options.remove.usage) || "{{prefix}}remove [position]",
        exclude: Boolean((options && options.remove && options.remove.exclude)),
        masked: "remove"
      };

      // Skip Command options
      this.skip = {
        disabled: Boolean((options && options.skip && options.skip.disabled)),
        run: "skipFunction",
        alt: (options && options.skip && options.skip.alt) || [],
        help: (options && options.skip && options.skip.help) || "Skip a song or songs with `skip [number]`",
        name: (options && options.skip && options.skip.name) || "skip",
        usage: (options && options.skip && options.skip.usage) || null,
        exclude: Boolean((options && options.skip && options.skip.exclude)),
        masked: "skip"
      };

      this.embedColor = (options && options.embedColor) || 'GREEN';
      // this.anyoneCanJoin = (options && options.anyoneCanJoin);
      this.anyoneCanSkip = Boolean((options && options.anyoneCanSkip));
      this.anyoneCanLeave = Boolean((options && options.anyoneCanLeave));
      this.djRole = (options && options.djRole) || "DJ";
      this.anyoneCanPause = Boolean((options && options.anyoneCanPause));
      this.anyoneCanAdjust = Boolean((options && options.anyoneCanAdjust));
      this.youtubeKey = (options && options.youtubeKey);
      this.botPrefix = (options && options.botPrefix) || "!";
      // this.thumbnailType = (options && options.thumbnailType) || "high";
      this.defVolume = (options && options.defVolume) || 50;
      this.maxQueueSize = (options && options.maxQueueSize) || 50;
      this.ownerOverMember = Boolean((options && options.ownerOverMember));
      this.botAdmins = (options && options.botAdmins) || [];
      this.ownerID = (options && options.ownerID);
      this.logging = Boolean((options && options.logging));
      this.requesterName = Boolean((options && options.requesterName));
      this.inlineEmbeds = Boolean((options && options.inlineEmbeds));
      this.clearOnLeave = Boolean((options && options.clearOnLeave));
      this.messageHelp = Boolean((options && options.messageHelp));
      this.inlineEmbeds = Boolean((options && options.inlineEmbeds));
      this.dateLocal = (options && options.dateLocal) || 'en-US';
      this.bigPicture = Boolean((options && options.bigPicture)) || false

      // Cooldown Settins
      this.cooldown = {
        disabled: Boolean(options && options.cooldown && options.cooldown.disabled),
        timer: parseInt((options && options.cooldown && options.cooldown.timer) || 10000),
        exclude: (options && options.cooldown && options.cooldown.exclude) || ["volume","queue","pause","resume","np"]
      };
      this.recentTalk = new Set();
}
	
/**
    * Updates positions of all songs in a queue.
    * @function doSomething
    * @memberOf my.namespace.Music
    * @param {object} A Discord.js client
    */
    async updatePositions(obj, server) {
      return new Promise((resolve, reject) => {
        if (!obj || typeof obj !== "object") reject();
        let mm = 0;
        var newsongs = [];
        obj.forEach(s => {
          if (s.position !== mm) s.position = mm;
          newsongs.push(s);
          mm++;
        });
        this.queues.get(server).last.position = 0;
        resolve(newsongs);
      });
    };

    isAdmin(member) {
      if (member.roles.find(r => r.name == this.djRole)) return true;
      if (this.ownerOverMember && member.id === this.botOwner) return true;
      if (this.botAdmins.includes(member.id)) return true;
      return member.hasPermission("ADMINISTRATOR");
    };

    canSkip(member, queue) {
      if (this.anyoneCanSkip) return true;
      else if (this.botAdmins.includes(member.id)) return true;
      else if (this.ownerOverMember && member.id === this.botOwner) return true;
      else if (queue.last.requester === member.id) return true;
      else if (this.isAdmin(member)) return true;
      else return false;
    };

    canAdjust(member, queue) {
      if (this.anyoneCanAdjust) return true;
      else if (this.botAdmins.includes(member.id)) return true;
      else if (this.ownerOverMember && member.id === this.botOwner) return true;
      else if (queue.last.requester === member.id) return true;
      else if (this.isAdmin(member)) return true;
      else return false;
    };

    getQueue(server) {
        if (!this.queues.has(server)) {
          this.queues.set(server, {songs: new Array(), last: null, loop: "none", id: server,volume: this.defVolume});
        };
        return this.queues.get(server);
    };

    setLast(server, last) {
      return new Promise((resolve, reject) => {
        if (this.queues.has(server)) {
          let q = this.queues.get(server);
          q.last = last;
          this.queues.set(server, q);
          resolve(this.queues.get(server));
        } else {
          reject("no server queue");
        };
      });
    };

    getLast(server) {
      return new Promise((resolve, reject) => {
        let q = this.queues.has(server) ? this.queues.get(server).last : null;
        if (!q || !q.last) resolve(null)
        else if (q.last) resolve(q.last);
      });
    };

    emptyQueue(server) {
      return new Promise((resolve, reject) => {
        if (!musicbot.queues.has(server)) reject(new Error(`[emptyQueue] no queue found for ${server}`));
        musicbot.queues.set(server, {songs: [], last: null, loop: "none", id: server, volume: this.defVolume});
        resolve(musicbot.queues.get(server));
      });
    };

  }
  var musicbot = new Music(client, options);
  exports.bot = musicbot;

  musicbot.searcher = new YTSearcher(musicbot.youtubeKey);
  musicbot.changeKey = () => {
    return new Promise((resolve, reject) => {
      if (!key || typeof key !== "string") reject("key must be a string");
      musicbot.youtubeKey = key;
      musicbot.searcher.key = key;
      resolve(musicbot);
    });
  };
// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
