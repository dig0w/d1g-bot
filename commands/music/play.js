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
    const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require("@discordjs/voice");
    const playdl = require("play-dl");
    const ytdl = require("ytdl-core");
    const ytstream = require("yt-stream");
    const scdl = require("soundcloud-downloader").default;

    await playdl.setToken({
        spotify : {
            client_id: process.env.spotifyID,
            client_secret: process.env.spotifySecret,
            refresh_token: process.env.spotifyRefresh,
            market: 'US'
        }
   });

    var voiceChannel = command.member.voice.channel;
      if (!voiceChannel) {
        return command.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("> You need to be connected to voice channel")
              .setColor(color)
            ],
          allowedMentions: { repliedUser: false },
          ephemeral: true
        });
      };
      if (command.guild.members.me.voice.channel && voiceChannel.id != command.guild.members.me.voice.channel.id) {
        return command.reply({
          embeds: [
              new EmbedBuilder()
                  .setDescription("> I\'m already connected to other voice channel")
                  .setColor(color)
          ],
          allowedMentions: { repliedUser: false },
          ephemeral: true
        });
      };

        if (command.commandName != undefined) { await command.deferReply() };

    var url = args.splice(1, args.length).join(" ");

    try {
        var queue = client.queue.get(command.guild.id);

        const queueConstruct = {
            voiceChannel: voiceChannel,
            connection: undefined,
            songs: [],
            status: "idle",
            volume: 50,
            npSong: 0,
            loop: 0,
            skipto: 0,
            stop: false,
            autoplay: false
        };
        var songs = [];
        var playlistInfo;

        if (url.startsWith("https") && playdl.yt_validate(url) === "playlist" && !ytdl.validateURL(url)) {
            const plInfo = await playdl.playlist_info(url, { incomplete: true });
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

                if (i == 0) {
                    queueSongs(songs);
                } else if (queue) {
                    queue.songs.push({
                        title: videoInfo.title,
                        url: videoInfo.url,
                        duration: videoInfo.durationInSec,
                        author: command.member
                    });
                };
            };
        } else if (ytdl.validateURL(url)) {
            const videoInfo = await ytdl.getBasicInfo(ytdl.getURLVideoID(url.split("&")[0]));

            songs.push({
                title: videoInfo.videoDetails.title,
                url: videoInfo.videoDetails.video_url,
                duration: videoInfo.videoDetails.lengthSeconds,
                author: command.member
            });

            queueSongs(songs);
        } else if (scdl.isPlaylistURL(url)) {
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

                if (i == 0) {
                    queueSongs(songs);
                } else if (queue) {
                    queue.songs.push({
                        title: trackInfo.title,
                        url: trackInfo.permalink_url,
                        duration: trackInfo.duration/1000,
                        author: command.member
                    });
                };
            };
        } else if (scdl.isValidUrl(url)) {
            const trackInfo = await scdl.getInfo(url, process.env.soundcloudID);
            songs.push({
                title: trackInfo.title,
                url: trackInfo.permalink_url,
                duration: trackInfo.duration/1000,
                author: command.member
            });

            queueSongs(songs);
        } else if (url.startsWith("https") && playdl.sp_validate(url) === "playlist" || url.startsWith("https") && playdl.sp_validate(url) === "album") {
            if (playdl.is_expired()) { await playdl.refreshToken() };

            const plInfo = await playdl.spotify(url);
            playlistInfo = {
                title: plInfo.name,
                url: plInfo.url,
                tracks: plInfo.tracksCount,
                author: command.member
            };

            await plInfo.fetched_tracks.forEach(async mapInfo => {
                for (let i = 0; i < mapInfo.length; i++) {
                    const spTrack = mapInfo[i];

                    const videoInfo = await playdl.search(`${spTrack.artists.map(artist => `${artist.name}`).join(", ")} - ${spTrack.name}`, { limit: 1 });

                    songs.push({
                        title: videoInfo[0].title,
                        url: videoInfo[0].url,
                        duration: videoInfo[0].durationInSec,
                        author: command.member
                    });

                    if (i == 0) {
                        queueSongs(songs);
                    } else if (queue) {
                        queue.songs.push({
                            title: videoInfo[0].title,
                            url: videoInfo[0].url,
                            duration: videoInfo[0].durationInSec,
                            author: command.member
                        });
                    };
                };
            });
        } else if (url.startsWith("https") && playdl.sp_validate(url) === "track") {
            if (playdl.is_expired()) { await playdl.refreshToken() };

            const spTrack = await playdl.spotify(url);

            const videoInfo = await playdl.search(`${spTrack.artists.map(artist => `${artist.name}`).join(", ")} - ${spTrack.name}`, { limit: 1 });

            songs.push({
                title: videoInfo[0].title,
                url: videoInfo[0].url,
                duration: videoInfo[0].durationInSec,
                author: command.member
            });

            queueSongs(songs);
        } else {
            const videoInfo = await playdl.search(url, { limit: 1});

            songs.push({
                title: videoInfo[0].title,
                url: videoInfo[0].url,
                duration: videoInfo[0].durationInSec,
                author: command.member
            });

            queueSongs(songs);
        };

        async function queueSongs(songs) {
            if (queue) {
                const length = queue.songs.length;
                queue.songs = [...queue.songs, ...songs];
    
                if (queue.status == "idle") {
                    console.log("not playing");
                    await play(queue.songs[length]);
                };
    
                if (songs.length > 1 && playlistInfo) {
                    try {
                        await command.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                                    .setFooter({ text: `By: ${playlistInfo.author.user.tag}` })
                                    .setColor(color)
                            ],
                            allowedMentions: { repliedUser: false }
                        });
                    } catch (err) {
                        await command.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                                    .setFooter({ text: `By: ${playlistInfo.author.user.tag}` })
                                    .setColor(color)
                            ],
                            allowedMentions: { repliedUser: false }
                        });
                    };
                } else {
                    for (let i = 0; i < songs.length; i++) {
                        const song = songs[i];
        
                        var songDurantion = song.duration;
                        var min = Math.floor((songDurantion / 60) << 0);
                        var sec = Math.floor((songDurantion) % 60);
                            if (sec <= 9) { sec = `0${sec}` };
                        songDurantion = `${min}:${sec}`;
                
                        try {
                            await command.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                        .setFooter({ text: `By: ${song.author.user.tag}` })
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false }
                            });
                        } catch (err) {
                            await command.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                        .setFooter({ text: `By: ${song.author.user.tag}` })
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false }
                            });
                        };
                    };
                };
            } else {
                queueConstruct.songs = songs;
                client.queue.set(command.guild.id, queueConstruct);
    
                if (playlistInfo) {
                    try {
                        await command.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                                    .setFooter({ text: `By: ${playlistInfo.author.user.tag}` })
                                    .setColor(color)
                            ],
                            allowedMentions: { repliedUser: false }
                        });
                    } catch (err) {
                        await command.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                                    .setFooter({ text: `By: ${playlistInfo.author.user.tag}` })
                                    .setColor(color)
                            ],
                            allowedMentions: { repliedUser: false }
                        });
                    };
                } else {
                    for (let i = 0; i < songs.length; i++) {
                        const song = songs[i];
        
                        var songDurantion = song.duration;
                        var min = Math.floor((songDurantion / 60) << 0);
                        var sec = Math.floor((songDurantion) % 60);
                            if (sec <= 9) { sec = `0${sec}` };
                        songDurantion = `${min}:${sec}`;
                
                        try {
                            await command.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                        .setFooter({ text: `By: ${song.author.user.tag}` })
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false }
                            });
                        } catch (err) {
                            await command.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                        .setFooter({ text: `By: ${song.author.user.tag}` })
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false }
                            });
                        };
                    };
                };
    
                queueConstruct.connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: command.guild.id,
                    adapterCreator: command.guild.voiceAdapterCreator
                });

                await play(queueConstruct.songs[0]);
            };
        };
    } catch (err) {
        if (err.statusCode == 410) {
            try {
                await command.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> Video is age restricted`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            } catch (err) {
                await command.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> Video is age restricted`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };
            return;
        };

        console.log(err);

        try {
            await command.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Something went wrong... \n> \`${err}\``)
                        .setColor(color)
                ],
                allowedMentions: { repliedUser: false },
                ephemeral: true
            });
        } catch (err) {
            try {
                await command.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Something went wrong... \n> \`${err}\``)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            } catch (err) {
                await command.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Something went wrong... \n> \`${err}\``)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });
            };
        };

        return;
    };

    async function play(song) {
        const queue = client.queue.get(command.guild.id);

        if (!song) {
            console.log("no songs", song);
            return;
        };

        const player = createAudioPlayer();
        var stream;
        console.log("url match: yt:", ytdl.validateURL(song.url), "sc:", scdl.isValidUrl(song.url), song.url);
        try {
            if (ytdl.validateURL(song.url)) {
                stream = await ytstream.stream(song.url, { quality: 'high', type: 'audio', highWaterMark: 1048576 * 32, download: true });

                player.play(createAudioResource(stream.stream, { inputType : stream.type, inlineVolume: true }));
            } else if (scdl.isValidUrl(song.url)) {
                stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, process.env.soundcloudID);

                player.play(createAudioResource(stream, { inlineVolume: true }));
            };
        } catch (err) {
            if (err.message.includes("Sign in to confirm your age")) {
                await command.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`> Video is age restricted`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false },
                    ephemeral: true
                });

                console.log("idle");
                queue.status = "idle";

                for (let i = 0; i < queue.songs.length; i++) {
                    if (queue.songs.length > i+1 && queue.songs[i] == song) {
                        console.log("else", i+1, queue.songs.length);
                        return play(queue.songs[i+1]);
                    };
                };
                
                return;
            } else {
                console.log(err);

                await command.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Something went wrong... \n> \`${err}\``)
                            .setColor(color)
                    ]
                });

                console.log("idle");
                queue.status = "idle";

                for (let i = 0; i < queue.songs.length; i++) {
                    if (queue.songs.length > i+1 && queue.songs[i] == song) {
                        console.log("else", i+1, queue.songs.length);
                        return play(queue.songs[i+1]);
                    };
                };

                return;
            };
        };

        var npMsg;
            player.on(AudioPlayerStatus.Playing, async () => {
                console.log("playing");
                queue.status = "playing";
                queue.npSong = song;

                if (npMsg && npMsg.deletable) {
                    command.channel.messages.fetch(npMsg.id).then(msg => msg.delete()).catch((error) => console.log("playing delete msg, Error:", error.message));
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
                        voiceChannel = interaction.member.voice.channel;
                        if (!voiceChannel) {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription("> You need to be connected to voice channel")
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false },
                                ephemeral: true
                            });
                        };
                        if (interaction.guild.members.me.voice.channel && voiceChannel.id != interaction.guild.members.me.voice.channel.id) {
                            return interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription("> I\'m already connected to other voice channel")
                                        .setColor(color)
                                ],
                                allowedMentions: { repliedUser: false },
                                ephemeral: true
                            });
                        };

                        var queue = client.queue.get(interaction.guild.id);
                            if (!queue) {
                                return interaction.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setDescription("> There\'s no queue")
                                            .setColor(color)
                                    ],
                                    allowedMentions: { repliedUser: false },
                                    ephemeral: true
                                });
                            };

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
                queue.status = "idle";

                if(npMsg && npMsg.deletable) {
                    command.channel.messages.fetch(npMsg.id).then(msg => msg.delete()).catch((error) => console.log("idle delete msg, Error:", error.message));
                };

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
                            return play(queue.songs[0]);
                        } else if (queue.songs[i] == song) {
                            console.log("loop 1 2");
                            return play(queue.songs[i+1]);
                        };
                    };
                } else if (queue.loop == 2) {
                    console.log("loop 2");
                    return play(song);
                } else {
                    for (let i = 0; i < queue.songs.length; i++) {
                        if (queue.songs.length > i+1 && queue.songs[i] == song) {
                            console.log("else", i+1, queue.songs.length);
                            return play(queue.songs[i+1]);
                        };
                    };
                };

                if (queue.autoplay && ytdl.validateURL(song.url)) {
                    const songs = [];

                    const videoInfo = await ytdl.getBasicInfo(ytdl.getURLVideoID(song.url));

                    if (videoInfo.related_videos && videoInfo.related_videos[0]) {
                        songs.push({
                            title: videoInfo.related_videos[0].title,
                            url: `https://www.youtube.com/watch?v=${videoInfo.related_videos[0].id}`,
                            duration: videoInfo.related_videos[0].length_seconds,
                            author: command.guild.members.me
                        });

                        queue.songs = [...queue.songs, ...songs];

                        for (let i = 0; i < queue.songs.length; i++) {
                            if (queue.songs.length > i+1 && queue.songs[i] == song) {
                                console.log("autoplay", i+1, queue.songs.length);
                                return play(queue.songs[i+1]);
                            };
                        };
                    };
                };

                setTimeout(async () => {
                    if (client.queue.get(command.guild.id) && queue.status == "idle" && queue.npSong == song) {
                        console.log("destroy connection, inactive");

                        await queue.connection.destroy();
                        return client.queue.delete(command.guild.id);
                    };
                }, 1000*60*5);
            });
            player.on("error", async err => {
                console.log("error");
                console.log(err);
                queue.status = "idle";

                if (npMsg && npMsg.deletable) {
                    command.channel.messages.fetch(npMsg.id).then(msg => msg.delete()).catch((error) => console.log("error idle delete msg, Error:", error.message));
                };

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

                return await command.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`Something went wrong... \n> \`${err}\``)
                            .setColor(color)
                    ]
                });
            });

        queue.connection.subscribe(player);
        try { queue.connection._state.subscription.player._state.resource.volume.setVolume(queue.volume/100) } catch (error) { console.log("set volume", error) };

        queue.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            console.log("disconnected");

            if (npMsg && npMsg.deletable) {
                command.channel.messages.fetch(npMsg.id).then(msg => msg.delete()).catch((error) => console.log("disconnect delete msg, Error:", error.message));
            };

            try {
                await queue.connection.destroy()
            } catch (error) {
                console.log("disconnect destroy, Error:", error.message);
            };

            return client.queue.delete(command.guild.id);
        });
    };
}