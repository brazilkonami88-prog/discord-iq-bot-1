const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const COUNT_OPTIONS = [10, 15, 20, 25, 30, 35, 40];

function buildRulesEmbed() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🧠 اختبار تحديد نسبة الذكاء - القوانين")
    .setDescription(
      [
        "أهلاً بيك في اختبار تحديد الذكاء! اقرأ القوانين كويس قبل ما تبدأ:",
        "",
        "**1.** هتختار عدد الأسئلة من القائمة تحت (من 10 لحد 40 سؤال).",
        "**2.** كل ما عدد الأسئلة أكبر، كل ما الأسئلة هتبقى متنوعة من مجالات أكتر (حسابات، متتاليات، ألغاز، ذاكرة، منطق، تركيز)، والنتيجة هتبقى أدق.",
        "**3.** عندك **10 ثواني بالظبط** للإجابة على كل سؤال.",
        "**4.** لو الوقت خلص من غير ما تجاوب، **الاختبار بيقف فورًا** ولازم تبدأ من السؤال الأول تاني.",
        "**5.** بعد ما تخلص كل الأسئلة، هتظهرلك نسبة ذكائك من 0% لحد 100% + تفصيل لكل مجال.",
        "**6.** محدش غيرك يقدر يجاوب على أسئلتك، الاختبار شخصي بحت.",
        "",
        "جاهز؟ اختار عدد الأسئلة من تحت وابدأ 👇"
      ].join("\n")
    )
    .setFooter({ text: "بالتوفيق! 🍀" });
}

function buildSelectRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("iq_select_count")
    .setPlaceholder("اختار عدد الأسئلة (10 - 40)")
    .addOptions(
      COUNT_OPTIONS.map((n) => ({
        label: `${n} سؤال`,
        description: n <= 15 ? "سريع - دقة أساسية" : n <= 25 ? "متوسط - دقة كويسة" : "طويل - أعلى دقة ممكنة",
        value: String(n)
      }))
    );
  return new ActionRowBuilder().addComponents(menu);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("قوانين")
    .setDescription("اعرض قوانين اختبار تحديد نسبة الذكاء وابدأ الاختبار"),
  async execute(interaction) {
    await interaction.reply({
      embeds: [buildRulesEmbed()],
      components: [buildSelectRow()]
    });
  },
  COUNT_OPTIONS,
  buildSelectRow,
  buildRulesEmbed
};
