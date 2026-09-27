/* ============================================================
   jafr-ai.js — تحليل AI للجفر
   الإصدار 2.0 — إلغاء الإعادة التلقائية + تنظيف الحد القديم
   ============================================================ */

/* ============ تنظيف الحد المُخزَّن القديم عند بدء التطبيق ============ */
(function jaCleanStaleRateLimit() {
  try {
    const until = parseInt(localStorage.getItem('ai_rate_limit_until') || '0', 10);
    if (!until) return;
    const diffSeconds = Math.ceil((until - Date.now()) / 1000);
    /* إذا بقي أكثر من 90 ثانية، فهو حد قديم عالق — امسحه */
    if (diffSeconds > 90) {
      localStorage.removeItem('ai_rate_limit_until');
      console.log("[JA-AI] تم مسح حد قديم عالق:", diffSeconds, "ثانية");
    }
  } catch (e) { }
})();

/* ============ الإصدار المُحسّن من jaAskAIDeeper ============ */
async function jaAskAIDeeper(word, extractedLetters, dominantNature, sentence) {
  const resultDiv = document.getElementById('jaAdvResult');
  if (!resultDiv) return;

  /* إزالة أي بانر سابق */
  const oldBanner = resultDiv.querySelector('.ja-ai-banner');
  if (oldBanner) oldBanner.remove();

  /* 1) فحص تفعيل AI */
  if (typeof isAIEnabled === 'function' && !isAIEnabled()) {
    jaShowAIBanner(resultDiv, {
      color: '#FFF3E0',
      border: '#E65100',
      icon: '💡',
      title: 'الذكاء الاصطناعي غير مفعّل',
      text: 'اذهب إلى الإعدادات لتفعيله وإدخال المفتاح.',
      buttonText: '⚙️ فتح الإعدادات',
      buttonAction: 'showFreeAISettings()'
    });
    return;
  }

  /* 2) فحص الجاهزية */
  if (typeof isAIReady === 'function' && !isAIReady()) {
    jaShowAIBanner(resultDiv, {
      color: '#FFEBEE',
      border: '#C62828',
      icon: '⚠️',
      title: 'الذكاء الاصطناعي غير جاهز',
      text: 'تأكد من وجود إنترنت + مفتاح صالح.'
    });
    return;
  }

  /* 3) فحص حد الانتظار النشط */
  const remaining = typeof getRemainingSeconds === 'function' ? getRemainingSeconds() : 0;
  if (remaining > 0) {
    jaShowAICountdown(resultDiv, remaining, word, extractedLetters, dominantNature, sentence);
    return;
  }

  /* 4) عرض حالة التحميل */
  const aiBox = document.createElement('div');
  aiBox.className = 'card ja-ai-box';
  aiBox.style.background = 'linear-gradient(135deg,#1A237E,#4A148C)';
  aiBox.style.color = '#fff';
  aiBox.innerHTML = '<div style="text-align:center;padding:20px">' +
    '<div style="display:inline-block;width:30px;height:30px;border:3px solid rgba(255,255,255,0.3);border-top-color:#FFD54F;border-radius:50%;animation:spin 0.8s linear infinite"></div>' +
    '<div style="margin-top:12px;font-size:14px;font-weight:bold">🧠 جاري التحليل العميق بـ Gemini...</div>' +
    '<div style="margin-top:6px;font-size:11px;opacity:0.75">قد يستغرق 5-15 ثانية</div>' +
    '</div>';
  resultDiv.insertBefore(aiBox, resultDiv.firstChild);

  /* 5) تنفيذ الطلب */
  try {
    const systemPrompt = 'أنت خبير في علم الجفر واللغة العربية. لديك قراءة رمزية استقرائية من محرك جفري، وطُلب منك تحليلها بعمق.\n' +
      'اشرح ما قد تعنيه هذه القراءة بالتفصيل، مع الاستشهاد بالمعاني الرمزية للحروف والطبائع. اكتب بموضوعية، مع التنبيه أنها قراءة احتمالية.';

    const userPrompt = 'الكلمة/السؤال: «' + word + '»\n' +
      'الحروف المستخرجة: ' + extractedLetters + '\n' +
      'الطبع الغالب: ' + dominantNature + '\n' +
      'القراءة الأولية: ' + sentence + '\n\n' +
      'المطلوب:\n' +
      '1) حلّل الرسالة الرمزية للحروف بالتفصيل.\n' +
      '2) اربط الطبائع بالمعنى العام.\n' +
      '3) اقترح 3-4 توجيهات عملية (بدون ادعاء الغيب).\n' +
      '4) اختم بتنبيه أن هذه قراءة رمزية احتمالية.\n' +
      'الإجابة في 250 كلمة.';

    const reply = await askAI(systemPrompt, userPrompt);

    /* نجاح — عرض النتيجة */
    aiBox.innerHTML = '<div class="card-title" style="color:#FFD54F;border-color:#FFD54F">🧠 تحليل AI العميق</div>' +
      '<div style="font-size:14px;line-height:1.95">' + formatAIResponse(reply) + '</div>';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;flex-wrap:wrap';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-outline';
    copyBtn.style.cssText = 'flex:1;padding:10px;background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.3);font-size:13px';
    copyBtn.textContent = '📋 نسخ';
    copyBtn.onclick = function() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(reply).then(function() {
          if (typeof showToast === 'function') showToast("✅ تم نسخ التحليل");
        });
      }
    };

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-outline';
    closeBtn.style.cssText = 'flex:1;padding:10px;background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.3);font-size:13px';
    closeBtn.textContent = '✖ إغلاق';
    closeBtn.onclick = function() { aiBox.remove(); };

    btnRow.appendChild(copyBtn);
    btnRow.appendChild(closeBtn);
    aiBox.appendChild(btnRow);

  } catch (e) {
    /* معالجة الأخطاء */
    const msg = e.message || String(e);

    /* حالة تجاوز الحد */
    if (msg.indexOf("انتظر") !== -1 || msg.indexOf("تجاوزت") !== -1 || msg.indexOf("429") !== -1) {
      const remaining = typeof getRemainingSeconds === 'function' ? getRemainingSeconds() : 60;
      aiBox.remove();
      jaShowAICountdown(resultDiv, remaining, word, extractedLetters, dominantNature, sentence);
      return;
    }

    /* أخطاء أخرى */
    let errorTitle = '❌ فشل التحليل';
    let errorText = msg;
    let hint = '';

    if (msg.indexOf("المفتاح") !== -1 || msg.indexOf("مرفوض") !== -1) {
      errorTitle = '🔑 مشكلة في المفتاح';
      hint = 'تحقق من مفتاح Gemini في الإعدادات.';
    } else if (msg.indexOf("إنترنت") !== -1 || msg.indexOf("شبك") !== -1) {
      errorTitle = '🌐 مشكلة في الإنترنت';
      hint = 'تحقق من اتصالك بالشبكة.';
    } else if (msg.indexOf("مهلة") !== -1) {
      errorTitle = '⏱️ انتهت المهلة';
      hint = 'قد يكون الاتصال بطيئاً. حاول مرة أخرى.';
    } else if (msg.indexOf("فشلت كل") !== -1) {
      errorTitle = '⚠️ فشلت كل النماذج';
      hint = 'قد يكون المفتاح منتهياً. جرّب مفتاحاً جديداً.';
    }

    aiBox.innerHTML =
      '<div class="card-title" style="color:#FFCDD2;border-color:#FFCDD2">' + errorTitle + '</div>' +
      '<div style="font-size:13px;line-height:1.85;opacity:0.95">' + errorText + '</div>' +
      (hint ? '<div style="font-size:12px;margin-top:10px;padding:8px;background:rgba(255,255,255,0.1);border-radius:6px">💡 ' + hint + '</div>' : '');

    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn-outline';
    retryBtn.style.cssText = 'width:100%;margin-top:10px;background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(255,255,255,0.3);font-size:13px';
    retryBtn.textContent = '🔄 إعادة المحاولة';
    retryBtn.onclick = function() {
      aiBox.remove();
      jaAskAIDeeper(word, extractedLetters, dominantNature, sentence);
    };
    aiBox.appendChild(retryBtn);
  }
}

/* ============================================================
   ✅ العدّاد التنازلي — بدون إعادة محاولة تلقائية
   ============================================================ */
function jaShowAICountdown(resultDiv, seconds, word, extractedLetters, dominantNature, sentence) {
  /* إزالة أي بانر سابق */
  const oldBanner = resultDiv.querySelector('.ja-ai-banner');
  if (oldBanner) oldBanner.remove();

  const banner = document.createElement('div');
  banner.className = 'card ja-ai-banner';
  banner.style.background = 'linear-gradient(135deg,#E65100,#F57C00)';
  banner.style.color = '#fff';
  banner.style.border = '2px solid #FFB300';
  banner.innerHTML =
    '<div class="card-title" style="color:#FFE082;border-color:#FFE082">⏱️ انتظر قليلاً</div>' +
    '<div style="text-align:center;padding:12px 0">' +
      '<div style="font-size:52px;font-weight:bold;color:#FFE082;text-shadow:0 0 20px rgba(255,224,130,0.6)" id="jaAiCountdown">' + seconds + '</div>' +
      '<div style="font-size:12px;opacity:0.9;margin-top:6px">ثانية متبقية</div>' +
    '</div>' +
    '<p style="font-size:12.5px;line-height:1.85;text-align:center;margin:0;opacity:0.95">' +
      'Gemini يسمح بعدد محدد من الطلبات في الدقيقة.<br>' +
      'بعد انتهاء العد، ستظهر لك <strong>زر إعادة المحاولة</strong>.<br>' +
      '<span style="font-size:11px;opacity:0.8">(لا تتم إعادة المحاولة تلقائياً)</span>' +
    '</p>' +
    '<div id="jaAiAfterCountdown" style="display:none;margin-top:12px">' +
      '<button class="btn-outline" id="jaAiRetryBtn" style="width:100%;background:rgba(255,255,255,0.2);color:#fff;border-color:rgba(255,255,255,0.4);font-size:13px;font-weight:bold;padding:12px">🔄 إعادة المحاولة الآن</button>' +
    '</div>' +
    '<button class="btn-outline" id="jaAiCancelBtn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.25);font-size:12px;padding:8px">✖ إلغاء</button>';

  resultDiv.insertBefore(banner, resultDiv.firstChild);

  const counterEl = banner.querySelector('#jaAiCountdown');
  const cancelBtn = banner.querySelector('#jaAiCancelBtn');
  const retryBtn = banner.querySelector('#jaAiRetryBtn');
  const afterCountdownDiv = banner.querySelector('#jaAiAfterCountdown');
  let cancelled = false;

  cancelBtn.onclick = function() {
    cancelled = true;
    banner.remove();
    clearInterval(timer);
  };

  retryBtn.onclick = function() {
    if (cancelled) return;
    clearInterval(timer);
    banner.remove();
    jaAskAIDeeper(word, extractedLetters, dominantNature, sentence);
  };

  const timer = setInterval(function() {
    if (cancelled) return;
    const remaining = typeof getRemainingSeconds === 'function' ? getRemainingSeconds() : 0;

    if (remaining > 0) {
      if (counterEl) counterEl.textContent = remaining;
    } else {
      /* انتهى العد — لا إعادة محاولة تلقائية */
      clearInterval(timer);
      if (counterEl) counterEl.textContent = '0';
      if (afterCountdownDiv) afterCountdownDiv.style.display = 'block';
      if (cancelBtn) cancelBtn.textContent = '✖ إغلاق';
    }
  }, 1000);
}

/* ============ بانر موحّد للرسائل ============ */
function jaShowAIBanner(resultDiv, opts) {
  const oldBanner = resultDiv.querySelector('.ja-ai-banner');
  if (oldBanner) oldBanner.remove();

  const banner = document.createElement('div');
  banner.className = 'card ja-ai-banner';
  banner.style.background = opts.color || '#FFF3E0';
  banner.style.borderRight = '4px solid ' + (opts.border || '#E65100');

  banner.innerHTML =
    '<div class="card-title" style="color:' + (opts.border || '#E65100') + ';border-color:' + (opts.border || '#E65100') + '">' +
      (opts.icon || '') + ' ' + (opts.title || '') +
    '</div>' +
    '<p style="font-size:13.5px;line-height:1.9;color:#333;margin:0">' + (opts.text || '') + '</p>' +
    (opts.buttonText ? '<button class="btn-outline" style="width:100%;margin-top:12px;font-size:13px" onclick="' + opts.buttonAction + '">' + opts.buttonText + '</button>' : '');

  resultDiv.insertBefore(banner, resultDiv.firstChild);
}

/* ============ استدعاء التحليل من المتغير المحفوظ ============ */
function jaAskAIDeeperFromLastResult() {
  if (typeof jaAdvLastResult === 'undefined' || !jaAdvLastResult) {
    alert("⚠️ لا توجد نتيجة سابقة");
    return;
  }
  const r = jaAdvLastResult;
  jaAskAIDeeper(
    r.word,
    r.extractedLetters,
    r.mahd.dominant,
    r.probability.sentence
  );
}