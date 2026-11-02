/* Page switching (router) */
R.forEach(function(n){
  var d=document.createElement("div");d.className="page";document.getElementById("app").appendChild(d);
  var sr=d.attachShadow({mode:"open"});sr.appendChild(document.getElementById("t-"+n).content.cloneNode(true));
  pages[n]=d;roots[n]=sr;
  sr.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
    if(a.dataset.p){e.preventDefault();return}var h=a.getAttribute("href").slice(1);if(h==="home")h="start";e.preventDefault();
    if(R.indexOf(h)>-1){if(location.hash.slice(1)===h)window.scrollTo(0,0);else location.hash=h;return}
    var el=h&&sr.querySelector("#"+h);if(el)el.scrollIntoView({behavior:"smooth"});else window.scrollTo(0,0);
  });
  init[n](sr);
});
function route(){
  var raw=location.hash.slice(1),PM=PMAP,pf=PM[raw]?PM[raw][0]:null,pt=PM[raw]?PM[raw][2]:null;var n=pf?"start":raw;if(n==="home")n="start";if(R.indexOf(n)<0)n=U?"start":"landing";if(U&&n==="landing")n="start";
  if(!U&&(n==="order"||n==="dash"||n==="verify"||n==="messages")){window.GO=n;n="login"}else if(!U&&n==="login"&&!window.GO)window.GO=null;if(!U&&(n==="order"||n==="dash"||n==="verify"||n==="messages"))n="login";else if(U&&n==="login")n="start";
  if(!(pf&&n==="start")&&location.hash.slice(1)!==n)history.replaceState(null,"","#"+n);
  R.forEach(function(r){pages[r].classList.toggle("on",r===n)});
  [].forEach.call(document.querySelectorAll("#bar a[data-r]"),function(a){if(a.dataset.r===n)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  document.title=T[n];if(n==="dash"&&window.renderDash)renderDash();if(n==="verify"&&window.renderVerify)renderVerify();if(n==="saved"&&window.renderSaved)renderSaved();if(n==="messages"&&window.renderMessages)renderMessages();if(n==="start"&&window.renderStart)renderStart();if(n==="start"&&window.setPlat)window.setPlat(pf||"All",pt);
  [].forEach.call(document.querySelectorAll("#cats nav a"),function(x){if(n==="start"&&x.dataset.p===(pf||"All"))x.setAttribute("aria-current","true");else x.removeAttribute("aria-current")});
  if(lastN!==n)window.scrollTo(0,0);if(pf&&lastN!=="start"){var gg=roots.start.querySelector("#grid");if(gg)gg.scrollIntoView()}lastN=n;
  
}
