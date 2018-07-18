const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('Moderátori munka', "https://twitch.tv/teddhun");
    
    i = 0;
    while (true) {
        if(i == 15) {
            client.user.setGame('Összeses szerver: ${client.guilds.size}');
        } else if(i == 30) {
            client.user.setGame('Moderátori munka', "https://twitch.tv/teddhun");
            i = 0;
        }      
        i++;
    }   
});

client.on('message', message => {
    if (message.content === 'ping') {
    	message.channel.send('PONG!');
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
