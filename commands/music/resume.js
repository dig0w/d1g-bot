module.exports = {
    name: 'resume',
    description: 'Resume a song',
    aliases: []
}
module.exports.run = async (client, { MessageEmbed }, interaction) => {
    const color = interaction.guild.me.displayHexColor;

    const voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel){
            return await interaction.reply({ content: '> You need to be connected to voice channel', ephemeral: true, allowedMentions: { repliedUser: false } });
        };
        if(interaction.guild.me.voice.channel && voiceChannel.id != interaction.guild.me.voice.channel.id){
            return await interaction.reply({ content: '> I\'m already playing music in other voice channel', ephemeral: true, allowedMentions: { repliedUser: false } });
        };

    const queue = client.queue.get(interaction.guildId);
        if(!queue){
            return await interaction.reply({ content: '> There is no song to resume', ephemeral: true, allowedMentions: { repliedUser: false } });
        };

    queue.connection._state.subscription.player.unpause();

    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`▶️ ${interaction.member} resumed the song`)
                .setColor(color)
        ], allowedMentions: { repliedUser: false }
    });
}