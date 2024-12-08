module.exports = {
    name: "volume",
    description: "Change the volume",
    aliases: ["v", "vol"],
    options: [
        {
            name: "volume",
            description: "Volume 0-100",
            type: 3,
            required: true,
            maxValue: 100,
            minValue: 0
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
                            .setDescription("> There\'s no queue")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };

        var volume = parseInt(args[1]);
            if (volume > 100) { volume = 100 };

        queue.connection._state.subscription.player._state.resource.volume.setVolume(volume/100);
        queue.volume = volume;

        return command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`🔉 ${command.member} changed the volume to: **\`${volume}%\`**`)
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