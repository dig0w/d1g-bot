module.exports = {
    name: "ping",
    description: "Gives the bot ping",
    aliases: [],
    options: [],
    permissions: []
}
module.exports.run = async (client, Discord, message, args, color) => {
    return message.reply({
        content: `🏓  Pong!\n> ${client.ws.ping}ms`,
        allowedMentions: {
            repliedUser: false
        }
    });
}