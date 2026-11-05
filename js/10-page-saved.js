/* Saved accounts: "Recently saved", your own lists, and the "Save to list" pop-up */
var SV=[],SVT={},SVL=[];/* SV = saved account names (newest first), SVT = when saved, SVL = lists [{id,name,items:[names]}] */
function updSc(){var c=document.getElementById("sc");c.textContent=SV.length;c.hidden=!SV.length}
function svx(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function svErr(r){if(r&&r.error)throw r.error;return r}
function svMsg(e){var m=(e&&e.message)||"";return /saved_lists|saved_list_items|schema cache|does not exist/i.test(m)?"Lists are not set up yet. Run supabase/saved-lists.sql once in Supabase.":"Something went wrong. Please try again."}

/* ---------- small helpers that talk to the database ---------- */
function svSaveKey(t){if(SV.indexOf(t)>-1)return Promise.resolve();SV.unshift(t);SVT[t]=new Date().toISOString();updSc();
 return sb.from("saved_items").insert({user_id:U.id,item_key:t}).then(svErr)}
function svAddTo(l,t){return svSaveKey(t).then(function(){if(l.items.indexOf(t)<0)l.items.push(t);
 return sb.from("saved_list_items").insert({list_id:l.id,user_id:U.id,item_key:t}).then(svErr)})}
function svOut(l,t){l.items=l.items.filter(function(x){return x!==t});
 return sb.from("saved_list_items").delete().eq("list_id",l.id).eq("item_key",t).then(svErr)}
function svUnsave(t){var i=SV.indexOf(t);if(i>-1)SV.splice(i,1);delete SVT[t];SVL.forEach(function(l){l.items=l.items.filter(function(x){return x!==t})});updSc();
 return Promise.all([sb.from("saved_list_items").delete().eq("user_id",U.id).eq("item_key",t),sb.from("saved_items").delete().eq("user_id",U.id).eq("item_key",t)]).then(function(a){a.forEach(svErr)})}
function svNewList(n){return sb.from("saved_lists").insert({user_id:U.id,name:n}).select("id,name").single().then(svErr).then(function(r){var l={id:r.data.id,name:r.data.name,items:[]};SVL.push(l);return l})}
function svFindList(n){n=n.toLowerCase();for(var i=0;i<SVL.length;i++)if(SVL[i].name.toLowerCase()===n)return SVL[i];return null}

/* ---------- the "Save to list" pop-up (opens when the heart is tapped) ---------- */
var svp=null,svpKey="",svpDone=null,svpErr="";
function svpStyle(){if(document.getElementById("svp-style"))return;var s=document.createElement("style");s.id="svp-style";
 s.textContent=
 "#svp{position:fixed;inset:0;z-index:2000;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.45);font:16px/1.4 Inter,sans-serif}"+
 "#svp.on{display:flex}"+
 "#svp .svb{width:420px;max-width:100%;max-height:min(640px,calc(100vh - 32px));overflow-y:auto;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:14px;padding:22px;box-shadow:0 16px 44px rgba(0,0,0,.25)}"+
 "#svp .svh{display:flex;align-items:center;gap:8px}#svp .svh b{flex:1;font-size:19px;font-weight:600}"+
 "#svp .svk{border:0;background:none;color:var(--muted);font-size:26px;line-height:1;cursor:pointer;padding:2px 8px;border-radius:8px}#svp .svk:hover{background:var(--soft);color:var(--text)}"+
 "#svp .svs{margin:4px 0 14px;color:var(--muted);font-size:14px;overflow-wrap:anywhere}"+
 "#svp .svi{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);padding:12px 14px;margin-bottom:8px;cursor:pointer;font:inherit}"+
 "#svp .svi:hover{background:var(--soft)}#svp .svi small{display:block;color:var(--muted);font-size:13px}"+
 "#svp .svi i{font-style:normal;flex:none;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--line);display:grid;place-items:center;font-size:14px;color:var(--accent-t)}"+
 "#svp .svi.in i{background:var(--accent);border-color:var(--accent)}"+
 "#svp .svz{color:var(--muted);font-size:14px;margin:0 0 12px}"+
 "#svp .svn{display:flex;gap:8px;margin-top:6px}"+
 "#svp .svn input{flex:1;min-width:0;padding:11px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--text);font-size:16px;font-family:inherit}"+
 "#svp .svc{border:0;border-radius:8px;padding:11px 16px;background:var(--accent);color:var(--accent-t);font:500 15px inherit;font-family:inherit;cursor:pointer}"+
 "#svp .sve{color:#c0392b;font-size:14px;min-height:20px;margin:8px 0 0}"+
 "#svp .svr{display:block;width:100%;margin-top:8px;border:1px solid var(--line);border-radius:8px;background:none;color:var(--text);padding:11px;font:500 15px inherit;font-family:inherit;cursor:pointer}#svp .svr:hover{background:var(--soft)}";
 document.head.appendChild(s)}
function svpDraw(){var t=svpKey,saved=SV.indexOf(t)>-1;
 var rows=SVL.length?SVL.map(function(l){var inn=l.items.indexOf(t)>-1;
  return '<button type="button" class="svi'+(inn?' in':'')+'" data-id="'+svx(l.id)+'" aria-pressed="'+inn+'"><span>'+svx(l.name)+'<small>'+l.items.length+' account'+(l.items.length===1?'':'s')+'</small></span><i>'+(inn?'\u2713':'')+'</i></button>'}).join("")
  :'<p class="svz">You have no lists yet. Create your first one below.</p>';
 svp.innerHTML='<div class="svb" role="dialog" aria-modal="true" aria-label="Save to list"><div class="svh"><b>Save to list</b><button type="button" class="svk" data-a="x" aria-label="Close">\u00d7</button></div>'+
  '<p class="svs">'+svx(t)+'</p>'+rows+
  '<form class="svn"><input maxlength="40" placeholder="New list name" aria-label="New list name"><button class="svc" type="submit">Create</button></form>'+
  '<p class="sve" role="alert">'+svx(svpErr)+'</p>'+(saved?'<button type="button" class="svr" data-a="rm">Remove from saved</button>':'')+'</div>'}
function svpClose(){if(!svp)return;svp.classList.remove("on");svp.innerHTML="";var f=svpDone;svpDone=null;if(f)f()}
function svpFail(e){svpErr=svMsg(e);SM.loadSaved().then(svpDraw,svpDraw)}
function openSavePop(t,done){svpStyle();
 if(!svp){svp=document.createElement("div");svp.id="svp";document.body.appendChild(svp);
  svp.addEventListener("click",function(e){
   if(e.target===svp||e.target.closest('[data-a="x"]')){svpClose();return}
   if(e.target.closest('[data-a="rm"]')){svUnsave(svpKey).then(svpClose,svpFail);return}
   var b=e.target.closest(".svi");if(!b)return;
   var l=SVL.filter(function(x){return x.id===b.dataset.id})[0];if(!l)return;svpErr="";
   if(l.items.indexOf(svpKey)>-1){svOut(l,svpKey).then(function(){if(svpDone)svpDone();svpDraw()},svpFail)}
   else{var first=SV.indexOf(svpKey)<0;svAddTo(l,svpKey).then(function(){if(first)svpClose();else{if(svpDone)svpDone();svpDraw()}},svpFail)}});
  svp.addEventListener("submit",function(e){e.preventDefault();var inp=svp.querySelector(".svn input"),n=inp.value.trim().replace(/\s+/g," ");
   if(!n){svpErr="Please type a name for the list.";svpDraw();return}
   svpErr="";var ex=svFindList(n),first=SV.indexOf(svpKey)<0;
   (ex?Promise.resolve(ex):svNewList(n)).then(function(l){return svAddTo(l,svpKey)}).then(function(){svpClose()},svpFail)});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&svp.classList.contains("on"))svpClose()})}
 svpKey=t;svpDone=done||null;svpErr="";svpDraw();svp.classList.add("on");
 var i=svp.querySelector(".svn input");if(i&&!SVL.length)i.focus()}

/* Called by the heart buttons. Not signed in: go to login. Signed in: open the pop-up to choose a list. */
function toggleSave(t,done){
 if(!U){window.GO="start";NAV.go("login");route();return}
 openSavePop(t,done)}

/* ---------- the Saved page: left side = Recently saved + Your lists, right side = the accounts ---------- */
init.saved=function(root){
 var view="recent",adding=false;/* "recent" or the id of the list that is open */
 var PLC={YouTube:"#d33a2f",Instagram:"#c13584",TikTok:"#2a2a33",Facebook:"#2f6fd0"};
 var CLOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 4v4.5H8"/><path d="M12 7.5V12l3 2"/></svg>';
 var v=root.querySelector("#sv");
 function D(){return window.SMD||[]}
 function idx(t){var a=D();for(var i=0;i<a.length;i++)if(a[i][2]===t)return i;return -1}
 function media(d){var im=d[12]&&d[12][0];return '<div class="rm" style="--c:'+(PLC[d[0]]||"#566070")+'">'+(im?'<img src="'+svx(im)+'" alt="" loading="lazy">':'<span class="rl">'+svx(d[0])+'</span>')+'</div>'}
 function card(t,inList){var i=idx(t),d=D()[i];
  return '<article class="ac"><a class="al" href="/account" data-i="'+i+'">'+media(d)+'<div class="ab"><p class="ap">'+svx(d[0])+' \u00b7 '+svx(d[1])+'</p><h3>'+svx(d[2])+'</h3><p class="ar">Rs. '+d[8].toLocaleString("en-US")+'</p></div></a>'+
  '<button type="button" class="hh" data-t="'+svx(t)+'" aria-label="Saved. Choose a list">\u2665</button>'+
  (inList?'<button type="button" class="btn line rmv" data-l="'+svx(inList)+'" data-t="'+svx(t)+'">Remove from list</button>':'')+'</article>'}
 function have(a){return a.filter(function(t){return idx(t)>-1})}
 function side(lists){
  return '<nav class="sd" aria-label="Saved accounts">'+
   '<button type="button" class="si'+(view==="recent"?' on':'')+'" data-v="recent">'+CLOCK+'<span>Recently saved</span></button>'+
   '<div class="yl"><span>Your lists</span><button type="button" class="pl" data-a="add" aria-label="Create a new list" aria-expanded="'+adding+'">+</button></div>'+
   (adding?'<form class="nl" data-a="new"><input maxlength="40" placeholder="List name" aria-label="New list name"><button class="btn" type="submit">Create</button></form><p class="err" role="alert"></p>':'')+
   lists.map(function(l){return '<button type="button" class="li'+(view===l.id?' on':'')+'" data-l="'+svx(l.id)+'">'+svx(l.name)+'</button>'}).join("")+
   (!lists.length&&!adding?'<p class="sm">No lists yet. Tap + to create one.</p>':'')+'</nav>'}
 function draw(){var lists=U?SVL:[],mine=U?have(SV):[],L=null,main;
  if(view!=="recent"){L=lists.filter(function(x){return x.id===view})[0];if(!L)view="recent"}
  if(L){var a=have(L.items);
   main='<div class="hd"><h1>'+svx(L.name)+'</h1><button type="button" class="btn line" data-a="del" data-l="'+svx(L.id)+'">Delete list</button></div>'+
    (a.length?'<div class="row">'+a.map(function(t){return card(t,L.id)}).join("")+'</div>':'<p class="m">This list is empty. Tap the heart on any account and choose this list.</p>')}
  else main='<div class="hd"><h1>Recently saved</h1></div>'+
    (mine.length?'<div class="row">'+mine.slice(0,12).map(function(t){return card(t)}).join("")+'</div>':'<p class="m">Nothing saved yet. Tap the heart on any account to save it.</p><a class="btn" href="/">Explore marketplace</a>');
  v.innerHTML='<div class="sv2">'+side(lists)+'<section class="mn">'+main+'</section></div>'}
 window.renderSaved=function(){view="recent";adding=false;draw()};
 function oops(e){var p=v.querySelector(".err");if(p)p.textContent=typeof e==="string"?e:svMsg(e)}
 v.addEventListener("click",function(e){
  var l=e.target.closest("a[data-i]");if(l)window.SEL=D()[+l.dataset.i];
  var h=e.target.closest("button.hh");if(h){toggleSave(h.dataset.t,draw);return}
  var r=e.target.closest("button.rmv");if(r){var R=SVL.filter(function(x){return x.id===r.dataset.l})[0];if(R)svOut(R,r.dataset.t).then(draw,function(){SM.loadSaved().then(draw,draw)});return}
  var a=e.target.closest("[data-a]");if(a){
   if(a.dataset.a==="add"){adding=!adding;draw();var i=v.querySelector(".nl input");if(i)i.focus()}
   if(a.dataset.a==="del"&&confirm("Delete this list? The accounts stay saved.")){var id=a.dataset.l;
    sb.from("saved_lists").delete().eq("id",id).then(svErr).then(function(){SVL=SVL.filter(function(x){return x.id!==id});view="recent";draw()},oops)}
   return}
  if(e.target.closest("button.si")){view="recent";adding=false;draw();return}
  var c=e.target.closest("button.li");if(c){view=c.dataset.l;adding=false;draw()}});
 v.addEventListener("submit",function(e){e.preventDefault();var inp=v.querySelector(".nl input"),n=inp.value.trim().replace(/\s+/g," ");
  if(!n){oops("Please type a name for the list.");return}
  if(svFindList(n)){oops("You already have a list with this name.");return}
  svNewList(n).then(function(l){view=l.id;adding=false;draw()},oops)})};
