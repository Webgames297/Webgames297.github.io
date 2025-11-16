document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.getElementById('searchBar');
  const games = Array.from(document.querySelectorAll('.game'));
  const genreLinks = Array.from(document.querySelectorAll('aside a'));
  const themeBtn = document.getElementById('themeBtn');
  const body = document.body;

  let themeIndex = 0;
  const themes = ['auto', 'dark', 'light', 'blue', 'green'];

  themeBtn.addEventListener('click', () => {
    themeIndex = (themeIndex + 1) % themes.length;
    body.setAttribute('data-theme', themes[themeIndex]);
  });

  searchBar.addEventListener('input', () => {
    const q = searchBar.value.toLowerCase();
    games.forEach(g => {
      const title = g.dataset.title.toLowerCase();
      const matches = title.includes(q);
      const visibleGenre = !g.classList.contains('genre-hidden');
      g.classList.toggle('hidden', !(matches && visibleGenre));
    });
  });

  genreLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const genre = link.dataset.genre;
      games.forEach(g => {
        if (genre === 'all' || g.dataset.genre.includes(genre))
          g.classList.remove('genre-hidden');
        else
          g.classList.add('genre-hidden');
      });
      searchBar.dispatchEvent(new Event('input'));
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const game = entry.target;
      const iframe = game.querySelector('iframe');
      if (entry.isIntersecting) {
        if (!iframe.src) iframe.src = game.dataset.src;
      } else {
        iframe.removeAttribute('src');
      }
    });
  }, { threshold: 0.2 });

  games.forEach(g => observer.observe(g));

  document.querySelectorAll('.fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const iframe = e.target.closest('.game').querySelector('iframe');
      if (iframe.requestFullscreen) iframe.requestFullscreen();
    });
  });
});
