/* Browse page: account list, filters and sub categories */
init.start=function(root){var $=function(i){return root.querySelector("#"+i)};

var LOGO={
YouTube:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#f00"/><path d="M10 8.7l5.4 3.3-5.4 3.3z" fill="#fff"/></svg>',
Instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="ig2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".35" stop-color="#fa7e1e"/><stop offset=".65" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig2)"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="#fff"/></svg>',
TikTok:'<svg viewBox="0 0 24 24" aria-hidden="true"><g id="tn2"><path d="M16.5 3c.3 2.3 1.7 3.8 4 4v3.2c-1.5 0-2.9-.5-4-1.3V15a6 6 0 1 1-6-6v3.3a2.8 2.8 0 1 0 2.8 2.7V3z"/></g><use href="#tn2" fill="#25f4ee" transform="translate(-.9 .7)"/><use href="#tn2" fill="#fe2c55" transform="translate(.9 -.7)"/><use href="#tn2" fill="#000"/></svg>',
Facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877f2"/><path d="M13.2 21v-7.3h2.4l.4-2.9h-2.8V9c0-.8.3-1.4 1.4-1.4H16V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H7.7v2.9h2.4V21z" fill="#fff"/></svg>',
Gaming:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="3" width="22" height="18" rx="5" fill="#2e9e5b"/><path d="M8 8.5h8a4 4 0 0 1 3.9 4.9l-.4 1.9a1.9 1.9 0 0 1-3.2.9L14.7 14.8H9.3l-1.6 1.4a1.9 1.9 0 0 1-3.2-.9l-.4-1.9A4 4 0 0 1 8 8.5z" fill="#fff"/><path d="M8.4 10.6v2.6M7.1 11.9h2.6" stroke="#2e9e5b" stroke-width="1.1" stroke-linecap="round"/><circle cx="15.6" cy="11" r=".9" fill="#2e9e5b"/><circle cx="17.3" cy="12.7" r=".9" fill="#2e9e5b"/></svg>',
All:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>'};
var PL={YouTube:"#d33a2f",Instagram:"#c13584",TikTok:"#2a2a33",Facebook:"#2f6fd0",Gaming:"#2e7d4f"};
var NOUN={YouTube:"channel",Instagram:"page",TikTok:"account",Facebook:"page",Gaming:"account"};
var D=[];

var plat="All",tagF=null,q="";
var chips=$("chips"),subsEl=$("subs"),exhEl=$("exh"),grid=$("grid"),sortEl=$("sort"),pv=$("pv"),nx=$("nx");
["All","YouTube","Instagram","TikTok","Facebook","Gaming"].forEach(function(p){
  var b=document.createElement("button");b.type="button";b.className="chip";
  b.innerHTML='<span class="lg">'+LOGO[p]+'</span>'+(p==="All"?"All platforms":p);
  b.setAttribute("aria-pressed",p==="All");
  b.dataset.p=p;b.onclick=function(){var h=HK[p]||"start";if(NAV.cur()===h)setPlat(p);else NAV.go(h)};
  chips.appendChild(b);
});
function setPlat(p,t){plat=p;tagF=t||null;[].forEach.call(chips.children,function(c){c.setAttribute("aria-pressed",c.dataset.p===p)});
  var g=SUB[p]||[];subsEl.innerHTML=g.map(function(grp){return grp[1].map(function(i){return '<button type="button" class="sub" data-h="'+HK[p]+"-"+i[1]+'" aria-pressed="'+(i[1]===tagF)+'">'+i[0]+'</button>'}).join("")}).join("");
  exhEl.textContent=tagF?p+" \u00b7 "+subLabel(p,tagF):"Explore popular categories on socialmarket";
  render();grid.scrollLeft=0}window.setPlat=setPlat;subsEl.addEventListener("click",function(e){var b=e.target.closest(".sub");if(!b)return;var h=b.dataset.h;if(NAV.cur()===h){setPlat(plat,null);NAV.go(HK[plat])}else NAV.go(h)});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function arrows(){pv.disabled=grid.scrollLeft<=4;nx.disabled=grid.scrollLeft+grid.clientWidth>=grid.scrollWidth-4}
function render(){
  var list=D.filter(function(d){return (plat==="All"||d[0]===plat)&&(!tagF||(d[10]||[]).indexOf(tagF)>-1)&&(!q||(d[0]+" "+d[1]+" "+d[2]).toLowerCase().indexOf(q)>-1)});
  if(!list.length){grid.innerHTML='<p class="xe">'+(q?"No accounts match your search. Try another platform or niche.":"No accounts available")+'</p>';arrows();return}
  grid.innerHTML=list.map(function(d){
    var k=D.indexOf(d),on=SV.indexOf(d[2])>-1;
    return '<article class="xc" data-k="'+k+'"><a href="/account"><div class="xm" style="--c:'+PL[d[0]]+'"><span class="lg">'+LOGO[d[0]]+'</span><div class="st"><b>'+d[5]+'</b><span>'+esc(d[6])+'</span></div>'+(d[9]?'<span class="vb">✓ Verified</span>':'')+'</div>'+
    '<div class="xi"><small>'+esc(d[0])+' · '+esc(d[1])+'</small><h3>'+esc(d[2])+'</h3><div class="pr"><span>From </span>$'+d[8].toLocaleString("en-US")+'</div></div></a>'+
    '<button type="button" class="xh" data-k="'+k+'" aria-pressed="'+on+'" aria-label="Save this account">'+(on?"♥":"♡")+'</button></article>';
  }).join("");
  arrows();
}
grid.addEventListener("click",function(e){var c=e.target.closest(".xc");if(c&&!e.target.closest(".xh"))window.SEL=D[+c.dataset.k];var h=e.target.closest(".xh");if(h){e.preventDefault();toggleSave(D[+h.dataset.k][2]);var on=SV.indexOf(D[+h.dataset.k][2])>-1;h.setAttribute("aria-pressed",on);h.textContent=on?"♥":"♡"}});
grid.addEventListener("scroll",arrows,{passive:true});
pv.onclick=function(){grid.scrollBy({left:-grid.clientWidth*.8,behavior:"smooth"})};
nx.onclick=function(){grid.scrollBy({left:grid.clientWidth*.8,behavior:"smooth"})};
function welcome(){var t=$("wb"),x=$("hero");if(!t||!x)return;var n=U&&U.name&&U.name!=="Google user"?String(U.name).split(" ")[0]:"";t.textContent=U?"Welcome back"+(n?", "+n:""):"Buy and sell social media accounts safely";x.classList.add("wb")}
function seller(){var a=$("spx"),t=$("spt"),d=$("spd");if(!a)return;var old=a.querySelector(".pg");if(old)old.remove();
 var n=!U||!U.kyc?1:U.kyc==="pending"?2:3;
 t.textContent=n+" of 3 steps done";
 d.textContent=n===1?"Next: verify your identity to start selling.":n===2?"Identity in review. You can already list an account.":"You are ready to sell. List your next account.";
 a.setAttribute("href",n===1?"#verify":"#sell");
 t.parentNode.insertAdjacentHTML("beforeend",'<div class="pg" aria-hidden="true"><i style="width:'+Math.round(n/3*100)+'%"></i></div>');
 t.parentNode.appendChild(d)}
/* Typing the first letters of a platform (i, ins, y, yo, you, t, f, g ...) opens that platform */
function findPlat(t){if(!t)return null;var r=null;["YouTube","Instagram","TikTok","Facebook","Gaming"].forEach(function(p){var l=p.toLowerCase();if(!r&&(l.indexOf(t)===0||t.indexOf(l)===0))r=p});return r}
$("fq").onsubmit=function(e){e.preventDefault();var t=$("fi").value.trim().toLowerCase(),hp=findPlat(t);
 if(hp){q="";var h=HK[hp];if(NAV.cur()===h)setPlat(hp);else NAV.go(h);$("browse").scrollIntoView({behavior:"smooth",block:"start"});return}
 q=t;render();$("browse").scrollIntoView({behavior:"smooth",block:"start"})};
$("sa").onclick=function(){q="";$("fi").value="";if(NAV.cur()==="start")setPlat("All");else NAV.go("start")};
window.addEventListener("resize",arrows);
SM.listings().then(function(rows){rows.forEach(function(r){var u=r.platform==="YouTube"?"subscribers":r.platform==="Gaming"?"items":"followers";
 D.unshift([r.platform,r.niche,r.title,r.seller_name||"Seller",r.followers,SM.short(r.followers),u,Number(r.income)||0,Number(r.price),r.seller_verified?1:0,[],r.description||"",r.shots||[],r.id])});render()});
window.SMD=D;window.renderStart=function(){welcome();seller();render()};render();welcome();seller();

};
