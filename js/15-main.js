/* Start the site */
updSc();setNav();document.querySelector("#bar .logo").addEventListener("click",function(e){e.preventDefault();if(U)location.hash="start";else if(location.hash)history.replaceState(null,"",location.pathname+location.search);route()});
window.addEventListener("hashchange",route);route();
