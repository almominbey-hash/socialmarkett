/* Page switching (router) */
R.forEach(function(n){
  var d=document.createElement("div");d.className="page";document.getElementById("app").appendChild(d);
  var sr=d.attachShadow({mode:"open"});sr.appendChild(document.getElementById("t-"+n).content.cloneNode(true));
  pages[n]=d;roots[n]=sr;
  sr.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var hr=a.getAttribute("href");
    if(hr.charAt(0)==="/"&&hr.charAt(1)!=="/"){
      if(a.dataset.p){e.preventDefault();return}
      var h=hr.slice(1);if(h==="")h="start";
      if(a.target==="_blank"||!(R.indexOf(h)>-1||PMAP[h]||h==="browse"))return;
      e.preventDefault();if(location.pathname===NAV.path(h))window.scrollTo(0,0);else NAV.go(h);return}
    if(hr.charAt(0)!=="#")return;
    e.preventDefault();if(a.dataset.p)return;
    var h2=hr.slice(1);var el=h2&&sr.querySelector("#"+h2);if(el)el.scrollIntoView({behavior:"smooth"});else window.scrollTo(0,0);
  });
  init[n](sr);
});
function route(){
  var raw=NAV.cur();if(raw==="browse")raw="start";var PM=PMAP,pf=PM[raw]?PM[raw][0]:null,pt=PM[raw]?PM[raw][2]:null;var n=pf?"start":raw;if(n==="home")n="start";if(R.indexOf(n)<0)n=U?"start":"landing";if(U&&n==="landing")n="start";
  if((n==="sell"||n==="start-selling"||n==="seller-dashboard")&&!U){window.GO=(n==="sell"?"start-selling":n);n="landing";setTimeout(function(){if(window.SMAuth)SMAuth.open("join")},0)}else if(n==="sell"&&U.kyc!=="verified")n="start-selling";else if(n==="start-selling"&&U.kyc==="verified")n="seller-dashboard";else if(n==="seller-dashboard"&&U.kyc!=="verified")n="start-selling";if(n==="account"&&!window.SEL)n="start";
  if(!U&&(n==="order"||n==="dash"||n==="messages")){window.GO=n;n="login"}else if(!U&&n==="login"&&!window.GO)window.GO=null;if(!U&&(n==="order"||n==="dash"||n==="messages"))n="login";else if(U&&n==="login")n="start";
  if(n==="landing")NAV.swap("/");else if(pf&&n==="start")NAV.swap("/"+raw);else NAV.swap(NAV.path(n));
  R.forEach(function(r){pages[r].classList.toggle("on",r===n)});
  [].forEach.call(document.querySelectorAll("#bar a[data-r]"),function(a){if(a.dataset.r===n)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  document.title=T[n];if(n==="dash"&&window.renderDash)renderDash();if(n==="start-selling"&&window.renderStartSelling)renderStartSelling();if(n==="seller-dashboard"&&window.renderSellerDash)renderSellerDash();if(n==="saved"&&window.renderSaved)renderSaved();if(n==="account"&&window.renderAccount)renderAccount();if(n==="messages"&&window.renderMessages)renderMessages();if(n==="start"&&window.renderStart)renderStart();if(n==="start"&&window.setPlat)window.setPlat(pf||"All",pt);
  [].forEach.call(document.querySelectorAll("#cats nav a"),function(x){if(n==="start"&&x.dataset.p===(pf||"All"))x.setAttribute("aria-current","true");else x.removeAttribute("aria-current")});
  if(lastN!==n)window.scrollTo(0,0);if(pf&&lastN!=="start"){var gg=roots.start.querySelector("#grid");if(gg)gg.scrollIntoView()}lastN=n;
  
}
