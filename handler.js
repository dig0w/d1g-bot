module.exports = client => {
    const fs = require("fs");
    const Discord = require('discord.js');

    const ccategories = fs.readdirSync("./commands/");
    for(const category of ccategories){
        const commandFiles = fs.readdirSync(`./commands/${category}`).filter(File => File.endsWith(".js"));

        for(const files of commandFiles){
            const command = require(`./commands/${category}/${files}`);

            if(command.name){
                client.commands.set(command.name, command);

                const slahscmd = new Discord.SlashCommandBuilder()
                    .setName(command.name)
                    .setDescription(command.description)
                    .setDefaultMemberPermissions(Discord.PermissionFlagsBits[command.permissions[0]])
                    .setDMPermission(false);

                for (let i = 0; i < command.options.length; i++) {
                    switch (command.options[i].type) {
                        case 1:
                            slahscmd.addUserOption(option => 
                                option
                                    .setName(command.options[i].name)
                                    .setDescription(command.options[i].description)
                                    .setRequired(command.options[i].required)
                            );
                        break;
                        case 2:
                            slahscmd.addStringOption(option => 
                                option
                                    .setName(command.options[i].name)
                                    .setDescription(command.options[i].description)
                                    .setRequired(command.options[i].required)
                            );
                        break;
                        case 3:
                            slahscmd.addNumberOption(option => 
                                option
                                    .setName(command.options[i].name)
                                    .setDescription(command.options[i].description)
                                    .setRequired(command.options[i].required)
                            );
                        break;
                    };
                };
            };
        };
    };

    const eventsFiles = fs.readdirSync("./events/");
    for(const files of eventsFiles){
        require(`./events/${files}`)(client);
    };
}