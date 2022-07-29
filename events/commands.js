module.exports = client => {
    const discord = require('discord.js');

    client.on('interactionCreate', async interaction => {
        if(!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
            if(!command) return;

        // Run
        try{
            await command.run(client, discord, interaction);
        } catch(err){
            console.error(err);
            await interaction.reply({ content: '> There was an error while executing this command!', ephemeral: true });
        };
    });

    client.on('messageCreate', async message => {
        if(!message.content.startsWith(process.env.prefix) || message.author.bot) return;

        var args = message.content.substring(process.env.prefix.length).split(' ').filter(arg => arg != '');

        const command = client.commands.get(args[0]) || client.commands.find(a => a.aliases.includes(args[0]));
            if(!command) return;

        var options = new Map;
        if(command.options){
            for(var i = 0; i < command.options.length; i++){
                if(command.options.length <= i+1){
                    options.set( command.options[i].name, { name: command.options[i].name, type: command.options[i].type, value: args.slice([i+1]).join(' ') } );
                } else{
                    options.set( command.options[i].name, { name: command.options[i].name, type: command.options[i].type, value: args[i+1] } );
                };
            };
        };

        message.options = options;
        message.user = message.author.user;
        message.member = message.author;

        // Options
        if(command.options){
            var msgOptions = '';

            for(var i = 0; i < command.options.length; i++){
                if(command.options[i].required){
                    msgOptions += `\`${command.options[i].name}\` `;
                } else{
                    msgOptions += `|\`${command.options[i].name}\`|`;
                };
            };

            for(var i = 0; i < command.options.length; i++){
                if(command.options[i].required && !args[i+1]){
                    return message.reply({
                        content: `Use:\n> /${command.name} ${msgOptions}`,
                        allowedMentions: { repliedUser: false }
                    });
                } else if(command.options[i].required && command.options[i].type == 10 && !Number(args[i+1])){
                    return message.reply({
                        content: `Use:\n> /${command.name} ${msgOptions}`,
                        allowedMentions: { repliedUser: false }
                    });
                };
            };
        };

        // Permissions
        if(command.default_member_permissions && !message.member.permissions.has(command.default_member_permissions)) return;

        // Run
        try{
            await command.run(client, discord, message);
        } catch(err){
            console.error(err);
            await message.reply({
                content: '> There was an error while executing this command!',
                allowedMentions: {
                    repliedUser: false
                }
            });
        };
    });
}