module.exports = {
    name: "stop",
    description: "Stops the queue",
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
                            .setDescription("> There\'s no queue to stop")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };

        // TRY THIS PLS!!!!!!!!!!!!
        if (queue.status == "idle") {
            await queue.connection.destroy();
            client.queue.delete(command.guild.id);
        } else {
            queue.stop = true;
            queue.connection._state.subscription.player.stop();
        };

        command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏹️ ${command.member} stopped the queue`)
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