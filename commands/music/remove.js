module.exports = {
    name: 'remove',
    description: 'Remove a song from the queue',
    options: [{
        name: 'suboptions',
        description: 'Options to remove songs from the queue',
        type: 3,
        required: true,
        choices: [{
            name: 'none',
            value: 'none'
        }, {
            name: 'duplicated',
            value: 'duplicated'
        }, {
            name: 'all',
            value: 'all'
        }]
    }, {
        name: 'position',
        description: 'Song to remove',
        type: 10
    }],
    aliases: ['rm']
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

    if(interaction.options.get('suboptions')){
        if(interaction.options.get('suboptions').value == 'none'){ }
        else if(interaction.options.get('suboptions').value == 'duplicated'){
            var nmb = 0;

            duplicatedFn();

            function duplicatedFn(){
                var valueArr = queue.songs.map(item => { return item.url });
        
                const duplicated = valueArr.findIndex((item, idx) => {
                    return valueArr.indexOf(item) != idx;
                });

                if(duplicated >= 0 && duplicated != queue.songIndex){
                    queue.songs.splice(duplicated, 1);
                    ++nmb;
    
                    duplicatedFn();
                };
            };

            const msg = { embeds: [
                new MessageEmbed()
                    .setDescription(`❌ ${interaction.member} removed \`${nmb}\` duplicated songs`)
                    .setColor(color)
            ], allowedMentions: { repliedUser: false }};
    
            try{ await interaction.followUp(msg);
            } catch(err){ await interaction.reply(msg); };
        } else if(interaction.options.get('suboptions').value == 'all'){
            var nmb = queue.songs.length;
            queue.songs = [];
            queue.connection._state.subscription.player.stop();

            const msg = { embeds: [
                new MessageEmbed()
                    .setDescription(`❌ ${interaction.member} removed all \`${nmb}\` songs from the queue`)
                    .setColor(color)
            ], allowedMentions: { repliedUser: false }};
    
            try{ await interaction.followUp(msg);
            } catch(err){ await interaction.reply(msg); };
        };
    }

    if(interaction.options.get('position')){
        var pos = interaction.options.get('position').value;

        const song = queue.songs[pos-1];
        queue.songs.splice(pos-1, 1);

        const msg = { embeds: [
            new MessageEmbed()
                .setDescription(`❌ ${interaction.member} removed [${song.title}](${song.url})`)
                .setColor(color)
        ], allowedMentions: { repliedUser: false }};

        try{ await interaction.followUp(msg);
        } catch(err){ await interaction.reply(msg); };
    };
}