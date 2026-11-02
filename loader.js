/* Loads every page file (pages/NAME.html + pages/NAME.css) and then the scripts, in order. */
(function(){
var PAGES=["landing", "start", "messages", "account", "order", "sell", "login", "dash", "saved", "verify"];
var SCRIPTS=["js/01-config.js", "js/02-page-messages.js", "js/03-page-account.js", "js/04-page-order.js", "js/05-page-sell.js", "js/06-session.js", "js/07-page-login.js", "js/08-page-verify.js", "js/09-page-dashboard.js", "js/10-page-saved.js", "js/11-page-start.js", "js/12-page-landing.js", "js/13-router.js", "js/14-category-menu.js", "js/15-main.js", "js/16-header-scroll.js"];
function get(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(u);return r.text()})}
function addScript(src){return new Promise(function(ok,no){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.body.appendChild(s)})}
Promise.all(PAGES.map(function(n){
  return Promise.all([get("pages/"+n+".css"),get("pages/"+n+".html")]).then(function(a){
    var t=document.createElement("template");t.id="t-"+n;t.innerHTML="<style>"+a[0]+"</style>"+a[1];document.body.appendChild(t)})
})).then(function(){
  return SCRIPTS.reduce(function(p,src){return p.then(function(){return addScript(src)})},Promise.resolve())
}).catch(function(e){
  document.getElementById("app").innerHTML='<div style="max-width:560px;margin:80px auto;padding:24px;font:16px/1.6 system-ui,sans-serif"><h2>Please open this site with Live Server</h2><p>The pages are separate files, so the browser needs a small server. In VS Code: install the <b>Live Server</b> extension, right click <b>index.html</b> and choose <b>Open with Live Server</b>.</p></div>';
  console.error(e);
});
})();
