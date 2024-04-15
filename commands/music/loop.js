module.exports = {
    name: "loop",
    description: "Loop the queue or the current song",
    aliases: [],
    options: [
        {
            name: "type",
            description: "Type of loop to apply",
            type: 2,
            required: true,
            choices: [
                { name: "queue", value: "queue" },
                { name: "song", value: "song" },
                { name: "disabled", value: "disabled" }
            ]
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
                            .setDescription("> There\'s no queue to loop")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };

        var desc;

        if (args[1] == "queue") {
            queue.loop = 1;
            desc = `🔁 ${command.member} looped the **queue**`;
        } else if (args[1] == "song") {
            queue.loop = 2;
            desc = `🔂 ${command.member} looped the **song**`;
        } else if (args[1] == "disabled") {
            queue.loop = 0;
            desc = `🔁 ${command.member} **disabled** the loop`;
        } else { return };

        command.reply({
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