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
  var m=$("le").closest("[data-g]").querySelector(".err"),acc=accs()[$("le").value.trim().toLowerCase()];
  if(!acc){m.textContent="No account with this email. Please sign up first.";mark("le",false);$("le").focus();return}
  m.textContent="Enter a valid email.";finish(acc)};
$("signup").onsubmit=function(e){e.preventDefault();
  var r=[mark("sn",$("sn").value.trim().length>1),mark("se",EM.test($("se").value.trim())),mark("sp",$("sp").value.length>=8),mark("st",$("st").checked)];
  if(r.indexOf(false)>-1){firstBad(this);if(!$("st").checked&&!root.querySelector("#signup .bad input[type=text],#signup .bad input[type=email],#signup .bad input[type=tel],#signup .bad input[type=password]"))$("st").focus();return}
  
  var u={name:$("sn").value.trim().replace(/\s+/g," "),email:$("se").value.trim().toLowerCase(),role:"member"},A=accs();A[u.email]=u;try{localStorage.setItem("sm_acc",JSON.stringify(A))}catch(x){}
  finish(u)};
$("fg").onclick=function(){$("rok").classList.add("hide");view("v-forgot");$("re").focus()};
$("rf").onsubmit=function(e){e.preventDefault();if(!mark("re",EM.test($("re").value.trim()))){$("re").focus();return}$("rok").classList.remove("hide")};
$("bk").onclick=function(){view("v-main");setMode("in")};
setMode("in");

$("gg").onclick=function(){finish({name:"Moman Hassan",email:"",role:"member"})};
};
