/* Become a seller (verification) */
init.verify=function(root){var $=function(i){return root.querySelector("#"+i)};
 window.renderVerify=function(){if(!U)return;$("vem").textContent=U.email||"Signed in with Google";if(!$("vn").value)$("vn").value=U.name&&U.name!=="Google user"?U.name:""};
 function mk(id,ok){$(id).closest("[data-g]").classList.toggle("bad",!ok);return ok}
 $("vf").onsubmit=function(e){e.preventDefault();
  var r=[mk("vn",$("vn").value.trim().length>1),mk("vp",$("vp").value.replace(/\D/g,"").length>=10),mk("vi",$("vi").value.trim().length>=6),mk("vfr",$("vfr").files.length>0),mk("vbk",$("vbk").files.length>0),mk("vpay",$("vpay").value.trim().length>3),mk("vc",$("vc").checked)];
  if(r.indexOf(false)>-1){var b=root.querySelector(".bad input,.bad select");if(b)b.focus();return}
  var u={name:U.name,email:U.email,role:U.role,kyc:"pending"};setUser(u);
  if(u.email){var A=accs();if(A[u.email]){A[u.email].kyc="pending";try{localStorage.setItem("sm_acc",JSON.stringify(A))}catch(x){}}}
  $("vf").reset();var g=window.GO;window.GO=null;location.hash=g||"dash";route()}};
