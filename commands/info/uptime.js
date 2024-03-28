module.exports = {
    name: "uptime",
    description: "Gives the bot uptime",
    aliases: [],
    options: [],
    permissions: []
}
module.exports.run = async (client, Discord, message, args, color) => {
    const ms = require("ms");

    return message.reply({
        content: `\🤖 Uptime!\n> ${ms(client.uptime)}`,
        allowedMentions: {
            repliedUser: false
        }
    });
}