module.exports = {
    name: "loop",
    description: "Loop the queue or the current song",
    aliases: [],
    options: [],
    permissions: []
}
module.exports.run = async (client, { EmbedBuilder }, message, args, color) => {
    const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> You need to be connected to voice channel!")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if(message.guild.members.me.voice.channel && voiceChannel.id != message.guild.members.me.voice.channel.id){
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> I\'m already playing music in other voice channel!")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    try{
        const queue = client.queue.get(message.guild.id);
            if(!queue){
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("> There\'s no queue to loop!")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        var desc;

        if(queue.loop == 0){ queue.loop = 1; desc = `🔁 ${message.member} looped the **queue**`; }
        else if(queue.loop == 1){ queue.loop = 2; desc = `🔂 ${message.member} looped the **song**`; }
        else if(queue.loop == 2){ queue.loop = 0; desc = `🔁 ${message.member} **disabled** the loop`; };

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(desc)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    } catch (err){
        console.log(err);
        return await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };
}