module.exports = client => {
    const Discord = require("discord.js");
    const { getVoiceConnection, EndBehaviorType } = require("@discordjs/voice");
    const fs = require("fs");
    const OpusScript = require("opusscript");
    const lamejs = require("lamejs");
    const { AssemblyAI } = require('assemblyai');

    const assembly = new AssemblyAI({
        apiKey: process.env.AIKey
    });

    var isSpeaking = false;

    client.on("voiceStateUpdate", async (oldState, newState) => {
    // If client joinned joice channel
        if (client.user.id == newState.member.id) {
            if (!oldState.channel && newState.channel) {
            // Getting client voice channel
                const connection = getVoiceConnection(newState.channel.guild.id);
                const receiver = connection.receiver;

            // Detect when a user is speaking
                receiver.speaking.on("start", userId => {
                    if (!isSpeaking) {
                    // Files info
                        const filename = `recorded_${userId}-${Date.now()}.pcm`;
                        const pcmFile = fs.createWriteStream(filename);
                        const filenameMP3 = `recorded_${userId}-${Date.now()}.mp3`;

                    // Creating Stream
                        const opusStream = receiver.subscribe(userId, {
                            end: {
                                behavior: EndBehaviorType.AfterSilence,
                                duration: 1000,
                            },
                        });

                        isSpeaking = true;

                        const opusDecoder = new OpusScript(48000, 2);

                    // Writting Stream
                        opusStream.on("data", (opusPacket) => {
                            const pcmBuffer = opusDecoder.decode(opusPacket);

                            pcmFile.write(pcmBuffer);
                        });

                    // Stream Ended
                        opusStream.on("end", async () => {
                        // Save File
                            pcmFile.end();

                        // Convert to MP3
                            const pcmData = fs.readFileSync(filename);

                            const mp3encoder = new lamejs.Mp3Encoder(2, 48000, 128);
                            const samples = new Int16Array(pcmData.buffer);

                            var mp3Data = [];

                            const spedUpSamples = new Int16Array(samples.length / 2);
                            for (let i = 0, j = 0; i < samples.length; i += 2, j++) {
                                spedUpSamples[j] = samples[i];
                            }

                            const mp3buf = mp3encoder.encodeBuffer(spedUpSamples, spedUpSamples);
                            mp3Data = [mp3buf, mp3encoder.flush()];

                            const mp3Buffers = mp3Data.map(buffer => Buffer.from(buffer));
                            const finalBuffer = Buffer.concat(mp3Buffers);

                            fs.writeFileSync(filenameMP3, finalBuffer);

                        // Send to AssemblyAI STT
                            const transcript = await assembly.transcripts.transcribe({
                                audio: fs.createReadStream(filenameMP3),
                                punctuate: false,
                                format_text: false
                            });
                            console.log(transcript.text);

                        // Delete Files
                            fs.unlinkSync(filename);
                            fs.unlinkSync(filenameMP3);

                            isSpeaking = false;

                            const args = transcript.text.split(" ");

                            for (let i = 0; i < args.length; i++) {
                                if (args[i] == "slash") {
                                    const command = client.commands.get(args[i+1]) || client.commands.find(a => a.aliases.includes(args[i+1]))
                                        if(!command) return;

                                    client.channels.cache.get('1222554916044935232').send(`${process.env.prefix}${args[i+1]} ${args.splice(i+2, args.length).join(" ")}`);
                                };
                            };
                        });
                    };
                });
            };
        };

        // if (!oldState.channel && newState.channel) {
        //     if (client.user.id !== newState.member.id &&  1 == 2) {
        //         const connection = getVoiceConnection(newState.channel.guild.id);
        //         const receiver = connection.receiver;

        //         receiver.speaking.on("start", userId => {
        //             if (!isSpeaking) {
        //                 const filename = `recorded_${userId}-${Date.now()}.pcm`;
        //                 const pcmFile = fs.createWriteStream(filename);
        //                 const filenameMP3 = `recorded_${userId}-${Date.now()}.mp3`;
     
        //                 const opusStream = receiver.subscribe(userId, {
        //                     end: {
        //                         behavior: EndBehaviorType.AfterSilence,
        //                         duration: 10000,
        //                     },
        //                 });
    
        //                 console.log("Started Recording.");
        //                 isSpeaking = true;
    
        //                 const opusDecoder = new OpusScript(48000, 2);
    
        //                 opusStream.on("data", (opusPacket) => {
        //                     const pcmBuffer = opusDecoder.decode(opusPacket);
    
        //                     pcmFile.write(pcmBuffer);
        //                 });
    
        //                 opusStream.on("end", async () => {
        //                     pcmFile.end();
        //                     console.log("Saved Recording.");

        //                     // Convert to mp3 so the ai can read it
        //                     const pcmData = fs.readFileSync(filename);

        //                     const mp3encoder = new lamejs.Mp3Encoder(2, 48000, 128);
        //                     const samples = new Int16Array(pcmData.buffer);

        //                     var mp3Data = [];

        //                     const spedUpSamples = new Int16Array(samples.length / 2);
        //                     for (let i = 0, j = 0; i < samples.length; i += 2, j++) {
        //                         spedUpSamples[j] = samples[i];
        //                     }

        //                     const mp3buf = mp3encoder.encodeBuffer(spedUpSamples, spedUpSamples);
        //                     mp3Data = [mp3buf, mp3encoder.flush()];

        //                     const mp3Buffers = mp3Data.map(buffer => Buffer.from(buffer));
        //                     const finalBuffer = Buffer.concat(mp3Buffers);
        //                     // Write the MP3 file
        //                     fs.writeFileSync(filenameMP3, finalBuffer);
    
        //                     const transcript = await assembly.transcripts.transcribe({
        //                         audio: fs.createReadStream(filenameMP3)
        //                     });
        //                     console.log(transcript.text);

        //                     isSpeaking = false;
        //                 });
        //             };
        //         });
        //     };
        // };
    });
}