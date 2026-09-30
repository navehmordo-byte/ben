/*
 * השאלון: מאגר שאלות על כל הספורטים באתר. בכל ניסיון נבחרות QUIZ_LENGTH שאלות.
 * type: "yesno" (כן/לא) או "choice" (בחירה מתוך כמה תשובות).
 */
const QUIZ_LENGTH = 20;
const MIN_PER_SPORT = 3;

const QUIZ = [
  // ⚽ כדורגל
  { sport: "football", type: "yesno", q: "בכדורגל, מותר לשוער לגעת בכדור עם הידיים בתוך הרחבה שלו?", answer: "כן", explain: "השוער הוא השחקן היחיד שמותר לו, ורק בתוך הרחבה." },
  { sport: "football", type: "choice", q: "כמה שחקנים יש לכל קבוצה על מגרש הכדורגל?", options: ["9", "10", "11", "12"], answer: "11", explain: "11 שחקנים, כולל השוער." },
  { sport: "football", type: "choice", q: "איפה נערך המונדיאל הראשון, ב-1930?", options: ["ברזיל", "אורוגוואי", "אנגליה", "איטליה"], answer: "אורוגוואי", explain: "אורוגוואי אירחה את המונדיאל הראשון, וגם זכתה בו." },
  { sport: "football", type: "yesno", q: "האם הכדורגל הומצא באמריקה ב-1950?", answer: "לא", explain: "משחקי כדור ברגליים היו כבר בסין העתיקה, והחוקים המודרניים נכתבו באנגליה ב-1863." },

  // 🏀 כדורסל
  { sport: "basketball", type: "choice", q: "כמה נקודות שווה זריקה מחוץ לקשת בכדורסל?", options: ["1", "2", "3", "4"], answer: "3", explain: "מחוץ לקשת זו שלשה: 3 נקודות." },
  { sport: "basketball", type: "choice", q: "מי המציא את הכדורסל?", options: ["ג'יימס נייסמית'", "מייקל ג'ורדן", "וולטר וינגפילד", "מתיו ווב"], answer: "ג'יימס נייסמית'", explain: "המורה ג'יימס נייסמית' המציא אותו ב-1891." },
  { sport: "basketball", type: "yesno", q: "בכדורסל, מותר ללכת עם הכדור ביד בלי לכדרר?", answer: "לא", explain: "זו עבירת \"צעדים\". כדי לזוז עם הכדור חייבים לכדרר." },
  { sport: "basketball", type: "choice", q: "כמה שניות יש לקבוצה כדי לזרוק לסל בכל התקפה?", options: ["10", "24", "30", "60"], answer: "24", explain: "שעון 24 השניות הפך את המשחק למהיר יותר." },
  { sport: "basketball", type: "choice", q: "במה השתמשו בכדורסל בהתחלה במקום טבעת?", options: ["דלי", "סל של אפרסקים", "כובע", "צמיג"], answer: "סל של אפרסקים", explain: "נייסמית' תלה סלים של אפרסקים, ומישהו היה צריך להוציא את הכדור אחרי כל סל." },

  // 🏊 שחייה
  { sport: "swimming", type: "choice", q: "כמה סגנונות שחייה יש בתחרויות?", options: ["2", "3", "4", "5"], answer: "4", explain: "חופשי, גב, חזה ופרפר." },
  { sport: "swimming", type: "yesno", q: "האם האורך של בריכה אולימפית הוא 50 מטר?", answer: "כן", explain: "בריכה אולימפית באורך 50 מטר." },
  { sport: "swimming", type: "choice", q: "בכמה מדליות זהב אולימפיות זכה מייקל פלפס?", options: ["8", "15", "23", "30"], answer: "23", explain: "23 מדליות זהב, יותר מכל אחד אחר בהיסטוריה." },
  { sport: "swimming", type: "yesno", q: "באולימפיאדה של 1896, השחיינים שחו בבריכה?", answer: "לא", explain: "הם שחו בים הפתוח, במים קרים." },
  { sport: "swimming", type: "choice", q: "איזה סגנון שחייה נולד מתוך שחיית חזה?", options: ["חופשי", "גב", "פרפר", "מעורב"], answer: "פרפר", explain: "שחיינים העבירו את הידיים מעל המים בחזה, וכך נולד הפרפר." },

  // 🎾 טניס
  { sport: "tennis", type: "choice", q: "בטניס, מה בא אחרי 30 בניקוד?", options: ["35", "40", "45", "50"], answer: "40", explain: "0, 15, 30, 40 ואז משחקון." },
  { sport: "tennis", type: "choice", q: "מה טורניר הטניס הכי ותיק בעולם?", options: ["וימבלדון", "רולאן גארוס", "אליפות אוסטרליה", "אליפות ארה\"ב"], answer: "וימבלדון", explain: "וימבלדון נערך לראשונה ב-1877." },
  { sport: "tennis", type: "yesno", q: "בטניס, כדור שנוגע בקו נחשב \"בחוץ\"?", answer: "לא", explain: "כדור שנוגע בקו נחשב \"בפנים\"." },

  // 🏓 פינג-פונג
  { sport: "pingpong", type: "choice", q: "עד כמה נקודות משחקים משחקון בפינג-פונג?", options: ["7", "11", "15", "21"], answer: "11", explain: "עד 11, בהפרש של 2. פעם זה היה 21." },
  { sport: "pingpong", type: "yesno", q: "בפינג-פונג, ההגשה עוברת לשחקן השני כל 2 נקודות?", answer: "כן", explain: "כל 2 נקודות, ובמצב 10:10 כל נקודה." },
  { sport: "pingpong", type: "choice", q: "מאיפה הגיע השם \"פינג-פונג\"?", options: ["משם של ממציא", "מהצליל של הכדור", "מעיר בסין", "משם של כלב"], answer: "מהצליל של הכדור", explain: "הכדור עושה \"פינג... פונג...\" כשהוא קופץ." },

  // 🚴 אופניים
  { sport: "cycling", type: "yesno", q: "האופניים הראשונים, מ-1817, היו בלי דוושות?", answer: "כן", explain: "ב\"מכונת הריצה\" של קרל דרייס דחפו ברגליים על הרצפה." },
  { sport: "cycling", type: "choice", q: "איזה צבע חולצה לובש המוביל בטור דה פראנס?", options: ["אדום", "ירוק", "צהוב", "כחול"], answer: "צהוב", explain: "החולצה הצהובה היא הסמל של המוביל בטור." },
  { sport: "cycling", type: "yesno", q: "ברכיבת אופניים חובה לחבוש קסדה?", answer: "כן", explain: "קסדה תמיד, גם באימון וגם בתחרות." },
  { sport: "cycling", type: "choice", q: "איזה סוג רכיבה נכנס לאולימפיאדה ב-2008?", options: ["BMX", "כביש", "מסלול", "הרים"], answer: "BMX", explain: "BMX נכנס ב-2008. אופני הרים נכנסו קודם, ב-1996." }
];

// מדליות לפי מספר התשובות הנכונות (מהגבוה לנמוך)
const MEDALS = [
  { min: QUIZ_LENGTH, kind: "gold", icon: "🥇", name: "מדליית זהב", text: "אתה מצוין, ענית על הכל! כל הכבוד, תמשיך ללמוד על הספורט" },
  { min: 15, kind: "silver", icon: "🥈", name: "מדליית כסף", text: "אתה מבין מאוד טוב, תמשיך לקרוא וללמוד על עולם הספורט" },
  { min: 10, kind: "bronze", icon: "🥉", name: "מדליית ארד", text: "אתה מבין טוב אבל עדיף שתלמד עוד" }
];

function renderQuiz(container) {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id) => (SPORTS.find((s) => s.id === id) || {}).icon || "🏅";
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let questions, idx, score;

  function sfxToggle() {
    return `<button class="quiz-sfx" id="quiz-sfx" aria-label="${Sound.sfxOn ? "כבה צלילים" : "הפעל צלילים"}">${Sound.sfxOn ? "🔊" : "🔇"}</button>`;
  }
  function bindSfx() {
    const b = container.querySelector("#quiz-sfx");
    if (b) b.onclick = () => { Sound.setSfx(!Sound.sfxOn); b.outerHTML = sfxToggle(); bindSfx(); };
  }

  function intro() {
    container.innerHTML = `<div class="card quiz-card fade-in">
      ${sfxToggle()}
      <div class="quiz-big">🏆</div>
      <h2 class="quiz-title">כמה אתה מבין בספורט?</h2>
      <p class="quiz-sub">${QUIZ_LENGTH} שאלות מתוך מאגר של ${QUIZ.length}, ובכל פעם שאלות קצת אחרות. חלק מהן כן/לא וחלק עם כמה תשובות לבחירה.</p>
      <ul class="medal-list">
        <li><span>🥇</span> ${QUIZ_LENGTH} נכונות: מדליית זהב</li>
        <li><span>🥈</span> 15 נכונות ומעלה: מדליית כסף</li>
        <li><span>🥉</span> 10 נכונות ומעלה: מדליית ארד</li>
      </ul>
      <button class="quiz-btn primary" id="quiz-start">בוא נתחיל!</button>
    </div>`;
    bindSfx();
    container.querySelector("#quiz-start").onclick = start;
  }

  // בחירה מאוזנת: לפחות MIN_PER_SPORT מכל ספורט, והשאר באקראי מהשאלות שנשארו
  function pickQuestions() {
    const picked = [], rest = [];
    const bySport = {};
    shuffle(QUIZ).forEach((q) => (bySport[q.sport] = bySport[q.sport] || []).push(q));
    Object.values(bySport).forEach((qs) => {
      picked.push(...qs.slice(0, MIN_PER_SPORT));
      rest.push(...qs.slice(MIN_PER_SPORT));
    });
    picked.push(...shuffle(rest).slice(0, Math.max(0, QUIZ_LENGTH - picked.length)));
    return shuffle(picked.slice(0, QUIZ_LENGTH));
  }

  function start() {
    questions = pickQuestions().map((q) => ({ ...q, opts: q.type === "yesno" ? ["כן", "לא"] : shuffle(q.options) }));
    idx = 0;
    score = 0;
    ask();
  }

  // בטלפון הכפתור "הבא" נמצא למטה, אז מחזירים את המסך לתחילת הכרטיס
  function scrollToCard() {
    const header = document.querySelector(".site-header");
    const top = container.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 12;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  }

  function ask() {
    const q = questions[idx];
    container.innerHTML = `<div class="card quiz-card fade-in">
      ${sfxToggle()}
      <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${(idx / questions.length) * 100}%"></div></div>
      <div class="quiz-meta">שאלה ${idx + 1} מתוך ${questions.length} · ניקוד: ${score}</div>
      <div class="quiz-sport">${icon(q.sport)}</div>
      <h2 class="quiz-q">${esc(q.q)}</h2>
      <div class="quiz-options ${q.type}">${q.opts
        .map((o) => {
          const label = q.type === "yesno" ? (o === "כן" ? "✅ כן" : "❌ לא") : esc(o);
          return `<button class="quiz-opt" data-v="${esc(o)}">${label}</button>`;
        })
        .join("")}</div>
      <div class="quiz-feedback" id="quiz-feedback"></div>
    </div>`;
    bindSfx();
    scrollToCard();
    container.querySelectorAll(".quiz-opt").forEach((b) => (b.onclick = () => answer(b)));
  }

  function answer(btn) {
    const q = questions[idx];
    const ok = btn.dataset.v === q.answer;
    if (ok) score++;
    container.querySelectorAll(".quiz-opt").forEach((b) => {
      b.disabled = true;
      if (b.dataset.v === q.answer) b.classList.add("correct");
    });
    if (!ok) btn.classList.add("wrong");
    ok ? Sound.correct() : Sound.wrong();
    const last = idx === questions.length - 1;
    container.querySelector("#quiz-feedback").innerHTML = `
      <div class="quiz-verdict ${ok ? "ok" : "bad"}">${ok ? "🎉 נכון!" : `😅 לא נכון. התשובה הנכונה: <b>${esc(q.answer)}</b>`}</div>
      <p class="quiz-explain">${esc(q.explain)}</p>
      <button class="quiz-btn primary" id="quiz-next">${last ? "לתוצאות 🏁" : "לשאלה הבאה ←"}</button>`;
    const next = container.querySelector("#quiz-next");
    next.focus();
    next.onclick = () => {
      idx++;
      last ? result() : ask();
    };
  }

  function result() {
    const medal = MEDALS.find((m) => score >= m.min);
    container.innerHTML = `<div class="card quiz-card quiz-result fade-in ${medal ? medal.kind : "none"}">
      ${sfxToggle()}
      ${medal
        ? `<div class="medal-icon">${medal.icon}</div><h2 class="quiz-title">${medal.name}!</h2>`
        : `<div class="medal-icon">💪</div><h2 class="quiz-title">עוד לא מדליה</h2>`}
      <div class="quiz-score">${score} מתוך ${questions.length}</div>
      <p class="quiz-message">${medal ? esc(medal.text) : "כדאי לקרוא עוד באתר ולנסות שוב 💪"}</p>
      <button class="quiz-btn primary" id="quiz-again">🔄 נסה שוב</button>
    </div>`;
    bindSfx();
    scrollToCard();
    Sound.medal(medal ? medal.kind : "none");
    container.querySelector("#quiz-again").onclick = start;
  }

  intro();
}
