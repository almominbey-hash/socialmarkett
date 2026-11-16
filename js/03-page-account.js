/* Account details page (shows the account you clicked). Everything the seller entered is shown here; empty things are left out. All money is PKR. */
init.account=function(root){var $=function(i){return root.querySelector("#"+i)};
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n).split(" ").map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase()}
function R(n){return "PKR "+Number(n||0).toLocaleString("en-US")}
function lab(list,k){var r="";(list||[]).forEach(function(x){if(x[0]===k)r=x[1]});return r}
var SOCIAL={YouTube:1,Instagram:1,TikTok:1,Facebook:1,X:1};
var PC={YouTube:"#d33a2f",Instagram:"#c13584",TikTok:"#2a2a33",Facebook:"#2f6fd0",X:"#14181f",Gaming:"#6d28d9","E-commerce":"#0e7490",Websites:"#0f7a4a",AdSense:"#b45309"};
/* category names the seller chose (Fresh, Monetized, YouTube Shorts ...). Country tags and "Others" are shown elsewhere */
function topics(d){var out=[],t=d[10]||[],skip={others:1,usa:1,uk:1,pakistan:1,other:1};t.forEach(function(k){if(skip[k])return;var l=typeof subLabel==="function"?subLabel(d[0],k):"";if(l&&out.indexOf(l)<0)out.push(l)});return out}
/* top boxes: every fact a buyer needs, once. [label, value, small, highlighted?, text-style?] */
function stats(d){var s=[],fol=Number(d[4])||0,social=!!SOCIAL[d[0]];
 s.push(["Platform",d[0],"",0,1]);
 if(d[1])s.push(["Niche",d[1],"",0,1]);
 if(fol>0||social)s.push([social?(d[0]==="YouTube"?"Subscribers":"Followers"):"Audience size",d[5]||"0",fol>0?fol.toLocaleString("en-US")+" in total":"",1]);
 if(d[7]>0)s.push(["Income / month",R(d[7]),"",1]);
 var ag=lab(typeof AGE!=="undefined"?AGE:[],d[20]);if(ag)s.push(["Account age",ag,"",0,1]);
 var mo=lab(typeof MON!=="undefined"?MON:[],d[19]);if(mo)s.push(["Monetization",mo,"",0,1]);
 if(d[14])s.push(["Audience country",d[14],"",0,1]);
 if(d[17]>0)s.push(["Listing views",Number(d[17]).toLocaleString("en-US"),"",0,1]);
 if(d[18])s.push(["Listed on",new Date(d[18]).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),"",0,1]);
 return s}
/* picture area: small pictures in one row under the title. Tap a picture (or "Full") to see it full screen. */
var gi=0;
function gallery(d){var sh=d[12]||[],g=$("gal"),c=PC[d[0]]||"#1d5fd6",lg=(window.SMX&&window.SMX.LOGO&&window.SMX.LOGO[d[0]])||"";
 if(!sh.length){g.innerHTML='<div class="gm ph" style="--c:'+c+'">'+lg+'<span>'+E(d[0])+(d[1]?' \u00b7 '+E(d[1]):'')+'</span></div>';return}
 g.innerHTML='<div class="th">'+sh.map(function(u,i){return '<div class="ti"><button type="button" data-i="'+i+'" aria-label="Picture '+(i+1)+'"><img src="'+E(u)+'" alt="Picture '+(i+1)+' of this account" loading="lazy"></button><a href="#" class="fl" data-i="'+i+'">Full</a></div>'}).join("")+'</div>'}
function lbShow(){var d=window.SEL;if(!d)return;var sh=d[12]||[];if(!sh.length)return;
 $("lbi").src=sh[gi];$("lbc").textContent=(gi+1)+" / "+sh.length;$("lb").hidden=false;
 $("lbp").style.display=$("lbn").style.display=sh.length>1?"":"none";document.body.style.overflow="hidden"}
function lbHide(){$("lb").hidden=true;$("lbi").removeAttribute("src");document.body.style.overflow=""}
$("gal").addEventListener("click",function(e){var d=window.SEL;if(!d)return;var t=e.target.closest("[data-i]");if(!t)return;e.preventDefault();gi=+t.dataset.i;lbShow()});
$("lbx").addEventListener("click",lbHide);
$("lb").addEventListener("click",function(e){if(e.target===$("lb"))lbHide()});
$("lbp").addEventListener("click",function(){var n=(window.SEL[12]||[]).length;gi=(gi-1+n)%n;lbShow()});
$("lbn").addEventListener("click",function(){var n=(window.SEL[12]||[]).length;gi=(gi+1)%n;lbShow()});
document.addEventListener("keydown",function(e){if($("lb").hidden)return;if(e.key==="Escape")lbHide();else if(e.key==="ArrowLeft")$("lbp").click();else if(e.key==="ArrowRight")$("lbn").click()});
/* seller card: accounts sold + buyer reviews (from supabase/seller-reviews.sql; hidden if not set up yet) */
function stars(n){n=Math.round(Number(n)||0);return "\u2605\u2605\u2605\u2605\u2605".slice(0,n)+"\u2606\u2606\u2606\u2606\u2606".slice(0,5-n)}
function sellerCard(d){var ss=$("ss"),rv=$("rv");ss.textContent="";rv.hidden=true;rv.innerHTML="";if(!d[13]||typeof sb==="undefined")return;
 var id=d[13];
 sb.rpc("seller_card",{p_listing:id}).then(function(r){if(!window.SEL||window.SEL[13]!==id||r.error||!r.data)return;var c=r.data,n=Number(c.sold)||0,k=Number(c.count)||0;
  ss.textContent=n+(n===1?" account sold":" accounts sold")+(k?" \u00b7 \u2605 "+Number(c.avg).toFixed(1)+" ("+k+(k===1?" review)":" reviews)"):"");
  rv.hidden=false;
  rv.innerHTML='<h3>Reviews'+(k?' <span>'+k+'</span>':'')+'</h3>'+(k?c.reviews.map(function(x){return '<div class="rv1"><div class="rt"><b>'+E(x.name)+'</b><span class="st" aria-label="'+x.rating+' out of 5">'+stars(x.rating)+'</span><small>'+new Date(x.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})+'</small></div>'+(x.comment?'<p>'+E(x.comment)+'</p>':'')+'</div>'}).join(""):'<p class="note">No reviews yet.</p>')},function(){})}
window.renderAccount=function(){var d=window.SEL;if(!d)return;gi=0;lbHide();
 $("ttl").textContent=d[2];
 $("tg").innerHTML='<span class="tag">'+E(d[0])+'</span>'+(d[1]?'<span class="tag">'+E(d[1])+'</span>':"");
 gallery(d);
 $("st").innerHTML=stats(d).map(function(f){return '<div class="'+(f[3]?"hl":"")+(f[4]?" t":"")+'"><span>'+E(f[0])+'</span><b>'+E(f[1])+'</b>'+(f[2]?'<small>'+E(f[2])+'</small>':"")+'</div>'}).join("");
 var ds=String(d[11]||"").trim();$("ds").textContent=ds;$("dsw").hidden=!ds;
 var tp=topics(d);$("tp").innerHTML=tp.map(function(x){return '<span class="chip ok">'+E(x)+'</span>'}).join("");$("tpw").hidden=!tp.length;
 $("pr").textContent=R(d[8]);
 ["si","si2"].forEach(function(k){$(k).textContent=ini(d[3])});["sn","sn2"].forEach(function(k){$(k).textContent=d[3]});
 sellerCard(d);
 if(window.SMX&&window.SMX.track)window.SMX.track(d); /* every account opened is remembered for "Inspired by your recent activity" */
 var ra=$("ra"),rg=$("rag"),hh=(window.SMX&&window.SMX.recent)?window.SMX.recent(d[13]):"";if(rg)rg.innerHTML=hh;if(ra)ra.hidden=!hh;
 window.scrollTo(0,0)};
/* the cards under the page: picture arrows, heart, and opening another account */
if($("rag"))$("rag").addEventListener("click",function(e){var D=window.SMD;if(!D)return;
 var nv=e.target.closest(".xnv");if(nv){e.preventDefault();e.stopPropagation();var cd=nv.closest(".xc"),sh=D[+cd.dataset.k][12],i=((+cd.dataset.i||0)+(+nv.dataset.d)+sh.length)%sh.length;cd.dataset.i=i;var im=cd.querySelector(".xm img");if(!im){im=document.createElement("img");im.alt="";cd.querySelector(".xm").insertBefore(im,cd.querySelector(".xm").firstChild)}im.src=sh[i];return}
 var h=e.target.closest(".xh");if(h){e.preventDefault();var k=+h.dataset.k;if(typeof toggleSave==="function")toggleSave(D[k][2],function(){var on=SV.indexOf(D[k][2])>-1;h.setAttribute("aria-pressed",on);h.textContent=on?"\u2665":"\u2661"});return}
 var c=e.target.closest(".xc");if(c){e.preventDefault();var d2=D[+c.dataset.k];if(!d2)return;window.SEL=d2;if(window.SMX&&window.SMX.track)window.SMX.track(d2);window.renderAccount()}});
["cs","cs2"].forEach(function(k){$(k).addEventListener("click",function(){var d=window.SEL;if(d&&d[13])window.openChat(d[13])})});
/* Buy now: makes the order (and its Order ID) in the database, then opens the Orders page */
$("buy").addEventListener("click",function(){var d=window.SEL;if(!d||!d[13])return;
 if(!U){window.GO="start";NAV.go("login");route();return}
 var b=$("buy");b.disabled=true;b.textContent="Creating your order...";
 sb.rpc("create_order",{p_listing:d[13]}).then(function(r){b.disabled=false;b.textContent="Buy now";
  if(r.error){alert(SM.msg(r.error));return}
  window.pendOrder=r.data;NAV.go("order");route()},function(){b.disabled=false;b.textContent="Buy now";alert("Something went wrong. Please try again.")})});
};
