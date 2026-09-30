(function () {
  const TABS = [
    { id: "basics", label: "מה זה בכלל?", icon: "❓" },
    { id: "history", label: "היסטוריית הספורט", icon: "📜" },
    { id: "learn", label: "למידה", icon: "🎬" }
  ];
  const SLIDE_MS = 7000;

  const nav = document.getElementById("sports-nav");
  const hero = document.getElementById("hero");
  const tabsEl = document.getElementById("tabs");
  const content = document.getElementById("content");

  let player = null; // מצב נגן המצגת הפעיל

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function parseHash() {
    const [sportId, tabId] = location.hash.replace("#", "").split("/");
    const sport = SPORTS.find((s) => s.id === sportId) || SPORTS[0];
    const tab = TABS.find((t) => t.id === tabId) || TABS[0];
    return { sport, tab };
  }

  function go(sportId, tabId) {
    location.hash = sportId + "/" + tabId;
  }

  function renderNav(active) {
    nav.innerHTML = SPORTS.map(
      (s) => `<button class="sport-btn${s.id === active.id ? " active" : ""}" data-sport="${s.id}" aria-current="${s.id === active.id}">
        <span class="sport-icon">${s.icon}</span><span>${esc(s.name)}</span></button>`
    ).join("");
  }

  function renderHero(sport) {
    hero.innerHTML = `<div class="hero-icon">${sport.icon}</div>
      <div><h2>${esc(sport.name)}</h2><p>${esc(sport.tagline)}</p></div>`;
  }

  function renderTabs(sport, active) {
    tabsEl.innerHTML = TABS.map(
      (t) => `<button role="tab" class="tab${t.id === active.id ? " active" : ""}" aria-selected="${t.id === active.id}" data-tab="${t.id}">
        <span>${t.icon}</span> ${esc(t.label)}</button>`
    ).join("");
  }

  function renderBasics(sport) {
    const b = sport.basics;
    return `<div class="card fade-in">
      <p class="intro">${esc(b.intro)}</p>
      <div class="facts">${b.facts
        .map((f) => `<div class="fact"><div class="fact-label">${esc(f.label)}</div><div class="fact-value">${esc(f.value)}</div></div>`)
        .join("")}</div>
      <h3>חוקים בסיסיים</h3>
      <ul class="rules">${b.rules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
    </div>`;
  }

  function renderHistory(sport) {
    return `<ol class="timeline fade-in">${sport.history
      .map(
        (h, i) => `<li class="tl-item" style="animation-delay:${i * 80}ms">
          <div class="tl-year">${esc(h.year)}</div>
          <div class="tl-body"><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div>
        </li>`
      )
      .join("")}</ol>`;
  }

  function renderLearn(sport) {
    const n = sport.lessons.length;
    return `<div class="player fade-in" tabindex="0" aria-label="מצגת למידה">
      <div class="screen">
        <div class="slide" id="slide"></div>
      </div>
      <div class="progress" id="progress">${sport.lessons
        .map((_, i) => `<button class="seg" data-i="${i}" aria-label="שלב ${i + 1}"><span class="fill"></span></button>`)
        .join("")}</div>
      <div class="controls">
        <button class="ctl flip" id="prev" aria-label="הקודם">⏮</button>
        <button class="ctl play" id="play" aria-label="השהה">⏸</button>
        <button class="ctl flip" id="next" aria-label="הבא">⏭</button>
        <span class="counter" id="counter">שלב 1 מתוך ${n}</span>
      </div>
    </div>`;
  }

  // ---------- נגן המצגת ----------
  function startPlayer(sport) {
    const lessons = sport.lessons;
    const slideEl = document.getElementById("slide");
    const segs = [...document.querySelectorAll("#progress .seg")];
    const playBtn = document.getElementById("play");
    const counter = document.getElementById("counter");

    player = { i: 0, playing: true, timer: null, started: 0, elapsed: 0 };

    function show(i) {
      player.i = (i + lessons.length) % lessons.length;
      player.elapsed = 0;
      const l = lessons[player.i];
      slideEl.classList.remove("enter");
      void slideEl.offsetWidth; // מאתחל את האנימציה
      slideEl.innerHTML = `<div class="slide-step">שלב ${player.i + 1}</div>
        <div class="slide-emoji anim-${esc(l.anim)}">${l.emoji}</div>
        <h3 class="slide-title">${esc(l.title)}</h3>
        <p class="slide-text">${esc(l.text)}</p>
        ${l.tip ? `<div class="slide-tip">💡 ${esc(l.tip)}</div>` : ""}`;
      slideEl.classList.add("enter");
      counter.textContent = `שלב ${player.i + 1} מתוך ${lessons.length}`;
      segs.forEach((s, k) => {
        s.classList.toggle("done", k < player.i);
        s.classList.toggle("current", k === player.i);
        s.querySelector(".fill").style.width = k < player.i ? "100%" : "0%";
      });
      if (player.playing) tick();
    }

    function tick() {
      cancelAnimationFrame(player.timer);
      player.started = performance.now() - player.elapsed;
      const loop = (now) => {
        player.elapsed = now - player.started;
        const pct = Math.min(100, (player.elapsed / SLIDE_MS) * 100);
        segs[player.i].querySelector(".fill").style.width = pct + "%";
        if (player.elapsed >= SLIDE_MS) {
          if (player.i === lessons.length - 1) {
            setPlaying(false);
            return;
          }
          show(player.i + 1);
          return;
        }
        player.timer = requestAnimationFrame(loop);
      };
      player.timer = requestAnimationFrame(loop);
    }

    function setPlaying(p) {
      player.playing = p;
      playBtn.textContent = p ? "⏸" : "▶";
      playBtn.setAttribute("aria-label", p ? "השהה" : "נגן");
      document.querySelector(".player").classList.toggle("paused", !p);
      if (p) {
        // בסוף המצגת, לחיצה על נגן מתחילה מההתחלה
        if (player.i === lessons.length - 1 && player.elapsed >= SLIDE_MS) show(0);
        else tick();
      } else cancelAnimationFrame(player.timer);
    }

    playBtn.onclick = () => setPlaying(!player.playing);
    document.getElementById("next").onclick = () => show(player.i + 1);
    document.getElementById("prev").onclick = () => show(player.i - 1);
    segs.forEach((s) => (s.onclick = () => show(+s.dataset.i)));
    document.querySelector(".player").onkeydown = (e) => {
      if (e.key === " ") { e.preventDefault(); setPlaying(!player.playing); }
      // ב-RTL חץ שמאלה הוא "קדימה"
      if (e.key === "ArrowLeft") show(player.i + 1);
      if (e.key === "ArrowRight") show(player.i - 1);
    };

    show(0);
  }

  function stopPlayer() {
    if (player) cancelAnimationFrame(player.timer);
    player = null;
  }

  function render() {
    stopPlayer();
    const { sport, tab } = parseHash();
    document.documentElement.style.setProperty("--accent", sport.color);
    document.title = `${sport.name}: ${tab.label} | עולם הספורט`;
    renderNav(sport);
    renderHero(sport);
    renderTabs(sport, tab);
    if (tab.id === "basics") content.innerHTML = renderBasics(sport);
    else if (tab.id === "history") content.innerHTML = renderHistory(sport);
    else {
      content.innerHTML = renderLearn(sport);
      startPlayer(sport);
    }
  }

  nav.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sport]");
    if (b) go(b.dataset.sport, "basics");
  });
  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) go(parseHash().sport.id, b.dataset.tab);
  });
  window.addEventListener("hashchange", render);
  render();
})();
