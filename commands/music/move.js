module.exports = {
    name: "move",
    description: "Move a song in the queue",
    aliases: [],
    options: [
        {
            name: "position",
            description: "Song to move",
            type: 3,
            required: true
        }, {
            name: "new",
            description: "Song new position",
            type: 3,
            required: true
        }
    ],
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
                allowedMentions: { repliedUser: false },
                ephemeral: true
            });
        };
        if (command.guild.members.me.voice.channel && voiceChannel.id != command.guild.members.me.voice.channel.id) {
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> I\'m already connected to other voice channel")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false },
                ephemeral: true
            });
        };

    try {
        const queue = client.queue.get(command.guild.id);
            if (!queue) {
                return command.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("> There\'s no songs to move")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };

        const moveSong = parseInt(args[1]);
        const newPos = parseInt(args[2]);

        const song = queue.songs[parseInt(moveSong) - 1];
        queue.songs.splice(parseInt(moveSong) - 1, 1);
        queue.songs.splice(parseInt(newPos) - 1, 0, song);

        command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`↕️ ${command.member} moved [${song.title}](${song.url}) to position **\`${parseInt(newPos)}\`**`)
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
            allowedMentions: { repliedUser: false },
            ephemeral: true
        });
    };
}