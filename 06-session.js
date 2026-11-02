/* Login session, top bar buttons and header search */
var U=null;try{U=JSON.parse(localStorage.getItem("sm_user")||"null")}catch(e){}
function esc(x){return String(x).replace(/[<>&"]/g,"")}
function setUser(u){U=u;try{if(u)localStorage.setItem("sm_user",JSON.stringify(u));else localStorage.removeItem("sm_user")}catch(e){}setNav()}
function setNav(){var av=document.getElementById("av");
 document.body.classList.toggle("in-user",!!U);
 if(U){var n=String(U.name||U.email||"U").trim();av.textContent=(n.charAt(0)||"U").toUpperCase();av.title="Log out ("+esc(n)+")"}}
document.getElementById("av").addEventListener("click",function(){if(U){setUser(null);location.hash="landing";route()}});
document.getElementById("hs").addEventListener("submit",function(e){e.preventDefault();var v=document.getElementById("hq").value;
 if(location.hash.slice(1)!=="start")location.hash="start";route();
 var h=roots.start,qi=h.querySelector("#fi");qi.value=v;h.querySelector("#fq").dispatchEvent(new Event("submit",{cancelable:true}));
 });
function accs(){try{return JSON.parse(localStorage.getItem("sm_acc")||"{}")}catch(e){return{}}}
