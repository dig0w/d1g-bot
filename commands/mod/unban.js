module.exports = {
    name: 'unban',
    description: 'Unban a member from the server',
    options: [
        {
            name: 'member name',
            type: 2,
            required: true
        }, {
            name: 'reason',
            type: 2,
            required: false
        }
    ],
    permissions: ['HIGHER_ROLE', 'BAN_MEMBERS']
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
    const bannedMembers = await message.guild.bans.fetch();
    const member = bannedMembers.find(bannedMember => bannedMember.user.id == args[1] || bannedMember.user.username == args[1]);
        if(!member){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription('> The user is not banned!')
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
    var reason = '';
        if(args[2]){ reason = args.splice(2, args.length).join(' '); } else{ reason = 'No reason' };

    message.guild.members.unban(member.user.id, `${reason}, by: ${message.author.tag}`).then(async () => {
        message.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`🔨 UnBan`)
                    .setDescription(`The member ${member.user} has been unbanned!`)
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