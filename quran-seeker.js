/* ============================================================
   quran-seeker.js — الكاشف القرآني
   الإصدار 1.0 — يعتمد على api.alquran.cloud (مجاني، بدون مفتاح)
   ============================================================ */

(function () {
  'use strict';

  if (window._quranSeekerLoaded === true) return;
  window._quranSeekerLoaded = true;

  /* ============ الحالة ============ */
  var state = {
    wudu: false,
    fatiha: 0, fatihaTarget: 3,
    muawwidhatayn: 0, muawwidhataynTarget: 1,
    ikhlas: 0, ikhlasTarget: 3,
    salawat: 0, salawatTarget: 3,
    duaDone: false,
    quranDone: false,
    startPage: null,
    foundPage: null,
    foundVerse: null,
    foundType: null,
    targetPage: null,
    line7: null,
    firstLetter: null
  };

  /* ============ كلمات التصنيف ============ */
  var MERCY_KW = ['رحم', 'غفر', 'جنات', 'نعيم', 'رضو', 'برك', 'رزق', 'نصر', 'فتح', 'خير', 'اجر', 'ثواب', 'سلام', 'امن', 'هدي', 'صالح', 'طيب', 'بشار', 'سعد', 'فلاح', 'فوز', 'احسان', 'توب'];
  var PUNISH_KW = ['عذاب', 'نار', 'جهنم', 'سخط', 'غضب', 'لعن', 'خسر', 'هلاك', 'دمر', 'اليم', 'عقاب', 'ويل', 'باس', 'نكال', 'شقو', 'ظلم', 'كفر', 'طاغوت', 'سعير', 'لظي', 'حطم', 'هاوي', 'جحيم'];

  /* ============ تطبيع النص العربي ============ */
  function normalizeArabic(text) {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u0652\u0670]/g, '')
      .replace(/[\u06D6-\u06DC\u06DE-\u06E8\u06EA-\u06ED]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي');
  }

  /* ============ تصنيف الآية ============ */
  function classifyVerse(text) {
    var t = normalizeArabic(text);
    if (!t || t.length < 8) return null;
    var m = 0, p = 0;
    for (var i = 0; i < MERCY_KW.length; i++) if (t.indexOf(MERCY_KW[i]) !== -1) m++;
    for (var j = 0; j < PUNISH_KW.length; j++) if (t.indexOf(PUNISH_KW[j]) !== -1) p++;
    if (m > p) return 'رحمة';
    if (p > m) return 'عذاب';
    return null;
  }

  /* ============ Toast & Loading ============ */
  function showToast(msg) {
    var t = document.getElementById('qsToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'qsToast';
      t.className = 'qs-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2500);
  }
  window.qsShowToast = showToast;

  function showLoading(text) {
    var ov = document.getElementById('qsLoadingOverlay');
    if (ov) {
      var txt = document.getElementById('qsLoadingText');
      if (txt) txt.textContent = text || 'جاري البحث...';
      ov.classList.add('active');
    }
  }
  function hideLoading() {
    var ov = document.getElementById('qsLoadingOverlay');
    if (ov) ov.classList.remove('active');
  }

  /* ============ شريط التقدم ============ */
  function updateProgress() {
    var total = 5, done = 0;
    if (state.wudu) done++;
    if (state.fatiha >= state.fatihaTarget && state.muawwidhatayn >= state.muawwidhataynTarget && state.ikhlas >= state.ikhlasTarget) done++;
    if (state.duaDone) done++;
    if (state.salawat >= state.salawatTarget) done++;
    if (state.quranDone) done++;
    var pct = Math.round((done / total) * 100);
    var bar = document.getElementById('qsProgressBar');
    if (bar) bar.style.width = pct + '%';
  }
  window.qsUpdateProgress = updateProgress;

  /* ============ عدّادات ============ */
  window.qsToggleWudu = function (checked) {
    state.wudu = checked;
    var badge = document.getElementById('qs-badge-wudu');
    if (badge) badge.style.display = checked ? 'inline-block' : 'none';
    updateProgress();
  };

  window.qsIncCounter = function (name) {
    var el = document.getElementById('qs-' + name);
    if (!el) return;
    state[name] = (state[name] || 0) + 1;
    el.textContent = state[name];
    var targetKey = name + 'Target';
    if (state[name] >= state[targetKey]) {
      var badge = document.getElementById('qs-badge-' + name);
      if (badge) badge.style.display = 'inline-block';
      el.style.color = '#10B981';
    }
    updateProgress();
  };

  window.qsResetCounter = function (name) {
    var el = document.getElementById('qs-' + name);
    if (!el) return;
    state[name] = 0;
    el.textContent = '0';
    el.style.color = '';
    var badge = document.getElementById('qs-badge-' + name);
    if (badge) badge.style.display = 'none';
    updateProgress();
  };

  /* ============ نسخ الدعاء ============ */
  window.qsCopyDua = function () {
    var dua = document.getElementById('qs-dua-text');
    if (!dua) return;
    var text = dua.textContent.trim();
    state.duaDone = true;
    updateProgress();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('✅ تم نسخ الدعاء');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('✅ تم نسخ الدعاء');
    } catch (e) {
      showToast('⚠️ تعذّر النسخ');
    }
    document.body.removeChild(ta);
  }

  /* ============ جلب صفحة من المصحف ============ */
  function fetchQuranPage(page) {
    return new Promise(function (resolve) {
      var url = 'https://api.alquran.cloud/v1/page/' + page + '/quran-uthmani';
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.timeout = 15000;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              var json = JSON.parse(xhr.responseText);
              if (json && json.data && json.data.ayahs) {
                resolve(json.data);
                return;
              }
            } catch (e) { /* تجاهل */ }
          }
          resolve(null);
        }
      };
      xhr.onerror = function () { resolve(null); };
      xhr.ontimeout = function () { resolve(null); };
      try { xhr.send(); } catch (e) { resolve(null); }
    });
  }

  /* ============ البحث والتحليل ============ */
  window.qsOpenQuranAndAnalyze = async function (btn) {
    if (btn) { btn.disabled = true; btn.textContent = '⏳ جاري البحث...'; }
    showLoading('جاري اختيار صفحة عشوائية...');

    try {
      /* 1) صفحة عشوائية */
      var startPage = Math.floor(Math.random() * 604) + 1;
      state.startPage = startPage;
      var el = document.getElementById('qs-resStart');
      if (el) el.textContent = startPage;

      /* 2) البحث عن آية رحمة أو عذاب */
      var maxSearch = 40;
      var found = null;
      for (var i = 0; i < maxSearch; i++) {
        var pg = startPage + i;
        if (pg > 604) pg = pg - 604;
        showLoading('جاري البحث في الصفحة ' + pg + '...');
        var data = await fetchQuranPage(pg);
        if (!data) continue;

        for (var j = 0; j < data.ayahs.length; j++) {
          var v = data.ayahs[j];
          var type = classifyVerse(v.text);
          if (type) {
            found = { page: pg, verse: v.text, type: type };
            break;
          }
        }
        if (found) break;
      }

      if (!found) throw new Error('لم يُعثر على آية رحمة أو عذاب في البحث');

      state.foundPage = found.page;
      state.foundVerse = found.verse;
      state.foundType = found.type;

      var el2 = document.getElementById('qs-resFoundPage');
      if (el2) el2.textContent = found.page;
      var el3 = document.getElementById('qs-resFoundType');
      if (el3) el3.textContent = found.type;
      var el4 = document.getElementById('qs-resFoundVerse');
      if (el4) el4.textContent = found.verse;
      var vb = document.getElementById('qs-foundVerseBox');
      if (vb) vb.classList.add('show');

      /* 3) الصفحة الهدف = صفحة الوجود + 14 */
      var targetPage = found.page + 14;
      if (targetPage > 604) targetPage = targetPage - 604;
      state.targetPage = targetPage;

      showLoading('جاري تحليل الصفحة الهدف ' + targetPage + '...');
      var targetData = await fetchQuranPage(targetPage);
      if (!targetData) throw new Error('تعذّر تحميل الصفحة الهدف');

      /* 4) تقدير السطر السابع */
      var allText = '';
      for (var k = 0; k < targetData.ayahs.length; k++) {
        allText += targetData.ayahs[k].text + ' ';
      }
      var words = allText.split(/\s+/).filter(function (w) { return w.length > 0; });
      var totalWords = words.length;
      var l7Start = Math.floor(totalWords * 6 / 15);
      var l7End = Math.floor(totalWords * 7 / 15);
      var line7Words = words.slice(l7Start, l7End);
      var line7 = line7Words.join(' ');
      var firstLetter = line7Words[0] ? line7Words[0].charAt(0) : '';

      state.line7 = line7;
      state.firstLetter = firstLetter;

      var el5 = document.getElementById('qs-resAdd');
      if (el5) el5.textContent = '14';
      var el6 = document.getElementById('qs-resTarget');
      if (el6) el6.textContent = targetPage;
      var el7 = document.getElementById('qs-targetPageBig');
      if (el7) el7.textContent = targetPage;
      var el8 = document.getElementById('qs-resLine7');
      if (el8) el8.textContent = line7 || '—';
      var el9 = document.getElementById('qs-firstLetter');
      if (el9) el9.value = firstLetter || '—';

      var rb = document.getElementById('qs-resultBox');
      if (rb) rb.classList.add('show');

      var vt = document.getElementById('qs-verseType');
      if (vt) vt.value = found.type;

      state.quranDone = true;
      updateProgress();

      hideLoading();
      showToast('✅ اكتمل البحث');

    } catch (err) {
      hideLoading();
      showToast('❌ ' + (err.message || 'خطأ غير متوقع'));
      console.error('[quran-seeker]', err);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '🔍 فتح القرآن والبحث'; }
    }
  };

  /* ============ حفظ / عرض / مسح ============ */
  window.qsSaveEntry = function () {
    if (!state.targetPage) {
      showToast('⚠️ لا توجد نتيجة لحفظها');
      return;
    }
    var entries = [];
    try { entries = JSON.parse(localStorage.getItem('qs_journal') || '[]'); } catch (e) {}
    var vt = document.getElementById('qs-verseType');
    var nt = document.getElementById('qs-notes');
    var entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('ar-EG'),
      startPage: state.startPage,
      foundPage: state.foundPage,
      foundVerse: state.foundVerse,
      foundType: state.foundType,
      targetPage: state.targetPage,
      line7: state.line7,
      firstLetter: state.firstLetter,
      verseType: vt ? vt.value : state.foundType,
      notes: nt ? nt.value : ''
    };
    entries.unshift(entry);
    if (entries.length > 50) entries = entries.slice(0, 50);
    localStorage.setItem('qs_journal', JSON.stringify(entries));
    renderJournal();
    showToast('✅ تم حفظ النتيجة');
  };

  window.qsOpenTargetOnline = function () {
    if (!state.targetPage) {
      showToast('⚠️ لا توجد صفحة هدف');
      return;
    }
    window.open('https://quran.com/page/' + state.targetPage, '_blank');
  };

  window.qsClearJournal = function () {
    if (!confirm('هل تريد مسح السجل؟')) return;
    localStorage.removeItem('qs_journal');
    renderJournal();
    showToast('🗑 تم مسح السجل');
  };

  function renderJournal() {
    var el = document.getElementById('qs-journal');
    if (!el) return;
    var entries = [];
    try { entries = JSON.parse(localStorage.getItem('qs_journal') || '[]'); } catch (e) {}
    if (entries.length === 0) {
      el.innerHTML = '<p style="color:#7B84A8;text-align:center;padding:20px;font-size:0.9rem">لا توجد نتائج محفوظة بعد</p>';
      return;
    }
    el.innerHTML = entries.map(function (e) {
      return '<div class="qs-journal-entry">' +
        '<div class="qs-journal-head">' +
          '<span class="qs-journal-tag">' + (e.verseType || e.foundType || '') + '</span>' +
          '<small>' + e.timestamp + '</small>' +
        '</div>' +
        '<div><strong>الصفحة الهدف:</strong> ' + e.targetPage + '</div>' +
        '<div><strong>الحرف الأول:</strong> <span style="color:#B8860B;font-size:1.3rem;font-family:Amiri,serif">' + (e.firstLetter || '—') + '</span></div>' +
        (e.notes ? '<div style="margin-top:6px;color:#7B84A8;font-size:0.85rem">📝 ' + e.notes + '</div>' : '') +
      '</div>';
    }).join('');
  }

  /* ============ فتح الشاشة ============ */
  window.showQuranSeekerScreen = function () {
    if (typeof window.showScreen === 'function') {
      window.showScreen('screen-quran-seeker');
    }
    window.scrollTo(0, 0);
    renderJournal();
    updateProgress();
  };

  /* ============ فحص ذاتي ============ */
  try {
    console.log('%c[quran-seeker] ✅ تم تحميل الملف بنجاح', 'color:#2E7D32;font-weight:bold');
    console.log('  • showQuranSeekerScreen:', typeof window.showQuranSeekerScreen);
    console.log('  • qsOpenQuranAndAnalyze:', typeof window.qsOpenQuranAndAnalyze);
  } catch (e) { /* تجاهل */ }

})();