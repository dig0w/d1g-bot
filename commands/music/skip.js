module.exports = {
    name: "skip",
    description: "Skip to the next song in the queue",
    aliases: ["next"],
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
                            .setDescription("> There\'s no song to skip")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };

        queue.connection._state.subscription.player.stop();

        return command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏭️ ${command.member} skipped to the next song`)
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