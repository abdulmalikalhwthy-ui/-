/* ============================================================
   interactive-ai.js — الذكاء التفاعلي
   الإصدار: 3.1 — إصلاح الشاشة البيضاء + فحص الأخطاء
   الميزات:
   - يعمل مع Gemini (المزود الوحيد)
   - اختياري تماماً
   - عدّاد تنازلي عند تجاوز الحد
   - أسئلة متابعة سريعة
   - ✅ إصلاح: النص كان أبيض على خلفية فاتحة (يظهر كشاشة بيضاء)
   - ✅ إضافة: فحص result.error قبل تحليل السياق
   ============================================================ */

/* ============ سؤال متابعة سريع ============ */
async function askFollowUp(word, questionType) {
  const container = document.getElementById('followUpResult');
  if (!container) return;

  // التحقق من تفعيل AI أولاً
  if (typeof isAIEnabled === 'function' && !isAIEnabled()) {
    container.innerHTML =
      '<div style="padding:14px;background:#FFF3E0;border-radius:10px;color:#E65100;font-size:13px;line-height:1.9;text-align:center">' +
      '💡 الذكاء الاصطناعي غير مفعّل.<br>' +
      'اذهب إلى: <strong>🤖 تفعيل الذكاء الاصطناعي</strong> ثم فعّله.' +
      '<br><br>' +
      '<button class="btn-outline" onclick="showFreeAISettings()" style="width:100%;padding:8px">' +
      '⚙️ فتح الإعدادات' +
      '</button>' +
      '</div>';
    return;
  }

  // التحقق من المفتاح
  if (typeof isAIReady === 'function' && !isAIReady()) {
    const isRateLimited = typeof isRateLimited_check === 'function' ? isRateLimited_check() : false;
    if (isRateLimited) {
      const secs = typeof getRemainingSeconds === 'function' ? getRemainingSeconds() : 60;
      container.innerHTML =
        '<div style="padding:14px;background:#FFF3E0;border-radius:10px;color:#E65100;font-size:13px;line-height:1.9;text-align:center">' +
        '⏱️ انتظر <strong>' + secs + '</strong> ثانية قبل المحاولة مرة أخرى.' +
        '</div>';
    } else {
      container.innerHTML =
        '<div style="padding:14px;background:#FFEBEE;border-radius:10px;color:#C62828;font-size:13px;line-height:1.9;text-align:center">' +
        '⚠️ الذكاء الاصطناعي غير مهيأ.<br>' +
        'تأكد من وجود إنترنت + مفتاح صالح.' +
        '</div>';
    }
    return;
  }

  // عرض حالة التحميل
  container.innerHTML =
    '<div class="ai-loading"><span class="ai-spinner"></span> جاري التحليل...</div>';

  // بناء السياق المحلي
  const result = analyzeComprehensive(word);
  if (result.error) {
    container.innerHTML = '<p style="color:#FF5252;text-align:center;padding:12px">لا يمكن تحليل هذه الكلمة</p>';
    return;
  }

  // الأسئلة المتابعة
  const questions = {
    "المعنى الروحي": 'حلّل البعد الروحي لكلمة «' + word + '» بجذرها «' + result.root + '».\n' +
      'اشرح كيف تتكامل المعاني الإلهية للحروف (من الروايتين الشريفتين) مع المعنى اللغوي.\n' +
      'الإجابة في 200 كلمة.',

    "الربط بالآيات": 'الكلمة «' + word + '» لها جذر «' + result.root + '».\n' +
      'اشرح الآيات القرآنية التي ورد فيها هذا الجذر وكيف تثري المعنى.\n' +
      'عدد الآيات المتاحة: ' + result.quranVerses.length + '.\n' +
      'الإجابة في 200 كلمة.',

    "التطبيقات العملية": 'كيف يمكن تطبيق معنى كلمة «' + word + '» (جذر «' + result.root + '») في الحياة اليومية؟\n' +
      'اذكر 3-4 أمثلة عملية. الإجابة في 200 كلمة.',

    "المقارنة بالجذور المشابهة": 'قارن جذر «' + result.root + '» بجذور عربية مشابهة في الحروف أو المعنى.\n' +
      'الإجابة في 200 كلمة.',

    "السياق التاريخي": 'ما هو السياق التاريخي والأدبي لكلمة «' + word + '» في التراث العربي؟\n' +
      'الإجابة في 200 كلمة.',

    "خلاصة فلسفية": 'أعطِ خلاصة فلسفية عميقة لكلمة «' + word + '» بجذر «' + result.root + '»\n' +
      'تجمع بين الفيزياء الحركية والروحانية الإلهية. الإجابة في 150 كلمة.'
  };

  const question = questions[questionType] || questionType;

  try {
    const context = buildContextForAI(word, result);
    const systemPrompt = 'أنت خبير في علم الحروف واللغة العربية والفلسفة الإسلامية.\n' +
      'أجب بالعربية الفصحى بإيجاز ووضوح. لا تستخدم رموز Markdown معقدة.';
    const reply = await askAI(systemPrompt, context + "\n\n" + question);

    // ✅ الحل: خلفية داكنة + نص أبيض (بدل class="ai-content" الذي كان يخفي النص)
    container.innerHTML =
      '<div style="padding:16px;background:linear-gradient(135deg,#1A237E,#4A148C);' +
      'color:#FFFFFF;border-radius:12px;font-size:14.5px;line-height:1.95;' +
      'direction:rtl;text-align:right;box-shadow:0 4px 12px rgba(26,35,126,.2)">' +
      '<div style="font-size:11px;color:#FFD54F;font-weight:bold;margin-bottom:8px;' +
      'border-bottom:1px solid rgba(255,215,0,.3);padding-bottom:6px">🧠 رد الذكاء الاصطناعي</div>' +
      formatAIResponse(reply) +
      '</div>';

  } catch (e) {
    // التحقق من تجاوز الحد
    if (e.message.indexOf("انتظر") !== -1) {
      const secs = typeof getRemainingSeconds === 'function' ? getRemainingSeconds() : 60;
      container.innerHTML =
        '<div style="padding:14px;background:#FFF3E0;border-radius:10px;color:#E65100;font-size:13px;line-height:1.9;text-align:center">' +
        '⏱️ <strong>' + secs + '</strong> ثانية انتظار...' +
        '</div>';
    } else {
      container.innerHTML =
        '<p style="color:#FF5252;font-size:13px;text-align:center;padding:8px">' + e.message + '</p>' +
        '<p style="color:#888;font-size:12px;margin-top:8px;text-align:center">التحليل المحلي متاح دائماً.</p>';
    }
  }
}

/* ============ سؤال مخصص ============ */
async function askCustomQuestion(word) {
  const input = document.getElementById('followUpInput');
  if (!input) return;
  const question = input.value.trim();
  if (!question) { alert("اكتب سؤالك أولاً"); return; }

  const container = document.getElementById('followUpResult');

  // التحقق من تفعيل AI
  if (typeof isAIEnabled === 'function' && !isAIEnabled()) {
    container.innerHTML =
      '<div style="padding:14px;background:#FFF3E0;border-radius:10px;color:#E65100;font-size:13px;line-height:1.9;text-align:center">' +
      '💡 فعّل الذكاء الاصطناعي من الإعدادات أولاً.' +
      '</div>';
    return;
  }

  if (typeof isAIReady === 'function' && !isAIReady()) {
    container.innerHTML =
      '<div style="padding:14px;background:#FFEBEE;border-radius:10px;color:#C62828;font-size:13px;line-height:1.9;text-align:center">' +
      '⚠️ الذكاء الاصطناعي غير جاهز حالياً.' +
      '</div>';
    return;
  }

  container.innerHTML =
    '<div class="ai-loading"><span class="ai-spinner"></span> جاري التحليل...</div>';

  const result = analyzeComprehensive(word);

  // ✅ فحص الأخطاء قبل بناء السياق (منعاً لانهيار JavaScript)
  if (result.error) {
    container.innerHTML = '<p style="color:#FF5252;text-align:center;padding:12px">لا يمكن تحليل هذه الكلمة</p>';
    return;
  }

  try {
    const context = buildContextForAI(word, result);
    const systemPrompt = 'أنت خبير في علم الحروف واللغة العربية والفلسفة الإسلامية.\n' +
      'سياق التحليل: كلمة «' + word + '» بجذر «' + result.root + '».\n' +
      'أجب على السؤال بالعربية الفصحى بإيجاز (200-250 كلمة).';
    const reply = await askAI(systemPrompt, context + "\n\nالسؤال: " + question);

    // ✅ الحل: خلفية داكنة + نص أبيض
    container.innerHTML =
      '<div style="padding:16px;background:linear-gradient(135deg,#1A237E,#4A148C);' +
      'color:#FFFFFF;border-radius:12px;font-size:14.5px;line-height:1.95;' +
      'direction:rtl;text-align:right;box-shadow:0 4px 12px rgba(26,35,126,.2)">' +
      '<div style="font-size:11px;color:#FFD54F;font-weight:bold;margin-bottom:8px;' +
      'border-bottom:1px solid rgba(255,215,0,.3);padding-bottom:6px">💬 رد الذكاء الاصطناعي</div>' +
      formatAIResponse(reply) +
      '</div>';

  } catch (e) {
    if (e.message.indexOf("انتظر") !== -1) {
      const secs = typeof getRemainingSeconds === 'function' ? getRemainingSeconds() : 60;
      container.innerHTML =
        '<div style="padding:14px;background:#FFF3E0;border-radius:10px;color:#E65100;font-size:13px;line-height:1.9;text-align:center">' +
        '⏱️ انتظر <strong>' + secs + '</strong> ثانية' +
        '</div>';
    } else {
      container.innerHTML = '<p style="color:#FF5252;font-size:13px;text-align:center;padding:8px">' + e.message + '</p>';
    }
  }
}

/* ============ بناء السياق للذكاء الاصطناعي ============ */
function buildContextForAI(word, result) {
  const lettersContext = result.letters.map(function(l) {
    return 'حرف «' + l.letter + '»: حركياً = ' + l.kinetic +
           '، إلهياً (علي) = ' + l.divineAli.primary +
           '، إلهياً (الرضا) = ' + l.divineRida.primary;
  }).join('\n');

  const versesContext = result.quranVerses.slice(0, 3).map(function(v) {
    return '﴿ ' + v.t + ' ﴾ [' + v.s + ': ' + v.a + ']';
  }).join('\n');

  return 'الكلمة: "' + word + '"\n' +
    'الجذر: ' + result.root + '\n' +
    'البعد: ' + result.dimension.dimension + '\n' +
    'الطبع: ' + result.dominantNature + '\n\n' +
    'تحليل الحروف:\n' + lettersContext + '\n\n' +
    (versesContext ? 'الآيات المتعلقة:\n' + versesContext + '\n\n' : '') +
    'المعنى الجامع المحلي: ' + result.finalMeaning;
}

/* ============ الدعم للكود القديم ============ */
async function startConversationMode(word) {
  await askCustomQuestion(word);
}

async function sendConversationMessage(word, message) {
  const input = document.getElementById('followUpInput');
  if (input) input.value = message;
  await askCustomQuestion(word);
}