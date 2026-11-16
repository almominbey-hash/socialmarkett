/* Account settings page (opened from the profile menu > Settings & security).
   Box 1: Personal information (name on ID, phone shown with dots). Box 2: Account & security (email, password, two-step "coming soon"). */
init.settings=function(root){
var $=function(i){return root.querySelector("#"+i)};
var INFO=null,EDIT=false,PW=false,MSG={pi:"",pw:""};
function X(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

window.renderSettings=function(){
  if(!U)return;
  $("body").hidden=true;$("st").className="state";$("st").textContent="Loading...";
  load().then(function(){$("st").textContent="";$("body").hidden=false});
};

function load(){
  return sb.rpc("get_my_personal_info").then(function(r){
    if(r.error)throw r.error;
    INFO=r.data||{};
  }).catch(function(){
    /* the database part (supabase/account-settings.sql) is not installed yet: still show the page */
    INFO={name:U.name||"",phone_masked:"",has_phone:false,kyc:U.kyc||"none",email:U.email||"",missing:true};
  }).then(function(){EDIT=false;PW=false;draw()});
}

function locked(){return INFO&&(INFO.kyc==="pending"||INFO.kyc==="verified")}

/* ---------- box 1: personal information ---------- */
function drawPI(){
  var h='<div class="ch"><h2 id="pit">Personal information</h2>'+(EDIT?'':'<button type="button" class="btn line sm" data-a="pi-edit">Edit</button>')+'</div>';
  if(!EDIT){
    h+='<div class="row"><div><small>Full name (as on your ID)</small><b>'+(INFO.name?X(INFO.name):'<span class="mut">Not added</span>')+'</b></div></div>'+
       '<div class="row"><div><small>Phone number</small><b>'+(INFO.has_phone?X(INFO.phone_masked):'<span class="mut">Not added</span>')+'</b></div></div>';
    if(INFO.missing)h+='<p class="note">Saved details could not be loaded. Please run supabase/account-settings.sql once in Supabase.</p>';
  }else{
    h+='<form class="f" id="pf" autocomplete="off">'+
       '<label class="f">Full name (as on your ID)<input id="pn" type="text" maxlength="80" value="'+X(INFO.name)+'"'+(locked()?' disabled':'')+'></label>'+
       (locked()?'<p class="note" style="margin:-8px 0 14px">Your name is locked after identity verification. Contact support to change it.</p>':'')+
       '<label class="f">Phone number<input id="pp" type="tel" inputmode="tel" maxlength="20" placeholder="'+(INFO.has_phone?X(INFO.phone_masked)+' (leave empty to keep)':'+92 300 1234567')+'"></label>'+
       '<div class="acts"><button class="btn" type="submit" id="ps">Save</button><button class="btn line" type="button" data-a="pi-cancel">Cancel</button></div></form>';
  }
  h+='<p class="msg'+(MSG.pi&&MSG.pi.bad?' bad':' ok')+'" id="pim">'+X(MSG.pi?MSG.pi.t:"")+'</p>';
  $("pi").innerHTML=h;
}

/* ---------- box 2: account & security ---------- */
function drawSec(){
  var h='<div class="ch"><h2 id="sct">Account &amp; security</h2></div>'+
   '<div class="row"><div><small>Email</small><b>'+X(INFO.email||U.email)+'</b></div></div>';
  if(!PW){
    h+='<div class="row"><div><small>Password</small><b>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</b></div><button type="button" class="btn line sm" data-a="pw-open">Change</button></div>';
  }else{
    h+='<form class="f" id="wf" autocomplete="off" style="border-top:1px solid var(--line);padding-top:14px">'+
       '<label class="f">Current password<input id="wc" type="password" autocomplete="current-password"></label>'+
       '<label class="f">New password (at least 8 characters)<input id="wn" type="password" autocomplete="new-password"></label>'+
       '<label class="f">Confirm new password<input id="wr" type="password" autocomplete="new-password"></label>'+
       '<div class="acts"><button class="btn" type="submit" id="ws">Update password</button><button class="btn line" type="button" data-a="pw-cancel">Cancel</button></div></form>';
  }
  h+='<div class="row"><div><small>Two-step verification</small><b>Add an extra check when you sign in<span class="pill">Coming soon</span></b></div><button type="button" class="btn line sm" data-a="2fa">Set up</button></div>'+
     '<p class="msg'+(MSG.pw&&MSG.pw.bad?' bad':' ok')+'" id="pwm">'+X(MSG.pw?MSG.pw.t:"")+'</p>';
  $("sec").innerHTML=h;
}

function draw(){drawPI();drawSec()}

/* ---------- clicks ---------- */
root.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-a]");if(!b)return;var a=b.dataset.a;
  if(a==="pi-edit"){EDIT=true;MSG.pi="";drawPI();var n=root.querySelector("#pn");if(n&&!n.disabled)n.focus();else{var p=root.querySelector("#pp");if(p)p.focus()}}
  else if(a==="pi-cancel"){EDIT=false;MSG.pi="";drawPI()}
  else if(a==="pw-open"){PW=true;MSG.pw="";drawSec();var c=root.querySelector("#wc");if(c)c.focus()}
  else if(a==="pw-cancel"){PW=false;MSG.pw="";drawSec()}
  else if(a==="2fa"){if(window.SMSoon)window.SMSoon("Two-step verification")}
});

/* ---------- save personal information ---------- */
root.addEventListener("submit",function(e){
  e.preventDefault();
  if(e.target.id==="pf")savePI();
  else if(e.target.id==="wf")savePW();
});

function savePI(){
  var nEl=root.querySelector("#pn"),pEl=root.querySelector("#pp"),btn=root.querySelector("#ps");
  var name=nEl&&!nEl.disabled?nEl.value.trim().replace(/\s+/g," "):"",phone=pEl.value.trim();
  var nameChanged=!!name&&name!==INFO.name;
  if(!nameChanged&&!phone){EDIT=false;MSG.pi="";drawPI();return}
  if(nameChanged&&name.length<3){MSG.pi={t:"Please enter your full name.",bad:1};drawPI();EDIT=true;return}
  if(phone&&!/^\+?[0-9 ]{8,18}$/.test(phone)){showPI("Enter a valid phone number (8 to 15 digits).",1);return}
  btn.disabled=true;
  sb.rpc("update_my_personal_info",{p_name:nameChanged?name:null,p_phone:phone||null}).then(function(r){
    if(r.error)throw r.error;
    return SM.refresh().catch(function(){});
  }).then(function(){
    return sb.rpc("get_my_personal_info");
  }).then(function(r){
    if(r&&r.data)INFO=r.data;
    EDIT=false;MSG.pi={t:"Saved."};drawPI();drawSec();
  }).catch(function(err){btn.disabled=false;showPI(SM.msg(err),1)});
}
function showPI(t,bad){var m=root.querySelector("#pim");if(m){m.textContent=t;m.className="msg "+(bad?"bad":"ok")}}

/* ---------- change password ---------- */
function savePW(){
  var cur=root.querySelector("#wc").value,np=root.querySelector("#wn").value,rp=root.querySelector("#wr").value,btn=root.querySelector("#ws");
  var say=function(t,bad){var m=root.querySelector("#pwm");m.textContent=t;m.className="msg "+(bad?"bad":"ok")};
  if(!cur){say("Enter your current password.",1);return}
  if(np.length<8){say("The new password must be at least 8 characters.",1);return}
  if(np!==rp){say("The two new passwords do not match.",1);return}
  if(np===cur){say("Choose a password different from the current one.",1);return}
  btn.disabled=true;
  sb.auth.signInWithPassword({email:U.email,password:cur}).then(function(r){
    if(r.error)throw new Error("Current password is incorrect.");
    return sb.auth.updateUser({password:np});
  }).then(function(r){
    if(r.error)throw r.error;
    PW=false;MSG.pw={t:"Password changed."};drawSec();
  }).catch(function(err){btn.disabled=false;say(SM.msg(err),1)});
}
};
