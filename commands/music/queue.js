module.exports = {
    name: 'queue',
    description: 'Displays the queue',
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

        const song = queue.songs[queue.songIndex];
        var songDurantion = song.duration;
        var min = Math.floor((songDurantion / 60) << 0);
        var sec = Math.floor((songDurantion) % 60).toString().padStart(2, '0');
        songDurantion = `${min}:${sec}`;

    var loop;
    if(queue.loop == 0){ loop = 'Off' }
    else if(queue.loop == 1){ loop = 'Queue' }
    else if(queue.loop == 2){ loop = 'Song' };

    var currentPage = 0;
    const embeds = genQueuePage(queue);

        const queueMsg = await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                    .setFooter(`Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop} | AutoPlay: ${queue.autoplay ? 'On' : 'Off'}`)
                    .setColor(color)
            ], fetchReply: true, allowedMentions: { repliedUser: false }
        });

    queueMsg.react('⬅️');
    queueMsg.react('➡️');
    const collector = queueMsg.createReactionCollector();
    collector.on('collect', async (reaction, user) => {
        if(user.id == client.user.id) return;
        if(user.bot && user.id != client.user.id) return reaction.users.remove(user);

        reaction.users.remove(user);

            if(reaction._emoji.name == '➡️'){
                if(currentPage < embeds.length-1){
                    currentPage++;

                    const msg = {
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                .setFooter(`Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop}`)
                                .setColor(color)
                        ], allowedMentions: { repliedUser: false }
                    };

                    try{
                        await interaction.editReply(msg);
                    } catch(err){
                        queueMsg.edit(msg)
                    };
                };
            } else if(reaction._emoji.name == '⬅️'){
                if(currentPage != 0){
                    --currentPage;

                    const msg = {
                        embeds: [
                            new MessageEmbed()
                                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                .setFooter(`Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop}`)
                                .setColor(color)
                        ], allowedMentions: { repliedUser: false }
                    };

                    try{
                        await interaction.editReply(msg);
                    } catch(err){
                        queueMsg.edit(msg)
                    };
                };
            };
    });


    function genQueuePage(queue){
        var k = 10;

        for(var i = 0; i < queue.songs.length; i += 10){
            const page = queue.songs.slice(i, k);
            var j = i;
            k += 10;

            const queueMap = page.map((song) => `**${++j}** - [${song.name}](${song.url})`).join('\n');

            embeds.push(queueMap);
        };

        return embeds;
    };
}