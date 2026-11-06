/* Category bar and hover menu */
[].forEach.call(document.querySelectorAll("#cats nav a"),function(a){a.addEventListener("click",function(e){e.preventDefault();[].forEach.call(document.querySelectorAll("#cats nav a.cur"),function(x){x.classList.remove("cur")});if(a.dataset.s){var q=document.getElementById("hq");q.value=a.dataset.s;document.getElementById("hs").dispatchEvent(new Event("submit",{cancelable:true}));[].forEach.call(document.querySelectorAll("#cats nav a"),function(x){x.classList.remove("cur");x.removeAttribute("aria-current")});a.classList.add("cur");return}window.TREND=/^\s*Trending/.test(a.textContent);var h=HK[a.dataset.p]||"start";if(NAV.cur()===h)route();else NAV.go(h);window.scrollTo(0,0)})});
(function(){var mm=document.getElementById("mm"),ce=document.getElementById("cats"),mt=null;
function mmClose(){clearTimeout(mt);mm.classList.remove("on")}
function mmOpen(p){clearTimeout(mt);var g=SUB[p];if(!g){mmClose();return}
 mm.innerHTML='<div class="mi"><div class="mh"><b>'+p+'</b><a href="/'+HK[p]+'">Browse all '+p+' &rarr;</a></div>'+g.map(function(c){return '<div><h4>'+c[0]+'</h4>'+c[1].map(function(i){return '<a href="/'+HK[p]+"-"+i[1]+'">'+i[0]+'</a>'}).join("")+'</div>'}).join("")+'</div>';
 mm.classList.add("on")}
/* categories that have no sub categories yet (E-commerce, Gaming ...) open the same wide box with "Coming soon" */
function mmSoon(a){clearTimeout(mt);
 mm.innerHTML='<div class="mi"><div class="mh"><b>'+a.textContent.trim()+'</b><p>Coming soon. Sellers, contact us to list your accounts here.</p><a href="/sell">Become a seller &rarr;</a></div></div>';
 mm.classList.add("on")}
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
