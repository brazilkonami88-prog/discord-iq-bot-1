const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "questions.json");
const ALL_QUESTIONS = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

// تجميع الأسئلة حسب المجال
const BY_CATEGORY = {};
for (const q of ALL_QUESTIONS) {
  if (!BY_CATEGORY[q.category]) BY_CATEGORY[q.category] = [];
  BY_CATEGORY[q.category].push(q);
}

const CATEGORY_NAMES = {
  math: "حسابات",
  sequences: "متتاليات وأرقام",
  riddles: "ألغاز",
  memory: "ذاكرة",
  logic: "منطق واستنتاج",
  concentration: "تركيز وانتباه"
};

const ALL_CATEGORIES = Object.keys(BY_CATEGORY);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * كل ما عدد الأسئلة أكبر، كل ما عدد المجالات المستخدمة أكبر
 * (تنوع أكتر = دقة أكتر في تحديد الذكاء)
 */
function categoryCountForQuestions(n) {
  if (n <= 15) return 3;
  if (n <= 25) return 4;
  if (n <= 35) return 5;
  return 6;
}

/**
 * بيرجع مصفوفة أسئلة فريدة بعدد n، موزعة على مجالات متنوعة،
 * وبيعمل reshuffle لترتيب الاختيارات في كل سؤال عشان الإجابة
 * الصحيحة متبقاش في نفس المكان دايمًا.
 */
function pickQuestions(n) {
  const kCategories = Math.min(categoryCountForQuestions(n), ALL_CATEGORIES.length);
  const chosenCategories = shuffle(ALL_CATEGORIES).slice(0, kCategories);

  // توزيع عدد الأسئلة بالتساوي تقريبًا على المجالات المختارة
  const base = Math.floor(n / kCategories);
  let remainder = n - base * kCategories;
  const counts = {};
  for (const cat of chosenCategories) {
    counts[cat] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
  }

  let selected = [];
  for (const cat of chosenCategories) {
    const pool = shuffle(BY_CATEGORY[cat] || []);
    selected.push(...pool.slice(0, counts[cat]));
  }

  // لو مجال معين ماعندوش أسئلة كفاية، كمّل من باقي المجالات
  if (selected.length < n) {
    const usedIds = new Set(selected.map((q) => q.id));
    const rest = shuffle(ALL_QUESTIONS.filter((q) => !usedIds.has(q.id)));
    selected.push(...rest.slice(0, n - selected.length));
  }

  selected = shuffle(selected).slice(0, n);

  // إعادة ترتيب الاختيارات عشوائيًا لكل سؤال (حماية إضافية من الحفظ)
  return selected.map((q) => {
    const correctText = q.options[q.answer];
    const newOptions = shuffle(q.options);
    return {
      ...q,
      options: newOptions,
      answer: newOptions.indexOf(correctText)
    };
  });
}

module.exports = {
  ALL_QUESTIONS,
  BY_CATEGORY,
  ALL_CATEGORIES,
  CATEGORY_NAMES,
  pickQuestions
};
