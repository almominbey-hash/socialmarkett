/* Start selling: the one-time seller application (5 steps) + approval notification */
init["start-selling"]=function(root){var $=function(i){return root.querySelector("#"+i)};
var S=1,N=5,retry=false;
var NM=["About you","Phone","What you sell","Verify identity","Review"];
var TT=[["Tell buyers who you are","Your name and photo build trust. Buyers only see your seller name, never your ID."],["Add your phone number","We use it to reach you about orders."],["Tell us what you sell","Honest answers help us approve you faster."],["Verify your identity","One time only. You will not repeat this for each listing."],["Check and send","Make sure everything is correct, then send it to our team."]];
var HP=[["Make a good first impression",["Use the same name as on your ID card.","Pick a seller name buyers can remember.","A short, honest bio builds trust."]],["Why we need your number",["We only use it to contact you about orders.","Buyers never see it.","Use a number you can answer."]],["Tell us what you sell",["Choose every platform you sell on.","You can list many accounts after approval.","Only accounts you really control."]],["Your ID stays private",["Photos must be clear and not cropped.","Files are stored privately.","Only our team sees them, only to verify you."]],["Almost done",["Our team reviews within 24 hours.","You get a notification when approved.","Then Seller Dashboard opens for you."]]];
$("steps").innerHTML=NM.map(function(n,i){return '<li data-i="'+(i+1)+'"><i>'+(i+1)+'</i><span>'+n+'</span></li>'}).join("");
function mk(id,ok){var g=$(id).closest("[data-g]");if(g)g.classList.toggle("bad",!ok);return ok}
function pls(){return [].map.call(root.querySelectorAll("[name=pl]:checked"),function(x){return x.value})}
function src(){var r=root.querySelector("[name=sr]:checked");return r?r.value:""}
function check(s){var r=[];
 if(s===1)r=[mk("vn",$("vn").value.trim().length>1),mk("dn",$("dn").value.trim().length>=3),mk("co",!!$("co").value),mk("ci",$("ci").value.trim().length>1),mk("bio",$("bio").value.trim().length>=20)];
 if(s===2)r=[mk("ph",$("ph").value.replace(/\D/g,"").length>=10)];
 if(s===3)r=[mk("plg",pls().length>0),mk("ni",!!$("ni").value),mk("ex",!!$("ex").value),mk("cn",!!$("cn").value),mk("srg",!!src())];
 if(s===4)r=[mk("in",$("in").value.trim().length>=6),mk("fr",$("fr").files.length>0),mk("bk2",$("bk2").files.length>0),mk("se",$("se").files.length>0)];
 if(s===5)r=[mk("c1",$("c1").checked),mk("c2",$("c2").checked),mk("c3",$("c3").checked)];
 var i=r.indexOf(false);if(i>-1){var b=root.querySelector(".p.on .bad input,.p.on .bad select,.p.on .bad textarea");if(b)b.focus();return false}return true}
function summary(){var R=[["Full name",$("vn").value.trim(),1],["Seller name",$("dn").value.trim(),1],["Location",$("ci").value.trim()+", "+$("co").value,1],["Phone",$("ph").value.trim(),2],["Platforms",pls().join(", "),3],["Niche",$("ni").value,3],["Experience",$("ex").value,3],["Accounts to sell",$("cn").value,3],["Source",src(),3],["ID",$("it").value+" · "+$("in").value.trim(),4],["Photos","ID front, ID back, selfie added",4]];
 $("sum").innerHTML=R.map(function(x){return '<div><dt>'+x[0]+'</dt><dd>'+esc(x[1])+'<button type="button" data-e="'+x[2]+'">Edit</button></dd></div>'}).join("")}
function show(i){S=i;
 [].forEach.call(root.querySelectorAll(".p"),function(p){p.classList.toggle("on",+p.dataset.s===i)});
 [].forEach.call(root.querySelectorAll("#steps li"),function(l){var n=+l.dataset.i;l.className=n===i?"on":n<i?"done":"";l.querySelector("i").textContent=n<i?"\u2713":n});
 $("kick").textContent="Step "+i+" of "+N;$("ttl").textContent=TT[i-1][0];$("sub").textContent=TT[i-1][1];
 $("help").innerHTML="<h2>"+HP[i-1][0]+"</h2><ul>"+HP[i-1][1].map(function(t){return "<li>"+t+"</li>"}).join("")+"</ul>";
 $("bk").style.visibility=i===1?"hidden":"visible";$("nx").textContent=i===N?"Submit for review":"Next";
 if(i===N)summary();window.scrollTo(0,0)}
$("bk").onclick=function(){if(S>1)show(S-1)};
$("sum").onclick=function(e){var b=e.target.closest("[data-e]");if(b)show(+b.dataset.e)};
$("fm").onsubmit=function(e){e.preventDefault();if(!check(S))return;if(S<N){show(S+1);return}
 for(var k=1;k<N;k++){if(!check(k)){show(k);return}}
 var b=$("nx");if(b.disabled)return;b.disabled=true;b.textContent="Submitting...";
 SM.submitSeller({name:$("vn").value.trim().replace(/\s+/g," "),display:$("dn").value.trim(),country:$("co").value,city:$("ci").value.trim(),bio:$("bio").value.trim(),phone:$("ph").value.trim(),platforms:pls(),niche:$("ni").value,exp:$("ex").value,count:$("cn").value,source:src(),idType:$("it").value,idNumber:$("in").value.trim(),front:$("fr").files[0],back:$("bk2").files[0],selfie:$("se").files[0],avatar:$("av").files[0]||null})
  .then(function(){return SM.refresh()}).then(function(){b.disabled=false;retry=false;route();window.scrollTo(0,0)})
  .catch(function(x){b.disabled=false;b.textContent="Submit for review";alert("Could not submit: "+SM.msg(x))})};
$("again").onclick=function(){retry=true;window.renderStartSelling()};
window.renderStartSelling=function(){if(!U)return;var k=U.kyc;
 $("v-wiz").classList.toggle("hide",k==="pending"||(k==="rejected"&&!retry));
 $("v-rev").classList.toggle("hide",k!=="pending");
 $("v-rej").classList.toggle("hide",!(k==="rejected"&&!retry));
 if(!$("vn").value&&U.name&&U.name!=="Google user")$("vn").value=U.name;
 if(k!=="pending")show(S)};
/* Notification: show an unread message (for example "your seller profile is approved") */
SM.notify=function(){if(!U||document.getElementById("smtoast"))return;
 sb.from("notifications").select("id,title,body").eq("user_id",U.id).eq("read",false).order("created_at").limit(1).then(function(r){var n=r&&r.data&&r.data[0];if(!n||document.getElementById("smtoast"))return;
  var t=document.createElement("div");t.id="smtoast";t.setAttribute("role","status");
  t.style.cssText="position:fixed;top:92px;right:16px;z-index:100000;max-width:340px;background:var(--bg);color:var(--text);border:1px solid var(--line);border-left:5px solid #1dbf73;border-radius:12px;padding:16px 18px;box-shadow:0 12px 40px rgba(0,0,0,.25);font:15px/1.45 Inter,Arial,sans-serif";
  t.innerHTML='<b style="display:block;font-size:16px;margin-bottom:4px"></b><span style="color:var(--muted)"></span><div style="text-align:right;margin-top:10px"><button type="button" style="border:0;border-radius:8px;padding:8px 16px;font:600 14px inherit;background:var(--accent);color:var(--accent-t);cursor:pointer">OK</button></div>';
  t.querySelector("b").textContent=n.title;t.querySelector("span").textContent=n.body;
  t.querySelector("button").onclick=function(){t.remove();sb.from("notifications").update({read:true}).eq("id",n.id).then(function(){SM.notify()},function(){})};
  document.body.appendChild(t)},function(){})};
/* If someone closes the login popup without signing in, forget where they wanted to go */
new MutationObserver(function(){var o=document.getElementById("smauth");if(o&&!o.classList.contains("on")&&!U&&/^(start-selling|seller-dashboard)$/.test(window.GO||""))window.GO=null}).observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"],childList:true});
show(1);
};
