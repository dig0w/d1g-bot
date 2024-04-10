module.exports = {
    name: "play",
    description: "Play a song in the voice channel",
    aliases: ["p"],
    options: [
        {
            name: "song",
            description: "Song to play",
            type: 2,
            required: true
        }
    ],
    permission: undefined,
    isExecVoice: true
}
module.exports.run = async (client, { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType }, command, args, color) => {
    const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require("@discordjs/voice");
    const playdl = require("play-dl");
    const scdl = require("soundcloud-downloader").default;

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

    const url = args.splice(1, args.length).join(" ");

    const ytPlaylistPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/(playlist\?list=)([^#\&\?]*).*/g;
    const ytPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/g;
    const scPlaylistPattern = /^https?:\/\/(soundcloud\.com)\/.+?\/(sets)\/(.*)$/g;
    const scPattern = /^https?:\/\/(soundcloud\.com)\/(.*)$/g;

    try{
        const queue = client.queue.get(command.guild.id);

        const queueConstruct = {
            voiceChannel: voiceChannel,
            connection: undefined,
            songs: [],
            playing: false,
            volume: 50,
            npSong: 0,
            skipto: 0,
            loop: 0,
            stop: false
        };
        var songs = [];
        var playlistInfo;

        if (ytPlaylistPattern.test(url)) {
            const plInfo = await playdl.playlist_info(url, { incomplete : true });
            playlistInfo = {
                title: plInfo.title,
                url: plInfo.url,
                tracks: plInfo.videoCount,
                author: command.member
            };

            for (let i = 0; i < plInfo.videos.length; i++) {
                const videoInfo = plInfo.videos[i];

                songs.push({
                    title: videoInfo.title,
                    url: videoInfo.url,
                    duration: videoInfo.durationInSec,
                    author: command.member
                });
            };
        } else if (ytPattern.test(url)) {
            const videoInfo = await playdl.video_info(url);
            songs.push({
                title: videoInfo.video_details.title,
                url: videoInfo.video_details.url,
                duration: videoInfo.video_details.durationInSec,
                author: command.member
            });
        } else if (scPlaylistPattern.test(url)) {
            const plInfo = await scdl.getSetInfo(url, process.env.soundcloudID);
            playlistInfo = {
                title: plInfo.title,
                url: plInfo.permalink_url,
                tracks: plInfo.track_count || plInfo.tracks.length,
                author: command.member
            };

            for (let i = 0; i < plInfo.tracks.length; i++) {
                const trackInfo = plInfo.tracks[i];

                songs.push({
                    title: trackInfo.title,
                    url: trackInfo.permalink_url,
                    duration: trackInfo.duration/1000,
                    author: command.member
                });
            };
        } else if (scPattern.test(url)) {
            const trackInfo = await scdl.getInfo(url, process.env.soundcloudID);
            songs.push({
                title: trackInfo.title,
                url: trackInfo.permalink_url,
                duration: trackInfo.duration/1000,
                author: command.member
            });
        } else {
            const videoInfo = await playdl.search(url, { limit: 1});
            songs.push({
                title: videoInfo[0].title,
                url: videoInfo[0].url,
                duration: videoInfo[0].durationInSec,
                author: command.member
            });
        };

        if (queue) {
            const length = queue.songs.length;
            queue.songs = [...queue.songs, ...songs];

            if (!queue.playing) {
                console.log("not playing");
                await play(queue.songs[length]);
            };

            if (songs.length > 1 && playlistInfo) {
                await command.reply({ embeds: [
                        new EmbedBuilder()
                            .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                            .setFooter({ text: `By: ${playlistInfo.author.user.tag}` })
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            } else {
                for (let i = 0; i < songs.length; i++) {
                    const song = songs[i];
    
                    var songDurantion = song.duration;
                    var min = Math.floor((songDurantion / 60) << 0);
                    var sec = Math.floor((songDurantion) % 60);
                        if (sec <= 9) { sec = `0${sec}` };
                    songDurantion = `${min}:${sec}`;
            
                    await command.reply({ embeds: [
                            new EmbedBuilder()
                                .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                .setFooter({ text: `By: ${song.author.user.tag}` })
                                .setColor(color)
                        ],
                        allowedMentions: { repliedUser: false }
                    });
                };
            };
        } else{
            queueConstruct.songs = songs;
            client.queue.set(command.guild.id, queueConstruct);

            if (songs.length > 1 && playlistInfo) {
                await command.reply({ embeds: [
                        new EmbedBuilder()
                            .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                            .setFooter({ text: `By: ${playlistInfo.author.user.tag}` })
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            } else {
                for (let i = 0; i < songs.length; i++) {
                    const song = songs[i];
    
                    var songDurantion = song.duration;
                    var min = Math.floor((songDurantion / 60) << 0);
                    var sec = Math.floor((songDurantion) % 60);
                        if (sec <= 9) { sec = `0${sec}` };
                    songDurantion = `${min}:${sec}`;
            
                    await command.reply({ embeds: [
                            new EmbedBuilder()
                                .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                .setFooter({ text: `By: ${song.author.user.tag}` })
                                .setColor(color)
                        ],
                        allowedMentions: { repliedUser: false }
                    });
                };
            };

            queueConstruct.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: command.guild.id,
                adapterCreator: command.guild.voiceAdapterCreator
            });
    
            await play(queueConstruct.songs[0]);
        };
    } catch (err) {
        console.log(err);

        client.queue.delete(command.guild.id);

        const connection = getVoiceConnection(command.guild.id);
        if (connection) { connection.destroy() };

        return await command.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };

    async function play(song) {
        const queue = client.queue.get(command.guild.id);

        if (!song) {
            console.log("no songs", song);
            return;
        };

        const player = createAudioPlayer();
        var stream;
        console.log("url match:", ytPattern.test(song.url), scPattern.test(song.url), song.url);
        try {
            if (song.url.match(ytPattern) && song.url.match(ytPattern).length > 0) {
                stream = await playdl.stream(song.url, { discordPlayerCompatibility: true });
    
                player.play(createAudioResource(stream.stream, { inputType : stream.type, inlineVolume: true }));
            } else if (song.url.match(scPattern) && song.url.match(scPattern).length > 0) {
                stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, process.env.soundcloudID);
    
                player.play(createAudioResource(stream, { inlineVolume: true }));
            } else {
                console.log(song.url.match(ytPattern).length > 0, song.url.match(scPattern) && song.url.match(scPattern).length > 0, song.url);
            };
        } catch (err) {
            console.log(err);

            return await command.channel.send({ embeds: [
                new EmbedBuilder()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ]});
        };

        var npMsg;
            player.on(AudioPlayerStatus.Playing, async () => {
                console.log("playing");
                queue.playing = true;
                queue.npSong = song;

                if (npMsg && npMsg.deletable) {
                    command.channel.messages.fetch(npMsg.id).then(msg => msg.delete()).catch(console.error);
                };

                const shuffleBtn = new ButtonBuilder()
                    .setCustomId("shuffle")
                    .setLabel("🔀")
                    .setStyle(ButtonStyle.Secondary);

                const previousBtn = new ButtonBuilder()
                    .setCustomId("previous")
                    .setLabel("⏮️")
                    .setStyle(ButtonStyle.Secondary);

                const pauseBtn = new ButtonBuilder()
                    .setCustomId("pause")
                    .setLabel("⏯️")
                    .setStyle(ButtonStyle.Secondary);
        
                const nextBtn = new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("⏭️")
                    .setStyle(ButtonStyle.Secondary);

                const repeatBtn = new ButtonBuilder()
                    .setCustomId("repeat")
                    .setLabel("🔂")
                    .setStyle(ButtonStyle.Secondary);


                var songDurantion = song.duration;
                var min = Math.floor((songDurantion / 60) << 0);
                var sec = Math.floor((songDurantion) % 60);
                    if (sec <= 9) { sec = `0${sec}` };
                songDurantion = `${min}:${sec}`;
    
                npMsg = await command.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`▶️ Now Playing: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                            .setFooter({ text: `By: ${song.author.user.tag}` })
                            .setColor(color)
                    ],
                    components: [ new ActionRowBuilder().addComponents(shuffleBtn, previousBtn, pauseBtn, nextBtn, repeatBtn) ]
                });

                const collector = npMsg.createMessageComponentCollector({ componentType: ComponentType.Button });

                collector.on("collect", interaction => {
                    if (interaction.message.id == npMsg.id || interaction.message.interaction.id == npMsg.id) {
                        if (interaction.customId == "shuffle") {
                            const startIndex = queue.songs.findIndex(song => song == queue.npSong) + 1;

                            var songs = queue.songs;
                                for (let i = songs.length - 1; i > startIndex; i--) {
                                    const j = Math.floor(Math.random() * (i - startIndex + 1)) + startIndex;
                                    [songs[i], songs[j]] = [songs[j], songs[i]];
                                };
                            queue.songs = songs;
    
                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`🔀 ${interaction.member} shufffled the queue`)
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false }
                            });
                        } else if (interaction.customId == "previous") {
                            const startIndex = queue.songs.findIndex(song => song == queue.npSong);

                            if (startIndex > 0) {
                                queue.skipto = startIndex;

                                queue.connection._state.subscription.player.stop();

                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setDescription(`⏮️ ${interaction.member} skipped to the previous song`)
                                            .setColor(color)
                                    ],
                                    allowedMentions: { repliedUser: false }
                                });
                            };
                        } else if (interaction.customId == "pause") {
                            if (queue.connection._state.subscription.player._state.status == "paused") {
                                queue.connection._state.subscription.player.unpause();

                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setDescription(`▶️ ${interaction.member} resumed the song`)
                                            .setColor(color)
                                    ],
                                    allowedMentions: { repliedUser: false }
                                });
                            } else {
                                queue.connection._state.subscription.player.pause();
    
                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setDescription(`⏸️ ${interaction.member} paused the song`)
                                            .setColor(color)
                                    ],
                                    allowedMentions: { repliedUser: false }
                                });
                            };
                        } else if (interaction.customId == "next") {
                            queue.connection._state.subscription.player.stop();

                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`⏭️ ${interaction.member} skipped to the next song`)
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false }
                            });
                        } else if (interaction.customId == "repeat") {
                            if(queue.loop == 2) {
                                queue.loop = 0;

                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setDescription(`🔁 ${interaction.member} **disabled** the loop`)
                                            .setColor(color)
                                    ],
                                    allowedMentions: { repliedUser: false }
                                });
                            } else {
                                queue.loop = 2;

                                interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setDescription(`🔂 ${interaction.member} looped the **song**`)
                                            .setColor(color)
                                    ],
                                    allowedMentions: { repliedUser: false }
                                });
                            };
                        };
                    };
                });
            });
            player.on(AudioPlayerStatus.Idle, async () => {
                console.log("idle");
                if(npMsg && npMsg.deletable) {
                    command.channel.messages.fetch(npMsg.id).then(msg => msg.delete()).catch(console.error);
                };
                queue.playing = false;

                if (queue.stop) {
                    await queue.connection.destroy();
                    return client.queue.delete(command.guild.id);
                };

                if (queue.skipto > 0 && queue.songs.length >= queue.skipto) {
                    console.log("skipto");
                    play(queue.songs[queue.skipto - 1]);
                    return queue.skipto = 0;
                };

                if (queue.loop == 1) {
                    for (let i = 0; i < queue.songs.length; i++) {
                        if (queue.songs[queue.songs.length-1] == song) {
                            console.log("loop 1 1");
                            play(queue.songs[0]);
                        } else if (queue.songs[i] == song) {
                            console.log("loop 1 2");
                            play(queue.songs[i+1]);
                        };
                    };
                } else if (queue.loop == 2) {
                    console.log("loop 2");
                    play(song);
                } else {
                    for (let i = 0; i < queue.songs.length; i++) {
                        if (queue.songs.length > i+1 && queue.songs[i] == song) {
                            console.log("else", i+1, queue.songs.length);
                            play(queue.songs[i+1]);
                        };
                    };
                };
            });
            player.on("error", async err => {
                console.log("error");
                console.log(err);

                if (npMsg && npMsg.deletable) {
                    command.channel.messages.fetch(npMsg.id).then(msg => msg.delete()).catch(console.error);
                };
                queue.playing = false;

                if (queue.stop) {
                    await queue.connection.destroy();
                    return client.queue.delete(command.guild.id);
                };

                if (queue.skipto > 0 && queue.songs.length >= queue.skipto) {
                    console.log("skipto");
                    play(queue.songs[queue.skipto]);
                    return queue.skipto = 0;
                };

                if (queue.loop == 1) {
                    for(var i = 0; i < queue.songs.length; i++){
                        if (queue.songs[queue.songs.length-1] == song) {
                            console.log("loop 1 1");
                            play(queue.songs[0]);
                        } else if (queue.songs[i] == song) {
                            console.log("loop 1 2");
                            play(queue.songs[i+1]);
                        };
                    };
                } else if (queue.loop == 2) {
                    console.log("loop 2");
                    play(song);
                } else {
                    for (let i = 0; i < queue.songs.length; i++) {
                        if (queue.songs.length > i+1 && queue.songs[i] == song) {
                            console.log("else", i+1, queue.songs.length);
                            play(queue.songs[i+1]);
                        };
                    };
                };

                return await command.channel.send({ embeds: [
                    new EmbedBuilder()
                        .setDescription(`Something went wrong... \n> \`${err}\``)
                        .setColor(color)
                ]});
            });

        queue.connection.subscribe(player);
        queue.connection._state.subscription.player._state.resource.volume.setVolume(queue.volume/100);
        queue.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => { client.queue.delete(command.guild.id); });
    };
}