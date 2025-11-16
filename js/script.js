document.addEventListener('DOMContentLoaded',()=>{
  const search=document.getElementById('searchBar');
  const games=[...document.querySelectorAll('.game')];
  const genres=[...document.querySelectorAll('.sidebar a')];
  const themeToggle=document.getElementById('themeToggle');

  let favSet=new Set();
  try{
    const saved=localStorage.getItem('webgames297_favs');
    if(saved)favSet=new Set(JSON.parse(saved));
  }catch(e){}

  games.forEach(g=>{
    const title=g.dataset.title||"";
    const favBtn=g.querySelector('.fav-btn');
    if(favSet.has(title) && favBtn){
      g.dataset.favorite='1';
      favBtn.classList.add('fav');
    }
  });

  function saveFavs(){
    try{localStorage.setItem('webgames297_favs',JSON.stringify([...favSet]));}catch(e){}
  }

  function applyTheme(){
    let t=null;
    try{t=localStorage.getItem('webgames297_theme');}catch(e){}
    if(t==='dark'){
      document.body.classList.add('dark');
      if(themeToggle)themeToggle.textContent='Light mode';
    }else{
      document.body.classList.remove('dark');
      if(themeToggle)themeToggle.textContent='Dark mode';
    }
  }
  applyTheme();

  if(themeToggle){
    themeToggle.addEventListener('click',()=>{
      const isDark=document.body.classList.toggle('dark');
      try{localStorage.setItem('webgames297_theme',isDark?'dark':'light');}catch(e){}
      themeToggle.textContent=isDark?'Light mode':'Dark mode';
    });
  }

  function filter(){
    const q=(search?search.value:"").toLowerCase();
    const active=document.querySelector('.sidebar a.active');
    const genre=active?active.dataset.genre:'all';
    games.forEach(g=>{
      const title=(g.dataset.title||"").toLowerCase();
      const gen=(g.dataset.genre||"").toLowerCase();
      const isFav=g.dataset.favorite==='1';
      const isNew=g.dataset.new==='1';
      let okGenre=false;
      if(genre==='all') okGenre=true;
      else if(genre==='favorites') okGenre=isFav;
      else if(genre==='new') okGenre=isNew;
      else okGenre=gen.includes(genre);
      const okTitle=title.includes(q);
      g.style.display=okTitle&&okGenre?'block':'none';
    });
  }

  if(search){
    search.addEventListener('input',filter);
  }

  genres.forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    genres.forEach(x=>x.classList.remove('active'));
    a.classList.add('active');
    filter();
  }));

  games.forEach(game=>{
    const favBtn=game.querySelector('.fav-btn');
    const title=game.dataset.title||"";
    if(favBtn){
      favBtn.addEventListener('click',e=>{
        e.stopPropagation();
        if(game.dataset.favorite==='1'){
          game.dataset.favorite='0';
          favBtn.classList.remove('fav');
          favSet.delete(title);
        }else{
          game.dataset.favorite='1';
          favBtn.classList.add('fav');
          favSet.add(title);
        }
        saveFavs();
        filter();
      });
    }
  });

  games.forEach(game=>{
    const iframe=game.querySelector('iframe');
    const src=game.dataset.src||"";
    const loader=game.querySelector('.loader');
    const playOverlay=game.querySelector('.play-overlay');
    if(iframe)iframe.dataset.loaded='0';

    game.addEventListener('click',e=>{
      const target=e.target;
      if(target.closest('.fav-btn') || target.closest('.fullscreen-btn')) return;
      if(!iframe || !src) return;
      if(iframe.dataset.loaded==='0'){
        if(loader)loader.style.display='block';
        if(playOverlay)playOverlay.style.display='none';
        iframe.src=src;
        iframe.dataset.loaded='1';
      }
    });

    if(iframe){
      iframe.addEventListener('load',()=>{
        if(loader && iframe.src) loader.style.display='none';
      });
    }
  });

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const game=entry.target;
      const iframe=game.querySelector('iframe');
      const loader=game.querySelector('.loader');
      const overlay=game.querySelector('.play-overlay');
      if(!entry.isIntersecting && iframe){
        iframe.src='';
        iframe.dataset.loaded='0';
        if(loader)loader.style.display='none';
        if(overlay)overlay.style.display='flex';
      }
    });
  },{threshold:0});

  games.forEach(g=>observer.observe(g));

  document.querySelectorAll('.fullscreen-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const iframe=btn.closest('.game').querySelector('iframe');
      if(!iframe)return;
      iframe.setAttribute('allowfullscreen','true');
      iframe.setAttribute('webkitallowfullscreen','true');
      iframe.setAttribute('mozallowfullscreen','true');
      if(iframe.requestFullscreen)iframe.requestFullscreen();
      else if(iframe.webkitRequestFullscreen)iframe.webkitRequestFullscreen();
      else if(iframe.msRequestFullscreen)iframe.msRequestFullscreen();
    });
  });

  if(genres.length>0)genres[0].classList.add('active');
  filter();
});
