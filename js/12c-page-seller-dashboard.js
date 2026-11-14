/* Seller Dashboard: numbers come from the database function seller_dashboard() (supabase/seller-dashboard.sql).
   It shows orders, money, messages and listings of the signed-in approved seller only. */
init["seller-dashboard"]=function(root){
var $=function(i){return root.querySelector("#"+i)};
var LAST=0,LOADING=false,BUSY=false;
var LAB={awaiting_payment:["Waiting for payment","warn"],in_progress:["Paid - deliver now","info"],delivered:["Delivered","info"],completed:["Completed","ok"],cancelled:["Cancelled","bad"]};
var LST={pending:["Waiting for approval","warn"],live:["Live","ok"],sold:["Sold","info"],rejected:["Rejected","bad"]};
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function N(x){return Number(x||0).toLocaleString("en-US")}
function amt(a){return "Rs. "+Number(a||0).toLocaleString("en-US",{maximumFractionDigits:0})}
function mm(m,key){return amt((m||{})[key])}
function dt(t){if(!t)return "";try{return new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}catch(e){return ""}}
function chip(p){return '<span class="chip '+p[1]+'">'+E(p[0])+'</span>'}
function card(l,n,h,c){return '<div class="k'+(c?" "+c:"")+'"><small>'+E(l)+'</small><b>'+n+'</b><span>'+E(h)+'</span></div>'}
function setState(t,err){var s=$("st");s.textContent=t||"";s.className="state"+(err?" err":"")}

function draw(d){
 var o=d.orders||{},l=d.listings||{},ms=d.messages||{},mo=d.money||{};
 /* things that need the seller now */
 var td=[];
 if(o.to_deliver>0)td.push(N(o.to_deliver)+" paid order"+(o.to_deliver>1?"s are":" is")+" waiting for you to deliver the account (use the Mark delivered button below).");
 if(o.disputed>0)td.push(N(o.disputed)+" order"+(o.disputed>1?"s have":" has")+" a problem reported by the buyer. Our team will contact you.");
 if(ms.unread>0)td.push("You have "+N(ms.unread)+" unread message"+(ms.unread>1?"s":"")+' from buyers. <a href="/messages">Open inbox</a>');
 if(l.pending>0)td.push(N(l.pending)+" listing"+(l.pending>1?"s are":" is")+" waiting for our team to approve.");
 $("todo").innerHTML=td.length?'<div class="todo"><b>Needs your attention</b><ul>'+td.map(function(x){return "<li>"+x+"</li>"}).join("")+"</ul></div>":"";
 /* order cards */
 $("og").innerHTML=card("Total orders",N(o.total),"All orders ever placed")+
  card("Paid orders",N(o.paid),"Buyer has paid")+
  card("Pending",N(o.unpaid),"Waiting for buyer payment",o.unpaid>0?"":"")+
  card("Active",N((o.to_deliver||0)+(o.delivered||0)),N(o.to_deliver)+" to deliver, "+N(o.delivered)+" delivered",o.to_deliver>0?"hot":"")+
  card("Completed",N(o.completed),"Finished successfully","good")+
  card("Cancelled / rejected",N(o.cancelled),"Not completed",o.cancelled>0?"bad":"")+
  card("Problem reported",N(o.disputed),"Buyer raised an issue",o.disputed>0?"hot":"");
 /* money cards */
 $("mg").innerHTML=card("Paid to you",mm(mo,"released"),"Money already released to your payout account","good")+
  card("Waiting in escrow",mm(mo,"held"),"Released after delivery and the 24 hour hold")+
  card("Total sales value",mm(mo,"gross"),"All paid orders (before our fee)");
 /* recent orders */
 var ro=d.recent_orders||[];
 $("ot").innerHTML=ro.length?'<table><tr><th>Order</th><th>Account</th><th>Buyer</th><th>You earn</th><th>Status</th><th></th></tr>'+ro.map(function(r){
  var st=LAB[r.status]||[r.status,"info"];
  var sub=r.payout_status==="held"&&r.release_at?'<span class="sub">Payout after '+E(dt(r.release_at))+'</span>':(r.payout_status==="released"?'<span class="sub">Paid to you</span>':"");
  var act=(r.status==="in_progress"&&r.payment_status==="paid"&&!r.disputed)?'<button class="btn sm" type="button" data-del="'+E(r.id)+'">Mark delivered</button>':"";
  return '<tr><td>SM-'+E(r.order_no)+'<span class="sub">'+E(dt(r.created_at))+'</span></td><td class="t">'+E(r.listing_title)+'<span class="sub">'+E(r.platform)+'</span></td><td>'+E(r.buyer_name)+'</td><td>'+amt(r.earning)+'</td><td>'+chip(st)+(r.disputed?' '+chip(["Problem","bad"]):"")+sub+'</td><td>'+act+'</td></tr>'}).join("")+'</table>':'<p class="none">No orders yet. When a buyer buys one of your accounts it will show here.</p>';
 /* messages */
 var rc=ms.recent||[];
 $("mc").innerHTML='<div class="ms"><div><b>'+N(ms.conversations)+'</b>Chats</div><div><b>'+N(ms.unread)+'</b>Unread</div></div>'+(rc.length?rc.map(function(c){
  return '<button type="button" class="conv" data-cv="'+E(c.id)+'"><span><b>'+E(c.other_name)+'</b><span class="sub">'+E(c.listing_title)+' - '+E(dt(c.updated_at))+'</span></span>'+(c.unread>0?'<i class="dot">'+N(c.unread)+'</i>':"")+'</button>'}).join(""):'<p class="none">No messages yet. Buyers can message you from your listing page.</p>');
 /* listings */
 $("lc").innerHTML=["live","pending","sold","rejected"].map(function(k){return '<span class="chip '+LST[k][1]+'">'+LST[k][0]+": "+N(l[k])+'</span>'}).join("");
 var rl=d.recent_listings||[];
 $("lt").innerHTML=rl.length?'<table><tr><th>Listing</th><th>Platform</th><th>Followers</th><th>Price</th><th>Status</th><th>Added</th></tr>'+rl.map(function(r){
  return '<tr><td class="t">'+E(r.title)+'</td><td>'+E(r.platform)+'</td><td>'+N(r.followers)+'</td><td>'+amt(r.price)+'</td><td>'+chip(LST[r.status]||[r.status,"info"])+'</td><td>'+E(dt(r.created_at))+'</td></tr>'}).join("")+'</table>':'<p class="none">You have no listings yet. Press "+ Create listing" to add your first account.</p>';
 $("body").hidden=false;setState("");
}

function load(force){
 var nm=$("sn");if(nm&&U)nm.textContent=U.name||"seller";
 if(!U||LOADING)return;
 if(!force&&Date.now()-LAST<15000)return;
 LOADING=true;if($("body").hidden)setState("Loading your dashboard...");
 sb.rpc("seller_dashboard").then(function(r){
  LOADING=false;
  if(r.error){$("body").hidden=true;setState(/function|schema cache|does not exist/i.test(r.error.message||"")?"The dashboard is not set up yet. In Supabase > SQL Editor run supabase/seller-dashboard.sql once, then press Refresh.":(window.SM&&SM.msg?SM.msg(r.error):r.error.message),true);return}
  LAST=Date.now();draw(r.data||{});
 },function(){LOADING=false;$("body").hidden=true;setState("Could not load. Check your internet and press Refresh.",true)});
}

root.addEventListener("click",function(e){
 var t=e.target.closest&&e.target.closest("button");if(!t)return;
 if(t.id==="rf"){load(true);return}
 if(t.dataset.cv){window.pendChat={id:t.dataset.cv};NAV.go("messages");route();return}
 if(t.dataset.del){
  if(BUSY)return;
  if(!confirm("Have you sent the account details to the buyer? The buyer will be told that the order is delivered."))return;
  BUSY=true;t.disabled=true;
  sb.rpc("mark_delivered",{p_order:t.dataset.del}).then(function(r){BUSY=false;if(r.error){t.disabled=false;alert(window.SM&&SM.msg?SM.msg(r.error):r.error.message);return}load(true)},function(){BUSY=false;t.disabled=false;alert("Could not save. Please try again.")});
 }
});
window.renderSellerDash=function(){load(false)};
};
