document.addEventListener('DOMContentLoaded',()=>{
const s=document.getElementById('searchBar');
const games=[...document.querySelectorAll('.game')];
const genres=[...document.querySelectorAll('.sidebar a')];

function filter(){
const q=s.value.toLowerCase();
const active=document.querySelector('.sidebar a.active');
const g=active?active.dataset.genre:'all';
games.forEach(x=>{
const title=x.dataset.title.toLowerCase();
const gen=(x.dataset.genre||'').toLowerCase();
const okTitle=title.includes(q);
const okGenre=g==='all'||gen.includes(g);
x.style.display=okTitle&&okGenre?'block':'none';
});
}

s.addEventListener('input',filter);

genres.forEach(a=>a.addEventListener('click',e=>{
e.preventDefault();
genres.forEach(x=>x.classList.remove('active'));
a.classList.add('active');
filter();
}));

document.querySelectorAll('.fullscreen-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
const iframe=btn.parentElement.querySelector('iframe');
if(iframe.requestFullscreen)iframe.requestFullscreen();
else if(iframe.webkitRequestFullscreen)iframe.webkitRequestFullscreen();
else if(iframe.msRequestFullscreen)iframe.msRequestFullscreen();
});
});

games.forEach(game=>{
const iframe=game.querySelector('iframe');
const src=game.dataset.src;
iframe.src="";
game.addEventListener('click',()=>{
if(!iframe.src)iframe.src=src;
});
});

const observer=new IntersectionObserver(entries=>{
entries.forEach(entry=>{
const game=entry.target;
const iframe=game.querySelector('iframe');
const src=game.dataset.src;
if(!entry.isIntersecting)iframe.src="";
});
},{threshold:0});

games.forEach(x=>observer.observe(x));

genres[0].classList.add('active');
filter();
});
