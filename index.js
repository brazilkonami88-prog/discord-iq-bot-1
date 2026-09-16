require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { runQuiz, activeSessions } = require("./src/utils/quizManager");
const { COUNT_OPTIONS } = require("./src/commands/rules");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "src", "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log(`✅ البوت شغال دلوقتي باسم: ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  try {
    // أوامر السلاش
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // قائمة اختيار عدد الأسئلة (جاية من أمر /قوانين)
    if (interaction.isStringSelectMenu() && interaction.customId === "iq_select_count") {
      const numQuestions = parseInt(interaction.values[0], 10);

      if (!COUNT_OPTIONS.includes(numQuestions)) {
        return interaction.reply({ content: "قيمة غير صحيحة.", ephemeral: true });
      }

      if (activeSessions.has(interaction.user.id)) {
        return interaction.reply({
          content: "⚠️ عندك اختبار شغال بالفعل! خلّصه الأول قبل ما تبدأ واحد جديد.",
          ephemeral: true
        });
      }

      await interaction.reply(
        `✅ تمام يا **${interaction.user.username}**، هيبدأ اختبارك (${numQuestions} سؤال) في الرسائل الجاية...`
      );

      await runQuiz({
        channel: interaction.channel,
        user: interaction.user,
        guildId: interaction.guildId,
        numQuestions
      });
      return;
    }
  } catch (err) {
    console.error("حصل خطأ في التعامل مع التفاعل:", err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      interaction
        .reply({ content: "حصل خطأ غير متوقع، حاول تاني.", ephemeral: true })
        .catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
