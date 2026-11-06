/* Profile picture in the top bar: opens a small menu (name, email, Profile & settings, Billing, Help, Invite a friend, Sign out).
   Also gives the site a "Coming soon" notice: window.SMSoon("Billing") */
(function(){
var av=document.getElementById("av");
if(!av)return;
var OPEN=false,panel=null,toast=null,tt=null;

function X(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var IC={
 user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
 card:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>',
 help:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17h.01"/></svg>',
 gift:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v8h14v-8M8.5 8a2.2 2.2 0 1 1 0-4.4C11 3.6 12 8 12 8s1-4.4 3.5-4.4a2.2 2.2 0 1 1 0 4.4"/></svg>',
 out:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="m16 8 4 4-4 4M20 12H9"/></svg>'
};

/* ---------- style ---------- */
var st=document.createElement("style");
st.textContent=
"#pm{position:fixed;z-index:1000;top:80px;right:16px;width:270px;max-width:calc(100vw - 24px);display:none;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.18);font:16px/1.4 Inter,sans-serif;overflow:hidden}"+
"#pm.on{display:block}"+
"#pm .ph{padding:14px 16px 10px}"+
"#pm .ph b{display:block;font-size:16px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"+
"#pm .ph span{display:block;margin-top:2px;color:var(--muted);font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"+
"#pm .pl{padding:0 8px 8px}"+
"#pm .ps{border-top:1px solid var(--line);margin:8px -8px}"+
"#pm .pi{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;border-radius:8px;background:none;color:var(--text);padding:10px;cursor:pointer;font:400 15px Inter,sans-serif}"+
"#pm .pi:hover,#pm .pi:focus-visible{background:var(--soft)}"+
"#pm .pi svg{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}"+
"#sm-soon{position:fixed;left:50%;bottom:28px;transform:translate(-50%,16px);z-index:3000;background:#14181f;color:#fff;padding:12px 20px;border-radius:999px;font:500 15px Inter,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;max-width:calc(100vw - 32px);text-align:center}"+
"#sm-soon.on{opacity:1;transform:translate(-50%,0)}";
document.head.appendChild(st);

/* ---------- "Coming soon" notice (can be used anywhere on the site) ---------- */
window.SMSoon=function(what){
 if(!toast){toast=document.createElement("div");toast.id="sm-soon";toast.setAttribute("role","status");document.body.appendChild(toast)}
 toast.textContent=(what?what+" – ":"")+"Coming soon";
 toast.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove("on")},2400)};

/* ---------- the menu ---------- */
panel=document.createElement("div");panel.id="pm";panel.setAttribute("role","menu");panel.setAttribute("aria-label","Account menu");
document.body.appendChild(panel);
av.setAttribute("aria-haspopup","menu");av.setAttribute("aria-expanded","false");av.setAttribute("aria-label","Account menu");

function draw(){
 var name=String((U&&(U.name||U.email))||"Account").trim(),mail=(U&&U.email)||"";
 panel.innerHTML='<div class="ph"><b>'+X(name)+'</b><span>'+X(mail)+'</span></div><div class="ps" style="margin-top:0"></div>'+
  '<div class="pl">'+
  '<button type="button" class="pi" role="menuitem" data-a="settings">Profile &amp; settings</button>'+
  '<button type="button" class="pi" role="menuitem" data-a="soon" data-n="Billing">Billing</button>'+
  '<button type="button" class="pi" role="menuitem" data-a="soon" data-n="Help">Help</button>'+
  '<div class="ps"></div>'+
  '<button type="button" class="pi" role="menuitem" data-a="soon" data-n="Invite a friend">Invite a friend</button>'+
  '<div class="ps"></div>'+
  '<button type="button" class="pi" role="menuitem" data-a="out">'+IC.out+'Sign out</button></div>'}

function place(){var r=av.getBoundingClientRect(),w=Math.min(270,window.innerWidth-24);
 panel.style.top=Math.round(r.bottom+10)+"px";
 panel.style.right="auto";
 panel.style.left=Math.max(12,Math.min(window.innerWidth-w-12,Math.round(r.left+r.width/2-w/2)))+"px"}
function open(){OPEN=true;draw();place();panel.classList.add("on");av.setAttribute("aria-expanded","true")}
function close(){OPEN=false;panel.classList.remove("on");av.setAttribute("aria-expanded","false")}

av.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();if(!U)return;OPEN?close():open()});
document.addEventListener("click",function(e){if(OPEN&&!panel.contains(e.target)&&!av.contains(e.target))close()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&OPEN){close();av.focus()}});
window.addEventListener("resize",function(){if(OPEN)place()});
window.addEventListener("scroll",function(){if(OPEN)place()},{passive:true});
window.addEventListener("navchange",close);

panel.addEventListener("click",function(e){
 var b=e.target.closest(".pi");if(!b)return;var a=b.dataset.a;close();
 if(a==="settings"){NAV.go("dash");route()}
 else if(a==="soon"){window.SMSoon(b.dataset.n)}
 else if(a==="out"){doSignOut()}});
})();
