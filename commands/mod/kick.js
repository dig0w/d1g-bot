module.exports = {
    name: 'kick',
    description: 'Kick a member from the server',
    aliases: [],
    options: [
        {
            name: 'member',
            type: 1,
            required: true
        }, {
            name: 'reason',
            type: 2,
            required: false
        }
    ],
    permissions: ['HIGHER_ROLE', 'KICK_MEMBERS']
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
    const member = message.guild.members.cache.find(member => member.id == args[1].substring(3, args[1].length-1));
    var reason = '';
        if(args[2]){ reason = args.splice(2, args.length).join(' '); } else{ reason = 'No reason' };

    member.kick(`${reason}, by: ${message.author.tag}`).then(async () => {
        message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`🦵 Kick`)
                    .setDescription(`The member ${member.user} has been kicked!`)
                    .setFooter(`${reason}, by: ${message.author.tag}`, message.author.displayAvatarURL())
                    .setThumbnail(member.user.displayAvatarURL())
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    }).catch(async err => {
        console.log(err);
        return await message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    });
}