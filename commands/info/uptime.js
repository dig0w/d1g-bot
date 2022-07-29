module.exports = {
    name: 'uptime',
    description: 'Gives the bot uptime',
    aliases: []
}
module.exports.run = async (client, discord, interaction) => {
    const ms = require('ms');

    await interaction.reply({
        content: `\🤖 Uptime!\n> ${ms(client.uptime)}`,
        allowedMentions: {
            repliedUser: false
        }
    });
}