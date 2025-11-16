document.addEventListener('DOMContentLoaded',()=>{

const search=document.getElementById('searchBar');
const games=[...document.querySelectorAll('.game')];
const genres=[...document.querySelectorAll('.sidebar a')];

function filter(){
const q=search.value.toLowerCase();
const active=document.querySelector('.sidebar a.active');
const g=active?active.dataset.genre:'all';
games.forEach(x=>{
const t=x.dataset.title.toLowerCase();
const gen=(x.dataset.genre||'').toLowerCase();
const okT=t.includes(q);
const okG=g==='all'||gen.includes(g);
x.style.display=okT&&okG?'block':'none';
});
}
search.addEventListener('input',filter);

genres.forEach(a=>a.addEventListener('click',e=>{
e.preventDefault();
genres.forEach(x=>x.classList.remove('active'));
a.classList.add('active');
filter();
}));


games.forEach(game=>{
const iframe=game.querySelector('iframe');
const src=game.dataset.src;
iframe.setAttribute('data-loaded','0');

game.addEventListener('click',e=>{
if(e.target.classList.contains('fullscreen-btn'))return;
if(iframe.getAttribute('data-loaded')==='0'){
iframe.src=src;
iframe.setAttribute('data-loaded','1');
}
});
});


const observer=new IntersectionObserver(entries=>{
entries.forEach(entry=>{
const game=entry.target;
const iframe=game.querySelector('iframe');
if(!entry.isIntersecting){
iframe.src="";
iframe.setAttribute('data-loaded','0');
}
});
},{threshold:0});

games.forEach(g=>observer.observe(g));

// fullscreen
document.querySelectorAll('.fullscreen-btn').forEach(btn=>{
btn.addEventListener('click',()=>{
const iframe=btn.parentElement.querySelector('iframe');
iframe.setAttribute("allowfullscreen","true");
iframe.setAttribute("webkitallowfullscreen","true");
iframe.setAttribute("mozallowfullscreen","true");
if(iframe.requestFullscreen)iframe.requestFullscreen();
});
});

genres[0].classList.add('active');
filter();
});
