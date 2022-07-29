module.exports = {
    name: 'play',
    description: 'Plays a song on the voice channel',
    options: [
        {
            name: 'song',
            description: 'Song to play',
            type: 3,
            required: true
        }
    ],
    aliases: ['p']
}
module.exports.run = async (client, { MessageEmbed }, interaction) => {
    const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
    const youtubei = require('youtubei');
    const youtube = new youtubei.Client();
    const ytdl = require('ytdl-core');
    const soundcloud = require('soundcloud-downloader').default;
    const color = interaction.guild.me.displayHexColor;

    const link = interaction.options.get('song').value;

    const voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel){
            return await interaction.reply({ content: '> You need to be connected to voice channel', ephemeral: true, allowedMentions: { repliedUser: false } });
        };
        if(interaction.guild.me.voice.channel && voiceChannel.id != interaction.guild.me.voice.channel.id){
            return await interaction.reply({ content: '> I\'m already playing music in other voice channel', ephemeral: true, allowedMentions: { repliedUser: false } });
        };

    const queue = client.queue.get(interaction.guildId);

    const queueConstruct = {
        voiceChannel: voiceChannel,
        textChannel: interaction.channel,
        connection: undefined,
        songs: [],
        songIndex: 0,
        playing: false,
        loop: 0,
        autoplay: false,
        volume: 100
    };
    var song;
    var playlist;

    try{
        await interaction.deferReply();
    } catch(err){ };

    // Youtube Playlist
    if(link.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/(playlist\?list=)([^#\&\?]*).*/gi)){
        const playlistInfo = await youtube.getPlaylist(link.match(/[&?]list=([^&]+)/i)[1]);
        playlist = {
            url: `https://www.youtube.com/playlist?list=${link.match(/[&?]list=([^&]+)/i)[1]}`,
            title: playlistInfo.title,
            length: playlistInfo.videoCount,
            songs: [],
            author: interaction.member
        };

        for(var i = 0; i < playlistInfo.videos.items.length; i++){
            const videoInfo = playlistInfo.videos.items[i];
            playlist.songs.push({
                id: videoInfo.id,
                url: `https://www.youtube.com/watch?v=${videoInfo.id}`,
                title: videoInfo.title,
                duration: videoInfo.duration,
                author: interaction.member
            });
        };
    // Youtube
    } else if(link.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi)){
        const videoInfo = await youtube.getVideo(link.match(/youtu(?:.*\/v\/|.*v\=|\.be\/)([A-Za-z0-9_\-]{11})/)[1]);
        song = {
            id: videoInfo.id,
            url: `https://www.youtube.com/watch?v=${videoInfo.id}`,
            title: videoInfo.title,
            duration: videoInfo.duration,
            author: interaction.member
        };
    // Soundcloud Playlist
    } else if(link.match(/^https?:\/\/(soundcloud\.com)\/.+?\/(sets)\/(.*)$/)){
        const playlistInfo = await soundcloud.getSetInfo(link, process.env.soundcloudID);
        playlist = {
            url: playlistInfo.permalink_url,
            title: playlistInfo.title,
            length: playlistInfo.track_count || playlistInfo.tracks.length,
            songs: [],
            author: interaction.member
        };

        for(var i = 0; i < playlistInfo.tracks.length; i++){
            const trackInfo = playlistInfo.tracks[i];
            playlist.songs.push({
                title: trackInfo.title,
                url: trackInfo.permalink_url,
                duration: trackInfo.duration/1000,
                author: interaction.member
            });
        };
    // Soundcloud
    } else if(link.match(/^https?:\/\/(soundcloud\.com)\/(.*)$/)){
        const trackInfo = await soundcloud.getInfo(link, process.env.soundcloudID);
        song = {
            title: trackInfo.title,
            url: trackInfo.permalink_url,
            duration: trackInfo.duration/1000,
            author: interaction.member
        };
    // Youtube Search
    } else {
        const search = await youtube.search(link, { type: 'video', sort: 'view' });
        song = {
            id: search.items[0].id,
            url: `https://www.youtube.com/watch?v=${search.items[0].id}`,
            title: search.items[0].title,
            duration: search.items[0].duration,
            author: interaction.member
        };
    };

    if(queue){
        if(playlist){
            queue.songs = [...queue.songs, ...playlist.songs];

            if(!queue.playing){
                await play(queue.songs[queue.songIndex]);
            };

            const msg = { embeds: [
                new MessageEmbed()
                    .setDescription(`↪️ Queued: [${playlist.title}](${playlist.url}) with **\`${playlist.length}\`** songs`)
                    .setFooter(`By: ${playlist.author.user.tag}`)
                    .setColor(color)
            ], allowedMentions: { repliedUser: false } };

            try{ await interaction.editReply(msg);
            } catch(err){ await interaction.reply(msg); };
        } else{
            queue.songs.push(song);

            if(!queue.playing){
                await play(queue.songs[queue.songIndex]);
            } else{
                var songDurantion = song.duration;
                var min = Math.floor((songDurantion / 60) << 0);
                var sec = Math.floor((songDurantion) % 60).toString().padStart(2, '0');
                songDurantion = `${min}:${sec}`;

                const msg = { embeds: [
                    new MessageEmbed()
                        .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                        .setFooter(`By: ${song.author.user.tag}`)
                        .setColor(color)
                ], allowedMentions: { repliedUser: false } };
    
                try{ await interaction.editReply(msg);
                } catch(err){ await interaction.reply(msg); };
            };
        };
    } else{
        if(playlist){
            queueConstruct.songs = playlist.songs;
            client.queue.set(interaction.guildId, queueConstruct);

            const msg = { embeds: [
                new MessageEmbed()
                    .setDescription(`↪️ Queued: [${playlist.title}](${playlist.url}) with **\`${playlist.length}\`** songs`)
                    .setFooter(`By: ${playlist.author.user.tag}`)
                    .setColor(color)
            ], allowedMentions: { repliedUser: false } };

            try{ await interaction.editReply(msg);
            } catch(err){ await interaction.reply(msg); };
    
            queueConstruct.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
    
            await play(queueConstruct.songs[0]);
        } else{
            queueConstruct.songs.push(song);
            client.queue.set(interaction.guildId, queueConstruct);
    
            queueConstruct.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
    
            await play(queueConstruct.songs[0]);
        };
    };

    async function play(song){
        const queue = client.queue.get(interaction.guildId);

        var idled;

        const player = createAudioPlayer();

        var stream;

        if(song.url.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi)){
            stream = createAudioResource(ytdl(song.id, { filter: 'audioonly', highWaterMark: 1 << 62, liveBuffer: 1 << 62, dlChunkSize: 0, bitrate: 128 }), { inlineVolume: true });
        } else if(song.url.match(/^https?:\/\/(soundcloud\.com)\/(.*)$/)){
            stream = createAudioResource(await soundcloud.downloadFormat(song.url, soundcloud.FORMATS.OPUS, process.env.soundcloudID), { inlineVolume: true });
        };

        player.play(stream);

        player.on(AudioPlayerStatus.Playing, async () => {
            queue.playing = true;

            if(idled){ clearInterval(idled); };

            var songDurantion = song.duration;
            var min = Math.floor((songDurantion / 60) << 0);
            var sec = Math.floor((songDurantion) % 60).toString().padStart(2, '0');
            songDurantion = `${min}:${sec}`;

            const msg = { embeds: [
                new MessageEmbed()
                    .setDescription(`▶️ Now Playing: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                    .setFooter(`By: ${song.author.user.tag}`)
                    .setColor(color)
            ], allowedMentions: { repliedUser: false }};

            try{ await interaction.followUp(msg);
            } catch(err){ await interaction.reply(msg); };
        })
        .on(AudioPlayerStatus.Idle, async () => {
            queue.playing = false;
            queue.songIndex = queue.songIndex+1;

            idled = setInterval(() => {
                queue.connection.destroy();
                client.queue.delete(interaction.guildId);

                clearInterval(idled);
            }, 5*60*1000);

            if(queue.autoplay){
                if(queue.songs[queue.songs.length-1] == song){
                    const videoInfo = await youtubei.getVideo(queue.songs[queue.songIndex-1].id)

                    queue.songs.push({
                        id: videoInfo.related.items[0].id,
                        url: `https://www.youtube.com/watch?v=${videoInfo.related.items[0].id}`,
                        title: videoInfo.related.items[0].title,
                        duration: videoInfo.related.items[0].duration,
                        author: { user: { tag: 'Auto Play' } }
                    });

                    play(queue.songs[queue.songIndex]);
                } else{
                    play(queue.songs[queue.songIndex]);
                };
            } else if(queue.loop == 1){
                for(var i = 0; i < queue.songs.length; i++){
                    if(queue.songs[queue.songs.length-1] == song){ play(queue.songs[0]); queue.songIndex = 0; }
                    else if(queue.songs[i] == song){ play(queue.songs[queue.songIndex]); };
                };
            } else if(queue.loop == 2){ play(song); queue.songIndex = queue.songIndex-1; }
            else if(queue.songs.length >= queue.songIndex+1){ play(queue.songs[queue.songIndex]); };
        })
        .on('error', async err => {
            console.log(err);

            queue.playing = false;
            queue.songIndex = queue.songIndex+1;

            if(queue.loop == 1){
                for(var i = 0; i < queue.songs.length; i++){
                    if(queue.songs[queue.songs.length-1] == song){ play(queue.songs[0]); queue.songIndex = 0; }
                    else if(queue.songs[i] == song){ play(queue.songs[i+1]); };
                };
            } else if(queue.loop == 2){ play(song); queue.songIndex = queue.songIndex-1; }
            else if(queue.songs.length >= queue.songIndex+1){ play(queue.songs[queue.songIndex]); };
        });
        player._state.resource.volume.setVolume(queue.volume/100);

        queue.connection.subscribe(player);
        queue.connection.on(VoiceConnectionStatus.Disconnected, async () => { client.queue.delete(interaction.guildId); });
    };
}