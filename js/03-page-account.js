/* Account details page (shows the account you clicked) */
init.account=function(root){var $=function(i){return root.querySelector("#"+i)};
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function ini(n){return String(n).split(" ").map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase()}
/* Stats box: only what a buyer really needs. Empty things are left out. [label, value, small text?] */
function lab(list,k){var r="";(list||[]).forEach(function(x){if(x[0]===k)r=x[1]});return r}
function has(t,k){return (t||[]).indexOf(k)>-1}
function names(t,map){var r=[];Object.keys(map).forEach(function(k){if(has(t,k))r.push(map[k])});return r}
function facts(d){var t=d[10]||[],p=d[0],f=[];
 f.push([String(d[6]).charAt(0).toUpperCase()+String(d[6]).slice(1),d[5]]);
 var mo=lab(typeof MON!=="undefined"?MON:[],d[19]);if(mo)f.push(["Monetization",mo,1]);
 if(d[7]>0)f.push(["Income / month","$"+Number(d[7]).toLocaleString("en-US")]);
 var ag=lab(typeof AGE!=="undefined"?AGE:[],d[20]);if(ag)f.push(["Account age",ag,1]);
 if(d[14])f.push(["Country",d[14],1]);
 var x;
 if(p==="YouTube"){if(has(t,"ypp"))f.push(["YouTube Partner Program","Yes",1]);x=names(t,{shorts:"Shorts","long-form":"Long-form",faceless:"Faceless"});if(x.length)f.push(["Content type",x.join(", "),1])}
 else if(p==="Instagram"){if(has(t,"verified"))f.push(["Blue tick","Yes",1]);x=names(t,{creator:"Creator",business:"Business",influencer:"Influencer"});if(x.length)f.push(["Account type",x.join(", "),1])}
 else if(p==="TikTok"){if(has(t,"creator-rewards"))f.push(["Creator Rewards","Yes",1]);x=names(t,{"shop-seller":"Seller","shop-affiliate":"Affiliate"});if(x.length)f.push(["TikTok Shop",x.join(", "),1])}
 else if(p==="Facebook"){x=names(t,{"content-monetization":"Content Monetization",stars:"Stars",subscriptions:"Subscriptions",eligible:"Monetization eligible",criteria:"Criteria completed"});if(x.length)f.push(["Monetization features",x.join(", "),1])}
 else if(p==="X"){x=names(t,{verified:"Blue tick","verified-gold":"Gold tick","verified-premium-plus":"Premium+"});if(x.length)f.push(["Verification",x.join(", "),1])}
 else{var c=[];t.forEach(function(k){if(k==="others")return;var l=typeof subLabel==="function"?subLabel(p,k):"";if(l)c.push(l)});if(c.length)f.push(["Category",c.join(", "),1])}
 if(d[9])f.push(["Seller","Verified",1]);
 return f}
window.renderAccount=function(){var d=window.SEL;if(!d)return;
 $("c1").textContent=d[0]+" \u203a "+d[1];$("ico").textContent=d[0].charAt(0);
 $("ttl").textContent=d[2];
 $("tg").innerHTML=(d[9]?'<span class="ver">\u2713 Verified seller</span>':"")+'<span class="tag">'+E(d[0])+'</span><span class="tag">'+E(d[1])+'</span>';
 $("st").innerHTML=facts(d).map(function(f){return '<div'+(f[2]?' class="t"':'')+'><b>'+E(f[1])+'</b><span>'+E(f[0])+'</span></div>'}).join("");
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
