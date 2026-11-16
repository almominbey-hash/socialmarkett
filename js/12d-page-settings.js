/* Account settings. Three screens inside one page:
   1) hub: two boxes (Personal information, Account security)
   2) Personal information: full name, email (hidden with stars), phone, ID card status
   3) Account security: password, two-step verification (coming soon), sign out of other devices
   Rule: if the person's ID is in review or approved and they change the name or phone, the ID goes back to review. */
init.settings=function(root){
var $=function(i){return root.querySelector("#"+i)};
var INFO=null,VIEW="hub",EDIT=null,MSG={};
function X(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

var IC={
 user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M15 7h6M15 11h6M17 15h4"/></svg>',
 shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 3 8.2 7 10 4-1.8 7-5.4 7-10V6z"/><rect x="9.5" y="10.5" width="5" height="4.5" rx="1"/><path d="M10.5 10.5V9a1.5 1.5 0 0 1 3 0v1.5"/></svg>'
};

/* email shown with stars, like m***********9@g***l.com */
function maskEmail(e){
  e=String(e||"");var i=e.indexOf("@");if(i<1)return e;
  var l=e.slice(0,i),d=e.slice(i+1),dot=d.indexOf("."),dn=dot>-1?d.slice(0,dot):d,rest=dot>-1?d.slice(dot):"";
  var ml=l.length<3?l.charAt(0)+"***":l.charAt(0)+new Array(l.length-1).join("*")+l.slice(-1);
  var md=dn.length<3?dn.charAt(0)+"***":dn.charAt(0)+"***"+dn.slice(-1);
  return ml+"@"+md+rest;
}

window.renderSettings=function(){
  if(!U)return;
  VIEW="hub";EDIT=null;MSG={};
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
  }).then(draw);
}

function inReview(){return INFO&&(INFO.kyc==="pending"||INFO.kyc==="verified")}
function kycLabel(){
  var k=INFO.kyc;
  if(k==="verified")return'<span class="pill ok">Verified</span>';
  if(k==="pending")return'<span class="pill wait">In review</span>';
  if(k==="rejected")return'<span class="pill">Not approved</span>';
  return'<span class="pill">Not submitted</span>';
}
function msg(k){var m=MSG[k];return'<p class="msg'+(m&&m.bad?' bad':' ok')+'" id="m-'+k+'" role="status">'+X(m?m.t:"")+'</p>'}
function say(k,t,bad){MSG[k]={t:t,bad:bad};var m=root.querySelector("#m-"+k);if(m){m.textContent=t;m.className="msg "+(bad?"bad":"ok")}}

/* one line of the list: title, value under it, and a link on the right */
function row(title,value,act,label){
  return'<div class="row"><div class="rh"><div><b>'+title+'</b>'+(value?'<small>'+value+'</small>':'')+'</div>'+
    (act?'<button type="button" class="lnk" data-a="'+act+'">'+label+'</button>':'')+'</div>';
}

/* ---------- screen 1: hub ---------- */
function drawHub(){
  var nm=INFO.name||U.name||"";
  return'<div class="top"><h1>Account settings</h1><a href="/dash">Go to profile</a></div>'+
   '<p class="m">'+(nm?X(nm)+' ('+X(maskEmail(INFO.email||U.email))+')':X(maskEmail(INFO.email||U.email)))+'</p>'+
   '<div class="grid">'+
   '<button type="button" class="tile" data-a="go-pi">'+IC.user+'<b>Personal information</b><span>Update your name and phone number, and see your ID card status.</span></button>'+
   '<button type="button" class="tile" data-a="go-sec">'+IC.shield+'<b>Account security</b><span>Update your password and manage additional security settings.</span></button>'+
   '</div>';
}

/* ---------- screen 2: personal information ---------- */
function drawPI(){
  var h='<button type="button" class="back" data-a="back">&#8592; Account settings</button><h1>Personal information</h1><div class="list">';
  /* full name */
  h+=row("Full name",EDIT==="name"?"":(INFO.name?X(INFO.name):"Not added"),EDIT==="name"?"":"e-name","Edit");
  if(EDIT==="name")h+='<form class="f" id="fn" autocomplete="off"><label class="f">Full name (as on your ID)<input id="pn" type="text" maxlength="80" value="'+X(INFO.name)+'"></label>'+warnReview()+'<div class="acts"><button class="btn" type="submit" id="sn">Save</button><button class="btn line" type="button" data-a="cancel">Cancel</button></div></form>';
  h+='</div>';
  /* email (hidden with stars, cannot be changed here) */
  h+=row("Email address",X(maskEmail(INFO.email||U.email)))+'</div>';
  /* phone */
  h+=row("Phone number",EDIT==="phone"?"":(INFO.has_phone?X(INFO.phone_masked):"Not added"),EDIT==="phone"?"":"e-phone","Edit");
  if(EDIT==="phone")h+='<form class="f" id="fp" autocomplete="off"><label class="f">New phone number<input id="pp" type="tel" inputmode="tel" maxlength="20" placeholder="+92 300 1234567"></label>'+warnReview()+'<div class="acts"><button class="btn" type="submit" id="sp">Save</button><button class="btn line" type="button" data-a="cancel">Cancel</button></div></form>';
  h+='</div>';
  /* ID card: only shown, cannot be edited */
  h+='<div class="row"><div class="rh"><div><b>ID card</b><small>'+kycLabel()+'</small></div></div>'+
     '<p class="note">Your ID card cannot be changed here. If you change your name or phone number, your ID goes back to review.</p></div>';
  h+='</div>';
  if(INFO.missing)h+='<p class="note warn">Saved details could not be loaded. Please run supabase/account-settings.sql once in Supabase.</p>';
  return h+msg("pi");
}
function warnReview(){return inReview()?'<p class="note warn" style="margin:-6px 0 14px">Changing this sends your ID back for review. Your seller account will wait until it is approved again.</p>':''}

/* ---------- screen 3: account security ---------- */
function drawSec(){
  var h='<button type="button" class="back" data-a="back">&#8592; Account settings</button><h1>Account security</h1><div class="list">';
  h+='<div class="row"><div class="rh"><div><b>Password</b>'+(EDIT==="pw"?'':'<small>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</small>')+'</div>'+(EDIT==="pw"?'':'<button type="button" class="lnk" data-a="e-pw">Edit</button>')+'</div>';
  if(EDIT==="pw")h+='<form class="f" id="fw" autocomplete="off">'+
     '<label class="f">Current password<input id="wc" type="password" autocomplete="current-password"></label>'+
     '<label class="f">New password (at least 8 characters)<input id="wn" type="password" autocomplete="new-password"></label>'+
     '<label class="f">Confirm new password<input id="wr" type="password" autocomplete="new-password"></label>'+
     '<div class="acts"><button class="btn" type="submit" id="sw">Update password</button><button class="btn line" type="button" data-a="cancel">Cancel</button></div></form>';
  h+='</div>';
  h+='<div class="row"><div class="rh"><div><b>Two-factor authentication</b><small>Not set<span class="pill">Coming soon</span></small></div><button type="button" class="lnk" data-a="2fa">Add</button></div></div>';
  h+='<div class="row"><div class="rh"><div><b>Connected devices</b><small>Sign out everywhere except this device</small></div><button type="button" class="lnk" data-a="others" id="so">Sign out</button></div></div>';
  h+='</div>';
  return h+msg("sec");
}

function draw(){
  $("body").innerHTML=VIEW==="pi"?drawPI():VIEW==="sec"?drawSec():drawHub();
}

/* ---------- clicks ---------- */
root.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest("[data-a]");if(!b)return;var a=b.dataset.a;
  if(a==="go-pi"||a==="go-sec"){VIEW=a==="go-pi"?"pi":"sec";EDIT=null;MSG={};draw();window.scrollTo(0,0)}
  else if(a==="back"){VIEW="hub";EDIT=null;MSG={};draw();window.scrollTo(0,0)}
  else if(a==="cancel"){EDIT=null;MSG={};draw()}
  else if(a==="e-name"||a==="e-phone"||a==="e-pw"){
    EDIT=a==="e-name"?"name":a==="e-phone"?"phone":"pw";MSG={};draw();
    var f=root.querySelector("#pn")||root.querySelector("#pp")||root.querySelector("#wc");if(f)f.focus()}
  else if(a==="2fa"){if(window.SMSoon)window.SMSoon("Two-factor authentication")}
  else if(a==="others")signOutOthers(b);
});
root.addEventListener("submit",function(e){
  e.preventDefault();
  if(e.target.id==="fn")savePI("name");
  else if(e.target.id==="fp")savePI("phone");
  else if(e.target.id==="fw")savePW();
});

/* ---------- save name or phone ---------- */
function savePI(which){
  var btn=root.querySelector(which==="name"?"#sn":"#sp"),name=null,phone=null;
  if(which==="name"){
    name=root.querySelector("#pn").value.trim().replace(/\s+/g," ");
    if(name===INFO.name){EDIT=null;draw();return}
    if(name.length<3){say("pi","Please enter your full name.",1);return}
  }else{
    phone=root.querySelector("#pp").value.trim();
    if(!phone){say("pi","Enter your new phone number.",1);return}
    if(!/^\+?[0-9 ]{8,18}$/.test(phone)){say("pi","Enter a valid phone number (8 to 15 digits).",1);return}
  }
  if(inReview()&&!confirm("Your ID card will go back to review after this change. Continue?"))return;
  btn.disabled=true;
  var review=false;
  sb.rpc("update_my_personal_info",{p_name:name,p_phone:phone}).then(function(r){
    if(r.error)throw r.error;
    review=!!(r.data&&r.data.review);
    return SM.refresh().catch(function(){});
  }).then(function(){return sb.rpc("get_my_personal_info")}).then(function(r){
    if(r&&r.data)INFO=r.data;
    EDIT=null;MSG.pi={t:review?"Saved. Your ID card is back in review.":"Saved."};draw();
  }).catch(function(err){btn.disabled=false;say("pi",SM.msg(err),1)});
}

/* ---------- change password ---------- */
function savePW(){
  var cur=root.querySelector("#wc").value,np=root.querySelector("#wn").value,rp=root.querySelector("#wr").value,btn=root.querySelector("#sw");
  if(!cur){say("sec","Enter your current password.",1);return}
  if(np.length<8){say("sec","The new password must be at least 8 characters.",1);return}
  if(np!==rp){say("sec","The two new passwords do not match.",1);return}
  if(np===cur){say("sec","Choose a password different from the current one.",1);return}
  btn.disabled=true;
  sb.auth.signInWithPassword({email:U.email,password:cur}).then(function(r){
    if(r.error)throw new Error("Current password is incorrect.");
    return sb.auth.updateUser({password:np});
  }).then(function(r){
    if(r.error)throw r.error;
    EDIT=null;MSG.sec={t:"Password changed."};draw();
  }).catch(function(err){btn.disabled=false;say("sec",SM.msg(err),1)});
}

/* ---------- sign out of all other devices ---------- */
function signOutOthers(btn){
  if(!confirm("Sign out of all other devices? You stay signed in here."))return;
  btn.disabled=true;
  sb.auth.signOut({scope:"others"}).then(function(r){
    btn.disabled=false;
    if(r.error)throw r.error;
    say("sec","Done. All other devices were signed out.");
  }).catch(function(err){btn.disabled=false;say("sec",SM.msg(err),1)});
}
};
