module.exports = async client => {
    const fs = require("fs");
    const Discord = require('discord.js');

    var commands = [];

    const ccategories = fs.readdirSync("./commands/");
    for(const category of ccategories){
        const commandFiles = fs.readdirSync(`./commands/${category}`).filter(File => File.endsWith(".js"));

        for(const files of commandFiles){
            const command = require(`./commands/${category}/${files}`);

            if(command.name){
                client.commands.set(command.name, command);

            // Permissions
                if (command.permission && Discord.PermissionFlagsBits[command.permission] == undefined) {
                    throw new Error(`Unknown permission: "${command.permission}"`);
                };

                const slahscmd = new Discord.SlashCommandBuilder()
                    .setName(command.name)
                    .setDescription(command.description)
                    .setDefaultMemberPermissions(Discord.PermissionFlagsBits[command.permission])
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
                            if (command.options[i].choices) {
                                slahscmd.addStringOption(option =>
                                    option
                                        .setName(command.options[i].name)
                                        .setDescription(command.options[i].description)
                                        .setRequired(command.options[i].required)
                                        .addChoices(command.options[i].choices[0], command.options[i].choices[1], command.options[i].choices[2])
                                );
                            } else {
                                slahscmd.addStringOption(option => 
                                    option
                                        .setName(command.options[i].name)
                                        .setDescription(command.options[i].description)
                                        .setRequired(command.options[i].required)
                                );
                            };
                        break;
                        case 3:
                            if (command.options[i].maxValue != undefined && command.options[i].minValue != undefined) {
                                slahscmd.addNumberOption(option => 
                                    option
                                        .setName(command.options[i].name)
                                        .setDescription(command.options[i].description)
                                        .setRequired(command.options[i].required)
                                        .setMaxValue(command.options[i].maxValue)
                                        .setMinValue(command.options[i].minValue)
                                );
                            } else {
                                slahscmd.addNumberOption(option => 
                                    option
                                        .setName(command.options[i].name)
                                        .setDescription(command.options[i].description)
                                        .setRequired(command.options[i].required)
                                );
                            };
                        break;
                    };
                };

                commands.push(slahscmd.toJSON());
            };
        };
    };

    const rest = new Discord.REST().setToken(process.env.clientToken);

    await rest.put(
        Discord.Routes.applicationCommands(process.env.clientId),
        { body: commands },
    );

    const eventsFiles = fs.readdirSync("./events/");
    for(const files of eventsFiles){
        require(`./events/${files}`)(client);
    };
}