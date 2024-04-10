const { ComponentType } = require("discord.js");

module.exports = {
    name: "queue",
    description: "Display queue",
    aliases: [],
    options: [],
    permission: undefined,
    isExecVoice: true
}
module.exports.run = async (client, { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType }, command, args, color) => {
    const voiceChannel = command.member.voice.channel;
        if (!voiceChannel) {
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> You need to be connected to voice channel")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };
        if (command.guild.members.me.voice.channel && voiceChannel.id != command.guild.members.me.voice.channel.id) {
            return command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("> I\'m already connected to other voice channel")
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false }
            });
        };

    try{
        var queue = client.queue.get(command.guild.id);
            if (!queue) {
                return command.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("> There\'s no queue")
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

        var npSong = queue.songs.find(song => song == queue.npSong);
        var songDurantion = npSong.duration;
        var min = Math.floor((songDurantion / 60) << 0);
        var sec = Math.floor((songDurantion) % 60);
            if (sec <= 9) { sec = `0${sec}` };
        songDurantion = `${min}:${sec}`;

        var loop;
        if (queue.loop == 0) { loop = "Disabled" }
        else if (queue.loop == 1) { loop = "Queue" }
        else if (queue.loop == 2) { loop = "Song" };

        var currentPage = 0;
        var embeds = genQueuePage(queue);

        const rewindBtn = new ButtonBuilder()
            .setCustomId("rewind")
            .setLabel("⏪")
            .setStyle(ButtonStyle.Secondary);

        const previousBtn = new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Secondary);

        const nextBtn = new ButtonBuilder()
            .setCustomId("next")
            .setLabel("➡️")
            .setStyle(ButtonStyle.Secondary);

        const fowardBtn = new ButtonBuilder()
            .setCustomId("foward")
            .setLabel("⏩")
            .setStyle(ButtonStyle.Secondary);

            if (currentPage == 0) {
                rewindBtn.setDisabled(true);
                previousBtn.setDisabled(true);
            };
            if (currentPage == embeds.length - 1) {
                nextBtn.setDisabled(true);
                fowardBtn.setDisabled(true);
            };
            if (currentPage != 0 && currentPage != embeds.length - 1) {
                rewindBtn.setDisabled(false);
                previousBtn.setDisabled(false);
                nextBtn.setDisabled(false);
                fowardBtn.setDisabled(false);
            };

        const queueMsg = await command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${npSong.title}](${npSong.url}) **\`${songDurantion}\`**`)
                    .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop}` })
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false },
            components: [ new ActionRowBuilder().addComponents(rewindBtn, previousBtn, nextBtn, fowardBtn) ]
        });

        const collector = queueMsg.createMessageComponentCollector({ componentType: ComponentType.Button });

        collector.on("collect", interaction => {
            try {
                if (interaction.message.id == queueMsg.id || interaction.message.interaction.id == queueMsg.id) {
                    if(interaction.customId == "next" && currentPage < embeds.length - 1){
                        currentPage++;
                    } else if(interaction.customId == "previous" && currentPage != 0){
                        --currentPage;
                    } else if (interaction.customId == "rewind") {
                        currentPage = 0;
                    } else if (interaction.customId == "foward") {
                        currentPage = embeds.length - 1; 
                    };
        
                    if (currentPage == 0) {
                        rewindBtn.setDisabled(true);
                        previousBtn.setDisabled(true);
                        nextBtn.setDisabled(false);
                        fowardBtn.setDisabled(false);
                    } else if (currentPage == embeds.length - 1) {
                        rewindBtn.setDisabled(false);
                        previousBtn.setDisabled(false);
                        nextBtn.setDisabled(true);
                        fowardBtn.setDisabled(true);
                    } else {
                        rewindBtn.setDisabled(false);
                        previousBtn.setDisabled(false);
                        nextBtn.setDisabled(false);
                        fowardBtn.setDisabled(false);
                    };
        
                    queue = client.queue.get(command.guild.id);
        
                    embeds = genQueuePage(queue);
        
                    npSong = queue.songs.find(song => song == queue.npSong);
                    songDurantion = npSong.duration;
                    min = Math.floor((songDurantion / 60) << 0);
                    sec = Math.floor((songDurantion) % 60);
                        if (sec <= 9) { sec = `0${sec}` };
                    songDurantion = `${min}:${sec}`;
        
                    if (queue.loop == 0) { loop = "Disabled" }
                    else if (queue.loop == 1) { loop = "Queue" }
                    else if (queue.loop == 2) { loop = "Song" };
        
                    interaction.update({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`**↪️ Queue:**\n\n${embeds[currentPage]}\n\n▶️ Now Playing: [${npSong.title}](${npSong.url}) **\`${songDurantion}\`**`)
                                .setFooter({ text: `Page: ${currentPage+1}/${embeds.length} | Volume: ${queue.volume}% | Loop: ${loop}` })
                                .setColor(color)
                        ],
                        allowedMentions: { repliedUser: false },
                        components: [new ActionRowBuilder().addComponents(rewindBtn, previousBtn, nextBtn, fowardBtn)]
                    });
                };
            } catch (err) {
                return  
            };
        });

        function genQueuePage(queue) {
            const embeds = [];
            let k = 10;

            for (let i = 0; i < queue.songs.length; i += 10) {
                const page = queue.songs.slice(i, k);
                let j = i;
                k += 10;

                const queueMap = page.map((song) => `**${++j}** - [${song.title}](${song.url})`).join("\n");

                embeds.push(queueMap);
            };

            return embeds;
        };
    } catch (err) {
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