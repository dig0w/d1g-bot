module.exports = {
    name: "autoplay",
    description: "Join user voice channel",
    aliases: ["ap"],
    options: [],
    permission: undefined,
    isExecVoice: false
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
                            .setDescription("> There\'s no queue to loop")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };

        queue.autoplay = !queue.autoplay;

        var desc;

        if (queue.autoplay) {
            desc = `${command.member} **enabled** auto play`;
        } else {
            desc = `${command.member} **disabled** auto play`;
        };

        return command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(desc)
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