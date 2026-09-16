const { SlashCommandBuilder } = require("discord.js");
const { runQuiz, activeSessions } = require("../utils/quizManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("اختبار-ذكاء")
    .setDescription("ابدأ اختبار تحديد نسبة الذكاء مباشرة")
    .addIntegerOption((opt) =>
      opt
        .setName("عدد-الاسئلة")
        .setDescription("عدد الأسئلة (من 10 لحد 40)")
        .setMinValue(10)
        .setMaxValue(40)
        .setRequired(true)
    ),
  async execute(interaction) {
    const numQuestions = interaction.options.getInteger("عدد-الاسئلة");

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
  }
};
