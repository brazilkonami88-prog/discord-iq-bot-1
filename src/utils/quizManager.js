const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { pickQuestions, CATEGORY_NAMES } = require("./questionBank");
const { computeScore } = require("./scoring");
const { recordResult } = require("./leaderboard");

// عشان نمنع نفس اليوزر يبدأ أكتر من اختبار في نفس الوقت
const activeSessions = new Set();

const LETTERS = ["🇦", "🇧", "🇨", "🇩"];

function buildOptionsRow(options, disabled = false) {
  const row = new ActionRowBuilder();
  options.forEach((opt, i) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`iq_answer_${i}`)
        .setLabel(`${String.fromCharCode(65 + i)}) ${opt}`.slice(0, 80))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled)
    );
  });
  return row;
}

function questionEmbed(q, index, total) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`❓ سؤال ${index + 1} من ${total}`)
    .setDescription(`**${CATEGORY_NAMES[q.category] || q.category}**\n\n${q.question}`)
    .setFooter({ text: "عندك 10 ثواني للإجابة ⏱️" });
}

function memorizeEmbed(q, index, total) {
  return new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle(`🧠 احفظ دي كويس! (سؤال ${index + 1} من ${total})`)
    .setDescription(`\`\`\`${q.memorize}\`\`\`\nهتتسأل عليها بعد ${q.memorizeSeconds || 5} ثواني...`);
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function askQuestion(channel, user, q, index, total) {
  if (q.category === "memory" && q.memorize) {
    const memMsg = await channel.send({ embeds: [memorizeEmbed(q, index, total)] });
    await sleep((q.memorizeSeconds || 5) * 1000);
    await memMsg.edit({
      embeds: [questionEmbed(q, index, total)],
      components: [buildOptionsRow(q.options)]
    });
    return waitForAnswer(memMsg, user, q);
  }

  const msg = await channel.send({
    embeds: [questionEmbed(q, index, total)],
    components: [buildOptionsRow(q.options)]
  });
  return waitForAnswer(msg, user, q);
}

function waitForAnswer(msg, user, q) {
  return new Promise((resolve) => {
    const timeLimit = (q.timeLimit || 10) * 1000;
    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === user.id && i.customId.startsWith("iq_answer_"),
      time: timeLimit,
      max: 1
    });

    let answered = false;

    collector.on("collect", async (i) => {
      answered = true;
      const chosenIndex = parseInt(i.customId.replace("iq_answer_", ""), 10);
      const correct = chosenIndex === q.answer;

      const resultRow = buildOptionsRow(q.options, true);
      resultRow.components.forEach((btn, idx) => {
        if (idx === q.answer) btn.setStyle(ButtonStyle.Success);
        else if (idx === chosenIndex) btn.setStyle(ButtonStyle.Danger);
      });

      try {
        await i.update({ components: [resultRow] });
      } catch {
        /* تجاهل لو الرسالة اتعدلت بالفعل */
      }

      resolve({ answered: true, correct, chosenIndex });
    });

    collector.on("end", () => {
      if (!answered) {
        const resultRow = buildOptionsRow(q.options, true);
        resultRow.components[q.answer].setStyle(ButtonStyle.Success);
        msg.edit({ components: [resultRow] }).catch(() => {});
        resolve({ answered: false, correct: false, timedOut: true });
      }
    });
  });
}

function resultEmbed(score, totalQuestions, user) {
  const embed = new EmbedBuilder()
    .setColor(score.percentage >= 60 ? 0x2ecc71 : score.percentage >= 40 ? 0xf1c40f : 0xe74c3c)
    .setTitle(`📊 نتيجة اختبار الذكاء بتاع ${user.username}`)
    .setDescription(
      `**النسبة النهائية: ${score.percentage}%**\n${score.label}\n\nإجابات صحيحة: ${score.correctCount} من ${totalQuestions}`
    )
    .setThumbnail(user.displayAvatarURL())
    .setTimestamp();

  const breakdownText = score.breakdown
    .map((b) => `• **${b.name}**: ${b.correct}/${b.total} (${b.percentage}%)`)
    .join("\n");

  embed.addFields({ name: "📁 التفصيل حسب المجال", value: breakdownText || "لا يوجد" });
  return embed;
}

/**
 * بيشغل جلسة اختبار كاملة لليوزر في الشانيل ده
 */
async function runQuiz({ channel, user, guildId, numQuestions }) {
  if (activeSessions.has(user.id)) {
    return { alreadyActive: true };
  }
  activeSessions.add(user.id);

  try {
    const questions = pickQuestions(numQuestions);
    await channel.send(
      `🚀 يلا بينا يا **${user.username}**! هيبدأ اختبارك دلوقتي (${numQuestions} سؤال). ركّز، عندك 10 ثواني لكل سؤال ⏱️`
    );
    await sleep(2000);

    const results = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const outcome = await askQuestion(channel, user, q, i, questions.length);

      if (outcome.timedOut) {
        await channel.send(
          `⏰ خلص الوقت يا **${user.username}**! الاختبار بيتوقف هنا ولازم تبدأ من الأول تاني عشان تاخد نتيجة صحيحة.\nاكتب \`/اختبار_ذكاء\` عشان تحاول تاني.`
        );
        return { timedOut: true, questionIndex: i };
      }

      results.push({ category: q.category, correct: outcome.correct });
      await sleep(1200);
    }

    const score = computeScore(results);
    await channel.send({ embeds: [resultEmbed(score, questions.length, user)] });

    if (guildId) {
      recordResult(guildId, user.id, user.username, score.percentage, questions.length);
    }

    return { timedOut: false, score };
  } finally {
    activeSessions.delete(user.id);
  }
}

module.exports = { runQuiz, activeSessions };
