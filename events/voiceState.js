module.exports = client => {
    const { getVoiceConnection } = require("@discordjs/voice");

    client.on("voiceStateUpdate", async (oldState, newState) => {
        if (newState.guild.members.me.voice.channel && newState.guild.members.me.voice.channel.members && newState.guild.members.me.voice.channel.members.find(member => member.user.id == client.user.id) && newState.guild.members.me.voice.channel.members.size == 1) {
            setTimeout(() => {
                if (newState.guild.members.me.voice.channel && newState.guild.members.me.voice.channel.members && newState.guild.members.me.voice.channel.members.find(member => member.user.id == client.user.id) && newState.guild.members.me.voice.channel.members.size == 1) {
                    console.log("destroy connection, lonely");

                    const connection = getVoiceConnection(newState.guild.id);

                    connection.destroy();
                    return client.queue.delete(newState.guild.id);
                };
            }, 1000*60*1);
        };
    });
}