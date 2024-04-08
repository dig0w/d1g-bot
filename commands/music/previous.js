module.exports = {
    name: "previous",
    description: "Skip to the previous song in the queue",
    aliases: [],
    options: [],
    permissions: [],
    isExecVoice: true
}
module.exports.run = async (client, { EmbedBuilder }, command, args, color) => {
    const voiceChannel = command.member.voice.channel;
        if(!voiceChannel){
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> You need to be connected to voice channel!")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if(command.guild.members.me.voice.channel && voiceChannel.id != command.guild.members.me.voice.channel.id){
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> I\'m already connected to other voice channel!")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    try{
        const queue = client.queue.get(command.guild.id);
            if(!queue){
                return command.reply({
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

        command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏮️ ${command.member} skipped to the previous song`)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    } catch (err){
        console.log(err);
        return await command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };
}