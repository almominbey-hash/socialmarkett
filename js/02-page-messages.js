/* Messages page (inbox and chat) */
init.messages=function(root){var $=function(i){return root.querySelector("#"+i)};
var list=$("list"),ms=$("ms"),th=$("th"),f=$("f"),mi=$("mi"),box=$("chat"),cur=null;
function key(){return "sm_chats_"+String(U&&(U.email||U.name)||"guest")}
function load(){try{return JSON.parse(localStorage.getItem(key())||"[]")}catch(e){return[]}}
function save(c){try{localStorage.setItem(key(),JSON.stringify(c))}catch(e){}}
function X(x){return String(x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n).split(" ").map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase()}
function hm(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
function draw(){var c=load().sort(function(a,b){return (b.u||0)-(a.u||0)});
 if(!c.length){list.innerHTML='<p class="empty">No conversations yet. Open an account and tap Contact seller to start one.</p>';th.innerHTML="";ms.innerHTML='<div class="none">Your messages will appear here.</div>';f.style.display="none";box.classList.remove("sel");return}
 f.style.display="";
 var cv=c.filter(function(x){return x.id===cur})[0];
 if(!cv&&window.innerWidth>760){cv=c[0];cur=cv.id}
 list.innerHTML=c.map(function(x){var l=x.msgs.length?x.msgs[x.msgs.length-1].x:"No messages yet";return '<button type="button" class="it" data-id="'+X(x.id)+'" aria-current="'+(x.id===cur)+'"><i>'+X(ini(x.seller))+'</i><div><b>'+X(x.seller)+'</b><small>'+X(x.title)+'</small><small>'+X(l)+'</small></div></button>'}).join("");
 if(!cv){th.innerHTML="";ms.innerHTML='<div class="none">Choose a conversation.</div>';box.classList.remove("sel");return}
 box.classList.add("sel");
 th.innerHTML='<button type="button" class="bk" id="bk">&larr; Inbox</button><i>'+X(ini(cv.seller))+'</i><div><b>'+X(cv.seller)+'</b><small>'+X(cv.title)+'</small></div>';
 ms.innerHTML=cv.msgs.length?cv.msgs.map(function(m){return '<div class="b me">'+X(m.x)+'<small>'+hm(m.t)+'</small></div>'}).join(""):'<div class="hint"><b>Say hello to '+X(cv.seller)+'</b>Ask about the account, its stats or how the transfer works. Keep payment inside socialmarket so your money stays protected.</div>';
 ms.scrollTop=ms.scrollHeight}
list.addEventListener("click",function(e){var b=e.target.closest(".it");if(b){cur=b.dataset.id;draw();mi.focus()}});
th.addEventListener("click",function(e){if(e.target.closest("#bk")){cur=null;box.classList.remove("sel")}});
f.addEventListener("submit",function(e){e.preventDefault();var v=mi.value.trim();if(!v||!cur)return;var c=load();c.forEach(function(x){if(x.id===cur){x.msgs.push({x:v,t:Date.now()});x.u=Date.now()}});save(c);mi.value="";draw()});
window.renderMessages=function(){var c=load();
 if(window.pendChat){var p=window.pendChat;window.pendChat=null;var id=p.s+"|"+p.t;if(!c.some(function(x){return x.id===id})){c.push({id:id,seller:p.s,title:p.t,msgs:[],u:Date.now()});save(c)}cur=id}
 draw();if(cur&&window.innerWidth<=760)box.classList.add("sel")}};
