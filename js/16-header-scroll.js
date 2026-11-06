/* Category bar show and hide while scrolling */
(function(){var c=document.getElementById('cats'),bar=document.getElementById('bar');if(!c||!bar)return;
function u(){
 var pg=document.querySelector('#app .page.on'),sr=pg&&pg.shadowRoot,landing=sr&&sr.querySelector('#tiles'),hero=sr&&sr.querySelector('section.hero');
 bar.style.position=landing?'':'relative';document.body.classList.toggle('on-landing',!!landing);
 var y=window.pageYOffset||document.documentElement.scrollTop,cur=c.classList.contains('show');
 if(!sr){c.classList.remove('show');return} /* page not ready yet (just after refresh): keep the row hidden */
if(sr&&(sr.querySelector('#gg')||(!landing&&!sr.querySelector('#browse')))){ /* login page and every page except the landing page and the Welcome back page: no category row */
  bar.classList.remove('rs');c.classList.remove('static');c.classList.remove('show');return}
 if(!landing){ /* signed-in page and other pages: row visible at the top, disappears on the first little scroll */
  bar.classList.toggle('rs',!(sr&&sr.querySelector('#browse')));c.classList.remove('static'); /* start page: the row sits over the top of the page, so nothing is left empty when it hides */
  var sh=cur?y<=8:y<=2;c.classList.toggle('show',sh);return}
 bar.classList.remove('rs');c.classList.remove('static');
 var show;
 if(hero){show=hero.getBoundingClientRect().bottom<=bar.getBoundingClientRect().height} /* landing: only after the blue box ends */
 else{show=cur?y>=20:y>80}
 if(show!==cur)c.classList.toggle('show',show)
}
window.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);window.addEventListener('hashchange',function(){setTimeout(u,50)});u();setTimeout(u,300);
new MutationObserver(function(){u()}).observe(document.getElementById('app'),{attributes:true,attributeFilter:['class'],subtree:true});})();
