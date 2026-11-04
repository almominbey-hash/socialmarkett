/* Dashboard */
init.dash=function(root){window.renderDash=function(){if(!U)return;SM.refresh().then(draw)};
function draw(){if(!U)return;
 var kc=(U.kyc==="pending"||U.kyc==="verified")?'<div class="c" style="margin-top:16px"><b style="font-size:17px">Seller verification: <span style="color:var(--ok)">'+(U.kyc==="pending"?"In review":"Verified")+'</span></b><span>'+(U.kyc==="pending"?"We check your details within 24 hours. You can list accounts once you are approved.":"You can list accounts.")+'</span></div>':'<div class="c" style="margin-top:16px"><b style="font-size:17px">Want to sell?</b><span>Verify your identity once, then list your accounts.</span><br><a class="btn" style="margin-top:10px" href="/start-selling">Become a seller</a></div>';
 var v=root.querySelector("#dv"),n=esc(U.name||U.email);
 var c=function(a,b){return '<div class="c"><b>'+a+'</b><span>'+b+'</span></div>'};
 v.innerHTML='<div class="hd"><div><h1>Hi, '+n+'</h1><p class="m" style="margin:0">Your account</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn line" href="/">Browse accounts</a><a class="btn" href="/sell">+ List an account</a></div></div>'+
 '<div class="cards">'+c("0","Active orders")+c('<span id="nl">0</span>',"Active listings")+c("$0","Sales this month")+c("$0","Pending payout")+'</div>'+
 '<h2>My orders (buying)</h2><div class="tb"><p class="m" style="margin:0">No orders yet.</p></div>'+
 '<h2>My listings (selling)</h2><div class="tb" id="lt"><p class="m" style="margin:0">Loading...</p></div>'+
 '<h2>Orders to deliver</h2><div class="tb"><p class="m" style="margin:0">No orders to deliver.</p></div>';
 v.querySelector('.hd').insertAdjacentHTML('afterend',kc);
 sb.from("listings").select("title,price,status,platform").eq("seller_id",U.id).order("created_at",{ascending:false}).then(function(r){
  var L=r.data||[],lt=v.querySelector("#lt");if(!lt)return;
  v.querySelector("#nl").textContent=L.filter(function(x){return x.status==="live"}).length;
  if(!L.length){lt.innerHTML='<p class="m" style="margin:0">You have no listings yet.</p>';return}
  var lab={pending:"In review",live:"Live",sold:"Sold",rejected:"Rejected"};
  lt.innerHTML='<table><tr><th>Account</th><th>Price</th><th>Status</th></tr>'+L.map(function(x){return "<tr><td>"+esc(x.platform)+" · "+esc(x.title)+"</td><td>$"+Number(x.price).toLocaleString("en-US")+'</td><td><span class="pill'+(x.status==="live"?" ok":"")+'">'+lab[x.status]+"</span></td></tr>"}).join("")+"</table>"})}};
