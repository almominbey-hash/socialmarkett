/* Saved accounts */
var SV=[];try{SV=JSON.parse(localStorage.getItem("sm_saved")||"[]")}catch(e){}
function updSc(){var c=document.getElementById("sc");c.textContent=SV.length;c.hidden=!SV.length}
function toggleSave(t){var i=SV.indexOf(t);if(i>-1)SV.splice(i,1);else SV.push(t);try{localStorage.setItem("sm_saved",JSON.stringify(SV))}catch(e){}updSc()}
init.saved=function(root){window.renderSaved=function(){var v=root.querySelector("#sv"),D=window.SMD||[],L=D.filter(function(d){return SV.indexOf(d[2])>-1});
 v.innerHTML='<h1>Saved accounts</h1><p class="m">Accounts you saved to look at later.</p>'+(L.length?'<div class="cards">'+L.map(function(d){return '<div class="c"><span>'+esc(d[0])+' \u00b7 '+esc(d[1])+'</span><p style="margin:6px 0;color:var(--text)">'+esc(d[2])+'</p><b>$'+d[8].toLocaleString("en-US")+'</b><div style="display:flex;gap:8px;margin-top:12px"><a class="btn" href="#account">View details</a><button class="btn line" data-t="'+esc(d[2])+'">Remove</button></div></div>'}).join("")+'</div>':'<p class="m">Nothing saved yet. Tap the heart on any account to save it.</p><a class="btn" href="#home">Explore marketplace</a>')};
 root.addEventListener("click",function(e){var b=e.target.closest("button[data-t]");if(b){toggleSave(b.dataset.t);renderSaved()}})};
