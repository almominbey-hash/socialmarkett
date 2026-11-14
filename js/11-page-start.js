/* Browse page: account list, filters and sub categories */
init.start=function(root){var $=function(i){return root.querySelector("#"+i)};

var LOGO={
YouTube:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#f00"/><path d="M10 8.7l5.4 3.3-5.4 3.3z" fill="#fff"/></svg>',
Instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="ig2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".35" stop-color="#fa7e1e"/><stop offset=".65" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig2)"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="#fff"/></svg>',
TikTok:'<svg viewBox="0 0 24 24" aria-hidden="true"><g id="tn2"><path d="M16.5 3c.3 2.3 1.7 3.8 4 4v3.2c-1.5 0-2.9-.5-4-1.3V15a6 6 0 1 1-6-6v3.3a2.8 2.8 0 1 0 2.8 2.7V3z"/></g><use href="#tn2" fill="#25f4ee" transform="translate(-.9 .7)"/><use href="#tn2" fill="#fe2c55" transform="translate(.9 -.7)"/><use href="#tn2" fill="#000"/></svg>',
X:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#000"/><path d="M7 7l10 10M17 7L7 17" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
Facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877f2"/><path d="M13.2 21v-7.3h2.4l.4-2.9h-2.8V9c0-.8.3-1.4 1.4-1.4H16V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H7.7v2.9h2.4V21z" fill="#fff"/></svg>',
All:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>'};
var PL={YouTube:"#d33a2f",Instagram:"#c13584",TikTok:"#2a2a33",Facebook:"#2f6fd0",X:"#14181f"};
var NOUN={YouTube:"channel",Instagram:"page",TikTok:"account",Facebook:"page",X:"account"};
var D=[],ready=false;

var plat="All",tagF=null,q="";
var F={niche:"",price:"",subs:"",lang:"",mon:"",age:"",sort:"new"},trend=false;
/* Trending score: more saves and more sold by the seller = higher. Verified seller, bigger audience and newer listings add a little. */
function srch(d){var h=0,t=((d[0]||"")+" "+(d[1]||"")+" "+(d[2]||"")).toLowerCase();(window.TS||[]).forEach(function(x){if(x.term&&t.indexOf(x.term)>-1)h+=Math.min(+x.hits||0,10)});return Math.min(h,12)*0.8}
function score(d){var ag=d[18]?(Date.now()-d[18])/864e5:99,nw=ag<14?(14-ag)*0.6:0;return (d[15]||0)*3+(d[16]||0)*5+(d[17]||0)*1+nw+srch(d)+(d[9]?2:0)+Math.log10((d[4]||0)+1)}
var subsEl=$("subs"),exhEl=$("exh"),exsEl=$("exs"),grid=$("grid"),sortEl=$("sort"),pv=$("pv"),nx=$("nx");
var fp=$("fp"),fn=$("fn"),fa=$("fa"),fal=$("fal"),fpmin=$("fpmin"),fpmax=$("fpmax"),fs=$("fs"),fm=$("fm"),fg=$("fg"),fso=$("fso"),fap=$("fap"),frs=$("frs");
var fmod=$("fmod"),fk=$("fk"),fbtn=$("fbtn"),fcn=$("fcn");
var PLS=["YouTube","Instagram","TikTok","Facebook","X"];
var PR=[["","Any price"],["0-25000","Under Rs. 25,000"],["25000-100000","Rs. 25,000 - 100,000"],["100000-250000","Rs. 100,000 - 250,000"],["250000-500000","Rs. 250,000 - 500,000"],["500000-","Rs. 500,000 and above"]];
var SR=[["","Any number"],["0-1000","0 - 1K"],["1000-10000","1K - 10K"],["10000-100000","10K - 100K"],["100000-","100K+"]];
var CT=["United States","United Kingdom","Pakistan"],CTL=[["United States","USA"],["United Kingdom","UK"],["Pakistan","Pakistan"],["Other","Other"]];
var SO=[["new","Newest"],["price","Price: Low to High"],["subs","Followers: High to Low"]];
function opts(list,sel){return list.map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===sel?" selected":"")+'>'+esc(o[1])+'</option>'}).join("")}
fp.innerHTML=opts([["All","All platforms"]].concat(PLS.map(function(p){return[p,p]})),"All");
fs.innerHTML=opts(SR,"");fm.innerHTML=opts([["","Any"]].concat(MON),"");fg.innerHTML=opts([["","Any"]].concat(AGE),"");fso.innerHTML=opts(SO,"new");
function inP(v,r){if(!r)return true;var a=r.split("-"),lo=+a[0]||0,hi=a[1]?+a[1]:Infinity;return v>=lo&&v<=hi}
function setPr(r){var a=(r||"").split("-");fpmin.value=a[0]||"";fpmax.value=a[1]||""}
function getPr(){var a=fpmin.value.trim(),b=fpmax.value.trim();return(a||b)?a+"-"+b:""}
function inR(v,r){if(!r)return true;var a=r.split("-"),lo=+a[0]||0,hi=(a[1]===undefined||a[1]==="")?Infinity:+a[1];return v>=lo&&v<hi}
function uniq(i,p){var m={};D.forEach(function(d){if((p==="All"||d[0]===p)&&d[i])m[d[i]]=1});return Object.keys(m).sort()}
function fillNiche(p,sel){var m={};NICHES.forEach(function(x){m[x]=1});uniq(1,p).forEach(function(x){m[x]=1});var l=Object.keys(m);fn.innerHTML=opts([["","All niches"]].concat(l.map(function(x){return[x,x]})),l.indexOf(sel)>-1?sel:"")}
function fillLang(){fa.hidden=fal.hidden=false;fa.innerHTML=opts([["","Any country"]].concat(CTL),F.lang)}
function pend(){return{plat:fp.value,niche:fn.value,price:getPr(),subs:fs.value,lang:fa.value,mon:fm.value,age:fg.value,sort:fso.value}}
function match(d,o,tag,qq){return (o.plat==="All"||d[0]===o.plat)&&(!o.niche||d[1]===o.niche)&&inP(d[8],o.price)&&inR(d[4],o.subs)&&(!o.lang||(o.lang==="Other"?(!!d[14]&&CT.indexOf(d[14])<0):d[14]===o.lang))&&(!o.mon||d[19]===o.mon)&&(!o.age||d[20]===o.age)&&(!tag||(d[10]||[]).indexOf(tag)>-1)&&(!qq||(d[0]+" "+d[1]+" "+d[2]).toLowerCase().indexOf(qq)>-1)}
function updCount(){var o=pend(),qq=fmod.hidden?q:fk.value.trim().toLowerCase(),n=D.filter(function(d){return match(d,o,o.plat===plat?tagF:null,qq)}).length;fap.textContent="Apply filters \u00b7 "+n+" result"+(n===1?"":"s")}
/* sub category buttons: shorter names (the repeated words are dropped) so they fit in one line */
function shortLbl(l){l=String(l);if(/^Criteria/i.test(l))return"Ready to monetize";if(/^Monetization Criteria/i.test(l))return"Criteria completed";
 var t=l.replace(/\s*\(.*\)\s*$/,"").replace(/^(Fresh|Monetized|Non-Monetized|Aged|Premium|Business|Verified)\s+(YouTube|Instagram|TikTok|Facebook)\s+(Channels|Accounts|Pages)$/i,"$1").replace(/^(YouTube|Instagram|TikTok|Facebook)\s+/i,"").replace(/\s+(Channels|Accounts|Pages|audience)$/i,"").replace(/\s+Enabled$/i,"");
 return t||l}
function setPlat(p,t){trend=!!window.TREND&&p==="All"&&!t;window.TREND=false;plat=p;tagF=t||null;fp.value=p;fillNiche(p,F.niche);if(!fn.value)F.niche="";fn.value=F.niche;setPr(F.price);fs.value=F.subs;fm.value=F.mon;fg.value=F.age;fso.value=F.sort;fa.value=F.lang;
  var g=SUB[p]||[];subsEl.innerHTML=g.length?'<button type="button" class="sub" data-h="'+HK[p]+'" aria-pressed="'+!tagF+'">All kinds</button>'+g.map(function(grp){return grp[1].map(function(i){return '<button type="button" class="sub" title="'+esc(i[0])+'" data-h="'+HK[p]+"-"+i[1]+'" aria-pressed="'+(i[1]===tagF)+'">'+esc(shortLbl(i[0]))+'</button>'}).join("")}).join(""):"";
  exhEl.textContent=trend?"Trending on socialmarket":"An audience worth building on.";
  exsEl.textContent=trend?"The accounts people are viewing, saving and buying the most.":"Featured accounts, ready for their next chapter.";
  render();updCount();grid.scrollLeft=0}window.setPlat=setPlat;
fp.onchange=function(){fillNiche(fp.value,"");updCount()};
[fn,fa,fs,fm,fg,fso].forEach(function(e){e.onchange=updCount});[fpmin,fpmax].forEach(function(e){e.oninput=updCount});
fap.onclick=function(){var o=pend();q=fk.value.trim().toLowerCase();var _fi=$("fi");if(_fi)_fi.value=q;closeF();F.niche=o.niche;F.price=o.price;F.subs=o.subs;F.lang=o.lang;F.mon=o.mon;F.age=o.age;F.sort=o.sort;
  if(o.plat!==plat){var h=HK[o.plat]||"start";if(NAV.cur()===h||(h==="start"&&NAV.cur()===""))setPlat(o.plat);else NAV.go(h)}else{render();updCount()}
  grid.scrollIntoView({behavior:"smooth",block:"nearest"})};
frs.onclick=function(){F={niche:"",price:"",subs:"",lang:"",mon:"",age:"",sort:"new"};q="";fk.value="";closeF();var fi=$("fi");if(fi)fi.value="";fa.value="";if(NAV.cur()==="start"||NAV.cur()==="")setPlat("All");else NAV.go("start")};
function syncF(){fp.value=plat;fillNiche(plat,F.niche);fn.value=F.niche;setPr(F.price);fs.value=F.subs;fm.value=F.mon;fg.value=F.age;fso.value=F.sort;fa.value=F.lang;fk.value=q}
function closeF(){fmod.hidden=true}
fbtn.onclick=function(){syncF();fmod.hidden=false;updCount();fk.focus()};
$("fcl").onclick=closeF;fmod.addEventListener("click",function(e){if(e.target===fmod)closeF()});
fk.oninput=updCount;root.addEventListener("keydown",function(e){if(e.key==="Escape"&&!fmod.hidden)closeF()});
function badge(){var n=(F.niche?1:0)+(F.price?1:0)+(F.subs?1:0)+(F.lang?1:0)+(F.mon?1:0)+(F.age?1:0)+(q?1:0);fcn.hidden=!n;fcn.textContent=n}
subsEl.addEventListener("click",function(e){var b=e.target.closest(".sub");if(!b)return;var h=b.dataset.h;if(NAV.cur()===h){setPlat(plat,null);NAV.go(HK[plat])}else NAV.go(h)});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function arrows(){pv.disabled=grid.scrollLeft<=4;nx.disabled=grid.scrollLeft+grid.clientWidth>=grid.scrollWidth-4}
var GL='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/></svg>';
function card(d,k,on,dm){var im=d[12]&&d[12][0],tag=dm?"div":"a";
  return '<article class="xc'+(dm?' dm':'')+'"'+(dm?'':' data-k="'+k+'"')+'><'+tag+(dm?'':' href="/account"')+'><div class="xm" style="--c:'+PL[d[0]]+'">'+(im?'<img src="'+esc(im)+'" alt="" loading="lazy">':'')+((!dm&&d[12]&&d[12].length>1)?'<button type="button" class="xnv xpv" data-d="-1" aria-label="Previous image">&lsaquo;</button><button type="button" class="xnv xnx" data-d="1" aria-label="Next image">&rsaquo;</button>':'')+
  '<div class="xtop"><span class="xpl" title="'+esc(d[0])+'">'+LOGO[d[0]]+'</span><span class="xn">'+esc(d[1])+'</span></div>'+
  (dm?'<span class="sm">Sample</span>':'')+
  '<div class="xsub"><b>'+d[5]+'</b><span>'+esc(d[6])+'</span></div>'+
  (d[9]?'<span class="xvt" title="Verified"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>':'')+'</div>'+
  '<div class="xi"><h3>'+esc(d[2])+'</h3><div class="xf"><b>Rs. '+d[8].toLocaleString("en-US")+'</b><span class="xa" aria-hidden="true">\u2197</span></div></div></'+tag+'>'+
  '<button type="button" class="xh" data-k="'+k+'" aria-pressed="'+!!on+'" aria-label="Save this account">'+(on?"\u2665":"\u2661")+'</button></article>'}
function render(){badge();
  var list=D.filter(function(d){return match(d,{plat:plat,niche:F.niche,price:F.price,subs:F.subs,lang:F.lang,mon:F.mon,age:F.age},tagF,q)});
  if(trend)list=list.slice().sort(function(x,y){return score(y)-score(x)});
  else if(F.sort==="price")list=list.slice().sort(function(x,y){return x[8]-y[8]});
  else if(F.sort==="subs")list=list.slice().sort(function(x,y){return y[4]-x[4]});
  else list=list.slice().sort(function(x,y){return (y[18]||0)-(x[18]||0)});
  if(!D.length){grid.innerHTML=ready?'<p class="xe">No accounts are listed yet. They will appear here as soon as sellers add them.</p>':"";arrows();return}
  if(!list.length){grid.innerHTML='<p class="xe">No accounts available here yet.</p>';arrows();return}
  grid.innerHTML=list.map(function(d){var k=D.indexOf(d);return card(d,k,SV.indexOf(d[2])>-1,false)}).join("");
  arrows();
}
var gridClick=function(e){var nv=e.target.closest(".xnv");if(nv){e.preventDefault();e.stopPropagation();var cd=nv.closest(".xc"),sh=D[+cd.dataset.k][12],i=((+cd.dataset.i||0)+(+nv.dataset.d)+sh.length)%sh.length;cd.dataset.i=i;var im=cd.querySelector(".xm img");if(!im){im=document.createElement("img");im.alt="";cd.querySelector(".xm").insertBefore(im,cd.querySelector(".xm").firstChild)}im.src=sh[i];return}var c=e.target.closest(".xc");if(c&&c.classList.contains("dm")){e.preventDefault();return}if(c&&!e.target.closest(".xh")){window.SEL=D[+c.dataset.k];track(D[+c.dataset.k])}var h=e.target.closest(".xh");if(h){e.preventDefault();toggleSave(D[+h.dataset.k][2],function(){var on=SV.indexOf(D[+h.dataset.k][2])>-1;h.setAttribute("aria-pressed",on);h.textContent=on?"♥":"♡"})}};
grid.addEventListener("click",gridClick);
var rg=$("recg");if(rg)rg.addEventListener("click",function(e){var c=e.target.closest(".xc");if(c&&!e.target.closest(".xh")){window.SEL=D[+c.dataset.k];track(D[+c.dataset.k])}var h=e.target.closest(".xh");if(h){e.preventDefault();toggleSave(D[+h.dataset.k][2],function(){var on=SV.indexOf(D[+h.dataset.k][2])>-1;h.setAttribute("aria-pressed",on);h.textContent=on?"\u2665":"\u2661"})}});
grid.addEventListener("scroll",arrows,{passive:true});
pv.onclick=function(){grid.scrollBy({left:-grid.clientWidth*.8,behavior:"smooth"})};
nx.onclick=function(){grid.scrollBy({left:grid.clientWidth*.8,behavior:"smooth"})};
/* Recent activity: remembers (in this browser only) what the person searched for and opened */
function rkey(){return "sm_recent_"+(U&&U.id?U.id:"guest")}
function rget(){try{var x=JSON.parse(localStorage.getItem(rkey())||"null");if(x&&x.q&&x.p)return x}catch(e){}return{q:[],p:{},n:{},v:[]}}
function rput(x){try{localStorage.setItem(rkey(),JSON.stringify(x))}catch(e){}}
function bump(d){if(!d||!d[13])return;var k="sm_v_"+d[13];try{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,"1")}catch(e){}try{sb.rpc("bump_listing_view",{listing:d[13]}).then(function(){},function(){})}catch(e){}}
function track(d,term,pl){var x=rget();bump(d);if(term){try{sb.rpc("log_search",{p_term:term}).then(function(){},function(){})}catch(e){}}
 if(term){x.q=x.q.filter(function(t){return t!==term});x.q.unshift(term);x.q=x.q.slice(0,8)}
 if(pl)x.p[pl]=(x.p[pl]||0)+1;
 if(d){x.p[d[0]]=(x.p[d[0]]||0)+1;x.n[d[1]]=(x.n[d[1]]||0)+1;x.v=x.v.filter(function(i){return i!==d[13]});x.v.unshift(d[13]);x.v=x.v.slice(0,12)}
 rput(x)}
function recent(){var el=$("rec"),box=$("recg");if(!el||!box)return;var x=rget();
 if(!D.length){el.hidden=true;return}
 var hist=x.q.length||x.v.length;
 var w=[];x.q.forEach(function(t){t.split(/\s+/).forEach(function(k){if(k.length>2)w.push(k)})});
 var vt={};D.forEach(function(d){if(x.v.indexOf(d[13])>-1)(d[10]||[]).forEach(function(t){vt[d[0]+":"+t]=1})});
 var last=null;D.forEach(function(d){if(x.v[0]&&d[13]===x.v[0])last=d});
 var rh=$("rech"),rs=$("recs");
 if(last){var ti=String(last[2]);if(ti.length>34)ti=ti.slice(0,32)+"...";if(rh)rh.textContent="More "+last[0]+" "+NOUN[last[0]]+"s like \u201c"+ti+"\u201d";if(rs)rs.textContent="You viewed this "+NOUN[last[0]]+" recently. Here are similar ones from other sellers."}
 else{if(rh)rh.textContent="More accounts like the ones you viewed";if(rs)rs.textContent="Because you looked at this kind of account, you may like these too."}
 var sc=D.map(function(d,k){if(last&&d===last)return[0,k];var s=(last&&d[0]===last[0]?6:0)+(x.p[d[0]]||0)*2+(x.n[d[1]]||0)*3+(d[10]||[]).filter(function(t){return vt[d[0]+":"+t]}).length*2,h=(d[0]+" "+d[1]+" "+d[2]).toLowerCase();w.forEach(function(k2){if(h.indexOf(k2)>-1)s+=3});if(x.v.indexOf(d[13])>-1)s+=1;return[s,k]})
  .filter(function(a){return a[0]>0}).sort(function(a,b){return b[0]-a[0]}).slice(0,8);
 if(!hist||!sc.length){sc=D.map(function(d,k){return[score(d),k]}).sort(function(a,b){return b[0]-a[0]}).slice(0,8);if(rh)rh.textContent="Popular on socialmarket";if(rs)rs.textContent="Good accounts from across all platforms."}
 if(!sc.length){el.hidden=true;return}
 box.innerHTML=sc.map(function(a){var d=D[a[1]],k=a[1],on=SV.indexOf(d[2])>-1,im=d[12]&&d[12][0];
  return '<article class="rc xc" data-k="'+k+'"><a href="/account"><div class="rm" style="--c:'+PL[d[0]]+'">'+(im?'<img src="'+esc(im)+'" alt="" loading="lazy">':'<span class="lg">'+LOGO[d[0]]+'</span>')+'</div>'+
  '<div class="rb"><div class="rs"><span class="ra">'+esc(String(d[3]).charAt(0).toUpperCase())+'</span><span class="rn">'+esc(d[3])+'</span><span class="rp">'+esc(d[0])+'</span></div>'+
  '<h3>'+esc(d[2])+'</h3><p class="rt">'+d[5]+' '+esc(d[6])+' \u00b7 '+esc(d[1])+'</p><p class="rf">From Rs. '+d[8].toLocaleString("en-US")+'</p></div></a>'+
  '<button type="button" class="xh" data-k="'+k+'" aria-pressed="'+on+'" aria-label="Save this account">'+(on?"\u2665":"\u2661")+'</button></article>'}).join("");
 el.hidden=false}
function welcome(){var t=$("wb"),x=$("hero");if(!t||!x)return;var n=U&&U.name&&U.name!=="Google user"?String(U.name).split(" ")[0]:"";t.textContent=U?"Welcome back"+(n?", "+n:""):"Buy and sell social media accounts safely";x.classList.add("wb")}
function seller(){var a=$("spx"),t=$("spt"),d=$("spd");if(!a)return;var old=a.querySelector(".pg");if(old)old.remove();
 var n=!U||!U.kyc?1:U.kyc==="pending"?2:3;
 t.textContent=n+" of 3 steps done";
 d.textContent=n===1?"Next: verify your identity to start selling.":n===2?"Identity in review. You can already list an account.":"You are ready to sell. List your next account.";
 a.setAttribute("href",n===1?"#verify":"#sell");
 t.parentNode.insertAdjacentHTML("beforeend",'<div class="pg" aria-hidden="true"><i style="width:'+Math.round(n/3*100)+'%"></i></div>');
 t.parentNode.appendChild(d)}
/* Typing the first letters of a platform (i, ins, y, yo, you, t, f, g ...) opens that platform */
function findPlat(t){if(!t)return null;var r=null;PLS.forEach(function(p){var l=p.toLowerCase();if(!r&&(l.indexOf(t)===0||t.indexOf(l)===0))r=p});return r}
$("fq").onsubmit=function(e){e.preventDefault();var t=$("fi").value.trim().toLowerCase(),hp=findPlat(t);
 if(t)track(null,t,hp);
 if(hp){q="";var h=HK[hp];if(NAV.cur()===h)setPlat(hp);else NAV.go(h);$("browse").scrollIntoView({behavior:"smooth",block:"start"});return}
 q=t;render();$("browse").scrollIntoView({behavior:"smooth",block:"start"})};
$("sa").onclick=function(){q="";$("fi").value="";if(NAV.cur()==="start")setPlat("All");else NAV.go("start")};
window.addEventListener("resize",arrows);
SM.trending=function(){return sb.from("trending_scores").select("*").then(function(r){return r.data||[]},function(){return[]})};
try{sb.rpc("top_searches").then(function(r){window.TS=r.data||[];if(trend)render()},function(){})}catch(e){}
Promise.all([SM.listings(),SM.trending()]).then(function(res){var rows=res[0],tr={};res[1].forEach(function(t){tr[t.listing_id]=t});window.SMT=tr;rows.forEach(function(r){var t=tr[r.id]||{};r._s=Number(t.saves)||0;r._o=Number(t.seller_sold)||0});(function(rows){ready=true;rows.forEach(function(r){var u=r.platform==="YouTube"?"subscribers":"followers";
 D.unshift([r.platform,r.niche,r.title,r.seller_name||"Seller",r.followers,SM.short(r.followers),u,Number(r.income)||0,Number(r.price),r.seller_verified?1:0,r.tags||[],r.description||"",r.shots||[],r.id,r.audience||"",r._s,r._o,Number(r.views)||0,r.created_at?new Date(r.created_at).getTime():0,r.monetization||"",r.account_age||""])});fillLang();fillNiche(plat,F.niche);render();updCount();recent();window.dispatchEvent(new Event("smdata"))})(rows)});
window.SMD=D;window.SMX={LOGO:LOGO,score:score,track:track};window.renderStart=function(){welcome();seller();render();updCount();recent()};fillLang();render();welcome();seller();

};
