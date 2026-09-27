/* ============================================================
   jafr-tools.js — حاسبة عمليات الجفر المنفصلة
   الإصدار 2.0 — يتولى إضافة الزرين معاً
   ============================================================ */

let jaToolMethod = "abjad";

/* ============ شاشة الحاسبة الرئيسية ============ */
function showJafrCalculatorAdvanced() {
  const titleEl = document.getElementById('jafrCalcTitle');
  const c = document.getElementById('jafrCalcContent');
  if (!c) return;
  if (titleEl) titleEl.textContent = "⚗️ حاسبة عمليات الجفر";

  c.innerHTML = `
    <div class="card" style="background:linear-gradient(135deg,#1A237E,#4A148C);color:#fff">
      <div class="card-title" style="color:#FFD54F;border-color:#FFD54F">⚗️ حاسبة عمليات الجفر</div>
      <p style="font-size:13px;color:rgba(255,255,255,0.9);line-height:1.9;margin:0">
        اختر العملية التي تريد تطبيقها على الكلمة:
        <br>كل عملية تعرض نتائجها بالتفصيل.
      </p>
    </div>

    <div class="card">
      <div class="card-title">📝 أدخل الكلمة</div>
      <input type="text" id="jaToolWord" placeholder="اكتب الاسم أو الكلمة..." autocomplete="off"
        style="width:100%;padding:12px;border:2px solid #C5CAE9;border-radius:10px;font-size:15px;margin:6px 0 12px 0;outline:none;font-family:inherit">

      <label style="font-size:13px;font-weight:bold">الدائرة:</label>
      <div style="display:flex;gap:8px;margin:6px 0">
        <button class="btn-outline" id="jaToolAbjad" onclick="jaToolSetMethod('abjad')"
          style="flex:1;padding:10px;background:#1A237E;color:#fff;border-color:#1A237E">أبجد</button>
        <button class="btn-outline" id="jaToolAyqagh" onclick="jaToolSetMethod('ayqagh')"
          style="flex:1;padding:10px">أيقغ</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔧 اختر العملية</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="jafr-btn" onclick="jaToolRun('bast')">
          <span class="jafr-icon">①</span><span>البسط</span>
        </button>
        <button class="jafr-btn" onclick="jaToolRun('kasr')">
          <span class="jafr-icon">②</span><span>الكسر</span>
        </button>
        <button class="jafr-btn" onclick="jaToolRun('tarh')">
          <span class="jafr-icon">③</span><span>الطرح</span>
        </button>
        <button class="jafr-btn" onclick="jaToolRun('tawlid')">
          <span class="jafr-icon">④</span><span>التوليد</span>
        </button>
        <button class="jafr-btn" onclick="jaToolRun('laqt')">
          <span class="jafr-icon">⑤</span><span>اللقط</span>
        </button>
        <button class="jafr-btn" onclick="jaToolRun('mahd')">
          <span class="jafr-icon">⑥</span><span>المحض</span>
        </button>
        <button class="jafr-btn primary" onclick="jaToolRun('hall')">
          <span class="jafr-icon">⑦</span><span>الحل</span>
        </button>
        <button class="jafr-btn primary" onclick="jaToolRun('aqd')">
          <span class="jafr-icon">⑧</span><span>العقد</span>
        </button>
      </div>
    </div>

    <div id="jaToolResult"></div>
  `;
  showScreen('screen-jafr-calc');
}

function jaToolSetMethod(m) {
  jaToolMethod = m;
  const a = document.getElementById('jaToolAbjad');
  const b = document.getElementById('jaToolAyqagh');
  if (!a || !b) return;
  if (m === "abjad") {
    a.style.background = "#1A237E"; a.style.color = "#fff";
    b.style.background = ""; b.style.color = "";
  } else {
    b.style.background = "#1A237E"; b.style.color = "#fff";
    a.style.background = ""; a.style.color = "";
  }
}

/* ============ تنفيذ العملية ============ */
function jaToolRun(op) {
  const wordEl = document.getElementById('jaToolWord');
  if (!wordEl) return;
  const word = wordEl.value.trim();
  if (!word) { alert("⚠️ الرجاء إدخال كلمة"); return; }

  const container = document.getElementById('jaToolResult');
  if (!container) return;

  const clean = jaNorm(word);
  const circle = (jaToolMethod === "ayqagh") ? JA_AYQAGH : JA_ABJAD;
  const letters = clean.split("").filter(c => circle.indexOf(c) !== -1);

  if (letters.length === 0) {
    container.innerHTML = '<div class="card"><p style="color:#B71C1C;text-align:center;padding:14px">❌ لا يوجد حروف صالحة</p></div>';
    return;
  }

  let html = "";

  if (op === "bast") {
    const rows = letters.map(l => jaBast(l));
    let tableRows = rows.map(b => '<tr><td class="letter-cell">' + b.letter + '</td><td>' + b.word + '</td><td style="text-align:center">' + b.value + '</td></tr>').join("");
    html = '<div class="card"><div class="card-title">① البسط — ' + word + '</div>' +
      '<p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:10px">تفكيك كل حرف إلى اسمه الكامل:</p>' +
      '<table class="jafr-table"><thead><tr><th>الحرف</th><th>اسمه</th><th>القيمة</th></tr></thead><tbody>' + tableRows + '</tbody></table></div>';
  }

  else if (op === "kasr") {
    let rows = "";
    letters.forEach(l => {
      const k = jaKasr(l);
      if (!k.fractions.length) {
        rows += '<tr><td class="letter-cell">' + l + '</td><td style="text-align:center">' + k.value + '</td><td colspan="2" style="text-align:center">لا يقبل القسمة</td></tr>';
      } else {
        k.fractions.forEach((f, i) => {
          rows += '<tr>';
          if (i === 0) {
            rows += '<td class="letter-cell" rowspan="' + k.fractions.length + '">' + l + '</td>';
            rows += '<td style="text-align:center" rowspan="' + k.fractions.length + '">' + k.value + '</td>';
          }
          rows += '<td style="text-align:center">1/' + f.divisor + '</td><td style="text-align:center">' + f.rawResult + ' → <strong>' + f.letter + '</strong></td></tr>';
        });
      }
    });
    html = '<div class="card"><div class="card-title">② الكسر — ' + word + '</div>' +
      '<table class="jafr-table"><thead><tr><th>الحرف</th><th>القيمة</th><th>الكسر</th><th>الناتج</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  else if (op === "tarh") {
    let rows = "";
    letters.forEach(l => {
      const t = jaTarh(l, jaToolMethod);
      rows += '<tr><td class="letter-cell">' + l + '</td><td style="text-align:center">' + t.value + '</td><td style="text-align:center">' + t.nature + '</td><td style="text-align:center">' + t.isqat + '</td><td style="text-align:center">' + t.remaining + '</td><td style="text-align:center;font-weight:bold;color:#1A237E">' + t.resultLetter + '</td></tr>';
    });
    html = '<div class="card"><div class="card-title">③ الطرح — ' + word + '</div>' +
      '<table class="jafr-table"><thead><tr><th>الحرف</th><th>قيمته</th><th>طبعه</th><th>الإسقاط</th><th>الباقي</th><th>الناتج</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  else if (op === "tawlid") {
    const rows = jaTawlid(word, jaToolMethod);
    let html_rows = rows.map((r, i) => '<div class="jafr-row"><span class="jafr-row-num">' + (i+1) + '</span><span class="jafr-row-text">' + r.split("").join(" ") + '</span></div>').join("");
    html = '<div class="card"><div class="card-title">④ التوليد — ' + word + '</div>' +
      '<p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:10px">28 سطراً بطريقة ' + (jaToolMethod === "ayqagh" ? "أيقغ" : "أبجد") + ':</p>' +
      '<div class="jafr-rows">' + html_rows + '</div></div>';
  }

  else if (op === "laqt") {
    const rows = jaTawlid(word, jaToolMethod);
    const firstLetter = (rows[0] && rows[0][0]) ? rows[0][0] : "—";
    const laqtChain = jaLaqt(rows, firstLetter, jaToolMethod);
    let items = laqtChain.map(l => '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:#F7F8FC;border-radius:8px;margin-bottom:6px">' +
      '<span style="width:24px;height:24px;background:#1A237E;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold">' + l.step + '</span>' +
      '<span style="font-size:22px;font-weight:bold;color:#1A237E;min-width:40px;text-align:center">' + l.letter + '</span>' +
      '<span style="font-size:11.5px;color:#666;flex:1">عدد: ' + l.value + ' • طبع: ' + l.nature + ' • مرتبة: ' + l.rank + '</span></div>').join("");
    html = '<div class="card"><div class="card-title">⑤ اللقط — ' + word + '</div>' +
      '<p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:10px">بدأنا بحرف «' + firstLetter + '»:</p>' + items +
      '<div style="margin-top:14px;padding:12px;background:linear-gradient(135deg,#1A237E,#4A148C);color:#fff;border-radius:10px;text-align:center">' +
        '<div style="font-size:11px;color:#FFD54F;margin-bottom:6px">الحروف المستخرجة:</div>' +
        '<div style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#FFD54F">' + laqtChain.map(l => l.letter).join("") + '</div>' +
      '</div></div>';
  }

  else if (op === "mahd") {
    const m = jaMahd(letters, jaToolMethod);
    let items = "";
    for (const n in m.totals) {
      const v = m.totals[n];
      const info = JA_NATURES_ABJAD[n] || {};
      const pct = m.dominantValue ? Math.round((v / (letters.reduce((s,l) => s + (JA_ABJAD_VALUES[l]||0), 0))) * 100) : 0;
      items += '<div class="nature-card" style="border-right-color:' + (info.color || '#1A237E') + '"><div class="nature-header" style="color:' + (info.color || '#1A237E') + '">' +
        '<span style="font-size:20px">' + (info.icon || '•') + '</span><strong>' + n + '</strong>' +
        '<span style="font-size:12px;color:#888">المجموع: ' + v + ' (' + pct + '%)</span></div></div>';
    }
    html = '<div class="card"><div class="card-title">⑥ المحض — ' + word + '</div>' + items +
      '<p style="margin-top:10px;font-size:13.5px;color:#444"><strong>العنصر الغالب:</strong> ' + m.dominant + ' (' + m.dominantValue + ')</p></div>';
  }

  else if (op === "hall") {
    const rows = jaTawlid(word, jaToolMethod);
    let hall = "";
    rows.forEach(r => { if (r.length > 0) hall += r[0]; });
    html = '<div class="card"><div class="card-title">⑦ الحل — ' + word + '</div>' +
      '<p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:10px">أخذ الحرف الأول من كل سطر:</p>' +
      '<div class="jafr-hall"><div class="jafr-hall-word">' + hall + '</div></div></div>';
  }

  else if (op === "aqd") {
    const rows = jaTawlid(word, jaToolMethod);
    let hall = "";
    rows.forEach(r => { if (r.length > 0) hall += r[0]; });
    const aqd = hall.split("").slice(0, 6).join("");
    html = '<div class="card"><div class="card-title">⑧ العقد — ' + word + '</div>' +
      '<p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:10px">أول 6 حروف من الحل (تركيب الكلمة):</p>' +
      '<div class="jafr-hall"><div class="jafr-hall-word" style="background:linear-gradient(135deg,#FFD700,#B8860B);color:#1A237E">' + aqd + '</div></div></div>';
  }

  html += '<button class="btn-outline" style="width:100%;margin-top:10px" onclick="showJafrCalculatorAdvanced()">← رجوع للقائمة</button>';
  container.innerHTML = html;
  window.scrollTo(0, 0);
}

/* ============================================================
   تعديل شاشة علم الجفر — إضافة الزرين معاً
   ============================================================ */
(function() {
  const orig = window.showJafrScreen;
  if (typeof orig !== 'function') return;

  window.showJafrScreen = function() {
    orig();
    setTimeout(function() {
      const c = document.getElementById('jafrContent');
      if (!c) return;
      const buttons = c.querySelector('.jafr-buttons');
      if (!buttons) return;

      /* 1) احذف الأزرار القديمة */
      const allBtns = buttons.querySelectorAll('button');
      allBtns.forEach(function(b) {
        const txt = b.textContent || '';
        if (txt.indexOf("سؤال جفري") !== -1 ||
            txt.indexOf("حاسبة الاستخراج") !== -1) {
          b.remove();
        }
      });

      /* 2) أضف زر "الاستخراج الجفري المتقدم" */
      if (!buttons.querySelector('.ja-advanced-btn')) {
        const advBtn = document.createElement('button');
        advBtn.className = 'jafr-btn primary ja-advanced-btn';
        advBtn.style.background = 'linear-gradient(135deg,#4A148C,#7B1FA2)';
        advBtn.onclick = showJafrAdvancedScreen;
        advBtn.innerHTML = '<span class="jafr-icon">🔮</span><span>الاستخراج الجفري المتقدم</span>';
        buttons.appendChild(advBtn);
      }

      /* 3) أضف زر "حاسبة عمليات الجفر" */
      if (!buttons.querySelector('.ja-calc-btn')) {
        const calcBtn = document.createElement('button');
        calcBtn.className = 'jafr-btn primary ja-calc-btn';
        calcBtn.style.background = 'linear-gradient(135deg,#E65100,#F57C00)';
        calcBtn.onclick = showJafrCalculatorAdvanced;
        calcBtn.innerHTML = '<span class="jafr-icon">⚗️</span><span>حاسبة عمليات الجفر</span>';
        buttons.appendChild(calcBtn);
      }
    }, 100);
  };
})();