module.exports = {
    name: 'clear',
    description: 'Clear the messages from a channel',
    options: [
        {
            name: 'amount',
            description: 'Amount to clear',
            type: 10,
            min_value: 0,
            max_value: 100,
            required: true
        }
    ],
    default_member_permissions: '8192',
    aliases: []
}
module.exports.run = async (client, discord, interaction) => {
    var amount = interaction.options.get('amount').value;
        if(amount > 100) amount = 100;

    interaction.channel.bulkDelete(amount, true).then(async (msgs) => {
        try{
            await interaction.reply(`> I deleted **\`${msgs.size}\`** messages!`)
            .then(async () => setTimeout(async () => { try{ await interaction.deleteReply(); } catch(err){ return; }; }, 4500));
        } catch(err){
            await interaction.channel.send(`> I deleted **\`${msgs.size}\`** messages!`)
            .then(async msg => setTimeout(async () => { try{ await msg.delete(); } catch(err){ return; }; }, 4500));
        };
    });
}