module.exports = {
    name: 'move',
    description: 'Move a song in the queue',
    options: [
        {
            name: 'position',
            description: 'Song to move in the queue',
            type: 10,
            required: true
        }, {
            name: 'new',
            description: 'Were to move the song',
            type: 10,
            required: true
        }
    ],
    aliases: ['mv']
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

    var pos = interaction.options.get('position').value;
    var npos = interaction.options.get('new').value;

    const song = queue.songs[pos-1];
    queue.songs.splice(pos-1, 1);
    queue.songs.splice(npos-1, 0, song);

    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`↕️ ${interaction.member} moved [${song.title}](${song.url}) to position **\`${npos}\`**`)
                .setColor(color)
        ], allowedMentions: { repliedUser: false }
    });
}