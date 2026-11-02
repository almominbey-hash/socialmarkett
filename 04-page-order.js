/* Order page (payment hold and release) */
init.order=function(root){var $=function(i){return root.querySelector("#"+i)};var d1=$("d1"),d2=$("d2"),d3=$("d3"),log=$("log");

var HOURS=24, S=0, left=HOURS*3600, timer=null, logs=[];
var stage=$("stage"), stepsEl=$("steps"), logEl=$("log");
function now(){return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
function add(t){logs.unshift(now()+" – "+t);logEl.innerHTML=logs.map(function(l){return "<li>"+l+"</li>"}).join("")}
function fmt(s){var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return [h,m,x].map(function(n){return String(n).padStart(2,"0")}).join(":")}
function steps(){var idx=S===0?1:S===1?1:S===2?2:3;
  [].forEach.call(stepsEl.children,function(li,i){li.className=(S>=3||i<idx)?"done":(i===idx?"now":"")});
  if(S===3)[].forEach.call(stepsEl.children,function(li){li.className="done"})}
function render(){
  steps();
  if(S===0){stage.innerHTML='<div class="banner ok"><b>Payment received and held</b>Waiting for the seller to send you the account.</div><p class="small" style="margin:0">The seller has been told to send the login details. You do not need to do anything yet.</p>'}
  if(S===1){stage.innerHTML='<div class="banner warn"><b>Seller is transferring the account</b>We will tell you as soon as it arrives.</div><p class="small" style="margin:0">Nothing to do yet.</p>'}
  if(S===2){stage.innerHTML='<div class="banner warn"><b>Check your account</b>Time left to confirm or report a problem<div class="timer" id="tm">'+fmt(left)+'</div>If you do nothing, the seller is paid when the time ends.</div>'+
    '<b>Before you confirm, check:</b>'+
    '<label class="check"><input type="checkbox" class="c"> I can log in with the new details</label>'+
    '<label class="check"><input type="checkbox" class="c"> The email and password are now mine, and the old recovery email and phone are removed</label>'+
    '<label class="check"><input type="checkbox" class="c"> Subscribers and stats match the listing</label>'+
    '<div class="row"><button class="btn" id="ok" disabled>Confirm and pay seller</button><button class="btn danger" id="bad">Report a problem</button></div>';
    var cs=stage.querySelectorAll(".c"),ok=$("ok");
    [].forEach.call(cs,function(c){c.onchange=function(){ok.disabled=![].every.call(cs,function(x){return x.checked})}});
    ok.onclick=function(){release("You confirmed the account")};
    $("bad").onclick=function(){S=4;add("You reported a problem");stop();render()}}
  if(S===3){stage.innerHTML='<div class="banner ok"><b>All done. The seller has been paid.</b>Thank you for buying on socialmarket.</div><p class="small" style="margin:0">Tip: change the password and turn on two-step login today.</p>'}
  if(S===4){stage.innerHTML='<div class="banner bad"><b>Payment is on hold</b>Your money will not go to the seller until we look into this.</div>'+
    '<label for="why"><b>What went wrong?</b></label><select id="why"><option>I cannot log in</option><option>The old owner still has access</option><option>The stats do not match the listing</option><option>The account was suspended</option><option>Something else</option></select>'+
    '<label for="det" class="small" style="display:block;margin-top:12px">Tell us more (add screenshots later)</label><textarea id="det" rows="3"></textarea>'+
    '<div class="row"><button class="btn" id="send">Send to our team</button><button class="btn line" id="back">Go back</button></div>';
    $("send").onclick=function(){stage.innerHTML='<div class="banner warn"><b>We got your report</b>Our team will contact you and the seller within 24 hours. Your money stays held until it is solved.</div>';add("Report sent to our team")};
    $("back").onclick=function(){S=2;start();render()}}
}
function tick(){left--;var t=$("tm");if(t)t.textContent=fmt(left);if(left<=0)release("Time ended with no problem reported")}
function start(){stop();timer=setInterval(tick,1000)}
function stop(){clearInterval(timer)}
function release(why){stop();S=3;add(why);add("Seller paid PKR 332,500");render()}
function reset(){stop();S=0;left=HOURS*3600;logs=[];add("You paid PKR 367,500. Held by socialmarket");render()}
$("d1").onclick=function(){if(S<2){S=2;add("Seller sent the account");left=HOURS*3600;start();render()}};
$("d2").onclick=function(){if(S===2){left=3;}};
$("d3").onclick=reset;
reset();

};
