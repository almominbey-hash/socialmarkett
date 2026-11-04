/* Start the site */
document.querySelector("#bar .logo").addEventListener("click",function(e){e.preventDefault();if(U)NAV.go("start");else{NAV.swap("/");route()}});
window.addEventListener("navchange",route);
window.addEventListener("popstate",function(){window.dispatchEvent(new Event("navchange"))});
/* Links in the header and category menu: switch page without reloading */
document.addEventListener("click",function(e){
 if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 var a=e.target.closest&&e.target.closest("#bar a[href]");if(!a||a.target==="_blank"||a.dataset.p)return;
 var hr=a.getAttribute("href");if(hr.charAt(0)!=="/"||hr.charAt(1)==="/")return;
 var h=hr.slice(1);if(h==="")h="start";if(!(R.indexOf(h)>-1||PMAP[h]||h==="browse"))return;
 e.preventDefault();if(location.pathname===NAV.path(h))window.scrollTo(0,0);else NAV.go(h)});
SM.boot().then(function(){updSc();setNav();document.body.classList.add("ready");
 if(location.hash.length>1){var lh=location.hash.slice(1);if(lh==="home")lh="start";if(R.indexOf(lh)>-1||PMAP[lh])history.replaceState(null,"",NAV.path(lh))}
 if(location.search)history.replaceState(null,"",location.pathname);route()});
