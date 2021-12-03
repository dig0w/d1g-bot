module.exports = client => {
    client.on('guildMemberAdd', async member => {
        var autorole = '835944323010134128';

        if(!member.pending){
            const role = member.guild.roles.cache.find(role => role.id == autorole);
                if(!role) return;

            return member.roles.add(role);
        } else{
            client.on('guildMemberUpdate', async (oldMember, newMember) => {
                if(newMember.user.id == member.user.id){
                    if(!newMember.pending){
                        const role = newMember.guild.roles.cache.find(role => role.id == autorole);
                            if(!role) return;
            
                        return newMember.roles.add(role);
                    };
                };
            });
        };
    });
}