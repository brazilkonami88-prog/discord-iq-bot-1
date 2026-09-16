require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "src", "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`جاري تسجيل ${commands.length} أمر سلاش...`);

    if (process.env.GUILD_ID) {
      // تسجيل سريع على سيرفر واحد (للتجربة - يظهر فورًا)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log("تم تسجيل الأوامر على السيرفر المحدد بنجاح ✅ (فورًا)");
    } else {
      // تسجيل عالمي (بياخد لحد ساعة عشان يظهر في كل السيرفرات)
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log("تم تسجيل الأوامر عالميًا بنجاح ✅ (ممكن ياخد لحد ساعة عشان يظهر)");
    }
  } catch (error) {
    console.error("حصل خطأ أثناء تسجيل الأوامر:", error);
  }
})();
