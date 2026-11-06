/* One footer for every page (Explore / For sellers / Social Market).
   It copies the footer that is already written in pages/landing.html, so the links stay in one place.
   The landing page keeps its own footer, so this one is hidden there to avoid showing two. */
(function(){
var land=pages.landing,src=roots.landing&&roots.landing.querySelector(".ft");
if(!land||!src)return;
var st=document.createElement("style");
st.textContent="#gft{border-top:1px solid var(--line);background:var(--bg);color:var(--text)}"+
"#gft[hidden],body:not(.ready) #gft{display:none}"+
"#gft .ft{max-width:1400px;margin:0 auto;padding:56px 48px 32px}"+
"#gft .cols{display:flex;gap:64px;padding-bottom:48px}"+
"#gft .cols>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:18px}"+
"#gft .cols h4{margin:0;font-size:16px;font-weight:600;letter-spacing:-.4px;line-height:1.15}"+
"#gft .cols a{font-size:14px;line-height:1.5;color:var(--muted);text-decoration:none}"+
"#gft .cols a:hover{color:var(--text)}"+
"#gft .fb2{display:flex;align-items:center;gap:24px;border-top:1px solid var(--line);padding-top:28px;font-size:13px;color:var(--muted)}"+
"#gft .fb2 .fl{font-size:26px;letter-spacing:-1px;color:var(--text)}"+
"#gft .fb2 .cp{flex:1;font-size:12px}"+
"@media (max-width:700px){#gft .ft{padding-left:20px;padding-right:20px}#gft .cols{flex-direction:column;gap:28px}#gft .fb2{flex-wrap:wrap;gap:10px}#gft .fb2 .cp{flex:1 1 100%;order:3}}";
document.head.appendChild(st);
var f=document.createElement("footer");f.id="gft";
var c=src.cloneNode(true);
[].forEach.call(c.querySelectorAll("a[href]"),function(a){var h=a.getAttribute("href");if(h&&!/^([a-z]+:|\/|#)/i.test(h))a.setAttribute("href","/"+h)});
var yr=c.querySelector("#yr");if(yr)yr.textContent=new Date().getFullYear();
f.appendChild(c);
document.getElementById("app").after(f);
function sync(){f.hidden=land.classList.contains("on")}
new MutationObserver(sync).observe(land,{attributes:true,attributeFilter:["class"]});sync();
/* links: same behaviour as the footer on the landing page */
f.addEventListener("click",function(e){
 if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var hr=a.getAttribute("href");
 if(a.dataset.p||a.dataset.s){e.preventDefault();var h=document.querySelector(a.dataset.p?'#cats a[data-p="'+a.dataset.p+'"]':'#cats a[data-s="'+a.dataset.s+'"]');if(h)h.click();return}
 if(hr.charAt(0)==="#"){e.preventDefault();window.scrollTo({top:0,behavior:"smooth"});return}
 if(hr.charAt(0)==="/"&&hr.charAt(1)!=="/"){var n=hr.slice(1)||"start";
  if(R.indexOf(n)>-1||PMAP[n]||n==="browse"){e.preventDefault();if(location.pathname===NAV.path(n))window.scrollTo(0,0);else NAV.go(n)}}});
})();
