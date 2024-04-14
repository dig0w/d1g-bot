module.exports = client => {
    client.on("ready", () => console.log(`🤖 Client, ${client.user.tag}, is ready!`) );
}