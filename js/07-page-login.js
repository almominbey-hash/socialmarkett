/* Login, sign up and password reset */
init.login=function(root){var $=function(i){return root.querySelector("#"+i)};
function finish(u){setUser(u);$("login").reset();$("signup").reset();setMode("in");view("v-main");var g=window.GO;window.GO=null;location.hash=g||"start";route()}

var mode="in",EM=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function view(v){["v-main","v-forgot"].forEach(function(x){$(x).classList.toggle("hide",x!==v)});window.scrollTo(0,0)}
function setMode(m){mode=m;
  $("t-in").setAttribute("aria-selected",m==="in");$("t-up").setAttribute("aria-selected",m==="up");
  $("login").classList.toggle("hide",m!=="in");$("signup").classList.toggle("hide",m!=="up");
  $("h").textContent=m==="in"?"Welcome back":"Create your account";
  $("s").textContent=m==="in"?"Log in to buy, sell and track your orders.":"It is free. It takes one minute.";
  $("sw").innerHTML=m==="in"?'New here? <button class="link" type="button" id="go">Create an account</button>':'Already have an account? <button class="link" type="button" id="go">Log in</button>';
  $("go").onclick=function(){setMode(m==="in"?"up":"in")};
}
function mark(id,ok){var g=$(id).closest("[data-g]");g.classList.toggle("bad",!ok);return ok}
function firstBad(f){var b=f.querySelector(".bad input");if(b){b.focus();return true}return false}
$("t-in").onclick=function(){setMode("in")};$("t-up").onclick=function(){setMode("up")};
[].forEach.call(root.querySelectorAll(".show"),function(b){b.onclick=function(){var i=$(b.getAttribute("aria-controls")),s=i.type==="password";i.type=s?"text":"password";b.textContent=s?"Hide":"Show"}});
$("login").onsubmit=function(e){e.preventDefault();
  var a=mark("le",EM.test($("le").value.trim())),b=mark("lp",$("lp").value.length>0);
  if(!(a&&b)){firstBad(this);return}
  var m=$("le").closest("[data-g]").querySelector(".err");m.textContent="Enter a valid email.";
  sb.auth.signInWithPassword({email:$("le").value.trim().toLowerCase(),password:$("lp").value}).then(function(r){
    if(r.error){m.textContent=/invalid login/i.test(r.error.message)?"Wrong email or password.":SM.msg(r.error);mark("le",false);$("le").focus();return}
    return SM.loadUser(r.data.user).then(function(){finish(U)})
  }).catch(function(x){m.textContent=SM.msg(x);mark("le",false)})};
$("signup").onsubmit=function(e){e.preventDefault();
  var r=[mark("sn",$("sn").value.trim().length>1),mark("se",EM.test($("se").value.trim())),mark("sp",$("sp").value.length>=8),mark("st",$("st").checked)];
  if(r.indexOf(false)>-1){firstBad(this);if(!$("st").checked&&!root.querySelector("#signup .bad input[type=text],#signup .bad input[type=email],#signup .bad input[type=tel],#signup .bad input[type=password]"))$("st").focus();return}
  var m=$("se").closest("[data-g]").querySelector(".err");m.textContent="Enter a valid email.";
  sb.auth.signUp({email:$("se").value.trim().toLowerCase(),password:$("sp").value,options:{data:{full_name:$("sn").value.trim().replace(/\s+/g," ")},emailRedirectTo:SM.home}}).then(function(r){
    if(r.error){m.textContent=SM.msg(r.error);mark("se",false);$("se").focus();return}
    if(!r.data.session){alert("We sent you an email. Click the link in it to confirm your account, then log in.");$("signup").reset();setMode("in");return}
    return SM.loadUser(r.data.user).then(function(){finish(U)})
  }).catch(function(x){m.textContent=SM.msg(x);mark("se",false)})};
$("fg").onclick=function(){$("rok").classList.add("hide");view("v-forgot");$("re").focus()};
$("rf").onsubmit=function(e){e.preventDefault();if(!mark("re",EM.test($("re").value.trim()))){$("re").focus();return}
  sb.auth.resetPasswordForEmail($("re").value.trim().toLowerCase(),{redirectTo:SM.home}).then(function(){$("rok").classList.remove("hide")})};
$("bk").onclick=function(){view("v-main");setMode("in")};
setMode("in");

$("gg").onclick=function(){sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:SM.home}})};
};
