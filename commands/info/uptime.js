module.exports = {
    name: "uptime",
    description: "Gives the bot uptime",
    aliases: [],
    options: [],
    permissions: [],
    isExecVoice: false
}
module.exports.run = async (client, Discord, command, args, color) => {
    const ms = require("ms");

    return command.reply({
        content: `\🤖 Uptime!\n> ${ms(client.uptime)}`,
        allowedMentions: {
            repliedUser: false
        }
    });
}