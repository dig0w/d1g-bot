module.exports = {
    name: "shuffle",
    description: "Shuffle the queue",
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
                            .setDescription("> There\'s no queue to shuffle!")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        var songs = queue.songs;
            for(var i = 0; i < songs.length; i++){
                var j = 1 + Math.floor(Math.random() * i);
                [songs[i], songs[j]] = [songs[j], songs[i]];
            };
        queue.songs = songs;

        command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`🔀 ${command.member} shufffled the queue`)
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