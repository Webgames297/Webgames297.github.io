document.addEventListener('DOMContentLoaded',()=>{
  const searchBar=document.getElementById('searchBar');
  const games=[...document.querySelectorAll('.game')];
  searchBar.addEventListener('input',()=>{
    const q=searchBar.value.toLowerCase();
    games.forEach(g=>{
      g.style.display=g.dataset.title.toLowerCase().includes(q)?'block':'none';
    });
  });
});
