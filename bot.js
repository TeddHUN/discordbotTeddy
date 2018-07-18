const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("online");
    client.user.setGame('Moderátori munka', { type: 'WATCHING' });
    client.SetGameAsync("Események kiírása & Rendszer fenttartása", "https://twitch.tv/teddhun", StreamType.Twitch);
});

client.on('message', message => {
    if (message.content === 'ping') {
    	message.channel.send('PONG!');
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
