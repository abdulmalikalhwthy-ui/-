/* ============================================================
   dream-ai.js — التفسير التفاعلي للأحلام بالذكاء الاصطناعي
   الإصدار: 2.2 — إضافة زر مشاركة النص
   
   المنهج:
   ① الإمام جعفر الصادق (ع) — الأولوية القصوى
   ② ابن سيرين
   ③ النابلسي وابن غانم
   
   الميزات:
   - استخراج الرموز من DREAMS_DB (يدعم const)
   - تصنيف الرؤيا (بشارة/تحذير/محايدة)
   - تحليل محلي فوري
   - تحليل تفاعلي بـ Gemini
   - نسخ + مشاركة التفسير
   ============================================================ */

(function () {
  'use strict';

  /* ============ حماية من التحميل المزدوج ============ */
  if (window._dreamAILoaded === true) {
    console.log('[dream-ai] الملف محمّل مسبقاً — تجاهل التحميل الثاني');
    return;
  }
  window._dreamAILoaded = true;

  /* ============================================================
     دالة مساعدة آمنة للوصول إلى المتغيرات العامة
     ============================================================ */
  function getGlobal(name) {
    try {
      if (name === 'DREAMS_DB' && typeof DREAMS_DB !== 'undefined') return DREAMS_DB;
      if (name === 'DREAM_CATEGORIES' && typeof DREAM_CATEGORIES !== 'undefined') return DREAM_CATEGORIES;
    } catch (e) { /* تجاهل */ }
    try {
      if (typeof window[name] !== 'undefined') return window[name];
    } catch (e) { /* تجاهل */ }
    return null;
  }

  /* ============================================================
     نظام الإمام الصادق التعليمي
     ============================================================ */
  var IMAM_SADIQ_SCHOOL = {
    "مبدأ": "الإمام الصادق (ع) يرى أن الرؤيا على ثلاثة أوجه: بشارة من الله، تخويف من الشيطان، وتحديث النفس.",
    "قاعدة1": "الرؤيا الصادقة جزء من النبوة — تُبشّر أو تُنذر، وتُفسّر بحسب حال الرائي.",
    "قاعدة2": "الرؤيا السوء لا تُحدَّث، ويُستعاذ بالله منها، ولا يُفسّرها المفسّر بما يكره الرائي.",
    "قاعدة3": "التعبير يتبع السياق: من رأى في طاعة، فُسّر خيراً. ومن رأى في معصية، حُذّر.",
    "قاعدة4": "الرموز تُفسَّر بحسب الدين والورع: ماء صافٍ = إيمان، نور = هداية، ظلمة = ضلالة.",
    "قاعدة5": "الرؤيا تتأثر بالزمان والمكان: رؤيا ليلة الجمعة، أو في الحرم، أقوى أثراً.",
    "قاعدة6": "الرؤيا الحسنة من الله، والحلم من الشيطان، وحديث النفس من النفس."
  };

  /* ============================================================
     رسالة النظام للذكاء الاصطناعي
     ============================================================ */
  var DREAM_AI_SYSTEM_PROMPT =
    'أنت مفسّر رؤى متخصص في التراث الإسلامي. مهمتك تحليل الرؤى وفق المنهج التالي بالترتيب:\n\n' +
    '【المرحلة ①】منهج الإمام جعفر الصادق (عليه السلام) — الأولوية القصوى:\n' +
    '- ابدأ بتصنيف الرؤيا: هل هي بشارة من الله؟ تخويف من الشيطان؟ أم حديث نفس؟\n' +
    '- اربط الرموز بالمعاني الروحية والأخلاقية (لا المادية فقط).\n' +
    '- استشهد بقواعد الإمام الصادق في التعبير:\n' +
    '  • "الرؤيا على ثلاثة أوجه: بشارة، تحذير، وحديث نفس".\n' +
    '  • "رؤيا المؤمن جزء من ستة وأربعين جزءاً من النبوة".\n' +
    '  • "لا يقصّ الرؤيا إلا على عالم أو ناصح".\n' +
    '- فسّر الرموز الدينية (ماء، نور، ظلمة، صلاة) بتفسير روحي.\n\n' +
    '【المرحلة ②】منهج ابن سيرين:\n' +
    '- بعد الانتهاء من المرحلة الأولى، أضف تفسير ابن سيرين للرموز.\n' +
    '- ابن سيرين يميل للتفسير المادي والاجتماعي (مال، زواج، سلطة).\n' +
    '- استشهد بمقولاته المعروفة في التعبير.\n\n' +
    '【المرحلة ③】منهج النابلسي وابن غانم:\n' +
    '- أضف تفاصيل إضافية من "تعطير الأنام" للنابلسي و"الإشارات" لابن غانم.\n' +
    '- هذه المرحلة للتفصيل الموسوعي وتعدد الاحتمالات.\n\n' +
    '【شروط مهمة】:\n' +
    '1) ابدأ دائماً بعبارة "وفق منهج الإمام الصادق (عليه السلام):"\n' +
    '2) اذكر أن التعبير ظنّي، ولا يُقطع به على الغيب.\n' +
    '3) لا تُخوّف الرائي، ولا تُبشّره بيقين — اترك الباب مفتوحاً.\n' +
    '4) لا تتحدث عن أمراض أو تشخيصات طبية مطلقاً.\n' +
    '5) إذا كانت الرؤيا مخيفة، اذكره بأدب الرؤيا (لا يُحدَّث بها، ويُستعاذ بالله).\n' +
    '6) الإجابة بالعربية الفصحى، مع تنظيم واضح (عناوين + نقاط).\n' +
    '7) اختم بـ "خاتمة" تجمع الخلاصة، وتوصية عملية واحدة.\n' +
    '8) الطول: 350-500 كلمة.';

  /* ============================================================
     ✅ دالة المشاركة الموحّدة — تعمل مع Web Share API و clipboard و WhatsApp
     ============================================================ */
  function daShareText(title, text) {
    if (!text) return;

    /* ① محاولة Web Share API (يعمل على Android/iOS الحديثة) */
    if (navigator.share) {
      navigator.share({ title: title || 'تفسير رؤيا', text: text })
        .then(function () {
          if (typeof window.showToast === 'function') {
            window.showToast('✅ تمت المشاركة');
          }
        })
        .catch(function (err) {
          /* المستخدم أغلق نافذة المشاركة — لا نعتبره خطأ */
          if (err && err.name === 'AbortError') return;
          /* أي خطأ آخر: fallback للنسخ */
          daFallbackShare(text);
        });
      return;
    }

    /* ② fallback: النسخ ثم WhatsApp */
    daFallbackShare(text);
  }

  function daFallbackShare(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () {
          if (typeof window.showToast === 'function') {
            window.showToast('✅ تم نسخ التفسير — الصقه حيث تشاء');
          }
        })
        .catch(function () {
          daOpenWhatsApp(text);
        });
    } else {
      daOpenWhatsApp(text);
    }
  }

  function daOpenWhatsApp(text) {
    try {
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    } catch (e) {
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ تعذّرت المشاركة');
      }
    }
  }

  /* ============================================================
     استخراج الرموز من النص
     ============================================================ */
  function daExtractSymbols(text) {
    if (!text) return [];

    var DREAMS_DB_LOCAL = getGlobal('DREAMS_DB');
    if (!DREAMS_DB_LOCAL || typeof DREAMS_DB_LOCAL !== 'object') {
      console.warn('[dream-ai] DREAMS_DB غير متاح — تعذّر استخراج الرموز');
      return [];
    }

    var normText = text
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه")
      .replace(/ى/g, "ي").replace(/[،؛.,!?؟]/g, " ");

    var found = [];
    var seen = {};

    for (var key in DREAMS_DB_LOCAL) {
      if (seen[key]) continue;
      var item = DREAMS_DB_LOCAL[key];
      if (!item) continue;

      var keyNorm = key.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
      if (normText.indexOf(keyNorm) !== -1) {
        found.push({ symbol: key, data: item, matchedBy: "المفتاح" });
        seen[key] = 1;
        continue;
      }

      if (item.keywords && item.keywords.length) {
        for (var i = 0; i < item.keywords.length; i++) {
          var kw = item.keywords[i];
          var kwNorm = kw.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
          if (normText.indexOf(kwNorm) !== -1) {
            found.push({ symbol: key, data: item, matchedBy: kw });
            seen[key] = 1;
            break;
          }
        }
      }
    }
    return found;
  }

  /* ============================================================
     تصنيف الرؤيا
     ============================================================ */
  function daClassifyDream(text, symbols) {
    var normText = text || "";
    var negative = ["خوف", "قتل", "موت", "سقوط", "مرض", "دم", "ثعبان", "عقرب", "حرب", "ظمأ", "دمار"];
    var positive = ["فرح", "نور", "بشارة", "جنة", "زواج", "ماء", "شمس", "قمر", "خير", "هدية"];
    var negScore = 0, posScore = 0;
    negative.forEach(function (w) { if (normText.indexOf(w) !== -1) negScore++; });
    positive.forEach(function (w) { if (normText.indexOf(w) !== -1) posScore++; });

    if (negScore > posScore) return { type: "تحذيرية", icon: "⚠️", tone: "#C62828" };
    if (posScore > negScore) return { type: "بشارة", icon: "🌸", tone: "#2E7D32" };
    return { type: "محايدة", icon: "⚖️", tone: "#1A237E" };
  }

  /* ============================================================
     التحليل المحلي
     ============================================================ */
  function daLocalAnalysis(text, symbols, classification) {
    if (!symbols || symbols.length === 0) {
      return {
        summary: "لم يتم التعرف على رموز محددة في الرؤيا.",
        sections: []
      };
    }

    var sections = symbols.slice(0, 8).map(function (s) {
      return {
        symbol: s.symbol,
        category: s.data.category,
        meaning: s.data.meaning,
        details: s.data.details,
        source: s.data.source
      };
    });

    return {
      summary: "تم التعرف على " + symbols.length + " رمز في رؤياك. وفيما يلي تفسيرها:",
      sections: sections
    };
  }

  /* ============================================================
     بناء نص المشاركة من التحليل المحلي
     ============================================================ */
  function daBuildShareFromLocal(data) {
    var text = "🌙 *تفسير رؤيا*\n";
    text += "━━━━━━━━━━━━━━━━━\n\n";
    text += "📝 *نص الرؤيا:*\n";
    text += data.text + "\n\n";
    text += "📊 *التصنيف:* " + data.classification.icon + " رؤيا " + data.classification.type + "\n\n";

    if (data.symbols.length > 0) {
      text += "🎯 *الرموز المكتشفة (" + data.symbols.length + "):*\n";
      data.symbols.forEach(function (s) {
        text += "• *" + s.symbol + "* — " + s.data.meaning + "\n";
      });
      text += "\n";
    }

    text += "━━━━━━━━━━━━━━━━━\n";
    text += "من تطبيق خصائص الأسماء — تفسير الأحلام";
    return text;
  }

  /* ============================================================
     الشاشة الرئيسية
     ============================================================ */
  function showDreamAIScreen() {
    var titleEl = document.getElementById('listTitle');
    var c = document.getElementById('listContent');
    if (!c) {
      alert('⚠️ خطأ في التطبيق: شاشة العرض غير متاحة');
      return;
    }
    if (titleEl) titleEl.textContent = "🌙 تفسير تفاعلي بالذكاء الاصطناعي";

    c.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#1A237E,#4A148C);color:#fff">
        <div class="card-title" style="color:#FFD54F;border-color:#FFD54F">🌙 التفسير التفاعلي للرؤيا</div>
        <p style="font-size:13px;color:rgba(255,255,255,0.9);line-height:1.9;margin:0">
          اكتب تفاصيل رؤياك بحرية، وسيقوم المحرك بـ:
          <br>① استخراج الرموز تلقائياً من النص
          <br>② تصنيف الرؤيا (بشارة / تحذير / محايدة)
          <br>③ تفسير تفاعلي وفق <strong style="color:#FFD54F">منهج الإمام الصادق (ع)</strong> أولاً
          <br>④ ثمّ يضيف تفسير ابن سيرين والنابلسي
        </p>
      </div>

      <div class="card">
        <div class="card-title">📝 اكتب تفاصيل الرؤيا</div>
        <textarea id="daDreamText" rows="7" 
          placeholder="مثال: رأيت أنني أمشي في صحراء واسعة، وفي يدي مفتاح ذهبي. ثم ظهر أسد كبير أمامي، لكنني لم أخف ولم يؤذني. بعدها فتحت المفتاح باباً فوجدت نوراً..."
          style="width:100%;padding:14px;border:2px solid #C5CAE9;border-radius:10px;font-size:14px;font-family:inherit;line-height:1.8;resize:vertical;outline:none"></textarea>
        
        <div style="display:flex;gap:8px;margin-top:10px">
          <input type="text" id="daDreamName" placeholder="اسم الرائي (اختياري)" 
            style="flex:1;padding:10px;border:2px solid #C5CAE9;border-radius:10px;font-size:13px;outline:none;font-family:inherit">
          <select id="daDreamGender" 
            style="flex:1;padding:10px;border:2px solid #C5CAE9;border-radius:10px;font-size:13px;outline:none;font-family:inherit;background:#fff">
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
          </select>
        </div>

        <button class="btn-primary" style="width:100%;margin-top:12px" onclick="daRunAnalysis()">
          🌙 فسّر الرؤيا
        </button>
      </div>

      <div id="daResult"></div>
    `;
    if (typeof showScreen === 'function') showScreen('screen-list');
    window.scrollTo(0, 0);
  }

  /* ============================================================
     تنفيذ التحليل المحلي
     ============================================================ */
  async function daRunAnalysis() {
    var textEl = document.getElementById('daDreamText');
    if (!textEl) return;
    var dreamText = textEl.value.trim();
    if (!dreamText || dreamText.length < 10) {
      alert("⚠️ الرجاء كتابة تفاصيل الرؤيا (10 أحرف على الأقل)");
      return;
    }

    var nameEl = document.getElementById('daDreamName');
    var genderEl = document.getElementById('daDreamGender');
    var dreamerName = (nameEl && nameEl.value.trim()) || "غير محدد";
    var dreamerGender = (genderEl && genderEl.value) || "ذكر";

    var container = document.getElementById('daResult');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#1A237E,#4A148C);color:#fff">
        <div style="text-align:center;padding:20px 0">
          <div style="display:inline-block;width:32px;height:32px;border:3px solid rgba(255,255,255,0.3);border-top-color:#FFD54F;border-radius:50%;animation:spin 0.8s linear infinite"></div>
          <div style="margin-top:12px;font-size:15px;font-weight:bold">🌙 جاري تحليل الرؤيا...</div>
          <div style="margin-top:6px;font-size:12px;opacity:0.8">⏳ استخراج الرموز → تصنيف الرؤيا → التفسير</div>
        </div>
      </div>
    `;

    var symbols = daExtractSymbols(dreamText);
    var classification = daClassifyDream(dreamText, symbols);

    var DREAM_CATEGORIES_LOCAL = getGlobal('DREAM_CATEGORIES');

    var symbolsHTML = '';
    if (symbols.length > 0) {
      symbolsHTML = symbols.map(function (s) {
        var catIcon = "📌";
        if (DREAM_CATEGORIES_LOCAL && Array.isArray(DREAM_CATEGORIES_LOCAL)) {
          var catInfo = DREAM_CATEGORIES_LOCAL.find(function (c) { return c.name === s.data.category; });
          if (catInfo) catIcon = catInfo.icon;
        }
        return '<div style="display:inline-block;background:#E8EAF6;color:#1A237E;padding:6px 12px;border-radius:20px;font-size:12.5px;font-weight:bold;margin:4px">' +
          catIcon + ' ' + s.symbol +
          '</div>';
      }).join("");
    } else {
      symbolsHTML = '<p style="font-size:13px;color:#888;text-align:center;margin:8px 0">لم يتم التعرف على رموز محددة في قاعدة البيانات المحلية.</p>';
    }

    var localAnalysis = daLocalAnalysis(dreamText, symbols, classification);

    var localSectionsHTML = '';
    if (localAnalysis.sections && localAnalysis.sections.length > 0) {
      localSectionsHTML = localAnalysis.sections.map(function (s) {
        return '<div style="margin-bottom:10px;padding:12px;background:#F7F8FC;border-right:3px solid #1A237E;border-radius:8px">' +
          '<div style="font-size:14px;font-weight:bold;color:#1A237E;margin-bottom:6px">' + s.symbol + ' <span style="font-size:11px;color:#888">(' + s.category + ')</span></div>' +
          '<p style="font-size:13px;line-height:1.85;color:#333;margin:0 0 6px 0">' + s.meaning + '</p>' +
          (s.details ? '<div style="font-size:12px;color:#555;line-height:1.8;background:#FFF;padding:8px;border-radius:6px">💡 ' + s.details + '</div>' : '') +
          '</div>';
      }).join("");
    }

    var localHTML = `
      <div class="card">
        <div class="card-title">① المرحلة الأولى — استخراج الرموز وتصنيف الرؤيا</div>
        
        <div style="margin-bottom:14px;padding:12px;background:${classification.tone}15;border-right:4px solid ${classification.tone};border-radius:10px">
          <div style="font-size:13px;color:#666;margin-bottom:6px">تصنيف الرؤيا:</div>
          <div style="font-size:16px;font-weight:bold;color:${classification.tone}">
            ${classification.icon} رؤيا ${classification.type}
          </div>
        </div>

        <div style="margin-bottom:14px">
          <div style="font-size:13px;font-weight:bold;color:#1A237E;margin-bottom:8px">📌 الرموز المكتشفة (${symbols.length}):</div>
          <div style="text-align:center">${symbolsHTML}</div>
        </div>

        ${localAnalysis.sections.length > 0 ? `
          <div style="font-size:13px;font-weight:bold;color:#1A237E;margin-bottom:8px;margin-top:16px">📖 التفسير المبدئي (محلياً):</div>
          ${localSectionsHTML}
        ` : ''}
      </div>
    `;

    container.innerHTML = localHTML + `
      <div class="card" style="background:#FFF8E1;border-right:4px solid #FF9800">
        <p style="font-size:12.5px;color:#555;line-height:1.85;text-align:center;margin:0">
          ⚠️ هذا تحليل رمزي أوّلي. للحصول على التفسير التفاعلي التفصيلي وفق <strong>منهج الإمام الصادق (ع)</strong>، استخدم زر "التفسير بالذكاء الاصطناعي" أدناه.
        </p>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <button class="btn-primary" style="flex:1 1 100%;padding:14px;font-size:14px" onclick="daRunAIAnalysis()">
          🧠 التفسير التفاعلي بالذكاء الاصطناعي
        </button>
        <button class="btn-outline" style="flex:1;padding:12px;font-size:13px;background:#E8F5E9;color:#2E7D32;border-color:#A5D6A7" onclick="daShareLocalResult()">
          📲 مشاركة الرموز
        </button>
        <button class="btn-outline" style="flex:1;padding:12px;font-size:13px" onclick="showDreamAIScreen()">
          ← رؤيا أخرى
        </button>
      </div>
    `;

    window._daLastDream = {
      text: dreamText,
      name: dreamerName,
      gender: dreamerGender,
      symbols: symbols,
      classification: classification
    };

    window.scrollTo(0, 0);
  }

  /* ============================================================
     مشاركة التحليل المحلي
     ============================================================ */
  function daShareLocalResult() {
    var data = window._daLastDream;
    if (!data) { alert('⚠️ لا توجد نتيجة للمشاركة'); return; }
    var text = daBuildShareFromLocal(data);
    daShareText('تفسير رؤيا — الرموز', text);
  }

  /* ============================================================
     التفسير التفاعلي بالذكاء الاصطناعي
     ============================================================ */
  async function daRunAIAnalysis() {
    var data = window._daLastDream;
    if (!data) { alert("⚠️ لم يتم العثور على الرؤيا"); return; }

    var container = document.getElementById('daResult');
    if (!container) return;

    if (typeof window.isAIEnabled === 'function' && !window.isAIEnabled()) {
      daShowBanner(container, {
        title: '💡 الذكاء الاصطناعي غير مفعّل',
        text: 'فعّله من الإعدادات للحصول على التفسير التفاعلي التفصيلي.',
        buttonText: '⚙️ فتح الإعدادات',
        buttonAction: 'showFreeAISettings()'
      });
      return;
    }

    if (typeof window.isAIReady === 'function' && !window.isAIReady()) {
      var remaining = typeof window.getRemainingSeconds === 'function' ? window.getRemainingSeconds() : 0;
      if (remaining > 0) {
        daShowCountdown(container, remaining);
      } else {
        daShowBanner(container, {
          title: '⚠️ الذكاء الاصطناعي غير جاهز',
          text: 'تحقق من المفتاح والإنترنت.'
        });
      }
      return;
    }

    var oldBanners = container.querySelectorAll('.da-ai-banner');
    oldBanners.forEach(function (b) { b.remove(); });

    var loadingBox = document.createElement('div');
    loadingBox.className = 'card da-ai-banner';
    loadingBox.style.background = 'linear-gradient(135deg,#1A237E,#4A148C)';
    loadingBox.style.color = '#fff';
    loadingBox.innerHTML = '<div style="text-align:center;padding:20px 0">' +
      '<div style="display:inline-block;width:32px;height:32px;border:3px solid rgba(255,255,255,0.3);border-top-color:#FFD54F;border-radius:50%;animation:spin 0.8s linear infinite"></div>' +
      '<div style="margin-top:12px;font-size:14px;font-weight:bold">🧠 جاري التفسير التفاعلي...</div>' +
      '<div style="margin-top:6px;font-size:11px;opacity:0.8">منهج الإمام الصادق (ع) ثم ابن سيرين ثم النابلسي</div>' +
      '</div>';
    container.insertBefore(loadingBox, container.firstChild);

    var symbolsList = data.symbols.map(function (s) { return s.symbol; }).join("، ") || "لا رموز معروفة في القاعدة";

    var userPrompt =
      'بيانات الرائي:\n' +
      '- الاسم: ' + data.name + '\n' +
      '- الجنس: ' + data.gender + '\n\n' +
      'نصّ الرؤيا كما رآها:\n' +
      '«' + data.text + '»\n\n' +
      'الرموز المستخرجة تلقائياً من النص:\n' +
      symbolsList + '\n\n' +
      'تصنيف الرؤيا: ' + data.classification.type + '\n\n' +
      'المطلوب:\n' +
      'فسّر هذه الرؤيا وفق المنهج المحدد، مع الالتزام بالترتيب:\n' +
      '【المرحلة ①】 الإمام الصادق (ع) — الأولوية.\n' +
      '【المرحلة ②】 ابن سيرين.\n' +
      '【المرحلة ③】 النابلسي وابن غانم.\n' +
      'ثم خاتمة تجمع الخلاصة والتوصية.';

    try {
      if (typeof window.askAI !== 'function') {
        throw new Error('محرك الذكاء الاصطناعي غير محمّل — تأكد من وجود ملف freeai.js');
      }
      var reply = await window.askAI(DREAM_AI_SYSTEM_PROMPT, userPrompt, { maxTokens: 1500 });

      /* ✅ حفظ الرد للاستخدام في أزرار النسخ والمشاركة */
      window._daLastAIResponse = reply;

      /* عرض الرد */
      loadingBox.innerHTML =
        '<div class="card-title" style="color:#FFD54F;border-color:#FFD54F">🧠 التفسير التفاعلي التفصيلي</div>' +
        '<div style="font-size:14px;line-height:2;color:#fff">' +
        (typeof window.formatAIResponse === 'function' ? window.formatAIResponse(reply) : reply) +
        '</div>';

      /* أزرار التحكم: نسخ + مشاركة + إغلاق */
      var btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:8px;margin-top:14px;flex-wrap:wrap';

      /* زر النسخ */
      var copyBtn = document.createElement('button');
      copyBtn.className = 'btn-outline';
      copyBtn.style.cssText = 'flex:1 1 45%;padding:10px;background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.3);font-size:13px';
      copyBtn.textContent = '📋 نسخ';
      copyBtn.onclick = function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(reply).then(function () {
            if (typeof window.showToast === 'function') window.showToast("✅ تم نسخ التفسير");
          }).catch(function () {
            if (typeof window.showToast === 'function') window.showToast("⚠️ تعذّر النسخ");
          });
        }
      };

      /* ✅ زر المشاركة (الجديد) */
      var shareBtn = document.createElement('button');
      shareBtn.className = 'btn-outline';
      shareBtn.style.cssText = 'flex:1 1 45%;padding:10px;background:rgba(76,175,80,0.25);color:#fff;border-color:rgba(165,214,167,0.6);font-size:13px;font-weight:bold';
      shareBtn.textContent = '📲 مشاركة';
      shareBtn.onclick = function () {
        var shareText = daBuildAIResponseShare(data, reply);
        daShareText('تفسير رؤيا — الإمام الصادق (ع)', shareText);
      };

      /* زر الإغلاق */
      var closeBtn = document.createElement('button');
      closeBtn.className = 'btn-outline';
      closeBtn.style.cssText = 'flex:1 1 100%;padding:10px;background:rgba(255,255,255,0.05);color:#fff;border-color:rgba(255,255,255,0.2);font-size:13px';
      closeBtn.textContent = '✖ إغلاق';
      closeBtn.onclick = function () { loadingBox.remove(); };

      btnRow.appendChild(copyBtn);
      btnRow.appendChild(shareBtn);
      btnRow.appendChild(closeBtn);
      loadingBox.appendChild(btnRow);

    } catch (e) {
      var msg = (e && e.message) ? e.message : String(e);
      if (msg.indexOf("انتظر") !== -1 || msg.indexOf("تجاوزت") !== -1 || msg.indexOf("429") !== -1) {
        var remaining2 = typeof window.getRemainingSeconds === 'function' ? window.getRemainingSeconds() : 60;
        loadingBox.remove();
        daShowCountdown(container, remaining2);
        return;
      }

      loadingBox.innerHTML =
        '<div class="card-title" style="color:#FFCDD2;border-color:#FFCDD2">❌ فشل التفسير</div>' +
        '<div style="font-size:13px;line-height:1.85;opacity:0.95">' + msg + '</div>';

      var retryBtn = document.createElement('button');
      retryBtn.className = 'btn-outline';
      retryBtn.style.cssText = 'width:100%;margin-top:10px;background:rgba(255,255,255,0.15);color:#fff;border-color:rgba(255,255,255,0.3);font-size:13px';
      retryBtn.textContent = '🔄 إعادة المحاولة';
      retryBtn.onclick = function () {
        loadingBox.remove();
        daRunAIAnalysis();
      };
      loadingBox.appendChild(retryBtn);
    }
  }

  /* ============================================================
     بناء نص مشاركة رد AI (مع الرؤيا والرموز والتفسير)
     ============================================================ */
  function daBuildAIResponseShare(data, aiReply) {
    var text = "🌙 *تفسير رؤيا*\n";
    text += "━━━━━━━━━━━━━━━━━\n\n";
    text += "📝 *نص الرؤيا:*\n";
    text += data.text + "\n\n";
    text += "📊 *التصنيف:* " + data.classification.icon + " رؤيا " + data.classification.type + "\n\n";

    if (data.symbols.length > 0) {
      text += "🎯 *الرموز المكتشفة (" + data.symbols.length + "):*\n";
      text += data.symbols.map(function (s) { return "• " + s.symbol; }).join("، ");
      text += "\n\n";
    }

    text += "━━━━━━━━━━━━━━━━━\n\n";
    text += "🧠 *التفسير التفاعلي:*\n\n";
    text += aiReply + "\n\n";
    text += "━━━━━━━━━━━━━━━━━\n";
    text += "⚠️ التعبير ظنّي — الأمر لله وحده.\n";
    text += "من تطبيق خصائص الأسماء";
    return text;
  }

  /* ============================================================
     بانر موحد
     ============================================================ */
  function daShowBanner(container, opts) {
    var banner = document.createElement('div');
    banner.className = 'card da-ai-banner';
    banner.style.background = '#FFF3E0';
    banner.style.borderRight = '4px solid #E65100';
    banner.innerHTML =
      '<div class="card-title" style="color:#E65100;border-color:#E65100">' + (opts.title || '') + '</div>' +
      '<p style="font-size:13.5px;line-height:1.9;color:#333;margin:0">' + (opts.text || '') + '</p>' +
      (opts.buttonText ? '<button class="btn-outline" style="width:100%;margin-top:12px;font-size:13px" onclick="' + opts.buttonAction + '">' + opts.buttonText + '</button>' : '');
    container.insertBefore(banner, container.firstChild);
  }

  /* ============================================================
     العدّاد التنازلي
     ============================================================ */
  function daShowCountdown(container, seconds) {
    var old = container.querySelector('.da-ai-banner');
    if (old) old.remove();

    var banner = document.createElement('div');
    banner.className = 'card da-ai-banner';
    banner.style.background = 'linear-gradient(135deg,#E65100,#F57C00)';
    banner.style.color = '#fff';
    banner.style.border = '2px solid #FFB300';
    banner.innerHTML =
      '<div class="card-title" style="color:#FFE082;border-color:#FFE082">⏱️ انتظر قليلاً</div>' +
      '<div style="text-align:center;padding:14px 0">' +
      '<div style="font-size:52px;font-weight:bold;color:#FFE082" id="daCountdown">' + seconds + '</div>' +
      '<div style="font-size:12px;opacity:0.9">ثانية متبقية</div>' +
      '</div>' +
      '<div id="daRetryWrap" style="display:none;margin-top:12px">' +
      '<button class="btn-outline" id="daRetryBtn" style="width:100%;background:rgba(255,255,255,0.2);color:#fff;border-color:rgba(255,255,255,0.4);font-size:13px;padding:12px;font-weight:bold">🔄 إعادة المحاولة الآن</button>' +
      '</div>';

    container.insertBefore(banner, container.firstChild);

    var counterEl = banner.querySelector('#daCountdown');
    var retryWrap = banner.querySelector('#daRetryWrap');
    var retryBtn = banner.querySelector('#daRetryBtn');

    retryBtn.onclick = function () {
      clearInterval(timer);
      banner.remove();
      daRunAIAnalysis();
    };

    var timer = setInterval(function () {
      var remaining = typeof window.getRemainingSeconds === 'function' ? window.getRemainingSeconds() : 0;
      if (remaining > 0) {
        if (counterEl) counterEl.textContent = remaining;
      } else {
        clearInterval(timer);
        if (counterEl) counterEl.textContent = '0';
        if (retryWrap) retryWrap.style.display = 'block';
      }
    }, 1000);
  }

  /* ============================================================
     الإسناد الصريح إلى window
     ============================================================ */
  window.showDreamAIScreen = showDreamAIScreen;
  window.daRunAnalysis = daRunAnalysis;
  window.daRunAIAnalysis = daRunAIAnalysis;
  window.daExtractSymbols = daExtractSymbols;
  window.daClassifyDream = daClassifyDream;
  window.daShareText = daShareText;
  window.daShareLocalResult = daShareLocalResult;

  /* ============================================================
     الفحص الذاتي
     ============================================================ */
  try {
    console.log('%c[dream-ai] ✅ تم تحميل الملف بنجاح (v2.2)', 'color:#2E7D32;font-weight:bold;font-size:13px');
    console.log('  • showDreamAIScreen:', typeof window.showDreamAIScreen);
    console.log('  • daRunAnalysis:', typeof window.daRunAnalysis);
    console.log('  • daRunAIAnalysis:', typeof window.daRunAIAnalysis);
    console.log('  • daShareText:', typeof window.daShareText);
    console.log('  • DREAMS_DB:', typeof getGlobal('DREAMS_DB'));
    console.log('  • DREAM_CATEGORIES:', typeof getGlobal('DREAM_CATEGORIES'));
    console.log('  • navigator.share:', typeof navigator.share);
  } catch (e) { /* تجاهل */ }

})();