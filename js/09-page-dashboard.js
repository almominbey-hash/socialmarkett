/* Dashboard */
init.dash=function(root){window.renderDash=function(){if(!U)return;SM.refresh().then(draw)};
function draw(){if(!U)return;
 var kc=(U.kyc==="pending"||U.kyc==="verified")?'<div class="c" style="margin-top:16px"><b style="font-size:17px">Seller verification: <span style="color:var(--ok)">'+(U.kyc==="pending"?"In review":"Verified")+'</span></b><span>'+(U.kyc==="pending"?"We check your details within 24 hours. You can list accounts once you are approved.":"You can list accounts.")+'</span></div>':'<div class="c" style="margin-top:16px"><b style="font-size:17px">Want to sell?</b><span>Verify your identity once, then list your accounts.</span><br><a class="btn" style="margin-top:10px" href="/start-selling">Become a seller</a></div>';
 var v=root.querySelector("#dv"),n=esc(U.name||U.email);
 var c=function(a,b){return '<div class="c"><b>'+a+'</b><span>'+b+'</span></div>'};
 v.innerHTML='<div class="hd"><div><h1>Hi, '+n+'</h1><p class="m" style="margin:0">Your account</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn line" href="/">Browse accounts</a><a class="btn" href="/sell">+ List an account</a></div></div>'+
 '<div class="cards">'+c('<span id="oa">0</span>',"Active orders")+c('<span id="oc">0</span>',"Completed orders")+c('<span id="nl">0</span>',"Active listings")+c('$<span id="os">0</span>',"Sales this month")+c('$<span id="op">0</span>',"Pending payout")+'</div>'+
 '<h2>My orders (buying)</h2><div class="tb" id="ob"><p class="m" style="margin:0">Loading...</p></div>'+
 '<h2>My listings (selling)</h2><div class="tb" id="lt"><p class="m" style="margin:0">Loading...</p></div>'+
 '<h2>Orders to deliver</h2><div class="tb" id="od"><p class="m" style="margin:0">Loading...</p></div>';
 v.querySelector('.hd').insertAdjacentHTML('afterend',kc);
 sb.from("orders").select("order_no,listing_title,platform,buyer_id,seller_id,amount,status,payment_status,payout_status,paid_at").order("created_at",{ascending:false}).then(function(r){
  var O=r.data||[],ob=v.querySelector("#ob"),od=v.querySelector("#od");if(!ob||!od)return;
  var LB={awaiting_payment:"Awaiting payment",in_progress:"In progress",delivered:"Delivered",completed:"Completed",cancelled:"Cancelled"};
  var mine=O.filter(function(o){return o.buyer_id===U.id}),sold=O.filter(function(o){return o.seller_id===U.id}),m0=new Date();m0.setDate(1);m0.setHours(0,0,0,0);
  var sum=function(a){return a.reduce(function(t,o){return t+Number(o.amount)},0)};
  v.querySelector("#oa").textContent=O.filter(function(o){return o.status!=="completed"&&o.status!=="cancelled"}).length;
  v.querySelector("#oc").textContent=O.filter(function(o){return o.status==="completed"}).length;
  v.querySelector("#os").textContent=sum(sold.filter(function(o){return o.payment_status==="paid"&&o.paid_at&&new Date(o.paid_at)>=m0})).toLocaleString("en-US");
  v.querySelector("#op").textContent=sum(sold.filter(function(o){return o.payout_status==="held"})).toLocaleString("en-US");
  var tbl=function(a){return '<table><tr><th>Order</th><th>Account</th><th>Amount</th><th>Status</th></tr>'+a.slice(0,5).map(function(o){return"<tr><td>SM-"+o.order_no+"</td><td>"+esc(o.platform)+" \u00b7 "+esc(o.listing_title)+"</td><td>Rs. "+Number(o.amount).toLocaleString("en-US")+'</td><td><span class="pill'+(o.status==="completed"?" ok":"")+'">'+LB[o.status]+"</span></td></tr>"}).join("")+"</table><p style=\"margin:8px 0 0\"><a href=\"/order\">See all orders</a></p>"};
  ob.innerHTML=mine.length?tbl(mine):'<p class="m" style="margin:0">No orders yet.</p>';
  var dv=sold.filter(function(o){return o.status==="in_progress"});od.innerHTML=dv.length?tbl(dv):'<p class="m" style="margin:0">No orders to deliver.</p>'});
 sb.from("listings").select("title,price,status,platform").eq("seller_id",U.id).order("created_at",{ascending:false}).then(function(r){
  var L=r.data||[],lt=v.querySelector("#lt");if(!lt)return;
  v.querySelector("#nl").textContent=L.filter(function(x){return x.status==="live"}).length;
  if(!L.length){lt.innerHTML='<p class="m" style="margin:0">You have no listings yet.</p>';return}
  var lab={pending:"In review",live:"Live",sold:"Sold",rejected:"Rejected"};
  lt.innerHTML='<table><tr><th>Account</th><th>Price</th><th>Status</th></tr>'+L.map(function(x){return "<tr><td>"+esc(x.platform)+" · "+esc(x.title)+"</td><td>Rs. "+Number(x.price).toLocaleString("en-US")+'</td><td><span class="pill'+(x.status==="live"?" ok":"")+'">'+lab[x.status]+"</span></td></tr>"}).join("")+"</table>"})}};
