/* Messages icon in the top bar: pop-up inbox, unread number, online heartbeat */
(function(){
var icon=document.querySelector('#bar a.ic[aria-label="Messages"]');
if(!icon)return;

var ROWS=[],OPEN=false,chan=null,chanUid=null,panel=null,badge=null,PRES={};

var ENV='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>';
function X(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n||"?").trim().charAt(0).toUpperCase()||"?"}
function ago(t){var s=Math.max(0,(Date.now()-new Date(t).getTime())/1000);
 if(s<60)return "now";if(s<3600)return Math.floor(s/60)+"m";if(s<86400)return Math.floor(s/3600)+"h";
 if(s<604800)return Math.floor(s/86400)+"d";if(s<2592000)return Math.floor(s/604800)+" week"+(s>=1209600?"s":"");
 return new Date(t).toLocaleDateString()}
function online(id){var t=PRES[id];return !!t&&Date.now()-new Date(t).getTime()<150000}
function unread(){return ROWS.reduce(function(a,r){return a+r.un},0)}

/* ---------- style ---------- */
var st=document.createElement("style");
st.textContent=
"#inb{position:fixed;z-index:1000;top:80px;right:16px;width:320px;max-width:calc(100vw - 24px);height:min(520px,calc(100vh - 110px));display:none;flex-direction:column;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.18);font:16px/1.4 Inter,sans-serif;overflow:hidden}"+
"#inb.on{display:flex}"+
"#inb .ih{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid var(--line);font-weight:600;font-size:16px}"+
"#inb .ih svg{width:24px;height:24px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}"+
"#inb .il{flex:1;overflow-y:auto}"+
"#inb .ii{display:flex;align-items:center;gap:14px;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:var(--bg);color:var(--text);padding:16px 20px;cursor:pointer;font:inherit}"+
"#inb .ii:hover{background:var(--soft)}"+
"#inb .av{position:relative;flex:none;width:52px;height:52px;border-radius:50%;background:var(--soft);color:var(--muted);display:grid;place-items:center;font-size:22px}"+
"#inb .av em{position:absolute;right:0;bottom:0;width:13px;height:13px;border-radius:50%;background:#9aa3b2;border:2px solid var(--bg)}"+
"#inb .av em.on{background:#1dbf73}"+
"#inb .tx{flex:1;min-width:0}"+
"#inb .tx b{display:block;font-size:15px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"+
"#inb .tx span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--muted);font-size:14px;overflow-wrap:anywhere}"+
"#inb .tx small{display:block;color:var(--muted);font-size:13px;margin-top:3px}"+
"#inb .ii.un .tx b,#inb .ii.un .tx span{color:var(--text);font-weight:600}"+
"#inb .ii.un::after{content:'';flex:none;width:10px;height:10px;border-radius:50%;background:var(--accent)}"+
"#inb .ie{padding:56px 20px;text-align:center;color:var(--muted)}"+
"#inb .ie svg{display:block;margin:0 auto 12px;width:44px;height:44px;fill:none;stroke:currentColor;stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}"+
"#inb .if{display:flex;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--line)}"+
"#inb .if button{border:0;background:none;color:var(--accent);font:600 16px Inter,sans-serif;cursor:pointer;padding:6px 4px}"+
"#inb .if button:hover{text-decoration:underline}"+
"@media (max-width:640px){#inb{left:12px!important;right:12px!important;width:auto;max-width:none}}";
document.head.appendChild(st);

/* ---------- icon becomes a button ---------- */
icon.removeAttribute("href");icon.removeAttribute("data-r");icon.removeAttribute("aria-current");
icon.setAttribute("role","button");icon.setAttribute("tabindex","0");
icon.setAttribute("aria-haspopup","dialog");icon.setAttribute("aria-expanded","false");icon.style.cursor="pointer";
badge=document.createElement("span");badge.className="cnt";badge.hidden=true;icon.appendChild(badge);

panel=document.createElement("div");panel.id="inb";panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Inbox");
document.body.appendChild(panel);

function place(){var r=icon.getBoundingClientRect(),w=Math.min(320,window.innerWidth-24);
 panel.style.top=Math.round(r.bottom+10)+"px";
 panel.style.right="auto";
 panel.style.left=Math.max(12,Math.min(window.innerWidth-w-12,Math.round(r.left+r.width/2-w/2)))+"px"}

function paintBadge(){var n=unread();badge.hidden=!n;badge.textContent=n>9?"9+":String(n);
 icon.setAttribute("aria-label",n?"Messages ("+n+" unread)":"Messages")}

function draw(){paintBadge();if(!OPEN)return;
 var h='<div class="ih">'+ENV+'<span>Inbox ('+unread()+')</span></div><div class="il">';
 if(!ROWS.length)h+='<div class="ie">'+ENV+'No messages yet</div>';
 else h+=ROWS.map(function(r,i){
  return '<button type="button" class="ii'+(r.un?' un':'')+'" data-i="'+i+'"><span class="av">'+X(ini(r.name))+'<em class="'+(online(r.id)?'on':'')+'"></em></span>'+
   '<span class="tx"><b>'+X(r.name)+'</b><span>'+X(r.last)+'</span><small>'+X(ago(r.t))+'</small></span></button>'}).join("");
 panel.innerHTML=h+'</div><div class="if"><button type="button" id="inb-all">See All in Inbox</button></div>'}

/* ---------- load from Supabase ---------- */
function load(){
 if(!U){ROWS=[];unsub();draw();return Promise.resolve()}
 return Promise.all([
  sb.from("conversations").select("id,buyer_id,buyer_name,seller_name,updated_at").order("updated_at",{ascending:false}).limit(30),
  sb.from("messages").select("conversation_id,sender_id,body,created_at,read_at").order("created_at",{ascending:false}).limit(400),
  sb.rpc("my_chat_presence")
 ]).then(function(a){
  var cs=(a[0]&&a[0].data)||[],ms=(a[1]&&a[1].data)||[];PRES={};
  ((a[2]&&a[2].data)||[]).forEach(function(p){PRES[p.conv_id]=p.last_seen});
  ROWS=cs.map(function(c){
   var mine=ms.filter(function(m){return m.conversation_id===c.id}),m0=mine[0];
   return{id:c.id,name:c.buyer_id===U.id?c.seller_name:c.buyer_name,
    last:m0?((m0.sender_id===U.id?"Me: ":"")+m0.body):"No messages yet",t:m0?m0.created_at:c.updated_at,
    un:mine.filter(function(m){return m.sender_id!==U.id&&!m.read_at}).length}});
  draw()},function(){draw()})}

function sub(){if(!U||(chan&&chanUid===U.id))return;unsub();
 try{chanUid=U.id;chan=sb.channel("msgs-"+U.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},function(){load();window.dispatchEvent(new Event("sm-msg"))}).subscribe()}catch(e){chan=null;chanUid=null}}
function unsub(){if(chan){try{sb.removeChannel(chan)}catch(e){}}chan=null;chanUid=null}

/* ---------- open / close ---------- */
function open(){OPEN=true;place();panel.classList.add("on");icon.setAttribute("aria-expanded","true");draw();load()}
function close(){OPEN=false;panel.classList.remove("on");icon.setAttribute("aria-expanded","false")}
function toggle(e){if(e){e.preventDefault();e.stopPropagation()}if(!U)return;OPEN?close():open()}
icon.addEventListener("click",toggle);
icon.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" ")toggle(e)});
document.addEventListener("click",function(e){if(OPEN&&!panel.contains(e.target)&&!icon.contains(e.target))close()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&OPEN){close();icon.focus()}});
window.addEventListener("resize",function(){if(OPEN)place()});
window.addEventListener("scroll",function(){if(OPEN)place()},{passive:true});

function goMessages(id){
 if(id)window.pendChat={id:id};
 if(NAV.cur()==="messages"&&window.renderMessages)window.renderMessages();else NAV.go("messages")}

panel.addEventListener("click",function(e){
 if(e.target.closest("#inb-all")){close();goMessages(null);return}
 var b=e.target.closest(".ii");if(!b)return;var r=ROWS[+b.dataset.i];if(!r)return;
 close();goMessages(r.id)});

/* ---------- online heartbeat: "this person is online" ---------- */
function beat(){if(U&&!document.hidden){try{sb.rpc("touch_presence").then(function(){},function(){})}catch(e){}}}

/* ---------- connect to the site ---------- */
var oldNotify=SM.notify;
SM.notify=function(){if(oldNotify)oldNotify();load();sub();beat()};
window.SMInbox={refresh:load};
setInterval(function(){if(U){load();beat()}else unsub()},45000);
document.addEventListener("visibilitychange",function(){if(!document.hidden&&U){load();beat()}});
if(U)SM.notify();
})();
