module.exports = {
    name: 'ping',
    description: 'Gives you the bot ping',
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