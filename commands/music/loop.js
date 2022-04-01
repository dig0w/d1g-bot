module.exports = {
    name: 'loop',
    description: 'Loop the queue or the current song',
    aliases: [],
    options: [
        {
            name: 'loop',
            type: 2,
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

        var mode = null;
        switch(args[1]){
            case 'off':
                mode = 0
              break;
            case 'song':
                mode = 1
              break;
            case 'queue':
                mode = 2
              break;
        };

        mode = queue.setRepeatMode(mode);
        mode = mode ? (mode === 2 ? `🔁 ${message.member} looped the **queue**` : `🔂 ${message.member} looped the **song**`) : `🔁 ${message.member} **disabled** the loop`;

        message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`${mode}`)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
}