module.exports = {
    name: 'shuffle',
    description: 'Shuffle the queue',
    aliases: ['sh']
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

    var song = queue.songs[queue.songIndex];
    var songs = queue.songs;
        for(var i = 0; i < songs.length; i++){
            var j = 1 + Math.floor(Math.random() * i);
            [songs[i], songs[j]] = [songs[j], songs[i]];
        };
    queue.songs = songs;
    for(var i = 0; i < queue.songs.length; i++){
        if(queue.songs[i] == song){ queue.songIndex = i; }
    };


    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`🔀 ${interaction.member} shufffled the queue`)
                .setColor(color)
        ], allowedMentions: { repliedUser: false }
    });
}