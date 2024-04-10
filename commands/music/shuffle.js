module.exports = {
    name: "shuffle",
    description: "Shuffle the queue",
    aliases: [],
    options: [],
    permission: undefined,
    isExecVoice: true
}
module.exports.run = async (client, { EmbedBuilder }, command, args, color) => {
    const voiceChannel = command.member.voice.channel;
        if (!voiceChannel) {
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> You need to be connected to voice channel")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if (command.guild.members.me.voice.channel && voiceChannel.id != command.guild.members.me.voice.channel.id) {
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> I\'m already connected to other voice channel")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    try {
        const queue = client.queue.get(command.guild.id);
            if (!queue) {
                return command.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("> There\'s no queue to shuffle")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        const startIndex = queue.songs.findIndex(song => song == queue.npSong) + 1;

        var songs = queue.songs;
            for (let i = songs.length - 1; i > startIndex; i--) {
                const j = Math.floor(Math.random() * (i - startIndex + 1)) + startIndex;
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
    } catch (err) {
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