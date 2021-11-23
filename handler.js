module.exports = client => {
    const fs = require('fs');

    const ccategories = fs.readdirSync('./commands/');
    for(const category of ccategories){
        const commandFiles = fs.readdirSync(`./commands/${category}`).filter(File => File.endsWith('.js'));

        for(const files of commandFiles){
            const command = require(`./commands/${category}/${files}`);

            if(command.name){
                client.commands.set(command.name, command);
            };
        };
    };

    const eventsFiles = fs.readdirSync('./events/');
    for(const files of eventsFiles){
        require(`./events/${files}`)(client);
    };
}