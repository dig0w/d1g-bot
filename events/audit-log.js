module.exports = client => {
    const { MessageEmbed } = require('discord.js');
    const ms = require('ms');
  
    client.on('guildBanAdd', async ban => {
        const channel = ban.guild.channels.cache.get('835958004247166998');
        var color = ban.guild.me.displayHexColor;
            if(ban.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
    
        const log = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });
    
        const blog = log.entries.first();
            if(!blog) return;
            if(Date.now() - blog.createdTimestamp > 1000) return;
    
    
        if(blog.target.id == ban.user.id){
            channel.send({ embeds: [
                new MessageEmbed()
                    .setTitle('🔨 Ban')
                    .setDescription(`The member ${ban.user} has been banned!`)
                    .setFooter(`${blog.reason || 'No reason'}, by: ${blog.executor.tag}`, blog.executor.displayAvatarURL())
                    .setThumbnail(ban.user.displayAvatarURL())
                    .setColor(color)
            ] });
        };
    });
    client.on('guildBanRemove', async ban => {
        const channel = ban.guild.channels.cache.get('835958004247166998');
        var color = ban.guild.me.displayHexColor;
            if(ban.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
    
    
        const log = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_REMOVE',
        });
    
        const blog = log.entries.first();
            if(!blog) return;
            if(Date.now() - blog.createdTimestamp > 1000) return;
    
    
        if(blog.target.id == ban.user.id){
            channel.send({ embeds: [
                new MessageEmbed()
                    .setTitle('🔨 UnBan')
                    .setDescription(`The member ${ban.user} has been unbanned!`)
                    .setFooter(`by: ${blog.executor.tag}`, blog.executor.displayAvatarURL())
                    .setThumbnail(ban.user.displayAvatarURL())
                    .setColor(color)
            ] });
        };
    });
  
    client.on('guildMemberRemove', async member => {
        const channel = member.guild.channels.cache.get('835958004247166998');
        var color = member.guild.me.displayHexColor;
            if(member.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
    
        const log = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });
    
        const klog = log.entries.first();
            if(!klog) return;
            if(Date.now() - klog.createdTimestamp > 1000) return;
    
        if(klog.target.id == member.id){
            channel.send({ embeds: [
                new MessageEmbed()
                    .setTitle('🦵 Kick')
                    .setDescription(`The member ${member.user} has been kicked!`)
                    .setFooter(`${klog.reason || 'No reason'}, by: ${klog.executor.tag}`, klog.executor.displayAvatarURL())
                    .setThumbnail(member.user.displayAvatarURL())
                    .setColor(color)
            ] });
        };
    });
  
    client.on('guildMemberRemove', async member => {
        const channel = member.guild.channels.cache.get('835958004247166998');
        var color = member.guild.me.displayHexColor;
            if(member.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
    
        const log = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_PRUNE',
        });
    
        const plog = log.entries.first();
            if(!plog) return;
            if(Date.now() - plog.createdTimestamp > 1000) return;
    
        if(plog.target.id == member.id){
            channel.send({ embeds: [
                new MessageEmbed()
                    .setTitle('🦵 Prune')
                    .setDescription(`The member ${member.user} has been pruned!`)
                    .setFooter(`by: ${plog.executor.tag}`, plog.executor.displayAvatarURL())
                    .setThumbnail(member.user.displayAvatarURL())
                    .setColor(color)
            ] });
        };
    });
  
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const channel = newMember.guild.channels.cache.get('835958004247166998');
        var color = newMember.guild.me.displayHexColor;
            if(newMember.guild.me.displayHexColor == '#000000') color = '#AD8EFB';
    
        if(newMember.communicationDisabledUntilTimestamp){
            const log = await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_UPDATE',
            });
    
            const tlog = log.entries.first();
                if(!tlog) return;
                if(Date.now() - tlog.createdTimestamp > 1000) return;
    
            const time = newMember.communicationDisabledUntilTimestamp - Date.now();
            
            if(tlog.target.id == newMember.id){
                channel.send({ embeds: [
                    new MessageEmbed()
                    .setTitle('🤐 Mute')
                    .setDescription(`The member ${newMember.user} has been muted for **\`${ms(time)}\`**!`)
                    .setFooter(`${tlog.reason || 'No reason'}, by: ${tlog.executor.tag}`, tlog.executor.displayAvatarURL())
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .setColor(color)
                ] });
        
                setTimeout(async () => {
                    if(newMember.guild.members.cache.get(newMember.user.id).communicationDisabledUntilTimestamp){
                        channel.send({ embeds: [
                            new MessageEmbed()
                            .setTitle('🤐 Unmute')
                            .setDescription(`The member ${newMember.user} has been unmuted!`)
                            .setFooter(`Time ended`)
                            .setThumbnail(newMember.user.displayAvatarURL())
                            .setColor(color)
                        ] });
                    };
                }, time - 500);
            };
        } else if(!newMember.communicationDisabledUntilTimestamp){
            const log = await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_UPDATE',
            });
    
            const tlog = log.entries.first();
                if(!tlog) return;
                if(Date.now() - tlog.createdTimestamp > 1000) return;
            
            if(tlog.target.id == newMember.id){
                channel.send({ embeds: [
                    new MessageEmbed()
                        .setTitle('🤐 Unmute')
                        .setDescription(`The member ${newMember.user} has been unmuted!`)
                        .setFooter(`by: ${tlog.executor.tag}`, tlog.executor.displayAvatarURL())
                        .setThumbnail(newMember.user.displayAvatarURL())
                        .setColor(color)
                ] });
            };
        };
    });
}