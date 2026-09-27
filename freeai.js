/* ============================================================
   freeai.js — الإصدار 9.0 (نسخة نظيفة — Gemini فقط)
   ✅ يستخدم X-goog-api-key (الطريقة الأصلية التي تعمل)
   ✅ نماذج Gemini 3.6 و 3.5 الجديدة (2025)
   ✅ متوافق مع WebView القديمة
   ============================================================ */

const AI_CONFIG = {
  URL: "https://generativelanguage.googleapis.com/v1beta/models/",
  MODELS: [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest"
  ],
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 45000,
  RATE_LIMIT_SECONDS: 60
};

/* ============ التفعيل ============ */
function isAIEnabled() { return localStorage.getItem('ai_enabled') === 'true'; }
function setAIEnabled(e) { localStorage.setItem('ai_enabled', e ? 'true' : 'false'); }

/* ============ المفتاح ============ */
function getAIKey() { return localStorage.getItem('gemini_key') || ""; }
function setAIKey(k) { localStorage.setItem('gemini_key', k.trim()); }

/* ============ توافق مع الكود القديم ============ */
function getActiveProvider() { return 'gemini'; }
function setActiveProvider() { /* مزود واحد فقط */ }
function getGeminiKey() { return getAIKey(); }
function isGeminiReady() { return isAIReady(); }
function askGemini(s, u, o) { return askAI(s, u, o); }

/* ============ الجاهزية ============ */
function isAIReady() {
  if (!isAIEnabled()) return false;
  if (!navigator.onLine) return false;
  return !!getAIKey();
}

/* ============ العدّاد التنازلي ============ */
function getRateLimitUntil() {
  return parseInt(localStorage.getItem('ai_rate_limit_until') || '0', 10);
}
function setRateLimit() {
  localStorage.setItem('ai_rate_limit_until',
    (Date.now() + AI_CONFIG.RATE_LIMIT_SECONDS * 1000).toString());
}
function getRemainingSeconds() {
  const diff = Math.ceil((getRateLimitUntil() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
}
function isRateLimited() { return getRemainingSeconds() > 0; }
function isRateLimited_check() { return isRateLimited(); }

/* ============ HTTP (متوافق مع WebView) ============ */
function httpPost(url, headers, body, timeoutMs) {
  return new Promise(function(resolve, reject) {
    var done = false;
    var timer = setTimeout(function() {
      if (done) return;
      done = true;
      reject(new Error("انتهت مهلة الاتصال"));
    }, timeoutMs || AI_CONFIG.TIMEOUT_MS);

    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.timeout = timeoutMs || AI_CONFIG.TIMEOUT_MS;
      for (var h in headers) {
        if (headers.hasOwnProperty(h)) {
          try { xhr.setRequestHeader(h, headers[h]); } catch(e) { }
        }
      }
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && !done) {
          done = true;
          clearTimeout(timer);
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            text: xhr.responseText || ""
          });
        }
      };
      xhr.onerror = function() {
        if (!done) { done = true; clearTimeout(timer); reject(new Error("خطأ شبكي")); }
      };
      xhr.ontimeout = function() {
        if (!done) { done = true; clearTimeout(timer); reject(new Error("انتهت مهلة الاتصال")); }
      };
      xhr.send(JSON.stringify(body));
    } catch (e) {
      if (!done) { done = true; clearTimeout(timer); reject(e); }
    }
  });
}

/* ============ استخراج رسالة الخطأ ============ */
function extractError(text) {
  if (!text) return "بدون تفاصيل";
  try {
    const j = JSON.parse(text);
    if (j.error && j.error.message) return j.error.message;
    if (j.error && j.error.status) return j.error.status;
    if (j.message) return j.message;
  } catch(e) { }
  return text.substring(0, 200);
}

/* ============ الاتصال الرئيسي ============ */
async function askAI(systemPrompt, userPrompt, options) {
  options = options || {};
  if (!isAIEnabled()) throw new Error("AI غير مفعّل");
  if (!navigator.onLine) throw new Error("لا يوجد إنترنت");
  if (isRateLimited()) throw new Error("انتظر " + getRemainingSeconds() + " ثانية");

  const apiKey = getAIKey();
  if (!apiKey) throw new Error("لا يوجد مفتاح API");

  const models = AI_CONFIG.MODELS;
  const errors = [];

  for (let m = 0; m < models.length; m++) {
    const model = models[m];
    const url = AI_CONFIG.URL + model + ":generateContent";
    // ✅ الطريقة الأصلية: المفتاح في رأس X-goog-api-key
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "X-goog-api-key": apiKey
    };
    const body = {
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
      }],
      generationConfig: {
        temperature: options.temperature || AI_CONFIG.TEMPERATURE,
        maxOutputTokens: options.maxTokens || AI_CONFIG.MAX_TOKENS
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    try {
      console.log("[AI] محاولة:", model);
      const resp = await httpPost(url, headers, body);

      if (resp.ok) {
        const data = JSON.parse(resp.text);
        const c = data.candidates && data.candidates[0];
        if (c && c.finishReason === "SAFETY") {
          throw new Error("تم رفض السؤال لأسباب أمنية");
        }
        if (c && c.content && c.content.parts && c.content.parts[0]) {
          const txt = c.content.parts[0].text || "";
          if (txt) {
            console.log("[AI] ✅ نجح:", model);
            return txt;
          }
        }
        errors.push(model + ": رد فارغ");
        continue;
      }

      const errMsg = extractError(resp.text);
      console.warn("[AI]", resp.status, model, ":", errMsg);
      errors.push(model + " [" + resp.status + "]: " + errMsg);

      if (resp.status === 429) {
        setRateLimit();
        throw new Error("تجاوزت الحد — انتظر 60 ثانية");
      }
      if (resp.status === 401 || resp.status === 403) {
        throw new Error("المفتاح مرفوض: " + errMsg);
      }
      // 400 / 404 / 503 → جرّب النموذج التالي
    } catch (e) {
      if (e.message.indexOf("مرفوض") !== -1 ||
          e.message.indexOf("تجاوزت") !== -1 ||
          e.message.indexOf("مهلة") !== -1) {
        throw e;
      }
      errors.push(model + ": " + e.message);
    }
  }

  throw new Error("فشلت كل المحاولات:\n" + errors.join("\n"));
}

/* ============ اختبار الاتصال ============ */
async function testAIConnection() {
  if (!getAIKey()) return { ok: false, message: "لا يوجد مفتاح" };
  if (!navigator.onLine) return { ok: false, message: "لا يوجد إنترنت" };
  try {
    const reply = await askAI("أجب بكلمة واحدة فقط.", "قل: نجح", { maxTokens: 30 });
    return {
      ok: true,
      message: '✅ نجح الاتصال بـ Gemini!<br><span style="font-size:12px;color:#888">الرد: "' +
               reply.trim().substring(0, 50) + '"</span>'
    };
  } catch (e) {
    return { ok: false, message: "❌ " + e.message };
  }
}

/* ============ شاشة الإعدادات ============ */
function showFreeAISettings() {
  document.getElementById('listTitle').textContent = "🤖 إعدادات الذكاء الاصطناعي";
  const c = document.getElementById('listContent');
  const enabled = isAIEnabled();
  const key = getAIKey();
  const maskedKey = key ? key.substring(0, 12) + "..." + key.slice(-4) : "غير مُدخل";
  const remaining = getRemainingSeconds();

  c.innerHTML = `
    <div class="card">
      <div class="card-title">🤖 الذكاء الاصطناعي (Google Gemini)</div>
      <p style="font-size:13.5px;color:#555;line-height:1.9">
        التطبيق يعمل <strong>بدون إنترنت</strong> بالتحليل المحلي.
        عند تفعيل الذكاء الاصطناعي، ستحصل على تحليلات موسّعة.
      </p>
      <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;background:#F7F8FC;padding:14px;border-radius:12px">
        <span style="font-size:15px;font-weight:bold">${enabled ? "✅ مفعّل" : "🔴 معطّل"}</span>
        <div class="switch ${enabled ? 'on' : ''}" onclick="toggleAI();showFreeAISettings()"></div>
      </div>
    </div>

    ${remaining > 0 ? `
      <div class="card" style="background:#FFF3E0;border-right:4px solid #FF9800">
        <div class="card-title" style="color:#E65100;border-color:#E65100">⏱️ تجاوزت الحد</div>
        <p style="text-align:center;font-size:18px;font-weight:bold;color:#E65100">
          انتظر <span id="countdown">${remaining}</span> ثانية
        </p>
      </div>
    ` : ""}

    <div class="card">
      <div class="card-title">🔑 المفتاح الحالي</div>
      <p style="font-family:monospace;font-size:12px;background:#F7F8FC;padding:12px;border-radius:8px;direction:ltr;text-align:left;word-break:break-all">
        ${maskedKey}
      </p>
    </div>

    <div class="card">
      <div class="card-title">📝 كيف أحصل على مفتاح مجاني؟</div>
      <ol style="padding-right:20px;font-size:13.5px;line-height:2;color:#444">
        <li>افتح: <strong>aistudio.google.com/app/apikey</strong></li>
        <li>سجّل بحساب Gmail</li>
        <li>اضغط "Create API key"</li>
        <li>انسخ المفتاح (يبدأ بـ AIza أو AQ.)</li>
      </ol>
    </div>

    <div class="card">
      <div class="card-title">➕ إدخال المفتاح</div>
      <input type="password" id="aiKeyInput" placeholder="AIza... أو AQ..."
        style="width:100%;padding:14px;border:2px solid #C5CAE9;border-radius:12px;font-size:13px;direction:ltr;text-align:left;background:#fff;outline:none"
        value="${key}">
      <button class="btn-primary" style="width:100%;margin-top:10px" onclick="saveAIKey()">
        💾 حفظ المفتاح
      </button>
      <button class="btn-outline" style="width:100%;margin-top:8px" onclick="testAIKey()">
        🧪 اختبار الاتصال
      </button>
      <button class="btn-outline" style="width:100%;margin-top:8px;color:#FF5252" onclick="clearAIKey()">
        🗑️ حذف المفتاح
      </button>
    </div>

    <div class="card">
      <div class="card-title">📊 حالة الاتصال</div>
      <div id="aiStatus" style="font-size:14px;line-height:2;color:#555">
        ${navigator.onLine ? "🟢 متصل بالإنترنت" : "🔴 لا يوجد إنترنت"}
        <br>
        ${enabled ? "🟢 الذكاء مُفعّل" : "⚪ الذكاء معطّل"}
        <br>
        ${key ? "🟢 المفتاح مُدخل" : "🔴 لا يوجد مفتاح"}
      </div>
    </div>

    <button class="btn-outline" style="width:100%" onclick="goHome()">← رجوع</button>
  `;

  showScreen('screen-list');
  if (remaining > 0) startCountdown();
}

function toggleAI() { setAIEnabled(!isAIEnabled()); }

function saveAIKey() {
  const key = document.getElementById('aiKeyInput').value.trim();
  if (key.length < 10) { alert("⚠️ المفتاح قصير جداً"); return; }
  setAIKey(key);
  showToast("✅ تم حفظ المفتاح");
  showFreeAISettings();
}

function clearAIKey() {
  if (confirm("حذف المفتاح؟")) {
    localStorage.removeItem('gemini_key');
    showToast("🗑️ تم الحذف");
    showFreeAISettings();
  }
}

async function testAIKey() {
  const status = document.getElementById('aiStatus');
  status.innerHTML = "⏳ جاري الاختبار... (قد يستغرق حتى 45 ثانية)";
  const result = await testAIConnection();
  status.innerHTML = result.message;
}

function startCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  const timer = setInterval(function() {
    const r = getRemainingSeconds();
    if (r <= 0) { clearInterval(timer); showFreeAISettings(); }
    else if (el) el.textContent = r;
  }, 1000);
}

/* ============ تنسيق الرد ============ */
function formatAIResponse(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");
}