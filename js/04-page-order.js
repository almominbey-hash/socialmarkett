/* Orders page (Manage Orders style):
   - tabs with counts: Priority, Active, Incomplete, Late, Delivered, Completed, Cancelled, Starred
   - a table: star, name, status, account, price, delivered date, and an arrow for quick actions
   - click a row to open the order: summary, other person, order number and "Track order"
   The buttons call the order functions made by supabase/orders.sql and supabase/orders-2.sql. */
init.order=function(root){
var $=function(i){return root.querySelector("#"+i)};
var COLS="id,order_no,listing_id,listing_image,listing_title,platform,buyer_id,seller_id,buyer_name,seller_name,amount,currency,status,payment_status,paid_at,delivered_at,completed_at,cancelled_at,release_at,payout_status,disputed,created_at";
var LATE_HOURS=72; /* a paid order that is not delivered after this many hours shows as "Late" */
var ORD=[],STAR={},EV={},EARN={},TAB=null,Q="",VIEW=null,OPENROW=null,BUSY=false,LOADED=false,ERR="";
var TABS=[["priority","Priority"],["active","Active"],["incomplete","Incomplete"],["late","Late"],["delivered","Delivered"],["completed","Completed"],["cancelled","Cancelled"],["starred","Starred"]];
var EMPTY={priority:"You have no priority orders. Nothing needs your attention right now.",active:"You have no active orders.",incomplete:"You have no incomplete orders.",late:"You have no late orders.",delivered:"You have no delivered orders.",completed:"You have no completed orders yet.",cancelled:"You have no cancelled orders.",starred:"You have no starred orders. Tap the star on an order to find it here quickly."};
var LAB={awaiting_payment:"Incomplete",in_progress:"In progress",delivered:"Delivered",completed:"Completed",cancelled:"Cancelled",late:"Late"};
var CLS={awaiting_payment:"warn",in_progress:"info",delivered:"info",completed:"ok",cancelled:"bad",late:"bad"};
var PAYL={unpaid:"Unpaid",paid:"Paid",refunded:"Refunded"};
var EVL={created:"Order placed",paid:"Payment received",delivered:"Order delivered",completed:"Buyer confirmed",dispute:"Problem reported",released:"Payout released",refunded:"Payment refunded",cancelled:"Order cancelled",review:"Payment is being checked"};
var COL=["#1d5fd6","#0f7a4a","#9a3b6b","#b45309","#6d28d9","#0e7490"];

function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function cur(o){return o.currency==="PKR"?"Rs. ":"$"}
function moneyN(n,o){return cur(o)+Number(n).toLocaleString("en-US")}
function money(o){return moneyN(o.amount,o)}
function dfull(t){if(!t)return"";try{return new Date(t).toLocaleString([],{dateStyle:"medium",timeStyle:"short"})}catch(e){return new Date(t).toLocaleString()}}
function dshort(t){if(!t)return"";try{return new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}catch(e){return new Date(t).toLocaleDateString()}}
function dtag(t){try{return new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"}).toUpperCase()}catch(e){return""}}
function ref(o){return"SM-"+o.order_no}
function role(o){return o.buyer_id===U.id?"buy":"sell"}
function other(o){return role(o)==="buy"?o.seller_name:o.buyer_name}
function isFinal(o){return o.status==="completed"||o.status==="cancelled"}
function byId(id){return ORD.filter(function(x){return x.id===id})[0]}
function isLate(o){return o.status==="in_progress"&&!!o.paid_at&&(Date.now()-new Date(o.paid_at).getTime())>LATE_HOURS*3600*1000}
function stKey(o){return isLate(o)?"late":o.status}

/* does this order wait for ME to do something? (Priority tab) */
function needsMe(o){var r=role(o);
 if(o.status==="awaiting_payment")return r==="buy";
 if(o.status==="in_progress")return r==="sell";
 if(o.status==="delivered")return r==="buy"&&!o.disputed;
 return false}
function inTab(o,t){
 if(t==="priority")return!isFinal(o)&&needsMe(o);
 if(t==="active")return o.status==="in_progress";
 if(t==="incomplete")return o.status==="awaiting_payment";
 if(t==="late")return isLate(o);
 if(t==="delivered")return o.status==="delivered";
 if(t==="completed"||t==="cancelled")return o.status===t;
 if(t==="starred")return!!STAR[o.id];
 return false}

function hint(o){var r=role(o),rel=dfull(o.release_at);
 if(o.status==="cancelled")return"This order was cancelled.";
 if(r==="buy"){
  if(o.status==="awaiting_payment")return"Pay to start your order.";
  if(o.status==="in_progress")return"Payment received. The seller is getting your account ready.";
  if(o.disputed)return"You reported a problem. Our team is looking into it.";
  if(o.status==="delivered")return"Check the account, then confirm. You can report a problem until we release the payment (after "+rel+").";
  return o.payout_status==="held"?"Order completed. You can still report a problem until "+rel+".":"Order completed."}
 if(o.status==="awaiting_payment")return"Waiting for the buyer to pay.";
 if(o.status==="in_progress")return"Paid. Send the account details to the buyer in Messages, then press Mark as delivered.";
 if(o.disputed)return"The buyer reported a problem. Our team will contact you.";
 if(o.payout_status==="released")return"Completed. Your payout was released.";
 return"Delivered. Your payout is held until "+rel+"."}

function btns(o){var r=role(o),h="";
 function b(a,t,c){return'<button type="button" class="btn'+(c?" "+c:"")+'" data-a="'+a+'" data-id="'+o.id+'"'+(BUSY?" disabled":"")+">"+t+"</button>"}
 if(r==="buy"){
  if(o.status==="awaiting_payment")h+=b("pay","Pay now")+b("cancel","Cancel order","line");
  if(o.status==="delivered"&&!o.disputed)h+=b("confirm","Confirm received");
  if(o.payout_status==="held"&&!o.disputed&&(o.status==="delivered"||o.status==="completed"))h+=b("report","Report a problem","line")}
 else if(o.status==="in_progress")h+=b("deliver","Mark as delivered");
 return h}

function av(name,big){var s=String(name||"?"),h=0,i;for(i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%997;
 return'<i class="av'+(big?" big":"")+'" style="background:'+COL[h%COL.length]+'">'+E(s.charAt(0).toUpperCase())+"</i>"}
function thumb(o){return o.listing_image?'<img src="'+E(o.listing_image)+'" alt="" loading="lazy">':'<i class="ph">'+E(String(o.platform).charAt(0))+"</i>"}
function badge(o){var k=stKey(o);return'<span class="bd '+CLS[k]+'">'+LAB[k]+"</span>"}

/* ---------- list view ---------- */
function shell(){var v=$("ov");if(!v||$("lv"))return;
 v.innerHTML='<div id="lv"><div class="hd"><h1>Manage Orders</h1><label class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Search orders" autocomplete="off"></label></div><div class="tabs" id="tb" role="tablist"></div><div id="ls"></div></div><div id="dv" hidden></div>'}

function drawTabs(){var t=$("tb");if(!t)return;
 if(!LOADED){t.innerHTML="";return}
 t.innerHTML=TABS.map(function(n){var c=ORD.filter(function(o){return inTab(o,n[0])}).length;
  return'<button type="button" role="tab" class="tab'+(TAB===n[0]?" on":"")+'" aria-selected="'+(TAB===n[0])+'" data-tab="'+n[0]+'">'+n[1]+" ("+c+")</button>"}).join("")}

function row(o){var r=role(o),op=OPENROW===o.id,nm=other(o),bt=btns(o),st=!!STAR[o.id];
 return'<div class="tr'+(op?" open":"")+'"><div class="rw" data-open="'+o.id+'" role="link" tabindex="0">'+
  '<button type="button" class="stb'+(st?" on":"")+'" data-star="'+o.id+'" aria-pressed="'+st+'" aria-label="Star this order">'+(st?"\u2605":"\u2606")+"</button>"+
  '<div class="nm">'+av(nm)+"<span><b>"+E(nm)+"</b><small>"+(r==="buy"?"Seller":"Buyer")+" \u00b7 "+ref(o)+"</small></span></div>"+
  '<div class="sc">'+badge(o)+"<small>"+PAYL[o.payment_status]+"</small></div>"+
  '<div class="sv">'+thumb(o)+"<span>"+E(o.platform)+" \u00b7 "+E(o.listing_title)+"</span></div>"+
  '<div class="pr">'+money(o)+"/Single payment</div>"+
  '<div class="dl">'+(o.delivered_at?E(dshort(o.delivered_at)):"\u2014")+"</div>"+
  '<button type="button" class="cv" data-chev="'+o.id+'" aria-expanded="'+op+'" aria-label="Show actions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></div>'+
  (op?'<div class="xp"><p class="hint">'+E(hint(o))+"</p>"+(bt?'<div class="acts">'+bt+"</div>":"")+"</div>":"")+"</div>"}

function drawList(){var l=$("ls");if(!l)return;
 if(ERR){l.innerHTML='<div class="box"><p style="margin:0">'+E(ERR)+"</p></div>";return}
 if(!LOADED){l.innerHTML='<p class="m">Loading...</p>';return}
 var list=ORD.filter(function(o){if(!inTab(o,TAB))return false;if(!Q)return true;
  return(ref(o)+" "+o.listing_title+" "+o.platform+" "+other(o)).toLowerCase().indexOf(Q)>-1});
 var TH='<div class="th"><span></span><span>Name</span><span>Status</span><span>Service</span><span>Price</span><span>Delivered at</span><span></span></div>';
 if(!list.length){l.innerHTML=TH+'<div class="empty"><p>'+(Q?"No orders match your search.":EMPTY[TAB])+"</p></div>";return}
 l.innerHTML=TH+list.map(row).join("")}

/* ---------- order page ---------- */
function titleOf(o){var r=role(o);
 if(o.disputed&&!isFinal(o))return"A problem was reported";
 var T={buy:{awaiting_payment:"Complete your payment",in_progress:"Your order is in progress",delivered:"Your order was delivered",completed:"Order completed",cancelled:"Order cancelled"},
        sell:{awaiting_payment:"Waiting for payment",in_progress:"Deliver this account",delivered:"Waiting for the buyer",completed:"Order completed",cancelled:"Order cancelled"}};
 return T[r][o.status]}

function drawDetail(){var d=$("dv"),o=byId(VIEW);if(!d)return;
 if(!o){VIEW=null;d.hidden=true;$("lv").hidden=false;return}
 var r=role(o),nm=other(o),ev=EV[o.id],bt=btns(o),kick;
 if(o.status==="completed"&&r==="sell"&&EARN[o.id]!=null)kick="Great job! You earned "+moneyN(EARN[o.id],o)+" from this order.";
 else kick=LAB[stKey(o)]+" \u00b7 Order "+ref(o);
 var pl={none:"Not started",held:o.release_at?"Held until "+dfull(o.release_at):"Held (the 24 hour hold starts when you deliver)",released:"Released",refunded:"Refunded to the buyer"};
 var det='<p class="fact"><span>Ordered by</span><b>'+E(r==="buy"?"You":o.buyer_name)+"</b></p>"+
  '<p class="fact"><span>Date ordered</span><b>'+E(dfull(o.created_at))+"</b></p>"+
  '<p class="fact"><span>Account</span><b>'+E(o.platform)+" \u00b7 "+E(o.listing_title)+"</b></p>"+
  '<p class="fact"><span>Payment</span><b>'+PAYL[o.payment_status]+(o.paid_at?" \u00b7 "+E(dfull(o.paid_at)):"")+"</b></p>"+
  (r==="sell"?'<p class="fact"><span>Your payout</span><b>'+E(pl[o.payout_status]||"")+"</b></p>":"");
 var tl=!ev?'<p class="m">Loading...</p>':!ev.length?'<p class="m">No steps yet.</p>':
  '<ol class="tl">'+ev.map(function(x){return"<li><small>"+E(dtag(x.created_at))+"</small><b>"+E(EVL[x.kind]||x.kind)+"</b>"+(x.kind==="dispute"&&x.note?"<span>"+E(x.note)+"</span>":"")+"</li>"}).join("")+"</ol>";
 d.innerHTML='<button type="button" class="back" data-back="1">\u2190 Back to orders</button>'+
 '<div class="dg"><div class="mn">'+
  '<section class="card"><p class="kick">'+E(kick)+'</p><h2 class="big">'+E(titleOf(o))+'</h2><p class="hint" style="padding:0">'+E(hint(o))+"</p>"+(bt?'<div class="acts" style="padding:14px 0 0">'+bt+"</div>":"")+"</section>"+
  '<details class="card" open><summary>Your order details</summary><div class="inner">'+det+"</div></details></div>"+
  '<aside class="sd"><section class="card"><div class="sm">'+thumb(o)+'<div><b class="ttl">'+E(o.listing_title)+"</b>"+badge(o)+"</div></div>"+
   '<hr><div class="who">'+av(nm,true)+"<div><b>"+E(nm)+"</b><small>"+(r==="buy"?"Seller":"Buyer")+'</small></div></div><button type="button" class="btn line full" data-conv="'+o.id+'">\u2709 View conversation</button><hr>'+
   '<p class="fact"><span>Ordered by</span><b>'+E(o.buyer_name)+"</b></p>"+
   '<p class="fact"><span>Delivery date</span><b>'+(o.delivered_at?E(dfull(o.delivered_at)):"\u2014")+"</b></p>"+
   '<p class="fact"><span>Total price</span><b>'+money(o)+"</b></p>"+
   '<p class="fact"><span>Order number</span><b>#'+ref(o)+"</b></p><hr>"+
   '<details open><summary>Track order</summary><div class="inner">'+tl+"</div></details></section></aside></div>"}

function openOrder(id){VIEW=id;var o=byId(id);if(!o)return;
 $("lv").hidden=true;$("dv").hidden=false;
 if(!EV[id])loadEv(id);
 if(role(o)==="sell"&&EARN[id]===undefined)loadEarn(id);
 drawDetail();window.scrollTo(0,0)}
function closeOrder(){VIEW=null;$("dv").hidden=true;$("lv").hidden=false;draw();window.scrollTo(0,0)}

function draw(){shell();drawTabs();drawList();if(VIEW)drawDetail()}

/* ---------- loading ---------- */
function loadEv(id){
 sb.from("order_events").select("kind,note,created_at").eq("order_id",id).order("created_at",{ascending:true})
  .then(function(r){EV[id]=(r&&r.data)||[];if(VIEW===id)drawDetail()},function(){EV[id]=[];if(VIEW===id)drawDetail()})}
function loadEarn(id){
 sb.rpc("order_earning",{p_order:id}).then(function(r){EARN[id]=(r&&!r.error&&r.data!=null)?Number(r.data):null;if(VIEW===id)drawDetail()},function(){EARN[id]=null})}

function load(){ERR="";
 var a=sb.from("orders").select(COLS).order("created_at",{ascending:false}),
     s=sb.from("order_stars").select("order_id");
 return Promise.all([a,s]).then(function(x){var r=x[0],st=x[1];
  if(r.error){console.error(r.error);ERR="Orders are not available yet. Please try again soon.";ORD=[]}else ORD=r.data||[];
  STAR={};if(st&&st.data)st.data.forEach(function(k){STAR[k.order_id]=true});
  LOADED=true;
  if(TAB===null){var f=["priority","active","incomplete","delivered","completed","cancelled"].filter(function(t){return ORD.some(function(o){return inTab(o,t)})})[0];TAB=f||"priority"}
  draw();
  if(window.pendOrder){var p=byId(window.pendOrder);window.pendOrder=null;if(p)openOrder(p.id)}},
  function(){ERR="Could not load your orders. Please check your connection.";LOADED=true;draw()})}

/* Payment gateway hook: when you add a payment gateway, define window.payOrder(order) and it is used here. */
function pay(o){
 if(typeof window.payOrder==="function"){window.payOrder(o);return}
 alert("Online payment is not open yet. Your order "+ref(o)+" is saved, and you can pay as soon as payment opens.")}

function run(a,id){if(BUSY)return;
 var o=byId(id);if(!o)return;
 if(a==="pay"){pay(o);return}
 var fn,args={p_order:id};
 if(a==="cancel"){if(!confirm("Cancel this order?"))return;fn="cancel_order"}
 else if(a==="deliver"){if(!confirm("Have you sent the account details to the buyer? The buyer will be told that the order is delivered."))return;fn="mark_delivered"}
 else if(a==="confirm"){if(!confirm("Confirm that you received the account and it is as described?"))return;fn="confirm_received"}
 else if(a==="report"){var n=prompt("What is the problem? The seller and our team will see this.");if(n===null)return;n=n.trim();
  if(n.length<10){alert("Please write a few words about the problem.");return}fn="report_problem";args.p_note=n}
 else return;
 BUSY=true;draw();
 sb.rpc(fn,args).then(function(r){BUSY=false;if(r.error)alert(SM.msg(r.error));
  delete EV[id];delete EARN[id];
  load().then(function(){if(VIEW===id){loadEv(id);if(byId(id)&&role(byId(id))==="sell")loadEarn(id)}})},
  function(){BUSY=false;alert("Something went wrong. Please try again.");draw()})}

function star(id){var on=!STAR[id];if(on)STAR[id]=true;else delete STAR[id];draw();
 var q=on?sb.from("order_stars").insert({user_id:U.id,order_id:id}):sb.from("order_stars").delete().eq("order_id",id).eq("user_id",U.id);
 q.then(function(r){if(r&&r.error){if(on)delete STAR[id];else STAR[id]=true;draw()}},function(){})}

function conv(id){var o=byId(id);if(!o)return;
 if(!o.listing_id){alert("There is no conversation for this order.");return}
 sb.from("conversations").select("id").eq("listing_id",o.listing_id).eq("buyer_id",o.buyer_id).limit(1).then(function(x){
  var c=x&&x.data&&x.data[0];
  if(c){window.pendChat={id:c.id};NAV.go("messages");route();return}
  if(role(o)==="buy"){sb.rpc("start_conversation",{p_listing:o.listing_id}).then(function(y){
   if(y.error){alert("No conversation could be opened for this order.");return}
   window.pendChat={id:y.data};NAV.go("messages");route()});return}
  alert("The buyer has not sent you a message about this order yet.")})}

/* ---------- clicks ---------- */
root.addEventListener("click",function(e){var t=e.target,x;
 if(!t||!t.closest)return;
 if(x=t.closest("[data-star]")){star(x.dataset.star);return}
 if(x=t.closest("[data-chev]")){var i=x.dataset.chev;OPENROW=OPENROW===i?null:i;drawList();return}
 if(x=t.closest("[data-a]")){run(x.dataset.a,x.dataset.id);return}
 if(x=t.closest("[data-conv]")){conv(x.dataset.conv);return}
 if(t.closest("[data-back]")){closeOrder();return}
 if(x=t.closest("[data-tab]")){TAB=x.dataset.tab;OPENROW=null;drawTabs();drawList();return}
 if(x=t.closest("[data-open]")){openOrder(x.dataset.open)}});
root.addEventListener("keydown",function(e){
 if(e.key!=="Enter"&&e.key!==" ")return;var x=e.target.closest&&e.target.closest("[data-open]");
 if(x&&e.target===x){e.preventDefault();openOrder(x.dataset.open)}});
root.addEventListener("input",function(e){if(e.target&&e.target.id==="q"){Q=e.target.value.trim().toLowerCase();drawList()}});

window.renderOrders=function(){if(!U)return;
 VIEW=null;OPENROW=null;shell();var d=$("dv");if(d)d.hidden=true;var l=$("lv");if(l)l.hidden=false;
 if(!LOADED)drawList();
 load()};
};
