module.exports = {
    name: 'play',
    description: 'Play a song in the voice channel',
    aliases: ['p'],
    options: [
        {
            name: 'song',
            type: 2,
            required: true
        }
    ],
    permissions: []
}
module.exports.run = async (client, { MessageEmbed }, message, args, color) => {
    const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
    const playdl = require('play-dl');
    const scdl = require('soundcloud-downloader').default;
    const spdl = require('spotify-url-info');
  
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
    const url = args.splice(1, args.length).join(' ');

    const ytPlaylistPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/(playlist\?list=)([^#\&\?]*).*/gi;
    const ytPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const scPlaylistPattern = /^https?:\/\/(soundcloud\.com)\/.+?\/(sets)\/(.*)$/;
    const scPattern = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const spPattern = /^https?:\/\/(open\.spotify\.com)\/(track)\/(.*)$/;
    const spPlaylistPattern = /^https?:\/\/(open\.spotify\.com)\/(playlist)\/(.*)$/;
    const spAlbumPattern = /^https?:\/\/(open\.spotify\.com)\/(album)\/(.*)$/;

    try{
        const queue = client.queue.get(message.guild.id);

        const queueConstruct = {
            voiceChannel: voiceChannel,
            connection: undefined,
            songs: [],
            playing: false,
            volume: 50,
            npSong: 0,
            skipto: 0,
            loop: 0
        };
        var songs = [];
        var playlistInfo;

        if(ytPlaylistPattern.test(url)){
            const plInfo = await playdl.playlist_info(url, { incomplete : true });
            playlistInfo = {
                title: plInfo.title,
                url: plInfo.url,
                tracks: plInfo.videoCount,
                author: message.member
            };

            for(var i = 0; i < plInfo.videos.length; i++){
                const videoInfo = plInfo.videos[i];

                songs.push({
                    title: videoInfo.title,
                    url: videoInfo.url,
                    duration: videoInfo.durationInSec,
                    author: message.member
                });
            };
        } else if(ytPattern.test(url)){
            const videoInfo = await playdl.video_info(url);
            songs.push({
                title: videoInfo.video_details.title,
                url: videoInfo.video_details.url,
                duration: videoInfo.video_details.durationInSec,
                author: message.member
            });
        } else if(scPlaylistPattern.test(url)){
            const plInfo = await scdl.getSetInfo(url, process.env.soundcloudID);
            playlistInfo = {
                title: plInfo.title,
                url: plInfo.permalink_url,
                tracks: plInfo.track_count || plInfo.tracks.length,
                author: message.member
            };

            for(var i = 0; i < plInfo.tracks.length; i++){
                const trackInfo = plInfo.tracks[i];

                songs.push({
                    title: trackInfo.title,
                    url: trackInfo.permalink_url,
                    duration: trackInfo.duration/1000,
                    author: message.member
                });
            };
        } else if(scPattern.test(url)){
            const trackInfo = await scdl.getInfo(url, process.env.soundcloudID);
            songs.push({
                title: trackInfo.title,
                url: trackInfo.permalink_url,
                duration: trackInfo.duration/1000,
                author: message.member
            });
        } else if(spPattern.test(url)){
            const trackInfo = await spdl.getPreview(url);
            const trackInfoDur = await spdl.getData(url);

            songs.push({
                title: `${trackInfo.artist} - ${trackInfo.title}`,
                url: trackInfo.link,
                duration: trackInfoDur.duration_ms/1000,
                author: message.member
            });
        } else if(spPlaylistPattern.test(url) || spAlbumPattern.test(url)){
            const plInfo = await spdl.getPreview(url);
            const plTracks = await spdl.getTracks(url);

            playlistInfo = {
                title: `${plInfo.artist} - ${plInfo.title}`,
                url: plInfo.link,
                tracks: plTracks.length,
                author: message.member
            };

            for(var i = 0; i < plTracks.length; i++){
                const trackInfo = plTracks[i];

                var artists = []
                  for(var l = 0; l < trackInfo.artists.length; l++){ artists.push(trackInfo.artists[l].name); };

                songs.push({
                    title: `${artists.join(' & ')} - ${trackInfo.name}`,
                    url: trackInfo.external_urls.spotify,
                    duration: trackInfo.duration_ms/1000,
                    author: message.member
                });
            };
        } else {
            const videoInfo = await playdl.search(url, { limit: 1});
            songs.push({
                title: videoInfo[0].title,
                url: videoInfo[0].url,
                duration: videoInfo[0].durationInSec,
                author: message.member
            });
        };

        if(queue){
            queue.songs = [...queue.songs, ...songs];

            if(!queue.playing){
                await play(queue.songs[songs[0]]);
            };

            if(songs.length > 1 && playlistInfo){
                await message.reply({ embeds: [
                        new MessageEmbed()
                            .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                            .setFooter(`By: ${playlistInfo.author.user.tag}`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            } else{
                for(var i = 0; i < songs.length; i++){
                    const song = songs[i];
    
                    var songDurantion = song.duration;
                    var min = Math.floor((songDurantion / 60) << 0);
                    var sec = Math.floor((songDurantion) % 60);
                        if(sec <= 9) sec = `0${sec}`;
                    songDurantion = `${min}:${sec}`;
            
                    await message.reply({ embeds: [
                            new MessageEmbed()
                                .setDescription(`↪️ Queued: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                                .setFooter(`By: ${song.author.user.tag}`)
                                .setColor(color)
                        ],
                        allowedMentions: { repliedUser: false }
                    });
                };
            };
        } else{
            queueConstruct.songs = songs;
            client.queue.set(message.guild.id, queueConstruct);

            if(songs.length > 1 && playlistInfo){
                await message.reply({ embeds: [
                        new MessageEmbed()
                            .setDescription(`↪️ Queued: [${playlistInfo.title}](${playlistInfo.url}) with **\`${playlistInfo.tracks}\`** songs`)
                            .setFooter(`By: ${playlistInfo.author.user.tag}`)
                            .setColor(color)
                    ],
                    allowedMentions: { repliedUser: false }
                });
            };

            queueConstruct.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });
    
            await play(queueConstruct.songs[0]);
        };
    } catch (err){
        console.log(err);

        client.queue.delete(message.guild.id);

        const connection = getVoiceConnection(message.guild.id);
        if(connection){ connection.destroy(); };

        return await message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Something went wrong... \n> \`${err}\``)
                    .setColor(color)
            ],
            allowedMentions: { repliedUser: false }
        });
    };

    async function play(song) {
        const queue = client.queue.get(message.guild.id);

        if(!song){
            setTimeout(async () => {
                if(song) return;
                const connection = getVoiceConnection(message.guild.id);
                if(connection){ connection.destroy(); };
                return client.queue.delete(message.guild.id);
            }, 2.5 * 60000);
            return;
        };

        const player = createAudioPlayer();
        var stream;
        if(ytPattern.test(song.url)){
            stream = await playdl.stream(song.url);

            player.play(createAudioResource(stream.stream, { inputType : stream.type, inlineVolume: true }));
        } else if(scPattern.test(song.url)){
            stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, process.env.soundcloudID);

            player.play(createAudioResource(stream, { inlineVolume: true }));
        } else if(spPattern.test(song.url)){
            const songInfo = await playdl.search(song.title, { limit: 1});
                if(!songInfo) return;

            stream = await playdl.stream(songInfo[0].url);

            player.play(createAudioResource(stream.stream, { inputType : stream.type, inlineVolume: true }));
        };

        var npMsg;
            player.on(AudioPlayerStatus.Playing, async () => {
                queue.playing = true;
                queue.npSong = song;

                var songDurantion = song.duration;
                var min = Math.floor((songDurantion / 60) << 0);
                var sec = Math.floor((songDurantion) % 60);
                    if(sec <= 9) sec = `0${sec}`;
                songDurantion = `${min}:${sec}`;
    
                npMsg = await message.channel.send({ embeds: [
                    new MessageEmbed()
                        .setDescription(`▶️ Now Playing: [${song.title}](${song.url}) **\`${songDurantion}\`**`)
                        .setFooter(`By: ${song.author.user.tag}`)
                        .setColor(color)
                ]});
            });
            player.on(AudioPlayerStatus.Idle, async () => {
                if(npMsg && npMsg.deletable) npMsg.delete();
                queue.playing = false;

                if(queue.skipto > 0){ return play(queue.songs[queue.skipto]); };

                if(queue.loop == 1){
                    for(var i = 0; i < queue.songs.length; i++){
                        if(queue.songs[queue.songs.length-1] == song){ play(queue.songs[0]); }
                        else if(queue.songs[i] == song){ play(queue.songs[i+1]); };
                    };
                } else if(queue.loop == 2){
                    play(song);
                } else{
                    for(var i = 0; i < queue.songs.length; i++){
                        if(queue.songs.length >= i+1 && queue.songs[i] == song){ play(queue.songs[i+1]); };
                    };
                };
            });
            player.on('error', async err => {
                console.log(err);

                if(npMsg && npMsg.deletable) npMsg.delete();
                queue.playing = false;

                if(queue.skipto > 0){ return play(queue.songs[queue.skipto]); };

                if(queue.loop == 1){
                    for(var i = 0; i < queue.songs.length; i++){
                        if(queue.songs[queue.songs.length-1] == song){ play(queue.songs[0]); }
                        else if(queue.songs[i] == song){ play(queue.songs[i+1]); };
                    };
                } else if(queue.loop == 2){
                    play(song);
                } else{
                    for(var i = 0; i < queue.songs.length; i++){
                        if(queue.songs.length >= i+1 && queue.songs[i] == song){ play(queue.songs[i+1]); };
                    };
                };

                return await message.channel.send({ embeds: [
                    new MessageEmbed()
                        .setDescription(`Something went wrong... \n> \`${err}\``)
                        .setColor(color)
                ]});
            });
            player._state.resource.volume.setVolume(queue.volume/100);

        queue.connection.subscribe(player);
        queue.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => { client.queue.delete(message.guild.id); });
    };
}