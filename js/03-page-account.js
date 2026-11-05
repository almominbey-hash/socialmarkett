/* Account details page (shows the account you clicked) */
init.account=function(root){var $=function(i){return root.querySelector("#"+i)};
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n).split(" ").map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase()}
window.renderAccount=function(){var d=window.SEL;if(!d)return;
 $("c1").textContent=d[0]+" \u203a "+d[1];$("ico").textContent=d[0].charAt(0);
 $("ttl").textContent=d[2];
 $("tg").innerHTML=(d[9]?'<span class="ver">\u2713 Verified seller</span>':"")+'<span class="tag">'+E(d[0])+'</span><span class="tag">'+E(d[1])+'</span>';
 $("st").innerHTML='<div><b>'+E(d[5])+'</b><span>'+E(d[6])+'</span></div>'+(d[7]>0?'<div><b>$'+Number(d[7]).toLocaleString("en-US")+'</b><span>income / month</span></div>':"");
 $("ds").textContent=d[11]||"";
 var sh=d[12]||[];$("shw").innerHTML=sh.length?'<h2>Screenshots</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">'+sh.map(function(u){return '<a href="'+E(u)+'" target="_blank" rel="noopener"><img src="'+E(u)+'" alt="Screenshot" style="width:100%;border-radius:8px;display:block"></a>'}).join("")+"</div>":"";
 $("dt").innerHTML='<tr><td>Platform</td><td>'+E(d[0])+'</td></tr><tr><td>Niche</td><td>'+E(d[1])+'</td></tr><tr><td>'+E(d[6].charAt(0).toUpperCase()+d[6].slice(1))+'</td><td>'+E(d[5])+'</td></tr>'+(d[7]>0?'<tr><td>Income per month</td><td>$'+Number(d[7]).toLocaleString("en-US")+'</td></tr>':"");
 $("pr").textContent="$"+Number(d[8]).toLocaleString("en-US");
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
