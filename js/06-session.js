/* Login session, top bar buttons and header search */
var U=null;
function esc(x){return String(x).replace(/[<>&"]/g,"")}
function setUser(u){U=u;setNav()}
function setNav(){var av=document.getElementById("av");
 document.body.classList.toggle("in-user",!!U);
 var cta=document.querySelector("#bar a.cta");if(cta){var k=U&&U.kyc;if(k==="verified"){cta.textContent="Seller Dashboard";cta.setAttribute("href","/seller-dashboard");cta.dataset.r="seller-dashboard"}else{cta.innerHTML=k==="pending"?"Application in review":"Become a Seller &#8599;";cta.setAttribute("href","/start-selling");cta.dataset.r="start-selling"}}
 if(U){var n=String(U.name||U.email||"U").trim();av.textContent=(n.charAt(0)||"U").toUpperCase();av.title="Log out ("+esc(n)+")"}}
document.getElementById("av").addEventListener("click",function(){if(U){sb.auth.signOut().then(function(){SV.length=0;updSc();setUser(null);NAV.swap("/");route()})}});
document.getElementById("hs").addEventListener("submit",function(e){e.preventDefault();var v=document.getElementById("hq").value;
 if(NAV.cur()!=="start")NAV.go("start");route();
 var h=roots.start,qi=h.querySelector("#fi");qi.value=v;h.querySelector("#fq").dispatchEvent(new Event("submit",{cancelable:true}));
 });
