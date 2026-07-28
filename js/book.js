// Irodalmi Videók — a "könyv" interakciói:
// borító nyitása, tartalomjegyzék, valódi lapozás-animáció a fejezetek közt,
// és saját, megosztható URL minden oldalhoz (#toc, #fejezet-1 … #fejezet-N).

const SITE_TITLE = "Irodalmi Videók";
const DEFAULT_TITLE = document.title || SITE_TITLE;
let currentChapterNum = null; // null = a tartalomjegyzék látszik, egyébként 1..N

/* ---------------- Tartalom-sablonok ---------------- */

function tocPageHtml() {
  return `
    <h2>Tartalom</h2>
    <ol class="toc-list" id="toc-list">
      ${CHAPTERS.map(
        (c) => `
        <li>
          <button class="toc-item" data-chapter="${c.num}">
            <span class="toc-num">${String(c.num).padStart(2, "0")}</span>
            <span class="toc-text">
              <span class="toc-title">${c.title}</span>
              <span class="toc-author">${c.author} &middot; ${c.channel}</span>
            </span>
            <span class="toc-dots">▸</span>
          </button>
        </li>`
      ).join("")}
    </ol>
    <button class="page-nav-btn toc-next-btn" id="toc-next-btn">Következő fejezet &rarr;</button>
  `;
}

function chapterPageHtml(chapter) {
  const isFirst = chapter.num === 1;
  const isLast = chapter.num === CHAPTERS.length;
  return `
    <h3>${chapter.num}. ${chapter.title}</h3>
    <div class="video-frame-wrap">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${chapter.youtubeId}"
        title="${chapter.title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
    <p class="video-meta">${chapter.author} &middot; ${chapter.channel}</p>
    <p class="video-blurb">${chapter.blurb}</p>
    <div class="page-nav-row">
      <button class="page-nav-btn" data-nav="prev">&larr; ${isFirst ? "Tartalomjegyzék" : "Előző fejezet"}</button>
      ${
        isLast
          ? `<button class="page-nav-btn" data-nav="toc">Tartalomjegyzék</button>`
          : `<button class="page-nav-btn" data-nav="next">Következő fejezet &rarr;</button>`
      }
    </div>
  `;
}

/* ---------------- Eseménybekötés egy adott konténerben ---------------- */

function wireToc(container) {
  container.querySelectorAll("[data-chapter]").forEach((btn) => {
    btn.addEventListener("click", () => goToChapter(Number(btn.dataset.chapter)));
  });
  const nextBtn = container.querySelector("#toc-next-btn");
  if (nextBtn) nextBtn.addEventListener("click", () => goToChapter(1));
}

function wireChapter(container, chapter) {
  const prevBtn = container.querySelector('[data-nav="prev"]');
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (chapter.num === 1) goToToc();
      else goToChapter(chapter.num - 1);
    });
  }
  const nextBtn = container.querySelector('[data-nav="next"]');
  if (nextBtn) nextBtn.addEventListener("click", () => goToChapter(chapter.num + 1));
  const tocBtn = container.querySelector('[data-nav="toc"]');
  if (tocBtn) tocBtn.addEventListener("click", goToToc);
}

function renderTocInto(container) {
  container.className = "page-inner toc-page";
  container.innerHTML = tocPageHtml();
  wireToc(container);
}

function renderChapterInto(container, chapter) {
  container.className = "page-inner video-page";
  container.innerHTML = chapterPageHtml(chapter);
  wireChapter(container, chapter);
}

/* ---------------- Valódi lapozás-animáció ---------------- */
/* A #flip-page a .book közvetlen gyereke — helyzetét minden lapozás előtt
   a jobb laphoz (#right-base szülője) igazítjuk, hogy pontosan ráilleszkedjen,
   és szabadon átlendülhessen a bal oldal fölé. */

function positionFlipPage() {
  const flipPage = document.getElementById("flip-page");
  const book = document.getElementById("book");
  const rightBox = document.querySelector(".book-page-right");
  if (!flipPage || !book || !rightBox) return;
  const bookRect = book.getBoundingClientRect();
  const rightRect = rightBox.getBoundingClientRect();
  flipPage.style.left = `${rightRect.left - bookRect.left}px`;
  flipPage.style.top = `${rightRect.top - bookRect.top}px`;
  flipPage.style.width = `${rightRect.width}px`;
  flipPage.style.height = `${rightRect.height}px`;
}

function animateToNewContent(renderFn) {
  const flipPage = document.getElementById("flip-page");
  const flipFront = document.getElementById("flip-front");
  const base = document.getElementById("right-base");
  if (!flipPage || !flipFront || !base) {
    renderFn(base);
    return;
  }

  positionFlipPage();

  // Esetleges korábbi, félbeszakadt animáció nyomait eltüntetjük, mielőtt újat indítunk.
  // FONTOS: az inline transform-ot utána törölni kell (removeProperty), különben
  // — magasabb specificitása miatt — örökre felülírná a .flip-active CSS-szabályt,
  // és a lap sosem fordulna el ténylegesen.
  flipPage.classList.remove("flip-active");
  flipPage.style.transition = "none";
  flipPage.style.transform = "rotateY(0deg)";
  void flipPage.offsetWidth; // reflow, hogy a transition:none tényleg érvényesüljön
  flipPage.style.transition = "";
  flipPage.style.removeProperty("transform");

  // 1. A RÉGI tartalom pillanatképe kerül a lapozó lap elejére.
  flipFront.className = base.className;
  flipFront.innerHTML = base.innerHTML;

  // 2. Az alapréteg azonnal az ÚJ tartalomra vált — egyelőre takarásban,
  //    hiszen a lapozó lap (a régi tartalom másolatával) még fölötte fekszik.
  renderFn(base);

  // 3. Elindítjuk a lapozást: a lap a gerinc körül a bal oldal fölé fordul,
  //    a fordulat felénél (amikor "élére áll") tűnik el a régi és bukkan
  //    elő alóla az új tartalom.
  requestAnimationFrame(() => {
    flipPage.classList.add("flip-active");
  });

  function onEnd(e) {
    if (e.target !== flipPage || e.propertyName !== "transform") return;
    flipPage.removeEventListener("transitionend", onEnd);
    flipPage.classList.remove("flip-active");
    // Nyugalmi állapotba állítjuk vissza villanás nélkül (opacity már 0),
    // és az inline transform-ot is töröljük, hogy legközelebb megint a
    // CSS-osztály (.flip-active) vezérelhesse a forgatást.
    flipPage.style.transition = "none";
    flipPage.style.transform = "rotateY(0deg)";
    void flipPage.offsetWidth;
    flipPage.style.transition = "";
    flipPage.style.removeProperty("transform");
  }
  flipPage.addEventListener("transitionend", onEnd);
}

/* ---------------- Navigáció + URL-ek ---------------- */

function showToc({ animate = true } = {}) {
  currentChapterNum = null;
  const base = document.getElementById("right-base");
  document.title = DEFAULT_TITLE;
  if (!base) return;
  if (animate) animateToNewContent((el) => renderTocInto(el));
  else renderTocInto(base);
}

function showChapterNum(num, { animate = true } = {}) {
  const chapter = CHAPTERS.find((c) => c.num === num);
  const base = document.getElementById("right-base");
  if (!chapter || !base) return;
  currentChapterNum = num;
  document.title = `${chapter.num}. ${chapter.title} — ${SITE_TITLE}`;
  if (animate) animateToNewContent((el) => renderChapterInto(el, chapter));
  else renderChapterInto(base, chapter);
}

function goToChapter(num) {
  if (num === currentChapterNum) return;
  const hash = `fejezet-${num}`;
  if (location.hash.slice(1) === hash) {
    showChapterNum(num);
  } else {
    location.hash = hash; // ez kiváltja a hashchange-et, ami ténylegesen navigál
  }
}

function goToToc() {
  if (currentChapterNum === null) return;
  if (location.hash.slice(1) === "toc" || location.hash === "") {
    showToc();
  } else {
    location.hash = "toc";
  }
}

function handleHashChange() {
  const book = document.getElementById("book");
  const hash = location.hash.slice(1);

  // Ha a könyv épp be van csukva (borító látszik), de a hash mégis egy
  // konkrét oldalra mutat (pl. böngésző vissza/előre gomb után), nyissuk
  // meg újra a könyvet — animáció nélkül, mielőtt a tartalmat frissítenénk.
  if (book && !book.classList.contains("visible") && hash) {
    openBookInstant();
  }

  const m = /^fejezet-(\d+)$/.exec(hash);
  if (m) {
    const num = Number(m[1]);
    if (CHAPTERS.some((c) => c.num === num) && num !== currentChapterNum) {
      showChapterNum(num);
    }
  } else if ((hash === "toc" || hash === "") && currentChapterNum !== null) {
    showToc();
  }
}

/* ---------------- Borító nyitás / csukás ---------------- */

function setToolbarVisible(visible) {
  const toolbar = document.getElementById("book-toolbar");
  if (toolbar) toolbar.classList.toggle("visible", visible);
}

function openBook() {
  const cover = document.getElementById("cover");
  const book = document.getElementById("book");
  if (!cover || !book) return;
  cover.classList.add("opening");
  book.classList.add("visible");
  setToolbarVisible(true);
  setTimeout(() => {
    cover.hidden = true;
    positionFlipPage();
  }, 900);
  if (!location.hash) location.hash = "toc";
}

// Animáció nélküli, azonnali megnyitás — mélylinkről érkezéskor, illetve
// böngésző vissza/előre navigációnál használjuk, amikor a könyv már be
// volt csukva.
function openBookInstant() {
  const cover = document.getElementById("cover");
  const book = document.getElementById("book");
  if (cover) cover.hidden = true;
  if (book) book.classList.add("visible");
  setToolbarVisible(true);
  requestAnimationFrame(positionFlipPage);
}

// A "Becsukás" gomb: lapozás-szerű animációval csukja be a könyvet
// (a borító visszafordul a helyére), majd a főoldal URL-jére (hash nélkül)
// ugrik vissza — ez a könyv "fedlapja".
function closeBook() {
  const cover = document.getElementById("cover");
  const book = document.getElementById("book");
  if (!cover || !book) return;

  cover.hidden = false;
  // Force reflow, hogy a hidden->visible váltás után a lezáró animáció
  // biztosan a "opening" állapotból induljon, ne egy ugrással.
  void cover.offsetWidth;
  cover.classList.remove("opening");
  book.classList.remove("visible");
  setToolbarVisible(false);

  history.pushState(null, "", location.pathname + location.search);
  currentChapterNum = null;
  document.title = DEFAULT_TITLE;

  setTimeout(() => {
    // A jobb oldalt visszaállítjuk tartalomjegyzékre, hogy legközelebb
    // (akár egy #fejezet-N mélylinkről) friss állapotból induljunk.
    const base = document.getElementById("right-base");
    if (base) renderTocInto(base);
  }, 900);
}

/* ---------------- Init ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  const base = document.getElementById("right-base");
  const cover = document.getElementById("cover");
  const book = document.getElementById("book");

  const initialHash = location.hash.slice(1);
  const chapterMatch = /^fejezet-(\d+)$/.exec(initialHash);
  const deepLinkChapter = chapterMatch && CHAPTERS.find((c) => c.num === Number(chapterMatch[1]));

  if (deepLinkChapter) {
    // Mélylink egy konkrét fejezetre: azonnal ott nyitjuk meg a könyvet, animáció nélkül.
    openBookInstant();
    showChapterNum(deepLinkChapter.num, { animate: false });
  } else if (initialHash === "toc") {
    openBookInstant();
    showToc({ animate: false });
  } else {
    // Nincs (érvényes) mélylink — a tartalomjegyzéket előkészítjük az alaprétegben,
    // hogy a borító kinyitásakor már ott legyen, csak a borító takarja.
    if (base) renderTocInto(base);
  }

  if (cover) {
    cover.addEventListener("click", openBook);
    cover.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBook();
      }
    });
  }

  const toolbarTocBtn = document.getElementById("toolbar-toc-btn");
  if (toolbarTocBtn) toolbarTocBtn.addEventListener("click", goToToc);
  const toolbarCloseBtn = document.getElementById("toolbar-close-btn");
  if (toolbarCloseBtn) toolbarCloseBtn.addEventListener("click", closeBook);

  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("resize", positionFlipPage);

  // Billentyűzetes lapozás (nyíl balra/jobbra), amíg a könyv nyitva van.
  document.addEventListener("keydown", (e) => {
    if (!book || !book.classList.contains("visible")) return;
    if (e.key === "ArrowRight") {
      goToChapter(currentChapterNum === null ? 1 : Math.min(currentChapterNum + 1, CHAPTERS.length));
    } else if (e.key === "ArrowLeft") {
      if (currentChapterNum === null) return;
      if (currentChapterNum === 1) goToToc();
      else goToChapter(currentChapterNum - 1);
    }
  });
});
