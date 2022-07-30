module.exports = {
    name: 'loop',
    description: 'Loop the queue or the current song',
    options: [{
            name: 'type',
            description: 'Type to loop',
            type: 3,
            required: true,
            choices: [{
                name: 'queue',
                value: 'queue'
            }, {
                name: 'song',
                value: 'song'
            }, {
                name: 'off',
                value: 'off'
            }]
    }],
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
            return await interaction.reply({ content: '> There is no queue', ephemeral: true, allowedMentions: { repliedUser: false } });
        };

    var desc;
    var loop = interaction.options.get('type').value;
        if(loop == 'off'){
            queue.loop = 0; desc = `🔁 ${interaction.member} **disabled** the loop`;
        } else if(loop == 'queue'){
            queue.loop = 1; desc = `🔁 ${interaction.member} looped the **queue**`;
        } else if(loop == 'song'){
            queue.loop = 2; desc = `🔂 ${interaction.member} looped the **song**`;
        };

    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(desc)
                .setColor(color)
        ], allowedMentions: { repliedUser: false }
    });
}