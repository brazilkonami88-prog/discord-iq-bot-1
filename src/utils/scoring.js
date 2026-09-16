const { CATEGORY_NAMES } = require("./questionBank");

/**
 * بيرجع تصنيف نصي بناءً على النسبة المئوية
 */
function getLabel(percentage) {
  if (percentage >= 90) return "🧠 عبقري خارق";
  if (percentage >= 75) return "🌟 ذكاء عالي جدًا";
  if (percentage >= 60) return "✅ ذكاء فوق المتوسط";
  if (percentage >= 45) return "🙂 ذكاء متوسط";
  if (percentage >= 25) return "⚠️ ذكاء أقل من المتوسط";
  return "😅 محتاج تركيز أكتر شوية";
}

/**
 * بيحسب النتيجة النهائية + تفصيل لكل مجال
 * results: [{ category, correct: bool }]
 */
function computeScore(results) {
  const total = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const byCategory = {};
  for (const r of results) {
    if (!byCategory[r.category]) byCategory[r.category] = { correct: 0, total: 0 };
    byCategory[r.category].total++;
    if (r.correct) byCategory[r.category].correct++;
  }

  const breakdown = Object.entries(byCategory).map(([cat, v]) => ({
    category: cat,
    name: CATEGORY_NAMES[cat] || cat,
    correct: v.correct,
    total: v.total,
    percentage: Math.round((v.correct / v.total) * 100)
  }));

  return {
    total,
    correctCount,
    percentage,
    label: getLabel(percentage),
    breakdown
  };
}

module.exports = { computeScore, getLabel };
