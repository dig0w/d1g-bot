module.exports = {
    name: "remove",
    description: "Remove a song from the queue",
    aliases: ["r"],
    options: [
        {
            name: "position",
            description: "Song to remove from queue",
            type: 3,
            required: true
        }
    ],
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
                            .setDescription("> There\'s no songs to remove!")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        const remove = parseInt(args[1]);

        const song = queue.songs[parseInt(remove) - 1];
        queue.songs.splice(parseInt(remove) - 1, 1);

        command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`❌ ${command.member} removed [${song.title}](${song.url})`)
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