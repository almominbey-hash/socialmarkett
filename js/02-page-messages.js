/* Messages page: conversations list, chat, emoji, files */
init.messages=function(root){var $=function(i){return root.querySelector("#"+i)};
var list=$("list"),ms=$("ms"),th=$("th"),f=$("f"),mi=$("mi"),box=$("chat"),q=$("q"),sr=$("sr"),fi=$("fi"),fchip=$("fchip"),emo=$("emo"),sendb=$("sendb");
var cur=null,cache=[],pres={},urls={},lastSig="",file=null,term="",busy=false;
var EMO="😀 😃 😄 😁 😆 😅 😂 🤣 🙂 😉 😊 😍 🥰 😘 😎 🤩 🤔 😐 😢 😭 😡 😱 🙏 👍 👎 👏 🙌 💪 🤝 👌 ✌️ 👋 🔥 ✨ 🎉 💯 ❤️ 💙 💚 ⭐ ✅ ❌ ⚠️ 💰 💵 📈 📌 📎 🔒".split(" ");
var BAD=/\.(exe|bat|cmd|msi|scr|vbs|js|sh|apk|jar|com|dll|ps1)$/i;
var CLIP='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7L10 17.4a1.7 1.7 0 0 1-2.4-2.4L15 7.6"/></svg>';

function X(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n||"?").trim().charAt(0).toUpperCase()||"?"}
function hm(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
function day(t){var d=new Date(t),n=new Date(),y=new Date(Date.now()-864e5);
 if(d.toDateString()===n.toDateString())return "Today";if(d.toDateString()===y.toDateString())return "Yesterday";
 return d.toLocaleDateString([],{month:"short",day:"numeric",year:d.getFullYear()===n.getFullYear()?undefined:"numeric"})}
function ago(t){var s=Math.max(0,(Date.now()-new Date(t).getTime())/1000);
 if(s<60)return "now";if(s<3600)return Math.floor(s/60)+"m";if(s<86400)return Math.floor(s/3600)+"h";
 if(s<604800)return Math.floor(s/86400)+"d";if(s<2592000)return Math.floor(s/604800)+" week"+(s>=1209600?"s":"");
 return new Date(t).toLocaleDateString()}
function agoLong(t){var s=Math.max(0,(Date.now()-new Date(t).getTime())/1000);
 if(s<3600)return Math.max(1,Math.floor(s/60))+" min ago";if(s<86400)return Math.floor(s/3600)+" h ago";return Math.floor(s/86400)+" d ago"}
function online(id){var t=pres[id];return !!t&&Date.now()-new Date(t).getTime()<150000}
function status(id){if(online(id))return{on:true,t:"Online"};var t=pres[id];return{on:false,t:t?"Offline · last seen "+agoLong(t):"Offline"}}
function size(n){n=+n||0;return n>=1048576?(n/1048576).toFixed(1)+" MB":Math.max(1,Math.round(n/1024))+" KB"}
function money(n){return "Rs. "+(+n||0).toLocaleString("en-US")}
function get(id){return cache.filter(function(c){return c.id===id})[0]}

function fetchAll(){
 return Promise.all([sb.from("conversations").select("*").order("updated_at",{ascending:false}),sb.rpc("my_chat_presence")]).then(function(a){
  var cs=a[0].data||[];pres={};((a[1]&&a[1].data)||[]).forEach(function(p){pres[p.conv_id]=p.last_seen});
  if(!cs.length){cache=[];return}
  return sb.from("messages").select("*").in("conversation_id",cs.map(function(c){return c.id})).order("created_at",{ascending:true}).then(function(m){
   var all=m.data||[];
   cache=cs.map(function(c){var mm=all.filter(function(x){return x.conversation_id===c.id});
    return{id:c.id,seller:c.buyer_id===U.id?c.seller_name:c.buyer_name,title:c.listing_title,t:c.updated_at,
     unread:mm.filter(function(x){return x.sender_id!==U.id&&!x.read_at}).length,
     msgs:mm.map(function(x){return{id:x.id,x:x.body,t:x.created_at,me:x.sender_id===U.id,fp:x.file_path,fn:x.file_name,ft:x.file_type,fs:x.file_size}})}})})})}

/* signed link for a file (files are private) */
function signed(p,cb){if(urls[p]){cb(urls[p]);return}
 sb.storage.from("chat-files").createSignedUrl(p,3600).then(function(r){if(r&&r.data&&r.data.signedUrl){urls[p]=r.data.signedUrl;cb(urls[p])}},function(){})}

function drawList(){
 var c=cache.filter(function(x){return !term||(x.seller+" "+x.title).toLowerCase().indexOf(term)>-1});
 if(!cache.length){list.innerHTML='<p class="empty">No conversations yet. Open an account and tap Contact seller to start one.</p>';return}
 if(!c.length){list.innerHTML='<p class="empty">No conversation found.</p>';return}
 list.innerHTML=c.map(function(x){var m=x.msgs[x.msgs.length-1];
  var l=m?((m.me?"Me: ":"")+m.x):"No messages yet";
  return '<button type="button" class="it'+(x.unread?' un':'')+'" data-id="'+X(x.id)+'" aria-current="'+(x.id===cur)+'"><span class="av">'+X(ini(x.seller))+'<em class="'+(online(x.id)?'on':'')+'"></em></span><span class="bd"><span class="r1"><b>'+X(x.seller)+'</b><span class="tm">'+X(ago(m?m.t:x.t))+'</span></span><small>'+X(x.title)+'</small><small class="pv">'+X(l)+'</small></span>'+(x.unread?'<i class="ud"></i>':'')+'</button>'}).join("")}

function drawThread(force){
 var cv=get(cur);
 box.classList.toggle("nosel",!cv);box.classList.toggle("sel",!!cv);
 if(!cv){th.innerHTML="";ms.innerHTML="";lastSig="";return}
 var s=status(cv.id);
 th.innerHTML='<button type="button" class="bk" id="bk">&larr; Inbox</button><span class="av">'+X(ini(cv.seller))+'<em class="'+(s.on?'on':'')+'"></em></span><div class="bd"><b>'+X(cv.seller)+'</b><small class="'+(s.on?'on':'')+'">'+X(s.t)+'</small></div>';
 var last=cv.msgs[cv.msgs.length-1],sig=cv.id+":"+cv.msgs.length+":"+(last?last.id:0);
 if(force||sig!==lastSig){
  var prev="";
  ms.innerHTML=cv.msgs.length?cv.msgs.map(function(m){
   var dl="",d=day(m.t);if(d!==prev){prev=d;dl='<div class="dl">'+X(d)+'</div>'}
   var body=(m.fp&&m.x==="📎 "+m.fn)?"":X(m.x);
   var fh="";
   if(m.fp){fh=/^image\//.test(m.ft||"")?'<img class="fimg" data-fp="'+X(m.fp)+'" alt="'+X(m.fn||"image")+'">':'<a class="fl" data-fp="'+X(m.fp)+'" target="_blank" rel="noopener">'+CLIP+X(m.fn||"File")+' ('+size(m.fs)+')</a>'}
   return dl+'<div class="b'+(m.me?" me":"")+'">'+fh+body+'<small>'+hm(m.t)+'</small></div>'}).join(""):'<div class="hint"><b>Say hello to '+X(cv.seller)+'</b>Ask about the account, its stats or how the transfer works.</div>';
  [].forEach.call(ms.querySelectorAll("[data-fp]"),function(el){signed(el.dataset.fp,function(u){if(el.tagName==="IMG")el.src=u;else el.href=u})});
  ms.scrollTop=ms.scrollHeight;lastSig=sig}
}

function markRead(){var cv=get(cur);if(!cv||!cv.unread||document.hidden)return;
 cv.unread=0;drawList();
 sb.rpc("mark_chat_read",{p_conv:cur}).then(function(){if(window.SMInbox)window.SMInbox.refresh()},function(){})}

function drawAll(force){drawList();drawThread(force);markRead()}

function clearFile(){file=null;fi.value="";fchip.hidden=true;fchip.innerHTML=""}
function showFile(){fchip.hidden=false;fchip.innerHTML='<span>'+CLIP.replace("<svg","<svg width=\"16\" height=\"16\" style=\"vertical-align:-3px;fill:none;stroke:currentColor;stroke-width:1.6\"")+' '+X(file.name)+' ('+size(file.size)+')</span><button type="button" id="fx" aria-label="Remove file">&times;</button>'}

list.addEventListener("click",function(e){var b=e.target.closest(".it");if(!b)return;
 cur=b.dataset.id;lastSig="";emo.hidden=true;drawAll(true);mi.focus()});
th.addEventListener("click",function(e){if(e.target.closest("#bk")){cur=null;drawAll(true)}});
$("sbtn").addEventListener("click",function(){sr.hidden=!sr.hidden;if(!sr.hidden)q.focus();else{q.value="";term="";drawList()}});
q.addEventListener("input",function(){term=q.value.trim().toLowerCase();drawList()});

$("att").addEventListener("click",function(){fi.click()});
fi.addEventListener("change",function(){var fl=fi.files&&fi.files[0];if(!fl)return;
 if(fl.size>10*1024*1024){alert("The file must be under 10 MB.");fi.value="";return}
 if(BAD.test(fl.name)){alert("This type of file cannot be sent.");fi.value="";return}
 file=fl;showFile()});
fchip.addEventListener("click",function(e){if(e.target.closest("#fx"))clearFile()});

emo.innerHTML=EMO.map(function(e){return '<button type="button" data-e="'+e+'">'+e+'</button>'}).join("");
$("emb").addEventListener("click",function(e){e.stopPropagation();emo.hidden=!emo.hidden});
emo.addEventListener("click",function(e){var b=e.target.closest("[data-e]");if(!b)return;
 var s=mi.selectionStart==null?mi.value.length:mi.selectionStart,t=mi.selectionEnd==null?s:mi.selectionEnd;
 mi.value=mi.value.slice(0,s)+b.dataset.e+mi.value.slice(t);var p=s+b.dataset.e.length;mi.focus();try{mi.setSelectionRange(p,p)}catch(x){}});
root.addEventListener("click",function(e){if(!e.target.closest("#emo")&&!e.target.closest("#emb"))emo.hidden=true});

f.addEventListener("submit",function(e){e.preventDefault();var v=mi.value.trim();if((!v&&!file)||!cur||busy)return;
 busy=true;sendb.disabled=true;
 var fl=file,id=cur,row={conversation_id:id,sender_id:U.id,body:(v||("📎 "+fl.name)).slice(0,2000)},p=Promise.resolve();
 if(fl){var path=id+"/"+Date.now()+"-"+fl.name.replace(/[^\w.\-]+/g,"_").slice(-80);
  p=sb.storage.from("chat-files").upload(path,fl,{contentType:fl.type||"application/octet-stream"}).then(function(r){if(r.error)throw r.error;
   row.file_path=path;row.file_name=fl.name.slice(0,120);row.file_type=fl.type||"";row.file_size=fl.size;if(!v)row.body=("📎 "+row.file_name).slice(0,2000)})}
 p.then(function(){return sb.from("messages").insert(row)}).then(function(r){if(r&&r.error)throw r.error;
  mi.value="";clearFile();emo.hidden=true;return fetchAll().then(function(){drawAll(true)})})
 .catch(function(err){alert(SM.msg(err))}).then(function(){busy=false;sendb.disabled=false})});

window.renderMessages=function(){if(!U)return;
 fetchAll().then(function(){if(window.pendChat){cur=window.pendChat.id;window.pendChat=null;lastSig=""}
  if(cur&&!get(cur))cur=null;
  drawAll(true)})};
function refresh(){if(U&&NAV.cur()==="messages"&&!document.hidden&&!busy)fetchAll().then(function(){drawAll(false)})}
setInterval(refresh,8000);
window.addEventListener("sm-msg",refresh);
};
