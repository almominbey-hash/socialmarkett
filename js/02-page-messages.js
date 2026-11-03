/* Messages page (inbox and chat between buyers and sellers) */
init.messages=function(root){var $=function(i){return root.querySelector("#"+i)};
var list=$("list"),ms=$("ms"),th=$("th"),f=$("f"),mi=$("mi"),box=$("chat"),cur=null,cache=[],lastSig="";
function X(x){return String(x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n).split(" ").map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase()}
function hm(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
function fetchAll(){
 return sb.from("conversations").select("*").order("updated_at",{ascending:false}).then(function(r){
  var cs=r.data||[];if(!cs.length){cache=[];return}
  return sb.from("messages").select("*").in("conversation_id",cs.map(function(c){return c.id})).order("created_at",{ascending:true}).then(function(m){
   var all=m.data||[];
   cache=cs.map(function(c){return{id:c.id,seller:c.buyer_id===U.id?c.seller_name:c.buyer_name,title:c.listing_title,
    msgs:all.filter(function(x){return x.conversation_id===c.id}).map(function(x){return{x:x.body,t:x.created_at,me:x.sender_id===U.id}})}})})})}
function draw(){var c=cache;
 if(!c.length){list.innerHTML='<p class="empty">No conversations yet. Open an account and tap Contact seller to start one.</p>';th.innerHTML="";ms.innerHTML='<div class="none">Your messages will appear here.</div>';f.style.display="none";box.classList.remove("sel");return}
 f.style.display="";
 var cv=c.filter(function(x){return x.id===cur})[0];
 if(!cv&&window.innerWidth>760){cv=c[0];cur=cv.id}
 list.innerHTML=c.map(function(x){var l=x.msgs.length?x.msgs[x.msgs.length-1].x:"No messages yet";return '<button type="button" class="it" data-id="'+X(x.id)+'" aria-current="'+(x.id===cur)+'"><i>'+X(ini(x.seller))+'</i><div><b>'+X(x.seller)+'</b><small>'+X(x.title)+'</small><small>'+X(l)+'</small></div></button>'}).join("");
 if(!cv){th.innerHTML="";ms.innerHTML='<div class="none">Choose a conversation.</div>';box.classList.remove("sel");return}
 box.classList.add("sel");
 th.innerHTML='<button type="button" class="bk" id="bk">&larr; Inbox</button><i>'+X(ini(cv.seller))+'</i><div><b>'+X(cv.seller)+'</b><small>'+X(cv.title)+'</small></div>';
 ms.innerHTML=cv.msgs.length?cv.msgs.map(function(m){return '<div class="b'+(m.me?" me":"")+'"'+(m.me?"":' style="align-self:flex-start;background:var(--bg);border:1px solid var(--line)"')+'>'+X(m.x)+'<small>'+hm(m.t)+'</small></div>'}).join(""):'<div class="hint"><b>Say hello to '+X(cv.seller)+'</b>Ask about the account, its stats or how the transfer works.</div>';
 var sig=cv.id+":"+cv.msgs.length;if(sig!==lastSig){ms.scrollTop=ms.scrollHeight;lastSig=sig}}
list.addEventListener("click",function(e){var b=e.target.closest(".it");if(b){cur=b.dataset.id;draw();mi.focus()}});
th.addEventListener("click",function(e){if(e.target.closest("#bk")){cur=null;box.classList.remove("sel")}});
f.addEventListener("submit",function(e){e.preventDefault();var v=mi.value.trim();if(!v||!cur)return;mi.value="";
 sb.from("messages").insert({conversation_id:cur,sender_id:U.id,body:v.slice(0,2000)}).then(function(r){if(r.error){alert(SM.msg(r.error));return}return fetchAll().then(draw)})});
window.renderMessages=function(){if(!U)return;
 fetchAll().then(function(){if(window.pendChat){cur=window.pendChat.id;window.pendChat=null}
  draw();if(cur&&window.innerWidth<=760)box.classList.add("sel")})};
setInterval(function(){if(U&&NAV.cur()==="messages"&&!document.hidden)fetchAll().then(draw)},8000);
};
