module.exports = {
    name: 'volume',
    description: 'Change the volume',
    options: [
        {
            name: 'volume',
            description: 'Change the volume',
            type: 10,
            min_value: 0,
            max_value: 100,
            required: true
        }
    ],
    aliases: ['v', 'vol']
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
            return await interaction.reply({ content: '> There is no queue', ephemeral: true, allowedMentions: { repliedUser: false } });
        };

    var volume = interaction.options.get('volume').value;
        if(volume > 100) volume = 100;

    queue.connection._state.subscription.player._state.resource.volume.setVolume(volume/100);
    queue.volume = volume;

    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`🔉 ${interaction.member} changed the volume to: **\`${volume}%\`**`)
                .setColor(color)
        ], allowedMentions: { repliedUser: false }
    });
}