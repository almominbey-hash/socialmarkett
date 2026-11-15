/* Category bar and hover menu */
(function(){var n=document.querySelector("#cats nav");if(!n||n.querySelector('a[data-p="X"]'))return;var a=document.createElement("a");a.href="/x";a.dataset.p="X";a.textContent="X (Twitter)";var e=n.querySelector("a[data-s]");if(e)n.insertBefore(a,e);else n.appendChild(a)})();
[].forEach.call(document.querySelectorAll("#cats nav a"),function(a){a.addEventListener("click",function(e){e.preventDefault();[].forEach.call(document.querySelectorAll("#cats nav a.cur"),function(x){x.classList.remove("cur")});if(a.dataset.s){var q=document.getElementById("hq");q.value=a.dataset.s;document.getElementById("hs").dispatchEvent(new Event("submit",{cancelable:true}));[].forEach.call(document.querySelectorAll("#cats nav a"),function(x){x.classList.remove("cur");x.removeAttribute("aria-current")});a.classList.add("cur");return}window.TREND=/^\s*Trending/.test(a.textContent);var h=HK[a.dataset.p]||"start";if(NAV.cur()===h)route();else NAV.go(h);window.scrollTo(0,0)})});
(function(){var mm=document.getElementById("mm"),ce=document.getElementById("cats"),mt=null;
function mmClose(){clearTimeout(mt);mm.classList.remove("on")}
/* All menus sit on top of each other in one box, so every menu is exactly as tall as the tallest one. Only the chosen one is visible. */
function mmBuild(){if(mm.dataset.b)return;var h="";
 Object.keys(SUB).forEach(function(p){var g=SUB[p],cols=[],au=null;
  g.forEach(function(c){if(AUD.indexOf(c)>-1){if(!au){au=[];cols.push(au)}au.push(c)}else cols.push([c])}); /* Premium audience and Local audience share one column */
  h+='<div class="mp" data-p="'+p+'"><div class="mh"><b>'+p+'</b><a href="/'+HK[p]+'">Browse all '+p+' &rarr;</a></div>'+cols.map(function(col){return '<div>'+col.map(function(c){return '<h4>'+c[0]+'</h4>'+c[1].map(function(i){return '<a href="/'+HK[p]+"-"+i[1]+'">'+i[0]+'</a>'}).join("")}).join("")+'</div>'}).join("")+'</div>'});
 [].forEach.call(document.querySelectorAll("#cats nav a[data-s]"),function(a){var n=a.textContent.trim();h+='<div class="mp" data-s="'+n+'"><div class="mh"><b>'+n+'</b><p>Coming soon. Sellers, contact us to list your accounts here.</p><a href="/sell">Become a seller &rarr;</a></div></div>'});
 mm.innerHTML='<div class="mi">'+h+'</div>';mm.dataset.b="1"}
function mmShow(attr,v){clearTimeout(mt);mmBuild();[].forEach.call(mm.querySelectorAll(".mp"),function(x){x.classList.toggle("act",x.getAttribute(attr)===v)});mm.classList.add("on")}
function mmOpen(p){var g=SUB[p];if(!g){mmClose();return}mmShow("data-p",p)}
/* categories that have no sub categories yet (E-commerce, Gaming ...) open the same wide box with "Coming soon" */
/* Gaming / E-commerce / Websites / AdSense stay "Coming soon" until a seller lists an account there. Then "Coming soon" goes by itself and the categories sellers really used appear. If anything goes wrong it just stays "Coming soon". */
var SOON=null;
function soonData(){if(!SOON)SOON=(typeof SM!=="undefined"&&SM.listings?SM.listings():Promise.resolve([])).then(function(rows){var m={};(rows||[]).forEach(function(r){var p=r.platform;if(!p)return;var o=m[p]||(m[p]={n:0,t:{}});o.n++;(r.tags||[]).forEach(function(t){o.t[t]=1})});return m},function(){return{}});return SOON}
function soonFill(a){try{var tx=a.textContent.trim(),p=a.dataset.s||tx,pn=mm.querySelector('.mp[data-s="'+tx+'"]');if(!pn||pn.dataset.live)return;
 soonData().then(function(m){var o=m&&m[p],g=(typeof EXTRA_SUB!=="undefined"&&EXTRA_SUB[p])||[],h=(typeof HK!=="undefined"&&HK[p])||"";if(!o||!o.n||!h||pn.dataset.live)return;
  var cols=g.map(function(c){var it=c[1].filter(function(i){return o.t[i[1]]});if(!it.length)return"";return '<div><h4>'+c[0]+'</h4>'+it.map(function(i){return '<a href="/'+h+"-"+i[1]+'">'+i[0]+'</a>'}).join("")+'</div>'}).join("");
  pn.innerHTML='<div class="mh"><b>'+p+'</b><a href="/'+h+'">Browse all '+p+' &rarr;</a></div>'+cols;pn.dataset.live="1"}).catch(function(){})}catch(e){}}
function mmSoon(a){mmShow("data-s",a.textContent.trim());soonFill(a)}
[].forEach.call(document.querySelectorAll("#cats nav a"),function(a){var p=a.dataset.p;
 a.addEventListener("mouseenter",function(){if(!window.matchMedia("(hover:hover)").matches){mmClose();return}if(SUB[p])mmOpen(p);else if(a.dataset.s)mmSoon(a);else mmClose()});
 a.addEventListener("focus",function(){if(SUB[p])mmOpen(p);else if(a.dataset.s)mmSoon(a);else mmClose()})});
ce.addEventListener("mouseleave",function(){mt=setTimeout(mmClose,180)});
ce.addEventListener("mouseenter",function(){clearTimeout(mt)});
mm.addEventListener("click",function(e){if(e.target.closest("a"))mmClose()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")mmClose()});
window.addEventListener("navchange",mmClose)})();

/* Small arrow at the right end of the category bar: shows when more items are hidden, scrolls the row */
(function(){var ce=document.getElementById("cats"),nv=ce&&ce.querySelector("nav");if(!nv)return;
var b=document.createElement("button");b.type="button";b.className="nxt";b.setAttribute("aria-label","Show more categories");b.innerHTML="&rsaquo;";ce.appendChild(b);
function u(){b.hidden=nv.scrollLeft+nv.clientWidth>=nv.scrollWidth-4}
b.addEventListener("click",function(){nv.scrollBy({left:240,behavior:"smooth"})});
nv.addEventListener("scroll",u,{passive:true});window.addEventListener("resize",u);setTimeout(u,300);u()})();
