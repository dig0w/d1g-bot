module.exports = client => {
    const Discord = require("discord.js");
    const color = "#AD8EFB";

    client.on("messageCreate", message => {
        if (!message.content.startsWith(process.env.prefix)) { return };

        var args = message.content.substring(process.env.prefix.length).split(" ").filter(arg => arg != "");

        const command = client.commands.get(args[0]) || client.commands.find(a => a.aliases.includes(args[0]));
            if (!command) { return };
      
        // Options
            var options = "";
            command.options.forEach(option => { if (option.required) { options += `**\`${option.name}\`**`; } else { options += `\`${option.name}\`` } });

            const usageEmbed = new Discord.EmbedBuilder()
                .setDescription(`**Wrong Usage**\n\n> Use: \`${process.env.prefix}${command.name}\`${options}`)
                .setColor(color);

            var member;

            for (let i = 0; i < command.options.length; i++) {
                if (command.options[i].required && !args[i+1]) { return message.reply({ embeds: [usageEmbed], allowedMentions: { repliedUser: false } }) };
                if (command.options[i].required && command.options[i].type == 1 && !message.guild.members.cache.find(member => member.id == args[i+1].substring(3, args[i+1].length-1))) { return message.reply({ embeds: [usageEmbed], allowedMentions: { repliedUser: false } }) };
                if (command.options[i].required && command.options[i].type == 3 && isNaN(args[i+1]) || command.options[i].required && command.options[i].type == 3 && parseInt(args[i+1]) < 0) { return message.reply({ embeds: [usageEmbed], allowedMentions: { repliedUser: false } }) };
                if (command.options[i].required && command.options[i].type == 1) { member = message.guild.members.cache.find(member => member.id == args[i+1].substring(3, args[i+1].length-1)) };
            };

        // Permissions
            if (command.permission) {
                if (Discord.PermissionFlagsBits[command.permission] == undefined) {
                    throw new Error(`Unknown permission: "${command.permission}"`);
                };

                if (member && command.permission == "HIGHER_ROLE" && message.member.roles.highest.rawPosition < member.roles.highest.rawPosition) {
                    return message.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription("**Missing Permissions**\n\n> The member has a higher or equal role to yours")
                                .setColor(color)
                        ],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                } else if (command.permission != "HIGHER_ROLE" && !message.member.permissions.has(Discord.PermissionFlagsBits[command.permission])) {
                    return message.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setDescription(`**Missing Permissions**\n\n> You don't have the required permissions\n> **\`${command.permission}\`**`)
                                .setColor(color)
                        ],
                        allowedMentions: {
                            repliedUser: false
                        }
                    });
                };
            };

        command.run(client, Discord, message, args, color);
    });

    client.on("interactionCreate", async interaction => {
        if (!interaction.isCommand()) { return };

        const command = client.commands.get(interaction.commandName);
            if (!command) { return };

        var args = [];
        args.push(command.name);

        for (let i = 0; i < interaction.options._hoistedOptions.length; i++) {
            args.push("" + interaction.options._hoistedOptions[i].value);
        };

        // Run
        try {
            await command.run(client, Discord, interaction, args, color);
        } catch(err) {
            console.error(err);
            await interaction.reply({ embeds: [
                    new Discord.EmbedBuilder()
                        .setDescription(`Something went wrong... \n> \`${err}\``)
                        .setColor(color)
                ],
                ephemeral: true
            });
        };
    });
}