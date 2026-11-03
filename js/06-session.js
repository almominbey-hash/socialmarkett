/* Login session, top bar buttons and header search */
var U=null;
function esc(x){return String(x).replace(/[<>&"]/g,"")}
function setUser(u){U=u;setNav()}
function setNav(){var av=document.getElementById("av");
 document.body.classList.toggle("in-user",!!U);
 if(U){var n=String(U.name||U.email||"U").trim();av.textContent=(n.charAt(0)||"U").toUpperCase();av.title="Log out ("+esc(n)+")"}}
document.getElementById("av").addEventListener("click",function(){if(U){sb.auth.signOut().then(function(){SV.length=0;updSc();setUser(null);if(location.hash)history.replaceState(null,"",location.pathname+location.search);route()})}});
document.getElementById("hs").addEventListener("submit",function(e){e.preventDefault();var v=document.getElementById("hq").value;
 if(location.hash.slice(1)!=="start")location.hash="start";route();
 var h=roots.start,qi=h.querySelector("#fi");qi.value=v;h.querySelector("#fq").dispatchEvent(new Event("submit",{cancelable:true}));
 });
