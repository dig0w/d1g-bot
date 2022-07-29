module.exports = {
    name: 'ping',
    description: 'Gives the bot ping',
	aliases: []
}
module.exports.run = async (client, discord, interaction) => {
	if(interaction.applicationId){
		await interaction.reply('> Pinging...').then(async () => setTimeout(async () => { try{ await interaction.editReply(`🏓  Pong!\n> ${client.ws.ping}ms`); } catch(err){ return; }; }, 300));
	} else{
		await interaction.reply({
			content: '> Pinging...',
			allowedMentions: {
				repliedUser: false
			}
		}).then(async msg => setTimeout(async () => { try{ await msg.edit({
			content: `🏓  Pong!\n> ${client.ws.ping}ms`,
			allowedMentions: {
				repliedUser: false
			}
		}); } catch(err){ return; }; }, 300));
	};
}