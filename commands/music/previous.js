module.exports = {
    name: "previous",
    description: "Skip to the previous song in the queue",
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
                            .setDescription("> There\'s no song to skip!")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        for(var i = 0; i < queue.songs.length; i++){
            if(queue.songs[i] == queue.npSong) queue.skipto = i-1;
        };
        queue.connection._state.subscription.player.stop();

        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏮️ ${message.member} skipped to the previous song`)
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