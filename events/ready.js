module.exports = client => {
    client.on('ready', () => {
        console.log(`🤖 Client ${client.user.tag} is ready!`);

        const { REST } = require('@discordjs/rest');
        const { Routes } = require('discord-api-types/v9');

        const rest = new REST({ version: '9' }).setToken(process.env.clientToken);
    
        (async () => {
            try {
    
                await rest.put(
                    Routes.applicationCommands(process.env.clientId),
                    { body: client.commands },
                );
    
                console.log('✅ Reloaded application commands.');
            } catch (error) {
                console.error(error);
            }
        })();
    });
}