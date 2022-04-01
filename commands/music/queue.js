module.exports = {
    name: 'queue',
    description: 'Resume a song',
    aliases: [],
    options: [],
    permissions: []
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
        if(!message.member.voice.channel){
            return message.reply({
                embeds: [
                new MessageEmbed()
                    .setDescription(`> You need to be connected to voice channel`)
                    .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if(message.guild.me.voice.channel && message.member.voice.channel.id != message.guild.me.voice.channel.id){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`> I am already playing music in other voice channel`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
    const queue = client.distube.getQueue(message);
        if(!queue){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`> There is nothing in the queue right now`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    var npSong;
    for(var i = 0; i < queue.songs.length; i++){
        npSong = queue.songs[0];
    };

    var loop;
    if(queue.loop == 0){ loop = 'Off' }
    else if(queue.loop == 1){ loop = 'Queue' }
    else if(queue.loop == 2){ loop = 'Song' };

    var currentPage = 0;
    const embeds = genQueuePage(queue);

    const queueMsg = await message.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Playing: [${npSong.name}](${npSong.url}) **\`${npSong.formattedDuration}\`**`)
                .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'} | Filter: ${queue.filters.join(', ') || 'Off'}` })
                .setColor(color)
        ],
        allowedMentions: { repliedUser: false }
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
                queueMsg.edit({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Playing: [${npSong.name}](${npSong.url}) **\`${npSong.formattedDuration}\`**`)
                            .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'} | Filter: ${queue.filters.join(', ') || 'Off'}` })
                            .setColor(color)
                    ]
                });
            };
        } else if(reaction._emoji.name == '⬅️'){
            if(currentPage != 0){
                --currentPage;
                queueMsg.edit({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Playing: [${npSong.name}](${npSong.url}) **\`${npSong.formattedDuration}\`**`)
                            .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'} | Filter: ${queue.filters.join(', ') || 'Off'}` })
                            .setColor(color)
                    ]
                });
            };
        };
    });


    function genQueuePage(queue){
        const embeds = [];
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