const fs = require("fs");
const path = require("path");

const LB_PATH = path.join(__dirname, "..", "data", "leaderboard.json");

function loadAll() {
  if (!fs.existsSync(LB_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(LB_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(LB_PATH, JSON.stringify(data, null, 2), "utf8");
}

/**
 * بيسجل نتيجة اختبار جديدة لليوزر في السيرفر، وبيحتفظ بأفضل نتيجة بتاعته فقط
 */
function recordResult(guildId, userId, username, percentage, totalQuestions) {
  const data = loadAll();
  if (!data[guildId]) data[guildId] = {};
  const existing = data[guildId][userId];
  if (!existing || percentage > existing.percentage) {
    data[guildId][userId] = {
      username,
      percentage,
      totalQuestions,
      date: new Date().toISOString()
    };
  }
  saveAll(data);
}

/**
 * بيرجع أفضل N نتيجة في السيرفر مرتبة تنازليًا
 */
function getTopResults(guildId, limit = 10) {
  const data = loadAll();
  const guildData = data[guildId] || {};
  return Object.entries(guildData)
    .map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit);
}

module.exports = { recordResult, getTopResults };
