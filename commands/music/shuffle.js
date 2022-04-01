module.exports = {
    name: 'shuffle',
    description: 'Shuffle the queue',
    aliases: [],
    options: [],
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

        queue.shuffle();

        message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`🔀 ${message.member} shufffled the queue`)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
}