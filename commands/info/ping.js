module.exports = {
    name: "ping",
    description: "Gives the bot ping",
    aliases: [],
    options: [],
    permissions: [],
    isExecVoice: false
}
module.exports.run = async (client, Discord, command, args, color) => {
    return command.reply({
        content: `🏓  Pong!\n> ${client.ws.ping}ms`,
        allowedMentions: {
            repliedUser: false
        }
    });
}