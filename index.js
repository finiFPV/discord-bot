const { Client, ChannelType, PermissionFlagsBits } = require('discord.js');
const TOKEN = ""
const privateVoiceChannel = "➕ Create private channel"
const privateChannelCategory = "Private Channels"
const ownderID = ""
const client = new Client({ intents: 641 });


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`Bot is in: "${client.guilds.holds.length}" guilds as of boot`);
    client.application.commands.create({
        name: 'ping',
        description: "Replies with pong(bot's latency).",
    })
    client.application.commands.create({
        name: 'setup',
        description: "Setups the server so the bot can be properly used.",
    })
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    switch(interaction.commandName) {
        case 'ping':
            await interaction.reply({"embeds": [
                {
                    "type": "rich",
                    "title": `🏓 Pong!`,
                    "color": Math.floor(Math.random() * 16777214) + 1,
                    "fields": [
                        {
                            "name": `API latency:`,
                            "value": `\`${Math.round(client.ws.ping)}\``
                        },
                        {
                            "name": `Response latency:`,
                            "value": `\`${Date.now() - interaction.createdTimestamp}\``
                        }
                    ]
                }
            ], ephemeral: interaction.member.id === ownderID});
            break;
        case 'setup':
            if (interaction.member.permissions.has("Administrator") || interaction.member.id === ownderID) {
                let changesMade = false;
                if (interaction.guild.channels.cache.find(channel => channel.name === privateVoiceChannel) === undefined) {
                    await interaction.guild.channels.create({name: privateVoiceChannel, type: ChannelType.GuildVoice});
                    changesMade = true;
                }
                if (changesMade) {
                    await interaction.reply({"embeds": [
                        {
                            "type": "rich",
                            "title": `✅⚙️ Setup complete!`,
                            "description": "Channel: `➕ Create private channel` was created.",
                            "color": 0x00ff2a
                        }
                    ], ephemeral: interaction.member.id === ownderID});
                } else {
                    await interaction.reply({"embeds": [
                        {
                            "type": "rich",
                            "title": `✅⚙️ Setup complete!`,
                            "description": "No setting up was needed. Everything is already set up.",
                            "color": 0x00ff2a
                        }
                    ], ephemeral: interaction.member.id === ownderID});
                }
            } else {
                await interaction.reply({"embeds": [
                    {
                        "type": "rich",
                        "title": `❌⚙️ Failed!`,
                        "description": "You don't have: `administrator` permission!",
                        "color": 0xff0000
                    }
                ]});
            }
            break;
        default:
            return
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    let category = newState.guild.channels.cache.find(channel => channel.name === privateChannelCategory && channel.type === 4);
    if (newState.channel != null && newState.channel.name == privateVoiceChannel) {
        const user = (newState.member.nickname === null) ? newState.member.user.username : newState.member.nickname;
        if (category === undefined) {
            await newState.guild.channels.create({name: privateChannelCategory, type: ChannelType.GuildCategory});
            category = newState.guild.channels.cache.find(channel => channel.name === privateChannelCategory && channel.type === 4);
        }
        const channel = await category.children.create({
            name: user + "'s channel",
            type: ChannelType.GuildVoice,
            permissionOverwrites: [{id: newState.member.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles]}]
        });
        await newState.member.voice.setChannel(channel)
    }
    if (oldState.channel != null && category.children.cache.find(channel => channel.name === oldState.channel.name) !== undefined && oldState.channel.members.size === 0) {
        await oldState.channel.delete()
        if (category.children.cache.size === 0) await category.delete()
    }
})

client.login(TOKEN);