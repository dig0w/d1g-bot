module.exports = client => {
    const Spam = new Map();

    const LIMIT = 7;
    const TIME = 7500;
    const DIFF = 10000;

    client.on('message', async message => {
        if(message.author.bot || message.channel.type === 'dm') return;

        if(Spam.has(message.author.id)){
            const userData = Spam.get(message.author.id);
            const { lastMessage, timer } = userData;
            const difference = message.createdTimestamp - lastMessage.createdTimestamp;
            var msgCount = userData.msgCount;

            if(difference > DIFF){
                clearTimeout(timer);
                userData.msgCount = 1;
                userData.lastMessage = message;
                userData.timer = setTimeout(() => {
                    Spam.delete(message.author.id);
                }, TIME);
                Spam.set(message.author.id, userData);
            } else{
                ++msgCount;
                if(parseInt(msgCount) > LIMIT){
                    const { MessageEmbed } = require('discord.js');
                    var color = message.guild.me.displayHexColor;
                    if(message.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
                    const member = message.guild.members.cache.find(member => member.id == message.author.id);
                    var reason = 'Sent to many messages in a short time';

                    message.delete();

                    const channel = message.guild.channels.cache.get('835958004247166998');

                    channel.send({ embeds: [
                        new MessageEmbed()
                            .setTitle(`⚠ Warn`)
                            .setDescription(`The member ${member.user} has been warned!`)
                            .setFooter(reason)
                            .setThumbnail(member.user.displayAvatarURL())
                            .setColor(color)
                    ] });

                    return Spam.delete(message.author.id);
                } else{
                    userData.msgCount = msgCount;
                    return Spam.set(message.author.id, userData);
                };
            };
        } else{
            var fn = setTimeout(() => {
                Spam.delete(message.author.id);
            }, TIME);
            Spam.set(message.author.id, {
                msgCount: 1,
                lastMessage: message,
                timer: fn
            });
            return;
        };
    });
}