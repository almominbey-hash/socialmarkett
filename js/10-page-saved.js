/* Saved accounts */
var SV=[];
function updSc(){var c=document.getElementById("sc");c.textContent=SV.length;c.hidden=!SV.length}
function toggleSave(t){
 if(!U){window.GO="start";NAV.go("login");route();return}
 var i=SV.indexOf(t);if(i>-1)SV.splice(i,1);else SV.push(t);updSc();
 var q=sb.from("saved_items");(i>-1?q.delete().eq("user_id",U.id).eq("item_key",t):q.insert({user_id:U.id,item_key:t})).then(function(){})}
init.saved=function(root){window.renderSaved=function(){var v=root.querySelector("#sv"),D=window.SMD||[],L=D.filter(function(d){return SV.indexOf(d[2])>-1});
 v.innerHTML='<h1>Saved accounts</h1><p class="m">Accounts you saved to look at later.</p>'+(L.length?'<div class="cards">'+L.map(function(d){return '<div class="c"><span>'+esc(d[0])+' \u00b7 '+esc(d[1])+'</span><p style="margin:6px 0;color:var(--text)">'+esc(d[2])+'</p><b>$'+d[8].toLocaleString("en-US")+'</b><div style="display:flex;gap:8px;margin-top:12px"><a class="btn" href="/account" data-i="'+D.indexOf(d)+'">View details</a><button class="btn line" data-t="'+esc(d[2])+'">Remove</button></div></div>'}).join("")+'</div>':'<p class="m">Nothing saved yet. Tap the heart on any account to save it.</p><a class="btn" href="/">Explore marketplace</a>')};
 root.addEventListener("click",function(e){var l=e.target.closest("a[data-i]");if(l)window.SEL=(window.SMD||[])[+l.dataset.i];var b=e.target.closest("button[data-t]");if(b){toggleSave(b.dataset.t);renderSaved()}})};
