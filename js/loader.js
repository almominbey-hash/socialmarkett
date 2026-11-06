/* Loads every page file (pages/NAME.html + pages/NAME.css) and then the scripts, in order. */
(function(){
/* If this browser already has a saved login, show the logged-in header right away (the real check follows and corrects it) */
try{for(var i=0;i<localStorage.length;i++){if(/^sb-.+-auth-token$/.test(localStorage.key(i))){document.body.classList.add("in-user");break}}}catch(e){}
var PAGES=["landing", "start", "messages", "account", "order", "sell", "login", "dash", "saved", "start-selling", "seller-dashboard"];
var SCRIPTS=["/js/00-supabase.js", "/js/01-config.js", "/js/02-page-messages.js", "/js/03-page-account.js", "/js/04-page-order.js", "/js/05-page-sell.js", "/js/06-session.js", "/js/07-page-login.js", "/js/09-page-dashboard.js", "/js/10-page-saved.js", "/js/11-page-start.js", "/js/12-page-landing.js", "/js/12b-page-start-selling.js", "/js/12c-page-seller-dashboard.js", "/js/13-router.js", "/js/14-category-menu.js", "/js/14b-notifications.js", "/js/14c-messages-popup.js", "/js/14d-profile-menu.js", "/js/15-main.js", "/js/16-header-scroll.js", "/js/17-footer.js"];
function get(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(u);return r.text()})}
function addScript(src){return new Promise(function(ok,no){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.body.appendChild(s)})}
Promise.all(PAGES.map(function(n){
  return Promise.all([get("/pages/"+n+".css"),get("/pages/"+n+".html"),get("/css/theme.css")]).catch(function(e){console.error("missing page file:",n);return ["","",""]}).then(function(a){
    var t=document.createElement("template");t.id="t-"+n;t.innerHTML="<style>"+a[0]+"</style><style>"+(a[2]||"")+"</style>"+a[1];document.body.appendChild(t)})
})).then(function(){
  return SCRIPTS.reduce(function(p,src){return p.then(function(){return addScript(src).catch(function(e){console.error("missing script file:",src)})})},Promise.resolve())
}).catch(function(e){
  document.body.classList.add("ready");document.getElementById("app").innerHTML='<div style="max-width:560px;margin:80px auto;padding:24px;font:16px/1.6 Inter,sans-serif"><h2>The site could not load</h2><p>Please refresh the page. If you are testing on your computer, open it with a small server (VS Code Live Server), not by double clicking the file.</p></div>';
  console.error(e);
});
})();
