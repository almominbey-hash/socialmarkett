/* Category bar and hover menu */
[].forEach.call(document.querySelectorAll("#cats nav a"),function(a){a.addEventListener("click",function(e){e.preventDefault();if(a.dataset.s){var q=document.getElementById("hq");q.value=a.dataset.s;document.getElementById("hs").dispatchEvent(new Event("submit",{cancelable:true}));return}window.TREND=/^\s*Trending/.test(a.textContent);var h=HK[a.dataset.p]||"start";if(NAV.cur()===h){route();var g=roots.start.querySelector("#grid");if(g)g.scrollIntoView()}else NAV.go(h)})});
(function(){var mm=document.getElementById("mm"),ce=document.getElementById("cats"),mt=null;
function mmClose(){clearTimeout(mt);mm.classList.remove("on")}
function mmOpen(p){clearTimeout(mt);var g=SUB[p];if(!g){mmClose();return}
 mm.innerHTML='<div class="mi"><div class="mh"><b>'+p+'</b><a href="/'+HK[p]+'">Browse all '+p+' &rarr;</a></div>'+g.map(function(c){return '<div><h4>'+c[0]+'</h4>'+c[1].map(function(i){return '<a href="/'+HK[p]+"-"+i[1]+'">'+i[0]+'</a>'}).join("")+'</div>'}).join("")+'</div>';
 mm.classList.add("on")}
[].forEach.call(document.querySelectorAll("#cats nav a"),function(a){var p=a.dataset.p;
 a.addEventListener("mouseenter",function(){if(SUB[p]&&window.matchMedia("(hover:hover)").matches)mmOpen(p);else mmClose()});
 a.addEventListener("focus",function(){if(SUB[p])mmOpen(p);else mmClose()})});
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
