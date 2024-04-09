module.exports = {
    name: "clear",
    description: "Clear the messages from a channel",
    aliases: [],
    options: [
        {
            name: "amount",
            description: "Amount to clear",
            type: 3,
            required: true,
            maxValue: 100,
            minValue: 0
        }
    ],
    permission: "ManageChannels",
    isExecVoice: false
}
module.exports.run = async (client, { EmbedBuilder }, command, args, color) => {
    var amount = parseInt(args[1]) + 1;
        if(amount > 100) amount = 100;

    const channel = client.channels.cache.get(command.channelId);

    channel.bulkDelete(amount, true).then(async (msgs) => {
        if(command.commandName != undefined) {
            command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`I deleted **\`${msgs.size}\`** messages!`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            }).then(async (msg) => setTimeout(async () => { try{ await msg.delete()} catch(err){ return }; }, 4500));
        } else {
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`I deleted **\`${msgs.size - 1}\`** messages!`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            }).then(async (msg) => setTimeout(async () => { try{ await msg.delete()} catch(err){ return }; }, 4500));
        };
    }).catch(async err => {
        console.log(err);
        return await command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    });
}