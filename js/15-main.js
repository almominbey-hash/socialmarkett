/* Start the site */
updSc();setNav();document.querySelector("#bar .logo").addEventListener("click",function(e){e.preventDefault();location.hash=U?"start":"landing";route()});
window.addEventListener("hashchange",route);route();
