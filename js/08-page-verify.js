/* Become a seller (verification) */
init.verify=function(root){var $=function(i){return root.querySelector("#"+i)};
 window.renderVerify=function(){if(!U)return;$("vem").textContent=U.email||"Signed in with Google";if(!$("vn").value)$("vn").value=U.name&&U.name!=="Google user"?U.name:""};
 function mk(id,ok){$(id).closest("[data-g]").classList.toggle("bad",!ok);return ok}
 $("vf").onsubmit=function(e){e.preventDefault();
  var r=[mk("vn",$("vn").value.trim().length>1),mk("vp",$("vp").value.replace(/\D/g,"").length>=10),mk("vi",$("vi").value.trim().length>=6),mk("vfr",$("vfr").files.length>0),mk("vbk",$("vbk").files.length>0),mk("vpay",$("vpay").value.trim().length>3),mk("vc",$("vc").checked)];
  if(r.indexOf(false)>-1){var b=root.querySelector(".bad input,.bad select");if(b)b.focus();return}
  var btn=root.querySelector("#vf button[type=submit]");btn.disabled=true;btn.textContent="Submitting...";
  SM.submitKyc({name:$("vn").value.trim().replace(/\s+/g," "),phone:$("vp").value.trim(),idType:$("vt").value,idNumber:$("vi").value.trim(),payout:$("vpay").value.trim(),front:$("vfr").files[0],back:$("vbk").files[0]})
   .then(function(){return SM.refresh()}).then(function(){
    $("vf").reset();btn.disabled=false;btn.textContent="Submit for verification";var g=window.GO;window.GO=null;NAV.go(g||"dash");route()})
   .catch(function(x){btn.disabled=false;btn.textContent="Submit for verification";alert("Could not submit: "+SM.msg(x))})};
};
