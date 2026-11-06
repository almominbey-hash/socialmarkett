/* Notifications: bell button in the top bar, pop-up list, unread number, click to open the right page */
(function(){
var bell=document.querySelector('#bar a.ic[aria-label="Notifications"]');
if(!bell)return;

var LIST=[],OPEN=false,chan=null,chanUid=null,panel=null,badge=null,timer=null;

var ICON={welcome:"\uD83D\uDC4B",seller_pending:"\u23F3",seller_verified:"\u2705",seller_rejected:"\u26A0\uFE0F",
 listing_pending:"\uD83D\uDCDD",listing_live:"\uD83D\uDE80",listing_rejected:"\u26A0\uFE0F",listing_sold:"\uD83D\uDCB0",
 message:"\uD83D\uDCAC",order:"\uD83D\uDED2",payment:"\uD83D\uDCB5",order_done:"\uD83C\uDF89"};

var BELL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/></svg>';
function X(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ago(t){var s=Math.max(0,(Date.now()-new Date(t).getTime())/1000);
 if(s<60)return "Just now";if(s<3600)return Math.floor(s/60)+" min ago";if(s<86400)return Math.floor(s/3600)+" h ago";
 if(s<604800)return Math.floor(s/86400)+" d ago";return new Date(t).toLocaleDateString()}
function unread(){return LIST.filter(function(n){return !n.read}).length}

/* ---------- style (added from here, no CSS file to edit) ---------- */
var st=document.createElement("style");
st.textContent=
"#ntf{position:fixed;z-index:1000;top:80px;right:16px;width:320px;max-width:calc(100vw - 24px);max-height:min(520px,calc(100vh - 110px));display:none;flex-direction:column;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.18);font:16px/1.4 Inter,sans-serif;overflow:hidden}"+
"#ntf.on{display:flex}"+
"#ntf .nh{display:flex;align-items:center;gap:12px;padding:20px 22px;border-bottom:1px solid var(--line)}"+
"#ntf .nh svg{width:24px;height:24px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}"+
"#ntf .nh b{font-size:17px;font-weight:600;flex:1}"+
"#ntf .nh button{border:0;background:none;color:var(--muted);font:400 13px inherit;font-family:inherit;cursor:pointer;padding:6px 8px;border-radius:8px}"+
"#ntf .nh button:hover{background:var(--soft);color:var(--text)}"+
"#ntf .nl{overflow-y:auto;flex:1}"+
"#ntf .ni{display:flex;align-items:center;gap:18px;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:var(--bg);color:var(--text);padding:20px 22px;cursor:pointer;font:inherit}"+
"#ntf .ni:last-child{border-bottom:0}"+
"#ntf .ni:hover{background:var(--soft)}"+
"#ntf .ic2{position:relative;flex:none;width:64px;height:64px;border-radius:50%;background:var(--soft);color:var(--muted);display:grid;place-items:center}"+
"#ntf .ic2 svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}"+
"#ntf .ic2 em{font-style:normal;font-size:26px;line-height:1}"+
"#ntf .ni.un .ic2::after{content:'';position:absolute;right:1px;bottom:1px;width:14px;height:14px;border-radius:50%;background:var(--accent);border:2px solid var(--bg)}"+
"#ntf .tx{flex:1;min-width:0}"+
"#ntf .tx b{display:block;font-size:16px;font-weight:600}"+
"#ntf .tx span{display:block;color:var(--text);font-size:15px;overflow-wrap:anywhere}"+
"#ntf .tx small{display:block;color:var(--muted);font-size:14px;margin-top:6px}"+
"#ntf .em2{padding:56px 20px;text-align:center;color:var(--muted)}"+
"#ntf .em2 svg{display:block;margin:0 auto 12px;width:44px;height:44px;fill:none;stroke:currentColor;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}"+
"@media (max-width:640px){#ntf{left:12px!important;right:12px!important;width:auto;max-width:none}#ntf .ic2{width:52px;height:52px}#ntf .ni{gap:14px;padding:16px 16px}#ntf .nh{padding:16px}}";
document.head.appendChild(st);

/* ---------- the bell button ---------- */
bell.removeAttribute("href");bell.classList.remove("hide-m");
bell.setAttribute("role","button");bell.setAttribute("tabindex","0");
bell.setAttribute("aria-haspopup","dialog");bell.setAttribute("aria-expanded","false");bell.style.cursor="pointer";
var oldDot=bell.querySelector("i");if(oldDot)oldDot.remove();
badge=document.createElement("span");badge.className="cnt";badge.hidden=true;bell.appendChild(badge);

panel=document.createElement("div");panel.id="ntf";panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Notifications");
document.body.appendChild(panel);

function place(){var r=bell.getBoundingClientRect(),w=Math.min(320,window.innerWidth-24);
 panel.style.top=Math.round(r.bottom+10)+"px";
 panel.style.right="auto";
 panel.style.left=Math.max(12,Math.min(window.innerWidth-w-12,Math.round(r.left+r.width/2-w/2)))+"px"}

function paintBadge(){var n=unread();badge.hidden=!n;badge.textContent=n>9?"9+":String(n);
 bell.setAttribute("aria-label",n?"Notifications ("+n+" unread)":"Notifications")}

function draw(){paintBadge();if(!OPEN)return;
 var un=unread();
 var h='<div class="nh">'+BELL+'<b>Notifications'+(un?' ('+un+')':'')+'</b>'+(un?'<button type="button" id="ntf-all">Mark all as read</button>':'')+'</div><div class="nl">';
 if(!LIST.length){h+='<div class="em2">'+BELL+'No notifications here</div>'}
 else{h+=LIST.map(function(n,i){
  return '<button type="button" class="ni'+(n.read?'':' un')+'" data-i="'+i+'"><span class="ic2">'+(ICON[n.kind]?'<em>'+ICON[n.kind]+'</em>':BELL)+'</span>'+
   '<span class="tx"><b>'+X(n.title)+'</b><span>'+X(n.body)+'</span><small>'+X(ago(n.created_at))+'</small></span></button>'}).join("")}
 panel.innerHTML=h+'</div>'}

/* ---------- load from Supabase ---------- */
function load(){
 if(!U){LIST=[];unsub();draw();return Promise.resolve()}
 return sb.from("notifications").select("*").eq("user_id",U.id).order("created_at",{ascending:false}).limit(30)
  .then(function(r){LIST=(r&&r.data)||[];draw()},function(){LIST=[];draw()})}

function sub(){if(!U||(chan&&chanUid===U.id))return;unsub();
 try{chanUid=U.id;chan=sb.channel("notif-"+U.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:"user_id=eq."+U.id},function(){load()}).subscribe()}catch(e){chan=null;chanUid=null}}
function unsub(){if(chan){try{sb.removeChannel(chan)}catch(e){}}chan=null;chanUid=null}

/* ---------- open / close ---------- */
function open(){OPEN=true;place();panel.classList.add("on");bell.setAttribute("aria-expanded","true");draw();load()}
function close(){OPEN=false;panel.classList.remove("on");bell.setAttribute("aria-expanded","false")}
function toggle(e){if(e){e.preventDefault();e.stopPropagation()}if(!U)return;OPEN?close():open()}

bell.addEventListener("click",toggle);
bell.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")toggle(e)});
document.addEventListener("click",function(e){if(OPEN&&!panel.contains(e.target)&&!bell.contains(e.target))close()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&OPEN){close();bell.focus()}});
window.addEventListener("resize",function(){if(OPEN)place()});
window.addEventListener("scroll",function(){if(OPEN)place()},{passive:true});

/* ---------- click on one notification: mark as read, then go to its page ---------- */
function go(n){
 if(n.kind==="message"&&n.ref){window.pendChat={id:n.ref};NAV.go("messages");return}
 var l=n.link||"";
 if(l.charAt(0)==="/"&&l.charAt(1)!=="/"){var h=l.slice(1);if(h==="")h="start";
  if(R.indexOf(h)>-1||PMAP[h]||h==="browse"){NAV.go(h);return}}
 if(/^https?:\/\//.test(l))location.href=l}

panel.addEventListener("click",function(e){
 if(e.target.closest("#ntf-all")){
  LIST.forEach(function(n){n.read=true});draw();
  sb.from("notifications").update({read:true}).eq("user_id",U.id).eq("read",false).then(function(){},function(){});return}
 var b=e.target.closest(".ni");if(!b)return;
 var n=LIST[+b.dataset.i];if(!n)return;
 if(!n.read){n.read=true;sb.from("notifications").update({read:true}).eq("id",n.id).then(function(){},function(){})}
 close();paintBadge();
 /* refresh the profile first, so a new "approved seller" status is known before we open the seller pages */
 if(n.kind==="message")go(n);else SM.refresh().then(function(){go(n)},function(){go(n)})});

/* ---------- connect to the site ---------- */
/* The site calls SM.notify() after every sign in. It used to show one pop-up message; now it updates the bell. */
SM.notify=function(){load();sub()};
timer=setInterval(function(){if(U)load();else unsub()},60000);
document.addEventListener("visibilitychange",function(){if(!document.hidden&&U)load()});
if(U)SM.notify();
})();
