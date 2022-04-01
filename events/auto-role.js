module.exports = client => {
    client.on('guildMemberAdd', async member => {
        var autorole = '835944323010134128';

        const role = member.guild.roles.cache.find(role => role.id == autorole);
            if(!role) return;

        return member.roles.add(role);
    });
}