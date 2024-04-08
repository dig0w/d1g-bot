module.exports = {
    name: "queue",
    description: "Resume a song",
    aliases: [],
    options: [],
    permission: undefined,
    isExecVoice: true
}
module.exports.run = async (client, { EmbedBuilder }, command, args, color) => {
    const voiceChannel = command.member.voice.channel;
        if(!voiceChannel){
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> You need to be connected to voice channel!")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if(command.guild.members.me.voice.channel && voiceChannel.id != command.guild.members.me.voice.channel.id){
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> I\'m already connected to other voice channel!")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    try{
        const queue = client.queue.get(command.guild.id);
            if(!queue){
                return command.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("> There\'s no queue!")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        const npSong = queue.songs.find(song => song == queue.npSong);
        var songDurantion = npSong.duration;
        var min = Math.floor((songDurantion / 60) << 0);
        var sec = Math.floor((songDurantion) % 60);
            if(sec <= 9) sec = `0${sec}`;
        songDurantion = `${min}:${sec}`;

        var loop;
        if(queue.loop == 0){ loop = "Off" }
        else if(queue.loop == 1){ loop = "Queue" }
        else if(queue.loop == 2){ loop = "Song" };

        var currentPage = 0;
        const embeds = genQueuePage(queue);

        const queueMsg = await command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${npSong.title}](${npSong.url}) **\`${songDurantion}\`**`)
                    .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop}` })
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });

        queueMsg.react("⬅️");
        queueMsg.react("➡️");
        const collector = queueMsg.createReactionCollector();
        collector.on("collect", async (reaction, user) => {
            if(user.id == client.user.id) return;
            if(user.bot && user.id != client.user.id) return reaction.users.remove(user);

            reaction.users.remove(user);

            if(reaction._emoji.name == "➡️"){
                if(currentPage < embeds.length-1){
                    currentPage++;
                    queueMsg.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${npSong.title}](${npSong.url}) **\`${songDurantion}\`**`)
                                .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop}` })
                                .setColor(color)
                        ]
                    });
                };
            } else if(reaction._emoji.name == "⬅️"){
                if(currentPage != 0){
                    --currentPage;
                    queueMsg.edit({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${npSong.title}](${npSong.url}) **\`${songDurantion}\`**`)
                                .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop}` })
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

                const queueMap = page.map((song) => `**${++j}** - [${song.title}](${song.url})`).join("\n");

                embeds.push(queueMap);
            };

            return embeds;
        }
    } catch (err){
        console.log(err);
        return await command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };
}