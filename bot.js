const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Elindult!');
});

client.on('message', message => {
    if (message.content === 'ping') {
    	message.channel.send('PONG!');
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
client.user.setActivity('Moderátori munka', { type: 'WATCHING' });
