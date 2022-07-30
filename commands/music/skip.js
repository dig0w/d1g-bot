module.exports = {
    name: 'skip',
    description: 'Skip a song',
    options: [
        {
            name: 'position',
            description: 'Song to skip to',
            type: 10,
            required: false
        }
    ],
    aliases: ['s', 'next']
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
            return await interaction.reply({ content: '> There is no song to skip', ephemeral: true, allowedMentions: { repliedUser: false } });
        };

    if(interaction.options.get('position')){
        if(queue.songs.length < interaction.options.get('position').value){
            return await interaction.reply({ content: '> There is no song to skip to', ephemeral: true, allowedMentions: { repliedUser: false } });
        };

        queue.songIndex = interaction.options.get('position').value-1;

        queue.connection._state.subscription.player.stop();

        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`⏭️ ${interaction.member} skipped to [${queue.songs[interaction.options.get('position').value-1].title}](${queue.songs[interaction.options.get('position').value-1].url})`)
                    .setColor(color)
            ], allowedMentions: { repliedUser: false }
        });
    } else {
        queue.connection._state.subscription.player.stop();

        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`⏭️ ${interaction.member} skipped the song`)
                    .setColor(color)
            ], allowedMentions: { repliedUser: false }
        });
    };
}