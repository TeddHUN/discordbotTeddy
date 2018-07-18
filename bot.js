const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Elindult!');
    client.user.setStatus("dnd");
    client.user.setGame('Moderátori munka', "https://twitch.tv/teddhun");

    setInterval(function(){    
        client.user.setGame('Fejlesztés alatt!');
        setInterval(function(){    
            client.user.setGame('Moderátori munka', "https://twitch.tv/teddhun");    
            setInterval(function(){    
                client.user.setGame('Készülök..', "https://twitch.tv/teddhun");
            }, 60000);
        }, 60000);        
    }, 60000);
});

client.on('message', message => {
    if (message.content === 'ping') {
    	message.channel.send('PONG!');
  	}
});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
