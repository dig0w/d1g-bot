module.exports = {
    name: "skipto",
    description: "Skip to a song in the queue",
    aliases: [],
    options: [
        {
            name: "position",
            description: "Song position to skip to",
            type: 3,
            required: true
        }
    ],
    permission: undefined,
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

        const skipto = parseInt(args[1])-1;
        queue.skipto = skipto;

        queue.connection._state.subscription.player.stop();

        command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`⏭️ ${command.member} skipped to [${queue.songs[queue.skipto].title}](${queue.songs[queue.skipto].url})`)
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