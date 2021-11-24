module.exports = {
    name: 'clear',
    description: 'Clear the messages from a channel',
    options: [
        {
            name: 'amount',
            type: 3,
            required: true
        }
    ],
    permissions: ['MANAGE_CHANNELS']
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
    var amount = parseInt(args[1]);
        if(amount > 100) amount = 100;

    message.channel.bulkDelete(amount+1, true).then(async (msgs) => {
        message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`I deleted **\`${msgs.size-1}\`** messages!`)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        }).then(async (msg) => setTimeout(async () => await msg.delete(), 4500));
    }).catch(async err => {
        console.log(err);
        return await message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Something went wrong... \n\`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    });
}