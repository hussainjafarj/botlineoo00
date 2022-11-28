const express = require('express')
const app = express();
const port = 3000

app.get('/', (req, res) => res.send('Yo boi!!'))

app.listen(port, () =>
console.log(`Your app is listening a http://localhost:${port}`)
);

const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX, LOCALE } = require("./util/EvobotUtil");
const path = require("path");
const i18n = require("i18n"); 

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
});

client.login(process.env.token);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

i18n.configure({
  locales: ["ar", "de", "en", "es", "fr", "it", "ko", "nl", "pl", "pt_br", "ru", "sv", "tr", "zh_cn", "zh_tw"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  objectNotation: true,
  register: global,

  logWarnFn: function (msg) {
    console.log("warn", msg);
  },

  logErrorFn: function (msg) {
    console.log("error", msg);
  },

  missingKeyFn: function (locale, value) {
    return value;
  },

  mustacheConfig: {
    tags: ["{{", "}}"],
    disable: false
  }
});

client.on('message', message => {
  if (message.content.startsWith('خط'))
      message.delete();{
    return message.channel.send('https://media.discordapp.net/attachments/983386931209580584/1044622350185938954/FB653D8B-87EC-4A34-A8C5-678FBE3305E0.png')
  }
});

// Code Auto Line
client.on("message", message => {
if(message.author.bot) return;
if(message.channel.id == "1014043906456961064") { /// اي دي روم الخط
message.channel.send("https://media.discordapp.net/attachments/983386931209580584/1044622350185938954/FB653D8B-87EC-4A34-A8C5-678FBE3305E0.png") /// رابط الخط
} else { return; }
})

// Code Auto Line
client.on("message", message => {
if(message.author.bot) return;
if(message.channel.id == "983386833482309652") { /// اي دي روم الخط
message.channel.send("https://media.discordapp.net/attachments/983386931209580584/1044622350185938954/FB653D8B-87EC-4A34-A8C5-678FBE3305E0.png") /// رابط الخط
} else { return; }

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setActivity(`Yivy Av.`, { type: "PLAYING" });
  client.user.setStatus("idle");
  let channel = client.channels.cache.find(r => r.id === "971575695560040498");//ايدي الروم
  if(!channel)return console.log("can't find channel")
  channel.join();
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(i18n.__("common.errorCommend")).catch(console.error);
  }
});
