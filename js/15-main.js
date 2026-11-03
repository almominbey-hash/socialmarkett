/* Start the site */
document.querySelector("#bar .logo").addEventListener("click",function(e){e.preventDefault();if(U)location.hash="start";else if(location.hash)history.replaceState(null,"",location.pathname+location.search);route()});
window.addEventListener("hashchange",route);
SM.boot().then(function(){updSc();setNav();if(location.search)history.replaceState(null,"",location.pathname+location.hash);route()});
