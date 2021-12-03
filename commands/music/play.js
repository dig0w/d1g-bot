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
    const ytdl = require('ytdl-core');
    const ytpl = require('ytpl');
    const scdl = require('soundcloud-downloader').default;
    const ytsr = require('ytsr');

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

    const scPlaylistPattern = /^https?:\/\/(soundcloud\.com)\/.+?\/(sets)\/(.*)$/;
    const scPattern = /^https?:\/\/(soundcloud\.com)\/(.*)$/;

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

        if(ytdl.validateURL(url)){
            const videoInfo = await ytdl.getBasicInfo(url);
            songs.push({
                title: videoInfo.videoDetails.title,
                url: videoInfo.videoDetails.video_url,
                duration: videoInfo.videoDetails.lengthSeconds,
                author: message.member
            });
        } else if(ytpl.validateID(url)){
            const plInfo = await ytpl(url);
            playlistInfo = {
                title: plInfo.title,
                url: plInfo.url,
                tracks: plInfo.estimatedItemCount,
                author: message.member
            };

            for(var i = 0; i < plInfo.items.length; i++){
                const videoInfo = plInfo.items[i];

                songs.push({
                    title: videoInfo.title,
                    url: videoInfo.url,
                    duration: videoInfo.durationSec,
                    author: message.member
                });
            };
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
        } else{
            const video = await ytsr(url, { limit: 1});
            const videoInfo = await ytdl.getBasicInfo(video.items[0].url);
            songs.push({
                title: videoInfo.videoDetails.title,
                url: videoInfo.videoDetails.video_url,
                duration: videoInfo.videoDetails.lengthSeconds,
                author: message.member
            });
        };

        if(queue){
            queue.songs = [...queue.songs, ...songs];

            if(!queue.playing){
                await play(queue.songs[queue.npSong]);
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

        var stream;
        if(ytdl.validateURL(song.url)){
            stream = await ytdl(song.url, { type: 'opus', filter: 'audioonly', highWaterMark: 100 });
        } else if(scPattern.test(url)){
            stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, process.env.soundcloudID);
        };

        var npMsg;

        const player = createAudioPlayer();
            player.play(createAudioResource(stream, { inlineVolume: true }));

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

                console.log(err);
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