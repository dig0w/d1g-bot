module.exports = {
    name: 'unmute',
    description: 'Unmute a member in the server',
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
    permissions: ['HIGHER_ROLE', 'MANAGE_ROLES']
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
    const member = message.guild.members.cache.find(member => member.id == args[1].substring(3, args[1].length-1));
    var reason = '';
        if(args[2]){ reason = args.splice(2, args.length).join(' '); } else{ reason = 'No reason' };

    const muterole = message.guild.roles.cache.find(role => role.name == 'Muted') || await message.guild.roles.create({ data: { name: 'Muted', color: '18191C', permissions: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'] } });
        if(!member.roles.cache.find(role => role.id == muterole.id)){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription('> The user is already unmuted!')
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

        member.roles.remove(muterole, `${reason}, by: ${message.author.tag}`).then(async () => {
        message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`🤐 UnMute`)
                    .setDescription(`The member ${member.user} has been unmuted!`)
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
                    .setDescription(`Something went wrong... \n\`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    });
}