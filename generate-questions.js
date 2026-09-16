/**
 * generate-questions.js
 * ----------------------------------------------------------
 * سكربت مرة واحدة (run once) بيولّد بنك أسئلة ضخم بشكل برمجي
 * للمجالات اللي ممكن تتولد بقواعد رياضية/منطقية (حسابات - متتاليات
 * - ذاكرة - تركيز)، وبيدمجه مع بنك الألغاز والمنطق المكتوب يدويًا
 * (data/manual-riddles.json و data/manual-logic.json) عشان ينتج
 * ملف واحد نهائي: src/data/questions.json
 *
 * شغّله مرة واحدة بس:  node generate-questions.js
 * ولو عايز تزود عدد الأسئلة لكل مجال غيّر TARGET_PER_CATEGORY تحت.
 * ----------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const TARGET_PER_CATEGORY = 520; // أكتر من 500 لكل مجال متولد برمجيًا

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleOptionsWithAnswer(correct, distractors) {
  const options = [correct, ...distractors];
  // shuffle (Fisher-Yates)
  for (let i = options.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, answer: options.indexOf(correct) };
}

function uniqueDistractors(correct, generator, count = 3) {
  const set = new Set();
  let guard = 0;
  while (set.size < count && guard < 200) {
    const v = generator();
    if (v !== correct) set.add(v);
    guard++;
  }
  return Array.from(set);
}

/* ============================ 1) الحسابات (math) ============================ */
function generateMath(n) {
  const questions = [];
  const ops = ["+", "-", "×", "÷", "%", "^"];
  let idCounter = 1;
  while (questions.length < n) {
    const op = ops[rand(0, ops.length - 1)];
    let a, b, correct, text;
    switch (op) {
      case "+":
        a = rand(10, 999);
        b = rand(10, 999);
        correct = a + b;
        text = `${a} + ${b} = ؟`;
        break;
      case "-":
        a = rand(50, 999);
        b = rand(10, a);
        correct = a - b;
        text = `${a} - ${b} = ؟`;
        break;
      case "×":
        a = rand(2, 25);
        b = rand(2, 25);
        correct = a * b;
        text = `${a} × ${b} = ؟`;
        break;
      case "÷":
        b = rand(2, 12);
        correct = rand(2, 20);
        a = b * correct;
        text = `${a} ÷ ${b} = ؟`;
        break;
      case "%":
        b = [5, 10, 15, 20, 25, 50, 75][rand(0, 6)];
        a = rand(2, 40) * 10;
        correct = (a * b) / 100;
        text = `${b}% من ${a} = ؟`;
        break;
      case "^":
        a = rand(2, 9);
        b = 2;
        correct = a ** b;
        text = `${a}² = ؟`;
        break;
    }
    const distractors = uniqueDistractors(correct, () => {
      const delta = rand(1, Math.max(3, Math.round(Math.abs(correct) * 0.2) + 2));
      return Math.random() < 0.5 ? correct + delta : correct - delta;
    });
    if (distractors.length < 3) continue;
    const { options, answer } = shuffleOptionsWithAnswer(correct, distractors.slice(0, 3));
    questions.push({
      id: `math_${String(idCounter).padStart(4, "0")}`,
      category: "math",
      question: text,
      options: options.map(String),
      answer,
      timeLimit: 10
    });
    idCounter++;
  }
  return questions;
}

/* ============================ 2) المتتاليات (sequences) ============================ */
function generateSequences(n) {
  const questions = [];
  const types = ["arithmetic", "geometric", "squares", "fibonacci", "alternating"];
  let idCounter = 1;
  while (questions.length < n) {
    const type = types[rand(0, types.length - 1)];
    let seq = [];
    let correct;
    switch (type) {
      case "arithmetic": {
        const start = rand(1, 50);
        const step = rand(2, 15);
        for (let i = 0; i < 5; i++) seq.push(start + i * step);
        correct = start + 5 * step;
        break;
      }
      case "geometric": {
        const start = rand(1, 5);
        const ratio = rand(2, 4);
        for (let i = 0; i < 4; i++) seq.push(start * ratio ** i);
        correct = start * ratio ** 4;
        break;
      }
      case "squares": {
        const startIdx = rand(1, 6);
        for (let i = 0; i < 4; i++) seq.push((startIdx + i) ** 2);
        correct = (startIdx + 4) ** 2;
        break;
      }
      case "fibonacci": {
        let a = rand(1, 5),
          b = rand(1, 5);
        seq = [a, b];
        for (let i = 0; i < 3; i++) {
          const c = seq[seq.length - 1] + seq[seq.length - 2];
          seq.push(c);
        }
        correct = seq[seq.length - 1] + seq[seq.length - 2];
        break;
      }
      case "alternating": {
        const start = rand(5, 40);
        const step1 = rand(2, 10);
        const step2 = rand(1, 5);
        seq = [start];
        for (let i = 1; i < 5; i++) {
          seq.push(seq[i - 1] + (i % 2 === 1 ? step1 : -step2));
        }
        correct = seq[seq.length - 1] + step1;
        break;
      }
    }
    const distractors = uniqueDistractors(correct, () => {
      const delta = rand(1, Math.max(3, Math.round(Math.abs(correct) * 0.15) + 2));
      return Math.random() < 0.5 ? correct + delta : correct - delta;
    });
    if (distractors.length < 3) continue;
    const { options, answer } = shuffleOptionsWithAnswer(correct, distractors.slice(0, 3));
    questions.push({
      id: `sequence_${String(idCounter).padStart(4, "0")}`,
      category: "sequences",
      question: `شوف المتتالية: ${seq.join(" ، ")} ... ما هو الرقم التالي؟`,
      options: options.map(String),
      answer,
      timeLimit: 10
    });
    idCounter++;
  }
  return questions;
}

/* ============================ 3) الذاكرة (memory) ============================ */
const WORD_BANK = [
  "قطة", "شمس", "كتاب", "باب", "نجمة", "بحر", "جبل", "وردة", "قلم", "ساعة",
  "طائر", "سيارة", "مفتاح", "كرسي", "شجرة", "نهر", "قمر", "سحاب", "ثلج", "نار",
  "حصان", "أسد", "فيل", "سمكة", "زجاجة", "منضدة", "باص", "طريق", "جسر", "برج"
];

function generateMemory(n) {
  const questions = [];
  let idCounter = 1;
  while (questions.length < n) {
    const useNumbers = Math.random() < 0.5;
    const length = rand(4, 6);
    let items = [];
    if (useNumbers) {
      const set = new Set();
      while (set.size < length) set.add(rand(1, 99));
      items = Array.from(set);
    } else {
      const pool = [...WORD_BANK];
      for (let i = 0; i < length; i++) {
        const idx = rand(0, pool.length - 1);
        items.push(pool[idx]);
        pool.splice(idx, 1);
      }
    }
    const askType = rand(0, 2); // 0: position, 1: count-before/after, 2: which-existed
    let questionText, correct, distractorPool;
    if (askType === 0) {
      const pos = rand(0, items.length - 1);
      correct = items[pos];
      questionText = `ما هو العنصر رقم ${pos + 1} في القائمة اللي حفظتها؟`;
      distractorPool = useNumbers ? items.filter((x) => x !== correct) : WORD_BANK.filter((w) => !items.includes(w));
    } else if (askType === 1) {
      correct = items[items.length - 1];
      questionText = `ما هو آخر عنصر ظهر في القائمة؟`;
      distractorPool = useNumbers ? items.filter((x) => x !== correct) : WORD_BANK.filter((w) => !items.includes(w));
    } else {
      correct = items[0];
      questionText = `ما هو أول عنصر ظهر في القائمة؟`;
      distractorPool = useNumbers ? items.filter((x) => x !== correct) : WORD_BANK.filter((w) => !items.includes(w));
    }
    let distractors = [];
    if (useNumbers) {
      distractors = uniqueDistractors(correct, () => rand(1, 99));
    } else {
      const shuffled = [...distractorPool].sort(() => Math.random() - 0.5);
      distractors = shuffled.slice(0, 3);
      if (distractors.length < 3) continue;
    }
    if (distractors.length < 3) continue;
    const { options, answer } = shuffleOptionsWithAnswer(correct, distractors.slice(0, 3));
    questions.push({
      id: `memory_${String(idCounter).padStart(4, "0")}`,
      category: "memory",
      memorize: items.join(" - "),
      memorizeSeconds: 5,
      question: questionText,
      options: options.map(String),
      answer,
      timeLimit: 10
    });
    idCounter++;
  }
  return questions;
}

/* ============================ 4) التركيز والانتباه (concentration) ============================ */
const LETTERS = ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ر", "س", "ش", "ص", "ط", "ع", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"];
const SHAPES = ["● ", "■ ", "▲ ", "◆ ", "★ "];

function generateConcentration(n) {
  const questions = [];
  let idCounter = 1;
  while (questions.length < n) {
    const type = rand(0, 2);
    let questionText, correct, distractors;
    if (type === 0) {
      // عد تكرار حرف معين في سلسلة
      const target = LETTERS[rand(0, LETTERS.length - 1)];
      const length = rand(12, 20);
      let seq = "";
      let count = 0;
      for (let i = 0; i < length; i++) {
        const isTarget = Math.random() < 0.3;
        const ch = isTarget ? target : LETTERS[rand(0, LETTERS.length - 1)];
        if (ch === target) count++;
        seq += ch + " ";
      }
      correct = count;
      questionText = `كام مرة ظهر الحرف "${target}" في السلسلة دي؟\n${seq.trim()}`;
      distractors = uniqueDistractors(correct, () => Math.max(0, correct + rand(-3, 3)));
    } else if (type === 1) {
      // عد تكرار شكل معين
      const target = SHAPES[rand(0, SHAPES.length - 1)];
      const length = rand(10, 18);
      let seq = "";
      let count = 0;
      for (let i = 0; i < length; i++) {
        const isTarget = Math.random() < 0.35;
        const ch = isTarget ? target : SHAPES[rand(0, SHAPES.length - 1)];
        if (ch === target) count++;
        seq += ch;
      }
      correct = count;
      questionText = `كام مرة ظهر الشكل "${target.trim()}" في السلسلة دي؟\n${seq}`;
      distractors = uniqueDistractors(correct, () => Math.max(0, correct + rand(-3, 3)));
    } else {
      // إيجاد العنصر المختلف (رقم فردي وسط زوجي أو العكس)
      const evenBase = Math.random() < 0.5;
      const length = 6;
      let arr = [];
      for (let i = 0; i < length - 1; i++) {
        const v = rand(1, 50);
        arr.push(evenBase ? v * 2 : v * 2 + 1);
      }
      const oddOneOut = evenBase ? rand(1, 50) * 2 + 1 : rand(1, 50) * 2;
      const pos = rand(0, arr.length);
      arr.splice(pos, 0, oddOneOut);
      correct = oddOneOut;
      questionText = `أي رقم من دول مختلف عن الباقي (الوحيد الفردي/الزوجي)؟\n${arr.join(" ، ")}`;
      distractors = uniqueDistractors(correct, () => arr[rand(0, arr.length - 1)]);
      if (new Set(distractors).size < 3) {
        distractors = uniqueDistractors(correct, () => rand(1, 100));
      }
    }
    if (distractors.length < 3) continue;
    const { options, answer } = shuffleOptionsWithAnswer(correct, distractors.slice(0, 3));
    questions.push({
      id: `focus_${String(idCounter).padStart(4, "0")}`,
      category: "concentration",
      question: questionText,
      options: options.map(String),
      answer,
      timeLimit: 10
    });
    idCounter++;
  }
  return questions;
}

/* ============================ التجميع النهائي ============================ */
function loadManual(file) {
  const p = path.join(__dirname, "src", "data", file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const math = generateMath(TARGET_PER_CATEGORY);
  const sequences = generateSequences(TARGET_PER_CATEGORY);
  const memory = generateMemory(TARGET_PER_CATEGORY);
  const concentration = generateConcentration(TARGET_PER_CATEGORY);
  const riddles = loadManual("manual-riddles.json");
  const logic = loadManual("manual-logic.json");

  const all = [...math, ...sequences, ...memory, ...concentration, ...riddles, ...logic];

  const outPath = path.join(__dirname, "src", "data", "questions.json");
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), "utf8");

  console.log("تم توليد بنك الأسئلة بنجاح ✅");
  console.log(`- حسابات: ${math.length}`);
  console.log(`- متتاليات: ${sequences.length}`);
  console.log(`- ذاكرة: ${memory.length}`);
  console.log(`- تركيز: ${concentration.length}`);
  console.log(`- ألغاز: ${riddles.length}`);
  console.log(`- منطق/جنائية: ${logic.length}`);
  console.log(`الإجمالي: ${all.length} سؤال`);
  console.log(`الملف: ${outPath}`);
}

main();
