// Irodalmi Videók — a "könyv" interakciói: borító nyitása, tartalomjegyzék,
// lapozás-animáció a videókhoz, és lapozás előre/hátra a fejezetek között.

let currentChapterNum = null; // null = a tartalomjegyzék látszik, egyébként 1..N

function renderToc() {
  const list = document.getElementById("toc-list");
  if (!list) return;
  list.innerHTML = CHAPTERS.map(
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
  ).join("");

  list.querySelectorAll("[data-chapter]").forEach((btn) => {
    btn.addEventListener("click", () => goToChapter(Number(btn.dataset.chapter)));
  });

  const tocNextBtn = document.getElementById("toc-next-btn");
  if (tocNextBtn) tocNextBtn.addEventListener("click", () => goToChapter(1));
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

// A tartalomjegyzékből (nincs még kinyitva a lap) egyszerű, egyszeri
// lapozás-animációval nyitjuk a fejezetet; ha már egy másik fejezetnél
// állunk, akkor "becsukjuk-majd-kinyitjuk" a lapot, hogy a váltás is
// valódi lapozásnak tűnjön, nem csak tartalomcserének.
function goToChapter(num) {
  const chapter = CHAPTERS.find((c) => c.num === num);
  const flipPage = document.getElementById("flip-page");
  if (!chapter || !flipPage) return;

  if (currentChapterNum === null) {
    showChapterContent(chapter);
    flipPage.classList.add("flipped");
    return;
  }

  if (currentChapterNum === num) return;

  flipPage.classList.remove("flipped");
  setTimeout(() => {
    showChapterContent(chapter);
    flipPage.classList.add("flipped");
  }, 420); // kb. a fordulat félidejében, amikor a lap "élére áll" — ekkor cserélünk láthatatlanul
}

function showChapterContent(chapter) {
  const videoPage = document.getElementById("video-page");
  if (!videoPage) return;
  videoPage.innerHTML = chapterPageHtml(chapter);
  currentChapterNum = chapter.num;

  const prevBtn = videoPage.querySelector('[data-nav="prev"]');
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (chapter.num === 1) goToToc();
      else goToChapter(chapter.num - 1);
    });
  }
  const nextBtn = videoPage.querySelector('[data-nav="next"]');
  if (nextBtn) nextBtn.addEventListener("click", () => goToChapter(chapter.num + 1));
  const tocBtn = videoPage.querySelector('[data-nav="toc"]');
  if (tocBtn) tocBtn.addEventListener("click", goToToc);
}

function goToToc() {
  const flipPage = document.getElementById("flip-page");
  if (!flipPage) return;
  currentChapterNum = null;
  flipPage.classList.remove("flipped");
  // A videót a lapozás animáció végeztével állítjuk le/ürítjük ki, hogy a
  // háttérben ne szóljon tovább a hang.
  setTimeout(() => {
    const videoPage = document.getElementById("video-page");
    if (videoPage && !flipPage.classList.contains("flipped")) {
      const iframe = videoPage.querySelector("iframe");
      if (iframe) iframe.src = "";
    }
  }, 950);
}

function openBook() {
  const cover = document.getElementById("cover");
  const book = document.getElementById("book");
  if (!cover || !book) return;
  cover.classList.add("opening");
  book.classList.add("visible");
  setTimeout(() => {
    cover.hidden = true;
  }, 900);
}

document.addEventListener("DOMContentLoaded", () => {
  renderToc();

  const cover = document.getElementById("cover");
  if (cover) {
    cover.addEventListener("click", openBook);
    cover.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBook();
      }
    });
  }

  // Billentyűzetes lapozás (nyíl balra/jobbra), amíg a könyv nyitva van.
  document.addEventListener("keydown", (e) => {
    const book = document.getElementById("book");
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
