/* Shared by the help pages. To change the site name, change BRAND below. */
var BRAND="AVIBIX";
(function(){
[].forEach.call(document.querySelectorAll("[data-brand]"),function(e){e.textContent=BRAND});
document.title=document.title.replace(/AVIBIX/g,BRAND);
var q=document.getElementById("hq");
if(q)q.addEventListener("input",function(){var v=q.value.trim().toLowerCase(),n=0;
 [].forEach.call(document.querySelectorAll("[data-s]"),function(c){var ok=!v||c.dataset.s.toLowerCase().indexOf(v)>-1;c.style.display=ok?"":"none";if(ok)n++});
 [].forEach.call(document.querySelectorAll(".sec"),function(s){var any=[].some.call(s.querySelectorAll("[data-s]"),function(c){return c.style.display!=="none"});s.style.display=any?"":"none"});
 var e=document.getElementById("none");if(e)e.style.display=n?"none":"block"});
})();
