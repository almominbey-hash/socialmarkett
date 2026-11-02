/* Start the site */
document.querySelector("#bar .logo").addEventListener("click",function(e){e.preventDefault();location.hash=U?"start":"landing";route()});
window.addEventListener("hashchange",route);
SM.boot().then(function(){updSc();setNav();if(location.search)history.replaceState(null,"",location.pathname+location.hash);route()});
