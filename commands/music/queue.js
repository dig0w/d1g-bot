module.exports = {
    name: 'queue',
    description: 'Resume a song',
    aliases: [],
    options: [],
    permissions: []
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
    const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`> You need to be connected to voice channel!`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if(message.guild.me.voice.channel && voiceChannel.id != message.guild.me.voice.channel.id){
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`> I\'m already playing music in other voice channel!`)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    try{
        const queue = client.queue.get(message.guild.id);
            if(!queue){
                return message.reply({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`> There\'s no queue!`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        var currentPage = 0;
        const embeds = genQueuePage(queue);

        const queueMsg = await message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}`)
                    .setFooter(`Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}%`)
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
                                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}`)
                                .setFooter(`Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}%`)
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
                                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}`)
                                .setFooter(`Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}%`)
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

                const queueMap = page.map((song) => `**${++j}** - [${song.title}](${song.url})`).join('\n');

                embeds.push(queueMap);
            };

            return embeds;
        }
    } catch (err){
        console.log(err);
        return await message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };
}