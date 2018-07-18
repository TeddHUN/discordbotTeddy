const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('Moderátori munka', "https://twitch.tv/teddhun");
    i = 0;
    setInterval(function(){ 
        i++;
        if(i == 1) {
            client.user.setGame('Moderátori munka', "https://twitch.tv/teddhun");
        } else if(i == 2) {
            i = 0;
            client.user.setGame('Rendszerfrissítés...');
        }
    
    }, 60000); 
   
});

client.on('message', message => {
    if (message.content === 'ping') {
    	message.channel.send('PONG!');
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
