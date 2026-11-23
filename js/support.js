/* Support tickets page: create a ticket, see my tickets, read the team's replies, reply back. */
(function(){
var $=function(i){return document.getElementById(i)},TK=[],OPEN=null;
var TOPICS={seller:["Selling on the site","seller_help"],safety:["Trust & safety","trust_safety"],general:["Help centre / other","help_center"]};
var CATS={
 seller:["Listing problem","Seller verification (ID)","Payout or fees","An order I am delivering","Change my payout account","Other"],
 safety:["I think I was scammed","Report a user or listing","Account safety","Report a problem with an order","Other"],
 general:["Buying help","My order","Payment problem","My account or login","Other"]};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function when(d){try{return new Date(d).toLocaleString([], {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch(e){return""}}
function say(id,t,ok){var e=$(id);if(!t){e.className="msg";return}e.textContent=t;e.className="msg on "+(ok?"ok":"err")}
function err(e){return (e&&e.message)?e.message:"Something went wrong. Please try again."}
var SL={open:"Waiting for us",answered:"We replied",closed:"Closed"};
function topic(){var m=/[?&]topic=(\w+)/.exec(location.search);return m&&TOPICS[m[1]]?m[1]:"general"}
function fillTopics(){var t=$("tp");t.innerHTML=Object.keys(TOPICS).map(function(k){return'<option value="'+k+'">'+esc(TOPICS[k][0])+"</option>"}).join("");t.value=topic();fillCats()}
function fillCats(){$("cat").innerHTML=CATS[$("tp").value].map(function(c){return"<option>"+esc(c)+"</option>"}).join("")}
function load(){return sb.from("support_tickets").select("*").order("updated_at",{ascending:false}).then(function(r){if(r.error){$("tks").innerHTML='<p class="msg on err">'+esc(err(r.error))+(/relation|does not exist/i.test(r.error.message||"")?" (Run supabase/support-tickets.sql once.)":"")+"</p>";return}
 TK=r.data||[];$("tks").innerHTML=TK.length?TK.map(function(t,i){return'<button type="button" class="tk" data-i="'+i+'"><span><b>'+esc(t.subject)+"</b><small>T-"+t.ticket_no+" &middot; "+esc(t.category)+" &middot; "+when(t.updated_at)+'</small></span><span class="st '+t.status+'">'+SL[t.status]+"</span></button>"}).join(""):'<p style="color:var(--muted)">You have no tickets yet.</p>'})}
function openT(i){OPEN=TK[i];$("list").hidden=true;$("view").hidden=false;$("vt").textContent=OPEN.subject;
 $("vs").innerHTML='<span class="st '+OPEN.status+'">'+SL[OPEN.status]+"</span> <small style=\"color:var(--muted)\">T-"+OPEN.ticket_no+" &middot; "+esc(OPEN.category)+"</small>";
 $("rp").hidden=OPEN.status==="closed";$("th").innerHTML="Loading…";say("m2","");
 sb.from("support_messages").select("*").eq("ticket_id",OPEN.id).order("created_at",{ascending:true}).then(function(r){
  $("th").innerHTML=(r.data||[]).map(function(m){return'<div class="bub '+(m.from_admin?"team":"me")+'"><small>'+(m.from_admin?"Support team":"You")+" &middot; "+when(m.created_at)+"</small>"+esc(m.body)+"</div>"}).join("")||"No messages."})}
function start(){
 fillTopics();$("tp").onchange=fillCats;
 $("send").onclick=function(){var s=$("sub").value.trim(),b=$("body").value.trim();say("m1","");
  if(s.length<5){say("m1","Please write a short subject (at least 5 letters).");return}
  if(b.length<20){say("m1","Please tell us more (at least 20 letters).");return}
  $("send").disabled=true;
  sb.rpc("create_ticket",{p_source:TOPICS[$("tp").value][1],p_category:$("cat").value,p_subject:s,p_body:b}).then(function(r){$("send").disabled=false;
   if(r.error){say("m1",err(r.error));return}
   $("sub").value="";$("body").value="";say("m1","Your ticket was sent. We will reply here.",1);
   load().then(function(){var i=TK.findIndex(function(t){return t.id===r.data});if(i>-1)openT(i)})})};
 $("tks").onclick=function(e){var b=e.target.closest(".tk");if(b)openT(+b.dataset.i)};
 $("back").onclick=function(){$("view").hidden=true;$("list").hidden=false;load()};
 $("rs").onclick=function(){var b=$("rb").value.trim();if(!OPEN||b.length<2){say("m2","Please write your reply.");return}$("rs").disabled=true;
  sb.rpc("ticket_reply",{p_ticket:OPEN.id,p_body:b}).then(function(r){$("rs").disabled=false;if(r.error){say("m2",err(r.error));return}$("rb").value="";say("m2","");
   load().then(function(){var i=TK.findIndex(function(t){return t.id===OPEN.id});if(i>-1)openT(i)})})};
 load()}
sb.auth.getSession().then(function(r){if(r.data&&r.data.session){$("app").hidden=false;start()}else $("gate").hidden=false});
})();
