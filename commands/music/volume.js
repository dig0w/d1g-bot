module.exports = {
    name: 'volume',
    description: 'Change the volume',
    aliases: ['v', 'vol'],
    options: [
        {
            name: 'volume',
            type: 3,
            required: true
        }
    ],
    permissions: []
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
        if(!message.member.voice.channel){
            return message.reply({
                embeds: [
                new MessageEmbed()
                    .setDescription(`> You need to be connected to voice channel`)
                    .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if(message.guild.me.voice.channel && message.member.voice.channel.id != message.guild.me.voice.channel.id){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`> I am already playing music in other voice channel`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
    const queue = client.distube.getQueue(message);
        if(!queue){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`> There is nothing in the queue right now`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    var volume = parseInt(args[1]);
        if(volume > 100) volume = 100;

    queue.setVolume(volume);

    message.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`🔉 ${message.member} changed the volume to: **\`${volume}%\`**`)
                .setColor(color)
        ],
        allowedMentions: { repliedUser: false }
    });
}