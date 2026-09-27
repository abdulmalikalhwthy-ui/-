/* ============================================================
   jafr-advanced.js — محرك علم الجفر المتقدم
   الإصدار 3.2 — زر AI محسّن + استدعاء من المتغير المحفوظ
   ============================================================ */

/* ============ الدوائر الأساسية ============ */
const JA_ABJAD = ["ا","ب","ج","د","ه","و","ز","ح","ط","ي","ك","ل","م","ن","س","ع","ف","ص","ق","ر","ش","ت","ث","خ","ذ","ض","ظ","غ"];
const JA_AYQAGH = ["ا","ي","ق","غ","ب","ه","ك","ن","ر","ث","د","م","ج","ل","ش","و","س","ط","ف","ت","ح","ع","ز","ذ","ض","خ","ص","ظ"];

const JA_ABJAD_VALUES = {
  "ا":1,"ب":2,"ج":3,"د":4,"ه":5,"و":6,"ز":7,"ح":8,"ط":9,"ي":10,
  "ك":20,"ل":30,"م":40,"ن":50,"س":60,"ع":70,"ف":80,"ص":90,"ق":100,
  "ر":200,"ش":300,"ت":400,"ث":500,"خ":600,"ذ":700,"ض":800,"ظ":900,"غ":1000
};

const JA_PLANETS = {
  "ا":{planet:"لاهوتية"},"ب":{planet:"العرش"},"ت":{planet:"العرش"},"ث":{planet:"العرش"},
  "ج":{planet:"الكرسي"},"ح":{planet:"الكرسي"},"خ":{planet:"الكرسي"},
  "د":{planet:"زحل"},"ذ":{planet:"زحل"},"ر":{planet:"المشتري"},"ز":{planet:"المشتري"},
  "س":{planet:"المريخ"},"ش":{planet:"المريخ"},"ص":{planet:"الشمس"},"ض":{planet:"الشمس"},
  "ط":{planet:"الزهرة"},"ظ":{planet:"الزهرة"},"ع":{planet:"عطارد"},"غ":{planet:"عطارد"},
  "ف":{planet:"القمر"},"ق":{planet:"القمر"},"ك":{planet:"كرة النار"},"ل":{planet:"كرة الهواء"},
  "م":{planet:"الحيوان"},"ن":{planet:"النبات"},"ه":{planet:"المعدن"},"و":{planet:"الماء"},"ي":{planet:"التراب"}
};

const JA_NATURES_ABJAD = {
  "نار":{letters:["ا","ه","ط","م","ف","ش","ذ"],isqat:9,dir:"شرقي",color:"#E53935",icon:"🔥"},
  "هواء":{letters:["ب","و","ي","ن","ص","ت","ض"],isqat:12,dir:"جنوبي",color:"#43A047",icon:"🌪️"},
  "ماء":{letters:["ج","ز","ك","س","ق","ث","ظ"],isqat:15,dir:"بحري",color:"#1E88E5",icon:"💧"},
  "تراب":{letters:["د","ح","ل","ع","ر","خ","غ"],isqat:16,dir:"غربي",color:"#8D6E63",icon:"⛰️"}
};

const JA_NATURES_AYQAGH = {
  "نار":{letters:["ا","ب","ر","ح","س","خ","ض"],isqat:9},
  "تراب":{letters:["ي","ه","ث","ل","ج","ز","ط"],isqat:16},
  "هواء":{letters:["ق","ك","د","ش","ف","ع","ص"],isqat:12},
  "ماء":{letters:["غ","ن","م","و","ت","ذ","ظ"],isqat:15}
};

const JA_RANKS = {
  "ا":"مراتب","ب":"مراتب","ج":"مراتب","د":"مراتب","ه":"درج","و":"درج","ز":"درج","ح":"درج",
  "ط":"دقائق","ي":"دقائق","ك":"دقائق","ل":"دقائق","م":"ثواني","ن":"ثواني","س":"ثواني","ع":"ثواني",
  "ف":"ثوالث","ص":"ثوالث","ق":"ثوالث","ر":"ثوالث","ش":"روابع","ت":"روابع","ث":"روابع","خ":"روابع",
  "ذ":"خوامس","ض":"خوامس","ظ":"خوامس","غ":"خوامس"
};

const JA_EXCESS_LETTERS = ["ه","خ","ص","ظ","د","ن","ز","ج"];

const JA_LETTER_SPELLING = {
  "ا":"ألف","ب":"باء","ج":"جيم","د":"دال","ه":"هاء","و":"واو","ز":"زاي",
  "ح":"حاء","ط":"طاء","ي":"ياء","ك":"كاف","ل":"لام","م":"ميم","ن":"نون",
  "س":"سين","ع":"عين","ف":"فاء","ص":"صاد","ق":"قاف","ر":"راء","ش":"شين",
  "ت":"تاء","ث":"ثاء","خ":"خاء","ذ":"ذال","ض":"ضاد","ظ":"ظاء","غ":"غين"
};

const JA_FRACTIONS = {
  "ا":[],"ب":[2],"ج":[3],"د":[2,4],"ه":[5],"و":[2,3,6],"ز":[7],
  "ح":[2,4,8],"ط":[3,9],"ي":[2,5,10],"ك":[2,4,5,10],"ل":[3,5,6,10],
  "م":[2,4,5,8,10],"ن":[2,5,10],"س":[2,3,6,10],"ع":[2,7,10],
  "ف":[2,4,8,10],"ص":[2,3,9,10],"ق":[2,4,5,10],"ر":[2,4,5,10],
  "ش":[2,3,4,5,6,10],"ت":[2,4,8,10],"ث":[2,4,5,10],"خ":[2,4,6,10],
  "ذ":[2,4,5,7,10],"ض":[2,4,5,8,10],"ظ":[2,3,4,5,6,9,10],"غ":[2,4,5,10]
};

/* ============ دلالات الحروف ============ */
const JA_LETTER_SEMANTICS = {
  "ا":{topics:["البداية","القيادة","التوحيد","الوالد"],verbs:["يبدأ","يقود"],quality:"قوة البداية",names:["أحمد","علي","أمين"]},
  "ب":{topics:["البيت","البناء","البركة","الأبناء"],verbs:["يُبنى","يستقر"],quality:"الاستقرار",names:["بشار","بدر","بشير"]},
  "ج":{topics:["الجمع","الجمال","الجوار","الجهاد"],verbs:["يجمع","يتجمع"],quality:"الجمع والتأليف",names:["جمال","جعفر","جابر"]},
  "د":{topics:["الدوام","الدولة","المال"],verbs:["يدوم","يستمر"],quality:"الدوام",names:["داود","دانيال","دريد"]},
  "ه":{topics:["الهداية","الهيبة","النهاية"],verbs:["يهدي","ينتهي"],quality:"الهداية",names:["هادي","هاني","هاشم"]},
  "و":{topics:["الوصل","الوعد","الولاية","الوفاء"],verbs:["يصل","يوعد"],quality:"الوصل",names:["وليد","وسام","وفاء"]},
  "ز":{topics:["الزيادة","الزواج","الزهد"],verbs:["يزيد","يزدهر"],quality:"الزيادة",names:["زيد","زينب","زكريا"]},
  "ح":{topics:["الحياة","الحكمة","الحب"],verbs:["يحيي","يحكم"],quality:"الحكمة",names:["حسن","حسين","حكيم"]},
  "ط":{topics:["الطهارة","الطلب","الطاعة"],verbs:["يطهر","يطلب"],quality:"الطهارة",names:["طاهر","طلال","طه"]},
  "ي":{topics:["اليد","اليقين","اليُسر"],verbs:["يُيسّر","يمد"],quality:"اليُسر",names:["ياسر","يعقوب","يوسف"]},
  "ك":{topics:["الكفاية","الكرم","الكيد"],verbs:["يكفي","يكرم"],quality:"الكفاية",names:["كريم","كمال","كاظم"]},
  "ل":{topics:["اللطف","اللقاء","اللبث"],verbs:["يلطف","يلقى"],quality:"اللطف",names:["ليلى","لؤي","لبنى"]},
  "م":{topics:["المُلك","المحبة","المال"],verbs:["يملك","يحب"],quality:"المُلك",names:["محمد","محمود","مريم"]},
  "ن":{topics:["النور","النصر","النفع"],verbs:["ينير","ينصر"],quality:"النور",names:["نور","نبيل","ناصر"]},
  "س":{topics:["السعادة","السلام","السفر"],verbs:["يسعد","يسير"],quality:"السعادة",names:["سعيد","سلمى","سليم"]},
  "ع":{topics:["العلم","العين","العطاء"],verbs:["يعلم","يعطي"],quality:"العلم",names:["علي","عمر","عبدالله"]},
  "ف":{topics:["الفتح","الفرج","الفوز"],verbs:["يفتح","يفرج"],quality:"الفتح والفرج",names:["فاطمة","فارس","فيصل"]},
  "ص":{topics:["الصدق","الصبر","الصحة"],verbs:["يصدق","يصبر"],quality:"الصدق",names:["صالح","صفاء","صابر"]},
  "ق":{topics:["القوة","القدر","القرب"],verbs:["يقوى","يقدر"],quality:"القوة",names:["قاسم","قيصر"]},
  "ر":{topics:["الرحمة","الرزق","الراحة"],verbs:["يرحم","يرزق"],quality:"الرحمة",names:["رحمة","رامي","رشيد"]},
  "ش":{topics:["الشفاء","الشدة","الشرف"],verbs:["يشفي","يشكر"],quality:"الشفاء",names:["شريف","شادي","شمس"]},
  "ت":{topics:["التوبة","التمام","التوفيق"],verbs:["يتوب","يوفق"],quality:"التوفيق",names:["توفيق","تامر","تميم"]},
  "ث":{topics:["الثبات","الثواب","الثقة"],verbs:["يثبت","يثري"],quality:"الثبات",names:["ثامر","ثابت"]},
  "خ":{topics:["الخير","الخوف","الخلاص"],verbs:["يخير","يخلص"],quality:"الخير والخلاص",names:["خالد","خليل","خديجة"]},
  "ذ":{topics:["الذكر","الذكاء","الذنب"],verbs:["يذكر","يذكي"],quality:"الذكر",names:["ذو الفقار"]},
  "ض":{topics:["الضيق","الضمان","الضياء"],verbs:["يضيق","يضمن"],quality:"الضيق أو الضمان",names:["ضياء","ضرار"]},
  "ظ":{topics:["الظهور","الظفر","الظل"],verbs:["يظهر","يظفر"],quality:"الظهور",names:["ظافر","ظلال"]},
  "غ":{topics:["الغنى","الغيب","الغلبة"],verbs:["يغني","يغلب"],quality:"الغنى والغلبة",names:["غانم","غسان"]}
};

/* ============ مصفوفة المواضيع الكبرى ============ */
const JA_TOPIC_MATRIX = {
  "الرزق والمال":      { letters:["د","ك","م","ث","غ","ر"],            icon:"💰" },
  "الصحة والشفاء":     { letters:["ح","ش","ط","س","ع","ف"],            icon:"💚" },
  "العلاقات والزواج":  { letters:["ز","و","م","ح","ل","ن"],            icon:"💞" },
  "العلم والدراسة":    { letters:["ع","ي","ذ","ق","ن","ل"],            icon:"📚" },
  "العمل والمهنة":     { letters:["د","ك","ق","ف","ص","ع"],            icon:"💼" },
  "السفر والتنقل":     { letters:["س","و","ط","ر","ي","ه"],            icon:"✈️" },
  "الأبناء والعائلة":  { letters:["ب","ا","م","و","ح","ن"],            icon:"👨‍👩‍👧" },
  "الروحانيات والدين": { letters:["ا","ن","ت","ص","ذ","ط"],            icon:"🕌" },
  "التحديات والصعوبات":{ letters:["ض","ش","خ","ط","ذ","ظ"],            icon:"⚠️" },
  "النصر والغلبة":     { letters:["ن","ق","ط","ع","غ","ظ"],            icon:"🏆" },
  "الفرج والتيسير":    { letters:["ف","ي","ل","ر","ب"],                icon:"🌸" },
  "السلطة والحكم":     { letters:["م","ا","د","س","ق","ط"],            icon:"👑" },
  "الأخبار والرسائل":  { letters:["ب","ش","ن","خ","ه","ف"],            icon:"📰" },
  "الأعداء والخصوم":   { letters:["ع","د","خ","ش","ض","ذ"],            icon:"⚔️" },
  "الميراث والوصية":   { letters:["و","ص","ث","ر","م"],                icon:"📜" },
  "السكن والهجرة":     { letters:["د","ب","ه","س","ن"],                icon:"🏠" },
  "الخصوبة والذرية":   { letters:["ب","ن","و","ز","ح"],                icon:"🌱" },
  "الحكمة والبصيرة":   { letters:["ح","ع","ن","ق","ص"],                icon:"🦉" },
  "الصبر والثبات":     { letters:["ص","ث","ق","ح","ط"],                icon:"🛡️" },
  "التوبة والرجوع":    { letters:["ت","و","ب","ر","ه"],                icon:"🕊️" }
};

const JA_NATURE_TONES = {
  "نار":"الأمر فيه حماس وإقدام، وتحديات تُواجه بالحسم والصراحة، والنتيجة تتحقق بسرعة.",
  "هواء":"الأمر متقلب ومتحرك، يُحسم بالمرونة والتواصل والمناورة الذكية.",
  "ماء":"الأمر عاطفي وسلس، يُحسم بالصبر والتفهم والتدرج.",
  "تراب":"الأمر ثابت وراسخ، يُحسم بالعمل المتواصل والصبر الطويل."
};

/* ============ دوال مساعدة ============ */
function jaNorm(word) {
  return (word || "").trim().replace(/\s+/g, "")
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه")
    .replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي");
}

function jaGetNature(letter, method) {
  const natures = (method === "ayqagh") ? JA_NATURES_AYQAGH : JA_NATURES_ABJAD;
  for (const n in natures) {
    if (natures[n].letters.indexOf(letter) !== -1) return n;
  }
  return "—";
}

function jaClosestLetter(value) {
  let best = null, bestDiff = Infinity;
  for (const l in JA_ABJAD_VALUES) {
    const d = Math.abs(JA_ABJAD_VALUES[l] - value);
    if (d < bestDiff) { bestDiff = d; best = l; }
  }
  return bestDiff <= 10 ? best : "—";
}

function jaTawlid(word, method) {
  method = method || "abjad";
  const circle = (method === "ayqagh") ? JA_AYQAGH : JA_ABJAD;
  const clean = jaNorm(word);
  const letters = clean.split("").filter(c => circle.indexOf(c) !== -1);
  if (letters.length === 0) return [];
  const rows = [];
  for (let row = 0; row < 28; row++) {
    const newRow = letters.map(ch => circle[(circle.indexOf(ch) + row) % 28]);
    rows.push(newRow.join(""));
  }
  return rows;
}

function jaLaqt(rows, startLetter, method, maxSteps) {
  maxSteps = maxSteps || 12;
  if (!rows || rows.length === 0) return [];
  const allLetters = rows.join("").split("");
  if (allLetters.length === 0) return [];
  let pos = allLetters.indexOf(startLetter);
  if (pos === -1) pos = 0;
  const result = [];
  const step = JA_ABJAD_VALUES[startLetter] || 1;
  for (let i = 0; i < maxSteps; i++) {
    pos = (pos + step) % allLetters.length;
    const picked = allLetters[pos];
    if (!picked) break;
    result.push({
      step: i + 1, letter: picked,
      value: JA_ABJAD_VALUES[picked] || 0,
      nature: jaGetNature(picked, method),
      planet: (JA_PLANETS[picked] || {}).planet || "—",
      rank: JA_RANKS[picked] || "—"
    });
  }
  return result;
}

function jaBast(letter) {
  const word = JA_LETTER_SPELLING[letter];
  if (!word) return { letter: letter, word: "", value: 0 };
  let sum = 0;
  for (const ch of word.split("")) sum += JA_ABJAD_VALUES[ch] || 0;
  return { letter: letter, word: word, value: sum };
}

function jaKasr(letter) {
  const value = JA_ABJAD_VALUES[letter] || 0;
  const fractions = JA_FRACTIONS[letter] || [];
  const results = fractions.map(div => {
    const r = Math.floor(value / div);
    return { divisor: div, rawResult: r, letter: jaClosestLetter(r) };
  });
  return { letter: letter, value: value, fractions: results };
}

function jaTarh(letter, method) {
  const value = JA_ABJAD_VALUES[letter] || 0;
  const nature = jaGetNature(letter, method);
  const isqat = (JA_NATURES_ABJAD[nature] || {}).isqat || 1;
  let remaining = value;
  while (remaining >= isqat && remaining > 0) remaining -= isqat;
  return { letter: letter, value: value, nature: nature, isqat: isqat, remaining: remaining, resultLetter: jaClosestLetter(remaining) };
}

function jaMahd(letters, method) {
  const totals = { "نار": 0, "هواء": 0, "ماء": 0, "تراب": 0 };
  letters.forEach(ch => {
    const nature = jaGetNature(ch, method);
    if (totals[nature] !== undefined) totals[nature] += JA_ABJAD_VALUES[ch] || 0;
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  return { totals: totals, dominant: sorted[0][0], dominantValue: sorted[0][1] };
}

function jaBuildProbabilityMatrix(extractedLetters, dominantElement) {
  if (!extractedLetters || extractedLetters.length === 0) {
    return { topics: [], verbs: [], sentence: "لا توجد حروف لتركيب القراءة." };
  }
  const lettersArray = extractedLetters.split("");
  const topicsResult = [];
  for (const topicName in JA_TOPIC_MATRIX) {
    const t = JA_TOPIC_MATRIX[topicName];
    let score = 0;
    lettersArray.forEach(ch => { if (t.letters.indexOf(ch) !== -1) score += 1; });
    if (score > 0) {
      topicsResult.push({ name: topicName, icon: t.icon, score: score, percentage: Math.round((score / lettersArray.length) * 100) });
    }
  }
  topicsResult.sort((a, b) => b.score - a.score);
  const verbCount = {};
  lettersArray.forEach(ch => {
    const sem = JA_LETTER_SEMANTICS[ch];
    if (!sem) return;
    sem.verbs.forEach(v => { verbCount[v] = (verbCount[v] || 0) + 1; });
  });
  const verbsResult = Object.entries(verbCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => ({ verb: e[0], count: e[1] }));
  let sentence = "";
  if (topicsResult.length > 0) {
    sentence += "الأرجح أن السؤال يتعلق بـ" + topicsResult[0].icon + " «" + topicsResult[0].name + "»";
    if (topicsResult[1]) sentence += " و" + topicsResult[1].icon + " «" + topicsResult[1].name + "»";
    sentence += ". ";
  }
  if (verbsResult.length >= 2) {
    sentence += "المسار يشير إلى: " + verbsResult.slice(0, 3).map(v => v.verb).join(" ← ") + ". ";
  }
  if (JA_NATURE_TONES[dominantElement]) sentence += JA_NATURE_TONES[dominantElement];
  return { topics: topicsResult, verbs: verbsResult, sentence: sentence };
}

function jaAnalyzeTiming(tarhResults, totalAbjad) {
  if (!tarhResults || tarhResults.length === 0) return { period: "غير محدد", icon: "❔", reasoning: "" };
  const sumRemaining = tarhResults.reduce((s, t) => s + (t.remaining || 0), 0);
  const mod = sumRemaining % 30;

  let period, icon, reasoning;
  if (mod >= 1 && mod <= 9) {
    period = "قريب جداً"; icon = "⚡";
    reasoning = "الباقي صغير (أيام إلى أسابيع). الأمر في طريقه للتحقق.";
  } else if (mod >= 10 && mod <= 19) {
    period = "متوسط"; icon = "⏳";
    reasoning = "الباقي متوسط (أشهر). الأمر يحتاج وقتاً وتدرجاً.";
  } else if (mod >= 20 && mod <= 29) {
    period = "بعيد"; icon = "📅";
    reasoning = "الباقي كبير (سنة أو أكثر). الأمر يحتاج صبراً وتخطيطاً.";
  } else {
    period = "غير محدد"; icon = "❔"; reasoning = "لم يتحدد التوقيت بوضوح.";
  }
  return { period: period, icon: icon, reasoning: reasoning, sumRemaining: sumRemaining, mod: mod };
}

function jaSuggestNames(extractedLetters) {
  if (!extractedLetters) return [];
  const letters = extractedLetters.split("");
  const seen = {};
  const result = [];
  const priorityLetters = [letters[0], letters[1], letters[2]].filter(Boolean);
  priorityLetters.forEach(ch => {
    const sem = JA_LETTER_SEMANTICS[ch];
    if (!sem || !sem.names) return;
    sem.names.forEach(n => {
      if (!seen[n]) { seen[n] = 1; result.push({ name: n, fromLetter: ch }); }
    });
  });
  return result.slice(0, 6);
}

function jaWarningsAndAdvice(extractedLetters, dominantElement) {
  const warnings = [];
  const advice = [];
  if (!extractedLetters) return { warnings: warnings, advice: advice };
  const letters = extractedLetters.split("");

  if (letters.includes("ض")) warnings.push("⚠️ ظهور حرف «ض» — قد يشير إلى ضيق أو صعوبة قادمة. لا تتسرع.");
  if (letters.includes("خ")) warnings.push("⚠️ ظهور حرف «خ» — انتبه من الخوف أو الخفاء. كن حذراً.");
  if (letters.includes("ذ")) warnings.push("⚠️ ظهور حرف «ذ» — قد يشير إلى ذكر سلبي أو نسيان. حافظ على حضورك.");
  if (letters.includes("ظ")) warnings.push("⚠️ ظهور حرف «ظ» — قد يشير إلى ظن أو ظهور مفاجئ. لا تبنِ على الظن.");
  if (dominantElement === "نار") warnings.push("🔥 الطبع ناري — احذر من التسرع والاندفاع. هدّئ من روعك.");

  if (letters.includes("ر")) advice.push("✅ ظهور «ر» — إشارة رحمة ورزق. توكّل على الله.");
  if (letters.includes("ف")) advice.push("✅ ظهور «ف» — إشارة فرج وفتح. استبشر خيراً.");
  if (letters.includes("ن")) advice.push("✅ ظهور «ن» — إشارة نور ونصر. ثق بنفسك.");
  if (letters.includes("ص")) advice.push("✅ ظهور «ص» — إشارة صدق وصبر. اثبت على موقفك.");
  if (letters.includes("ح")) advice.push("✅ ظهور «ح» — إشارة حكمة وحياة. تعامل بعقل.");
  if (dominantElement === "تراب") advice.push("⛰️ الطبع ترابي — الأمر يحتاج عمل متواصل وصبر طويل.");
  if (dominantElement === "ماء") advice.push("💧 الطبع مائي — تعامل بعاطفة وتفهم، ولا تهمل الجانب العملي.");
  if (dominantElement === "هواء") advice.push("🌪️ الطبع هوائي — راجع حساباتك مرة أخرى قبل التنفيذ.");

  return { warnings: warnings, advice: advice };
}

/* ============ التحليل الكامل ============ */
function jaFullAnalysis(word, method) {
  method = method || "abjad";
  const clean = jaNorm(word);
  const circle = (method === "ayqagh") ? JA_AYQAGH : JA_ABJAD;
  const letters = clean.split("").filter(c => circle.indexOf(c) !== -1);
  if (letters.length === 0) return { error: "لا يوجد حروف صالحة للتحليل" };

  const rows = jaTawlid(word, method);
  const firstLetter = (rows[0] && rows[0][0]) ? rows[0][0] : "—";
  const laqtChain = jaLaqt(rows, firstLetter, method);
  const extractedLetters = laqtChain.map(l => l.letter).join("");
  const mahd = jaMahd(letters, method);
  const tarhResults = letters.map(l => jaTarh(l, method));

  return {
    word: word, method: method, letters: letters, rows: rows,
    firstLetter: firstLetter, laqtChain: laqtChain,
    extractedLetters: extractedLetters,
    bast: letters.map(l => jaBast(l)),
    kasr: letters.map(l => jaKasr(l)),
    tarh: tarhResults,
    mahd: mahd,
    probability: jaBuildProbabilityMatrix(extractedLetters, mahd.dominant),
    timing: jaAnalyzeTiming(tarhResults, letters.reduce((s,l) => s + (JA_ABJAD_VALUES[l]||0), 0)),
    names: jaSuggestNames(extractedLetters),
    warningsAdvice: jaWarningsAndAdvice(extractedLetters, mahd.dominant),
    totalAbjad: letters.reduce((s, l) => s + (JA_ABJAD_VALUES[l] || 0), 0),
    excessFound: letters.filter(l => JA_EXCESS_LETTERS.indexOf(l) !== -1)
  };
}

/* ============ الشاشة الرئيسية ============ */
let jaAdvCurrentMethod = "abjad";
let jaAdvLastResult = null;

function showJafrAdvancedScreen() {
  const titleEl = document.getElementById('listTitle');
  const c = document.getElementById('listContent');
  if (!c) { alert("خطأ"); return; }
  if (titleEl) titleEl.textContent = "🔮 الاستخراج الجفري المتقدم";

  c.innerHTML = `
    <div class="card" style="background:linear-gradient(135deg,#1A237E,#4A148C);color:#fff">
      <div class="card-title" style="color:#FFD54F;border-color:#FFD54F">🔮 الاستخراج الجفري المتقدم</div>
      <p style="font-size:13px;color:rgba(255,255,255,0.9);line-height:1.9;margin:0">
        محرك شامل يطبق قواعد علم الجفر + مصفوفة احتمالات موسّعة:
        <br>① البسط — ② الكسر — ③ الطرح — ④ التوليد
        <br>⑤ اللقط — ⑥ المحض — ⑦ الحل والعقد
        <br><strong style="color:#FFD54F">⑧ الخبر — ⑨ التوقيت — ⑩ الأسماء — ⑪ التحذير والنصيحة</strong>
      </p>
    </div>

    <div class="card">
      <div class="card-title">📝 أدخل السؤال</div>
      <label style="font-size:13px;font-weight:bold">الاسم أو الكلمة:</label>
      <input type="text" id="jaAdvWord" placeholder="مثال: سليم، أحمد..." autocomplete="off"
        style="width:100%;padding:12px;border:2px solid #C5CAE9;border-radius:10px;font-size:15px;margin:6px 0 12px 0;outline:none;font-family:inherit">

      <label style="font-size:13px;font-weight:bold">الدائرة:</label>
      <div style="display:flex;gap:8px;margin:6px 0 12px 0">
        <button class="btn-outline" id="jaAdvAbjad" onclick="jaAdvSetMethod('abjad')"
          style="flex:1;padding:10px;background:#1A237E;color:#fff;border-color:#1A237E">أبجد</button>
        <button class="btn-outline" id="jaAdvAyqagh" onclick="jaAdvSetMethod('ayqagh')"
          style="flex:1;padding:10px">أيقغ</button>
      </div>

      <button class="btn-primary" style="width:100%;margin-top:8px" onclick="jaAdvRun()">
        🔮 استخرج القراءة
      </button>
    </div>

    <div id="jaAdvResult"></div>
  `;
  showScreen('screen-list');
}

function jaAdvSetMethod(m) {
  jaAdvCurrentMethod = m;
  const a = document.getElementById('jaAdvAbjad');
  const b = document.getElementById('jaAdvAyqagh');
  if (!a || !b) return;
  if (m === "abjad") {
    a.style.background = "#1A237E"; a.style.color = "#fff";
    b.style.background = ""; b.style.color = "";
  } else {
    b.style.background = "#1A237E"; b.style.color = "#fff";
    a.style.background = ""; a.style.color = "";
  }
}

function jaAdvRun() {
  try {
    const wordEl = document.getElementById('jaAdvWord');
    if (!wordEl) { alert("❌"); return; }
    const word = wordEl.value.trim();
    if (!word) { alert("⚠️ الرجاء إدخال اسم أو كلمة"); return; }

    const container = document.getElementById('jaAdvResult');
    if (!container) { alert("❌"); return; }

    container.innerHTML = '<div class="card"><p style="text-align:center;color:#1A237E;font-weight:bold;padding:16px">⏳ جاري الحساب...</p></div>';

    const result = jaFullAnalysis(word, jaAdvCurrentMethod);
    if (!result || result.error) {
      container.innerHTML = '<div class="card"><p style="color:#B71C1C;text-align:center;padding:14px">' + (result && result.error ? result.error : "لا توجد نتائج") + '</p></div>';
      return;
    }

    jaAdvLastResult = result;
    const methodName = (result.method === "ayqagh") ? "دائرة أيقغ" : "دائرة أبجد";

    let headerHTML = '<div class="card">' +
      '<div class="card-title">📖 البيانات الأساسية</div>' +
      '<div style="text-align:center;padding:14px 0">' +
        '<div style="font-size:38px;font-weight:bold;color:#4A148C;margin-bottom:10px">' + result.word + '</div>' +
        '<div style="font-size:13px;color:#666">' + methodName + '</div>' +
      '</div>' +
      '<div class="summary-grid">' +
        '<div class="sum-item"><span class="sum-lbl">القيمة الأبجدية</span><span class="sum-val">' + result.totalAbjad + '</span></div>' +
        '<div class="sum-item"><span class="sum-lbl">عدد الحروف</span><span class="sum-val">' + result.letters.length + '</span></div>' +
        '<div class="sum-item"><span class="sum-lbl">الطبع الغالب</span><span class="sum-val">' + result.mahd.dominant + '</span></div>' +
        '<div class="sum-item"><span class="sum-lbl">حرف البداية</span><span class="sum-val">' + result.firstLetter + '</span></div>' +
      '</div>';
    if (result.excessFound.length > 0) {
      headerHTML += '<div style="margin-top:12px;padding:10px;background:#FFF3E0;border-radius:8px;font-size:12.5px;color:#E65100;line-height:1.8">' +
        '⚠️ <strong>حروف زائدة:</strong> ' + result.excessFound.join("، ") + '</div>';
    }
    headerHTML += '</div>';

    const prob = result.probability;
    const topicsHTML = prob.topics.slice(0, 8).map(function(t) {
      const barWidth = Math.min(100, t.percentage * 2);
      return '<div style="margin-bottom:10px">' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">' +
          '<span style="font-weight:bold;color:#1A237E">' + t.icon + ' ' + t.name + '</span>' +
          '<span style="color:#666">' + t.percentage + '%</span>' +
        '</div>' +
        '<div style="background:#E8EAF6;height:8px;border-radius:4px;overflow:hidden">' +
          '<div style="background:linear-gradient(90deg,#1A237E,#4A148C);height:100%;width:' + barWidth + '%;border-radius:4px"></div>' +
        '</div>' +
      '</div>';
    }).join("");

    const verbsHTML = prob.verbs.map(function(v) {
      return '<span style="display:inline-block;background:#E8EAF6;color:#1A237E;padding:6px 14px;border-radius:20px;font-weight:bold;margin:4px;font-size:14px">' + v.verb + ' <span style="color:#888;font-size:11px">(' + v.count + ')</span></span>';
    }).join("");

    const probHTML = `
      <div class="card" style="border:2px solid #4A148C">
        <div class="card-title" style="color:#4A148C;border-color:#4A148C">⑧ مصفوفة الاحتمالات وتركيب الخبر</div>
        <div style="background:linear-gradient(135deg,#1A237E,#4A148C);color:#fff;padding:16px;border-radius:12px;margin-bottom:14px">
          <div style="font-size:12px;opacity:0.85;margin-bottom:8px;color:#FFD54F;font-weight:bold">📰 الخبر المستخرج</div>
          <div style="font-size:14.5px;line-height:1.95">${prob.sentence}</div>
        </div>
        ${topicsHTML ? '<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:bold;color:#1A237E;margin-bottom:10px">📊 نسب المواضيع</div>' + topicsHTML + '</div>' : ""}
        ${verbsHTML ? '<div><div style="font-size:13px;font-weight:bold;color:#1A237E;margin-bottom:8px">🔤 الأفعال</div><div style="text-align:center">' + verbsHTML + '</div></div>' : ""}
      </div>
    `;

    const timing = result.timing;
    const timingHTML = `
      <div class="card" style="border-right:4px solid #FF6F00">
        <div class="card-title" style="color:#E65100;border-color:#E65100">⑨ التوقيت المتوقع</div>
        <div style="text-align:center;padding:14px 0">
          <div style="font-size:56px;margin-bottom:8px">${timing.icon}</div>
          <div style="font-size:24px;font-weight:bold;color:#E65100;margin-bottom:10px">${timing.period}</div>
        </div>
        <p style="font-size:13.5px;line-height:1.9;color:#444;text-align:center;margin:0">${timing.reasoning}</p>
        ${timing.sumRemaining !== undefined ? '<p style="font-size:12px;color:#888;text-align:center;margin-top:8px">مجموع الباقي: ' + timing.sumRemaining + ' • الباقي% 30 = ' + timing.mod + '</p>' : ''}
      </div>
    `;

    let namesHTML = "";
    if (result.names && result.names.length > 0) {
      const nameChips = result.names.map(n =>
        '<div style="display:inline-block;background:#F3E5F5;color:#4A148C;padding:8px 16px;border-radius:20px;font-weight:bold;margin:4px;font-size:14px;border:1px solid #CE93D8">' +
          n.name + ' <span style="font-size:10px;color:#888">(' + n.fromLetter + ')</span>' +
        '</div>'
      ).join("");
      namesHTML = `
        <div class="card" style="border-right:4px solid #7B1FA2">
          <div class="card-title" style="color:#4A148C;border-color:#4A148C">⑩ أسماء وأشخاص ذوو صلة</div>
          <p style="font-size:12.5px;color:#666;line-height:1.8;margin-bottom:10px">وفق الحروف الأولى المستخرجة، قد يكون للأمر صلة بأحد هذه الأسماء:</p>
          <div style="text-align:center">${nameChips}</div>
        </div>
      `;
    }

    const wa = result.warningsAdvice;
    let waHTML = "";
    if ((wa.warnings && wa.warnings.length > 0) || (wa.advice && wa.advice.length > 0)) {
      waHTML = '<div class="card" style="border-right:4px solid #2E7D32"><div class="card-title" style="color:#2E7D32;border-color:#2E7D32">⑪ التحذير والنصيحة</div>';
      if (wa.warnings.length > 0) {
        waHTML += '<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:bold;color:#C62828;margin-bottom:8px">⚠️ تحذيرات</div>';
        wa.warnings.forEach(w => {
          waHTML += '<div style="padding:10px;background:#FFEBEE;border-right:3px solid #E53935;border-radius:8px;margin-bottom:6px;font-size:13.5px;line-height:1.8;color:#333">' + w + '</div>';
        });
        waHTML += '</div>';
      }
      if (wa.advice.length > 0) {
        waHTML += '<div><div style="font-size:13px;font-weight:bold;color:#2E7D32;margin-bottom:8px">✅ نصائح</div>';
        wa.advice.forEach(a => {
          waHTML += '<div style="padding:10px;background:#E8F5E9;border-right:3px solid #43A047;border-radius:8px;margin-bottom:6px;font-size:13.5px;line-height:1.8;color:#333">' + a + '</div>';
        });
        waHTML += '</div>';
      }
      waHTML += '</div>';
    }

    const exportHTML = `
      <div class="card">
        <div class="card-title">📤 تصدير ومشاركة</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-primary" style="flex:1;padding:14px;font-size:14px" onclick="jaExportAsPNG()">
            🖼️ حفظ كصورة
          </button>
          <button class="btn-outline" style="flex:1;padding:14px;font-size:14px" onclick="jaExportAsText()">
            📲 مشاركة كنص
          </button>
          <button class="btn-outline" style="flex:1 1 100%;padding:14px;font-size:14px;background:linear-gradient(135deg,#4A148C,#7B1FA2);color:#fff;border:none" onclick="jaAskAIDeeperFromLastResult()">
            🧠 تحليل AI أعمق
          </button>
        </div>
      </div>
    `;

    let rowsHTML = '';
    result.rows.forEach(function(r, i) {
      rowsHTML += '<div class="jafr-row"><span class="jafr-row-num">' + (i + 1) + '</span><span class="jafr-row-text">' + r.split("").join(" ") + '</span></div>';
    });
    const tawlidHTML = '<div class="card"><div class="card-title">④ التوليد (28 سطراً)</div><div class="jafr-rows">' + rowsHTML + '</div></div>';

    let laqtHTML = '';
    result.laqtChain.forEach(function(l) {
      laqtHTML += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:#F7F8FC;border-radius:8px;margin-bottom:6px">' +
        '<span style="width:24px;height:24px;background:#1A237E;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;flex-shrink:0">' + l.step + '</span>' +
        '<span style="font-size:22px;font-weight:bold;color:#1A237E;min-width:40px;text-align:center">' + l.letter + '</span>' +
        '<span style="font-size:11.5px;color:#666;flex:1">عدد: <strong>' + l.value + '</strong> • طبع: <strong>' + l.nature + '</strong></span>' +
      '</div>';
    });
    const laqtSectionHTML = '<div class="card"><div class="card-title">⑤ اللقط</div>' + laqtHTML + '</div>';

    let bastRows = '';
    result.bast.forEach(function(b) {
      bastRows += '<tr><td class="letter-cell">' + b.letter + '</td><td>' + b.word + '</td><td style="text-align:center">' + b.value + '</td></tr>';
    });
    const bastHTML = '<div class="card"><div class="card-title">① البسط</div><table class="jafr-table"><thead><tr><th>الحرف</th><th>اسمه</th><th>القيمة</th></tr></thead><tbody>' + bastRows + '</tbody></table></div>';

    let kasrRows = '';
    result.kasr.forEach(function(k) {
      if (!k.fractions || k.fractions.length === 0) {
        kasrRows += '<tr><td class="letter-cell">' + k.letter + '</td><td style="text-align:center">' + k.value + '</td><td style="text-align:center">—</td><td style="text-align:center">لا يقبل</td></tr>';
      } else {
        k.fractions.forEach(function(f, idx) {
          kasrRows += '<tr>';
          if (idx === 0) {
            kasrRows += '<td class="letter-cell" rowspan="' + k.fractions.length + '">' + k.letter + '</td>';
            kasrRows += '<td style="text-align:center" rowspan="' + k.fractions.length + '">' + k.value + '</td>';
          }
          kasrRows += '<td style="text-align:center">1/' + f.divisor + '</td><td style="text-align:center">' + f.rawResult + ' → <strong>' + f.letter + '</strong></td></tr>';
        });
      }
    });
    const kasrHTML = '<div class="card"><div class="card-title">② الكسر</div><table class="jafr-table"><thead><tr><th>الحرف</th><th>قيمته</th><th>الكسر</th><th>الناتج</th></tr></thead><tbody>' + kasrRows + '</tbody></table></div>';

    let tarhRows = '';
    result.tarh.forEach(function(t) {
      tarhRows += '<tr><td class="letter-cell">' + t.letter + '</td><td style="text-align:center">' + t.value + '</td><td style="text-align:center">' + t.nature + '</td><td style="text-align:center">' + t.isqat + '</td><td style="text-align:center">' + t.remaining + '</td><td style="text-align:center;font-weight:bold;color:#1A237E">' + t.resultLetter + '</td></tr>';
    });
    const tarhHTML = '<div class="card"><div class="card-title">③ الطرح</div><table class="jafr-table"><thead><tr><th>الحرف</th><th>قيمته</th><th>طبعه</th><th>الإسقاط</th><th>الباقي</th><th>الناتج</th></tr></thead><tbody>' + tarhRows + '</tbody></table></div>';

    let mahdHTML = '';
    for (const n in result.mahd.totals) {
      const v = result.mahd.totals[n];
      const info = JA_NATURES_ABJAD[n] || {};
      const pct = result.totalAbjad ? Math.round((v / result.totalAbjad) * 100) : 0;
      mahdHTML += '<div class="nature-card" style="border-right-color:' + (info.color || '#1A237E') + '"><div class="nature-header" style="color:' + (info.color || '#1A237E') + '">' +
        '<span style="font-size:20px">' + (info.icon || '•') + '</span><strong>' + n + '</strong>' +
        '<span style="font-size:12px;color:#888">المجموع: ' + v + ' (' + pct + '%)</span></div></div>';
    }
    const mahdSectionHTML = '<div class="card"><div class="card-title">⑥ المحض</div>' + mahdHTML + '<p style="margin-top:10px;font-size:13.5px;color:#444"><strong>العنصر الغالب:</strong> ' + result.mahd.dominant + '</p></div>';

    let wordsHTML = '';
    if (result.extractedLetters.length > 0) {
      for (let i = 0; i < result.extractedLetters.length; i += 2) {
        const pair = result.extractedLetters.substring(i, i + 2);
        if (pair.length === 2) {
          wordsHTML += '<span style="display:inline-block;background:#E8EAF6;color:#1A237E;padding:6px 14px;border-radius:20px;font-weight:bold;margin:4px;font-size:15px">' + pair + '</span>';
        }
      }
    }
    const finalHTML = '<div class="card" style="background:linear-gradient(135deg,#1A237E,#4A148C);color:#fff">' +
      '<div class="card-title" style="color:#FFD54F;border-color:#FFD54F">⑦ الحل والعقد</div>' +
      '<div style="text-align:center;padding:14px 0">' +
        '<div style="font-size:11px;opacity:0.85;margin-bottom:8px">الحروف المستخرجة</div>' +
        '<div style="font-size:30px;font-weight:bold;color:#FFD54F;letter-spacing:5px;margin:8px 0;font-family:Amiri,serif;word-break:break-all">' + (result.extractedLetters || "—") + '</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.12);border-radius:10px;padding:12px;margin-top:10px">' +
        '<div style="font-size:12px;color:#FFD54F;font-weight:bold;margin-bottom:8px">المقاطع المقترحة:</div>' +
        '<div style="text-align:center">' + wordsHTML + '</div>' +
      '</div>' +
    '</div>';

    container.innerHTML = headerHTML + probHTML + timingHTML + namesHTML + waHTML + exportHTML + bastHTML + kasrHTML + tarhHTML + tawlidHTML + laqtSectionHTML + mahdSectionHTML + finalHTML +
      '<div class="card" style="background:#FFF8E1;border-right:4px solid #FF9800">' +
        '<p style="font-size:12.5px;color:#555;line-height:1.9;text-align:center;margin:0">' +
          '⚠️ <strong>تنبيه:</strong> هذه قراءة رمزية استقرائية احتمالية. لا تُعدّ إخباراً بالغيب ولا نبوءة.' +
        '</p>' +
      '</div>' +
      '<button class="btn-outline" style="width:100%;margin-top:10px" onclick="showJafrAdvancedScreen()">← سؤال آخر</button>';

    window.scrollTo(0, 0);
  } catch (e) {
    console.error("[JA-ADV] خطأ:", e);
    const container = document.getElementById('jaAdvResult');
    if (container) container.innerHTML = '<div class="card"><p style="color:#B71C1C;text-align:center;padding:14px">❌ ' + (e.message || e) + '</p></div>';
  }
}

/* ============ تصدير كصورة ============ */
function jaExportAsPNG() {
  if (!jaAdvLastResult) { alert("⚠️ لا توجد نتيجة"); return; }
  try {
    const r = jaAdvLastResult;
    const W = 900, H = 1800;
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1A237E");
    bg.addColorStop(0.5, "#283593");
    bg.addColorStop(1, "#4A148C");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,215,0,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    let y = 80;
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFD54F";
    ctx.font = "bold 44px 'Segoe UI', Tahoma, Arial";
    ctx.fillText("🔮 الاستخراج الجفري", W / 2, y); y += 60;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 38px 'Segoe UI', Tahoma, Arial";
    ctx.fillText(r.word, W / 2, y); y += 50;

    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "18px 'Segoe UI', Tahoma, Arial";
    ctx.fillText("القيمة الأبجدية: " + r.totalAbjad + " • الطبع الغالب: " + r.mahd.dominant, W / 2, y); y += 50;

    ctx.strokeStyle = "rgba(255,215,0,0.4)";
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(W - 80, y);
    ctx.stroke();
    y += 40;

    ctx.textAlign = "right";
    ctx.fillStyle = "#FFD54F";
    ctx.font = "bold 22px 'Segoe UI', Tahoma, Arial";
    ctx.fillText("📰 الخبر المستخرج:", W - 60, y); y += 36;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px 'Segoe UI', Tahoma, Arial";
    y = jaWrapText(ctx, r.probability.sentence, W - 60, y, W - 120, 30);
    y += 30;

    ctx.fillStyle = "#FFD54F";
    ctx.font = "bold 22px 'Segoe UI', Tahoma, Arial";
    ctx.fillText("⏳ التوقيت: " + r.timing.icon + " " + r.timing.period, W - 60, y); y += 36;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "16px 'Segoe UI', Tahoma, Arial";
    y = jaWrapText(ctx, r.timing.reasoning, W - 60, y, W - 120, 26);
    y += 30;

    if (r.probability.topics.length > 0) {
      ctx.fillStyle = "#FFD54F";
      ctx.font = "bold 22px 'Segoe UI', Tahoma, Arial";
      ctx.fillText("📊 المواضيع المرجحة:", W - 60, y); y += 36;
      ctx.font = "16px 'Segoe UI', Tahoma, Arial";
      r.probability.topics.slice(0, 5).forEach(t => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("• " + t.icon + " " + t.name + " — " + t.percentage + "%", W - 60, y);
        y += 28;
      });
      y += 20;
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#FFD54F";
    ctx.font = "bold 22px 'Segoe UI', Tahoma, Arial";
    ctx.fillText("⑦ الحروف المستخرجة من اللقط", W / 2, y); y += 50;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 40px 'Amiri', serif";
    ctx.fillText(r.extractedLetters || "—", W / 2, y); y += 60;

    if (r.warningsAdvice.advice.length > 0) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#A5D6A7";
      ctx.font = "bold 20px 'Segoe UI', Tahoma, Arial";
      ctx.fillText("✅ نصائح:", W - 60, y); y += 32;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "16px 'Segoe UI', Tahoma, Arial";
      r.warningsAdvice.advice.slice(0, 3).forEach(a => {
        y = jaWrapText(ctx, "• " + a, W - 60, y, W - 120, 26);
      });
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,215,0,0.7)";
    ctx.font = "14px 'Segoe UI', Tahoma, Arial";
    ctx.fillText("قراءة رمزية استقرائية — تطبيق علم الحروف", W / 2, H - 40);

    canvas.toBlob(async function(blob) {
      const file = new File([blob], r.word + "-جفر.png", { type: "image/png" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "قراءة جفرية: " + r.word }); return; } catch(e) {}
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = r.word + "-جفر.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (typeof showToast === 'function') showToast("✅ تم حفظ الصورة");
    }, "image/png");
  } catch (err) {
    console.error(err);
    alert("❌ خطأ في التصدير: " + err.message);
  }
}

function jaWrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else { line = testLine; }
  }
  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
}

/* ============ تصدير كنص ============ */
function jaExportAsText() {
  if (!jaAdvLastResult) { alert("⚠️ لا توجد نتيجة"); return; }
  const r = jaAdvLastResult;
  let text = "🔮 *قراءة جفرية — " + r.word + "*\n";
  text += "━━━━━━━━━━━━━━━━━\n\n";
  text += "📖 *البيانات الأساسية:*\n";
  text += "• القيمة الأبجدية: " + r.totalAbjad + "\n";
  text += "• الطبع الغالب: " + r.mahd.dominant + "\n";
  text += "• الدائرة: " + (r.method === "ayqagh" ? "أيقغ" : "أبجد") + "\n\n";
  text += "📰 *الخبر:*\n" + r.probability.sentence + "\n\n";
  text += "⏳ *التوقيت:* " + r.timing.icon + " " + r.timing.period + "\n";
  text += r.timing.reasoning + "\n\n";
  if (r.probability.topics.length > 0) {
    text += "📊 *المواضيع المرجحة:*\n";
    r.probability.topics.slice(0, 5).forEach(t => { text += "• " + t.icon + " " + t.name + " — " + t.percentage + "%\n"; });
    text += "\n";
  }
  text += "⑦ *الحروف المستخرجة:* " + (r.extractedLetters || "—") + "\n\n";
  if (r.warningsAdvice.advice.length > 0) {
    text += "✅ *نصائح:*\n";
    r.warningsAdvice.advice.slice(0, 3).forEach(a => { text += "• " + a + "\n"; });
    text += "\n";
  }
  text += "━━━━━━━━━━━━━━━━━\n";
  text += "⚠️ قراءة رمزية استقرائية — لا تُعد إخباراً بالغيب.";

  if (navigator.share) {
    navigator.share({ title: "قراءة جفرية: " + r.word, text: text }).catch(() => jaFallbackShare(text));
  } else {
    jaFallbackShare(text);
  }
}

function jaFallbackShare(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') showToast("✅ تم نسخ القراءة");
    }).catch(() => window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank"));
  } else {
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  }
}

/* ============================================================
   ملاحظة: دالة jaAskAIDeeper الأصلية محذوفة من هنا
   وتم استبدالها بنسخة محسّنة في ملف jafr-ai.js
   الذي يُحمّل بعد هذا الملف تلقائياً
   ============================================================ */