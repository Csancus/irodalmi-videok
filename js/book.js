// Irodalmi Videók — a "könyv" interakciói: borító nyitása, tartalomjegyzék,
// lapozás-animáció a videóhoz és vissza.

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
    btn.addEventListener("click", () => openChapter(Number(btn.dataset.chapter)));
  });
}

function openChapter(num) {
  const chapter = CHAPTERS.find((c) => c.num === num);
  const flipPage = document.getElementById("flip-page");
  const videoPage = document.getElementById("video-page");
  if (!chapter || !flipPage || !videoPage) return;

  videoPage.innerHTML = `
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
    <button class="back-to-toc" data-back>&larr; Vissza a tartalomjegyzékhez</button>
  `;

  videoPage.querySelector("[data-back]").addEventListener("click", closeChapter);

  flipPage.classList.add("flipped");
}

function closeChapter() {
  const flipPage = document.getElementById("flip-page");
  if (!flipPage) return;
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
});
