const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getTopResults } = require("../utils/leaderboard");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("الافضل")
    .setDescription("اعرض أفضل نتائج اختبار الذكاء في السيرفر"),
  async execute(interaction) {
    const top = getTopResults(interaction.guildId, 10);

    if (top.length === 0) {
      return interaction.reply("لسه محدش عمل اختبار في السيرفر ده. جرب `/اختبار-ذكاء` عشان تبقى الأول! 🏆");
    }

    const medals = ["🥇", "🥈", "🥉"];
    const lines = top.map((r, i) => {
      const medal = medals[i] || `${i + 1}.`;
      return `${medal} **${r.username}** — ${r.percentage}% (${r.totalQuestions} سؤال)`;
    });

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("🏆 أفضل نتائج اختبار الذكاء في السيرفر")
      .setDescription(lines.join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
};
