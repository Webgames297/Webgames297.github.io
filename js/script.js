document.addEventListener('DOMContentLoaded', () => {
  async function makePreviewFrame(url, img) {
    return new Promise(resolve => {
        const temp = document.createElement('iframe');
        temp.src = url;
        temp.style.position = 'absolute';
        temp.style.left = '-9999px';
        temp.style.top = '-9999px';
        temp.width = 800;
        temp.height = 600;
        document.body.appendChild(temp);

        let done = false;

        temp.onload = async () => {
            setTimeout(async () => {
                try {
                    const canvas = await html2canvas(temp.contentWindow.document.body, {
                        useCORS: true,
                        backgroundColor: null
                    });
                    img.src = canvas.toDataURL("image/png");
                } catch (e) {
                    img.src = img.dataset.fallback;
                }
                if (!done) {
                    done = true;
                    temp.remove();
                    resolve();
                }
            }, 700);
        };

        setTimeout(() => {
            if (!done) {
                done = true;
                img.src = img.dataset.fallback;
                temp.remove();
                resolve();
            }
        }, 1500);
    });
}

const search = document.getElementById('searchBar');
const games = [...document.querySelectorAll('.game')];
const genres = [...document.querySelectorAll('.sidebar a')];
const themeToggle = document.getElementById('themeToggle');

function getPlayCounts() {
  try { return JSON.parse(localStorage.getItem('webgames297_plays') || '{}'); }
  catch(e) { return {}; }
}

function savePlayCounts(obj) {
  localStorage.setItem('webgames297_plays', JSON.stringify(obj));
}

let playCounts = getPlayCounts();

function recordPlay(title) {
  playCounts[title] = (playCounts[title] || 0) + 1;
  savePlayCounts(playCounts);
}

let favSet = new Set();
try {
  const saved = localStorage.getItem('webgames297_favs');
  if (saved) favSet = new Set(JSON.parse(saved));
} catch(e) {}

games.forEach(g => {
  const title = g.dataset.title || "";
  const btn = g.querySelector('.fav-btn');
  if (favSet.has(title)) {
    g.dataset.favorite = '1';
    if (btn) btn.classList.add('fav');
  }
});

function saveFavs() {
  localStorage.setItem('webgames297_favs', JSON.stringify([...favSet]));
}

function applyTheme() {
  let t = null;
  try { t = localStorage.getItem('webgames297_theme'); } catch(e){}
  if (t === 'dark') {
    document.body.classList.add('dark');
    if (themeToggle) themeToggle.textContent = 'Light mode';
  } else {
    document.body.classList.remove('dark');
    if (themeToggle) themeToggle.textContent = 'Dark mode';
  }
}
applyTheme();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('webgames297_theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  });
}

function filterGames() {
  const q = (search ? search.value : "").toLowerCase();
  const active = document.querySelector('.sidebar a.active');
  const genre = active ? active.dataset.genre : 'all';

  if (genre === 'mostplayed') {
    const sorted = [...games].sort((a, b) => {
      const tA = a.dataset.title || "";
      const tB = b.dataset.title || "";
      return (playCounts[tB] || 0) - (playCounts[tA] || 0);
    });
    const container = document.getElementById('gamesList');
    container.innerHTML = "";
    sorted.forEach(g => container.appendChild(g));
  }

  games.forEach(g => {
    const title = (g.dataset.title || "").toLowerCase();
    const gen = (g.dataset.genre || "").toLowerCase();
    const isFav = g.dataset.favorite === '1';
    const isNew = g.dataset.new === '1';

    let ok = false;
    if (genre === 'all') ok = true;
    else if (genre === 'favorites') ok = isFav;
    else if (genre === 'new') ok = isNew;
    else if (genre === 'mostplayed') ok = true;
    else ok = gen.includes(genre);

    const okTitle = title.includes(q);
    g.style.display = ok && okTitle ? 'block' : 'none';
  });
}

if (search) search.addEventListener('input', filterGames);

genres.forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  genres.forEach(x => x.classList.remove('active'));
  a.classList.add('active');
  filterGames();
}));

games.forEach(game => {
  const favBtn = game.querySelector('.fav-btn');
  const title = game.dataset.title || "";
  if (favBtn) {
    favBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (game.dataset.favorite === '1') {
        game.dataset.favorite = '0';
        favBtn.classList.remove('fav');
        favSet.delete(title);
      } else {
        game.dataset.favorite = '1';
        favBtn.classList.add('fav');
        favSet.add(title);
      }
      saveFavs();
      filterGames();
    });
  }
});

games.forEach(game => {
  const iframe = game.querySelector('iframe');
  const src = game.dataset.src || "";
  const overlay = game.querySelector('.overlay');
  const loader = game.querySelector('.loader');
  const playButton = game.querySelector('.play-big');

  iframe.dataset.loaded = "0";

  if (playButton) {
    playButton.addEventListener('click', e => {
      e.stopPropagation();
      if (iframe.dataset.loaded === "0") {
        overlay.style.display = "none";
        if (loader) loader.style.display = "block";
        recordPlay(game.dataset.title || "");
        iframe.src = src;
        iframe.dataset.loaded = "1";
      }
    });
  }

  game.addEventListener('click', e => {
    if (e.target.closest('.fav-btn') || e.target.closest('.fullscreen-btn') || e.target.closest('.play-big'))
      return;

    if (iframe.dataset.loaded === "0") {
      overlay.style.display = "none";
      if (loader) loader.style.display = "block";
      recordPlay(game.dataset.title || "");
      iframe.src = src;
      iframe.dataset.loaded = "1";
    }
  });

  iframe.addEventListener('load', () => {
    if (loader) loader.style.display = "none";
    if (overlay) overlay.style.display = "none";
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const game = entry.target;
    const iframe = game.querySelector('iframe');
    const overlay = game.querySelector('.overlay');
    const loader = game.querySelector('.loader');

    if (!entry.isIntersecting && iframe) {
      iframe.src = "";
      iframe.dataset.loaded = "0";
      if (overlay) overlay.style.display = "flex";
      if (loader) loader.style.display = "none";
    }
  });
});

games.forEach(g => observer.observe(g));

document.querySelectorAll('.fullscreen-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const iframe = btn.parentElement.querySelector('iframe');
    if (!iframe) return;
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('webkitallowfullscreen', 'true');
    iframe.setAttribute('mozallowfullscreen', 'true');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
  });
});

genres[0].classList.add('active');
filterGames();
});
