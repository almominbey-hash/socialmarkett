/* Account details page (shows the account you clicked). Everything the seller entered is shown here; empty things are left out. All money is PKR. */
init.account=function(root){var $=function(i){return root.querySelector("#"+i)};
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n).split(" ").map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase()}
function R(n){return "Rs. "+Number(n||0).toLocaleString("en-US")}
function lab(list,k){var r="";(list||[]).forEach(function(x){if(x[0]===k)r=x[1]});return r}
var SOCIAL={YouTube:1,Instagram:1,TikTok:1,Facebook:1,X:1};
var PC={YouTube:"#d33a2f",Instagram:"#c13584",TikTok:"#2a2a33",Facebook:"#2f6fd0",X:"#14181f",Gaming:"#6d28d9","E-commerce":"#0e7490",Websites:"#0f7a4a",AdSense:"#b45309"};
/* category names the seller chose (Fresh, Monetized, YouTube Shorts ...). Country tags and "Others" are shown elsewhere */
function topics(d){var out=[],t=d[10]||[],skip={others:1,usa:1,uk:1,pakistan:1,other:1};t.forEach(function(k){if(skip[k])return;var l=typeof subLabel==="function"?subLabel(d[0],k):"";if(l&&out.indexOf(l)<0)out.push(l)});return out}
/* top boxes: the numbers a buyer looks at first. [label, value, small, highlighted?, text-style?] */
function stats(d){var s=[],fol=Number(d[4])||0,social=!!SOCIAL[d[0]];
 if(fol>0||social)s.push([social?(d[0]==="YouTube"?"Subscribers":"Followers"):"Audience size",d[5]||"0",fol>0?fol.toLocaleString("en-US")+" in total":"",1]);
 if(d[7]>0)s.push(["Income / month",R(d[7]),"Stated by the seller",1]);
 var ag=lab(typeof AGE!=="undefined"?AGE:[],d[20]);if(ag)s.push(["Account age",ag,"",0,1]);
 var mo=lab(typeof MON!=="undefined"?MON:[],d[19]);if(mo)s.push(["Monetization",mo,"",0,1]);
 if(d[14])s.push(["Audience country",d[14],"",0,1]);
 if(d[1])s.push(["Niche",d[1],"",0,1]);
 return s}
function rows(d){var r=[],fol=Number(d[4])||0,ag=lab(typeof AGE!=="undefined"?AGE:[],d[20]),mo=lab(typeof MON!=="undefined"?MON:[],d[19]);
 r.push(["Platform",d[0]]);
 if(d[1])r.push(["Niche / topic",d[1]]);
 if(fol>0||SOCIAL[d[0]])r.push([SOCIAL[d[0]]?(d[0]==="YouTube"?"Subscribers":"Followers"):"Audience size",fol.toLocaleString("en-US")]);
 if(d[14])r.push(["Audience country",d[14]]);
 if(mo)r.push(["Monetization",mo]);
 if(ag)r.push(["Account age",ag]);
 if(d[7]>0)r.push(["Income per month",R(d[7])]);
 r.push(["Asking price",R(d[8])]);
 if(d[17]>0)r.push(["Listing views",Number(d[17]).toLocaleString("en-US")]);
 if(d[18])r.push(["Listed on",new Date(d[18]).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})]);
 r.push(["Seller",E(d[3])+(d[9]?" (verified)":"")]);
 return r}
/* picture area: big picture, arrows, small pictures below. No picture = coloured panel with the platform sign. */
var gi=0;
function gallery(d){var sh=d[12]||[],g=$("gal"),c=PC[d[0]]||"#1d5fd6",lg=(window.SMX&&window.SMX.LOGO&&window.SMX.LOGO[d[0]])||"";
 if(gi>=sh.length)gi=0;
 var main=sh.length?'<a href="'+E(sh[gi])+'" target="_blank" rel="noopener"><img src="'+E(sh[gi])+'" alt="Picture '+(gi+1)+' of this account"></a>':'<div class="ph">'+lg+'<span>'+E(d[0])+(d[1]?' · '+E(d[1]):'')+'</span></div>';
 g.innerHTML='<div class="gm" style="--c:'+c+'">'+main+(sh.length>1?'<button type="button" class="gn gp" data-d="-1" aria-label="Previous picture">&lsaquo;</button><button type="button" class="gn gx" data-d="1" aria-label="Next picture">&rsaquo;</button><span class="gc">'+(gi+1)+' / '+sh.length+'</span>':'')+'</div>'+
 (sh.length>1?'<div class="th">'+sh.map(function(u,i){return '<button type="button" data-i="'+i+'" aria-label="Show picture '+(i+1)+'" aria-current="'+(i===gi)+'"><img src="'+E(u)+'" alt="" loading="lazy"></button>'}).join("")+'</div>':"")}
$("gal").addEventListener("click",function(e){var d=window.SEL;if(!d)return;var sh=d[12]||[],n=e.target.closest(".gn"),t=e.target.closest(".th button");
 if(n){e.preventDefault();gi=(gi+(+n.dataset.d)+sh.length)%sh.length;gallery(d)}else if(t){gi=+t.dataset.i;gallery(d)}});
window.renderAccount=function(){var d=window.SEL;if(!d)return;gi=0;
 $("c1").textContent=d[0]+(d[1]?" \u203a "+d[1]:"");
 $("ttl").textContent=d[2];
 $("tg").innerHTML=(d[9]?'<span class="ver">\u2713 Verified seller</span>':"")+'<span class="tag">'+E(d[0])+'</span>'+(d[1]?'<span class="tag">'+E(d[1])+'</span>':"");
 gallery(d);
 $("st").innerHTML=stats(d).map(function(f){return '<div class="'+(f[3]?"hl":"")+(f[4]?" t":"")+'"><span>'+E(f[0])+'</span><b>'+E(f[1])+'</b>'+(f[2]?'<small>'+E(f[2])+'</small>':"")+'</div>'}).join("");
 var ds=String(d[11]||"").trim();$("ds").textContent=ds;$("dsw").hidden=!ds;
 var tp=topics(d);$("tp").innerHTML=tp.map(function(x){return '<span class="chip ok">'+E(x)+'</span>'}).join("");$("tpw").hidden=!tp.length;
 $("dt").innerHTML=rows(d).map(function(r){return '<tr><td>'+E(r[0])+'</td><td>'+(r[0]==="Seller"?r[1]:E(r[1]))+'</td></tr>'}).join("");
 $("pr").textContent=R(d[8]);
 var roi=$("roi");if(d[7]>0&&d[8]>0){var m=d[8]/d[7];roi.innerHTML='<b>About '+(m>=10?Math.round(m):(Math.round(m*10)/10))+' months of income</b>This price compared with the monthly income the seller listed.';roi.hidden=false}else roi.hidden=true;
 ["si","si2"].forEach(function(k){$(k).textContent=ini(d[3])});["sn","sn2"].forEach(function(k){$(k).textContent=d[3]});
 ["sv","sv2"].forEach(function(k){$(k).textContent=d[9]?"Verified seller":"Seller"});
 window.scrollTo(0,0)};
["cs","cs2"].forEach(function(k){$(k).addEventListener("click",function(){var d=window.SEL;if(d&&d[13])window.openChat(d[13])})});
/* Buy now: makes the order (and its Order ID) in the database, then opens the Orders page */
$("buy").addEventListener("click",function(){var d=window.SEL;if(!d||!d[13])return;
 if(!U){window.GO="start";NAV.go("login");route();return}
 var b=$("buy");b.disabled=true;b.textContent="Creating your order...";
 sb.rpc("create_order",{p_listing:d[13]}).then(function(r){b.disabled=false;b.textContent="Buy now";
  if(r.error){alert(SM.msg(r.error));return}
  window.pendOrder=r.data;NAV.go("order");route()},function(){b.disabled=false;b.textContent="Buy now";alert("Something went wrong. Please try again.")})});
};
