/* Category bar show and hide while scrolling */
(function(){var c=document.getElementById('cats'),bar=document.getElementById('bar');if(!c||!bar)return;
function u(){
 var pg=document.querySelector('#app .page.on'),sr=pg&&pg.shadowRoot,landing=sr&&sr.querySelector('#tiles'),hero=sr&&sr.querySelector('section.hero');
 bar.style.position=landing?'':'relative';
 var y=window.pageYOffset||document.documentElement.scrollTop,cur=c.classList.contains('show');
 if(sr&&sr.querySelector('#gg')){ /* login / sign-in page: no category row */
  bar.classList.remove('rs');c.classList.remove('static');c.classList.remove('show');return}
 if(!landing){ /* signed-in page and other pages: row visible at the top, disappears on the first little scroll */
  bar.classList.add('rs');c.classList.remove('static');
  var sh=cur?y<=8:y<=2;c.classList.toggle('show',sh);return}
 bar.classList.remove('rs');c.classList.remove('static');
 var show;
 if(hero){show=hero.getBoundingClientRect().bottom<=bar.getBoundingClientRect().height} /* landing: only after the blue box ends */
 else{show=cur?y>=20:y>80}
 if(show!==cur)c.classList.toggle('show',show)
}
window.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);window.addEventListener('hashchange',function(){setTimeout(u,50)});u();setTimeout(u,300);})();
