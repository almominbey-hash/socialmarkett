/* First page (home) - design from Figma "Social Market homepage Desktop" */
init.landing=function(root){var $=function(i){return root.querySelector("#"+i)};
/* PICTURES: put your exported images in the /images folder (names below). Missing picture = soft grey box. */
var IMG={hero:"/images/hero.jpg",cover1:"/images/cover1.jpg",cover2:"/images/cover2.jpg",cover3:"/images/cover3.jpg",cover4:"/images/cover4.jpg",cover5:"/images/cover5.jpg",cover6:"/images/cover6.jpg",cover7:"/images/cover7.jpg",cover8:"/images/cover8.jpg"};
[].forEach.call(root.querySelectorAll("[data-img]"),function(b){var u=IMG[b.dataset.img];if(u)b.style.backgroundImage='url("'+u+'")'});
$("yr").textContent=new Date().getFullYear();
/* Search box: sends the words to the real site search */
$("sf").onsubmit=function(e){e.preventDefault();document.getElementById("hq").value=$("sq").value;document.getElementById("hs").dispatchEvent(new Event("submit",{cancelable:true}))};
/* Heart button on a card: stays on the page, does not open the card */
root.addEventListener("click",function(e){if(e.target.closest(".sv")){e.preventDefault();e.stopPropagation();return}
 var a=e.target.closest("[data-p]");if(a){var h=document.querySelector('#cats a[data-p="'+a.dataset.p+'"]');if(h)h.click()}});
};


/* ===== Sign in / Join popup (added) ===== */
/* SocialMarket - Sign in / Join popup
   One self-contained file: it brings its own style and HTML.
   Add this one line to index.html just before </body>:
   <script src="js/auth-modal.js"></script>
*/
(function () {
  if (window.SMAuth) return;

  var CSS = [
    ".sma-ov{--bg:#fff;--text:#14181f;--muted:#566070;--line:#d5dbe5;--accent:#1d5fd6;--accent-t:#fff;--soft:#f5f7fa;--bad:#c62828;position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(10,15,25,.62);font:16px/1.5 Inter,'Helvetica Neue',Helvetica,Arial,sans-serif;color:var(--text)}",
    "",
    ".sma-ov.on{display:flex}",
    ".sma-ov *{box-sizing:border-box}",
    ".sma-dlg{position:relative;display:grid;grid-template-columns:1fr 1fr;width:100%;max-width:820px;max-height:94vh;background:var(--bg);border-radius:16px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.4)}",
    ".sma-side{display:flex;flex-direction:column;justify-content:center;gap:22px;padding:44px 38px;color:#fff;background:linear-gradient(160deg,#0f3a8a 0%,#1d5fd6 100%)}",
    ".sma-side h2{margin:0;font-size:clamp(26px,3vw,36px);line-height:1.15;letter-spacing:-.03em;font-weight:500}",
    ".sma-side ul{list-style:none;margin:0;padding:0}",
    ".sma-side li{position:relative;padding-left:30px;margin:0 0 12px;font-size:17px}",
    ".sma-side li:before{content:'\\2713';position:absolute;left:0;top:0;font-weight:500;color:#4be3a0}",
    ".sma-ic{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:6px}",
    ".sma-ic span{display:flex;align-items:center;justify-content:center;aspect-ratio:1;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);border-radius:14px}",
    ".sma-ic svg{width:60%;height:60%}",
    ".sma-main{position:relative;overflow:auto;padding:44px 40px 32px}",
    ".sma-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:var(--muted);font-size:26px;line-height:1;cursor:pointer}",
    ".sma-x:hover{background:var(--soft);color:var(--text)}",
    ".sma-main h1{margin:0 0 6px;font-size:26px;line-height:1.2;letter-spacing:-.02em;font-weight:500}",
    ".sma-sub{margin:0 0 22px;color:var(--muted)}",
    ".sma-lnk{background:none;border:0;padding:0;font:inherit;color:var(--text);text-decoration:underline;cursor:pointer}",
    ".sma-lnk:hover{color:var(--accent)}",
    ".sma-b{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:48px;padding:10px 16px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);font-weight:500;font-size:15px;font-family:inherit;cursor:pointer;margin:0 0 12px}",
    ".sma-b:hover{border-color:var(--accent)}",
    ".sma-b.pri{background:var(--accent);border-color:var(--accent);color:var(--accent-t);margin:6px 0 0}",
    ".sma-b.pri:hover{filter:brightness(1.08)}",
    ".sma-or{display:flex;align-items:center;gap:12px;margin:6px 0 14px;color:var(--muted);font-size:13px;font-weight:500}",
    ".sma-or:before,.sma-or:after{content:'';flex:1;height:1px;background:var(--line)}",
    ".sma-f{margin:0 0 14px}",
    ".sma-f label{display:block;margin:0 0 5px;font-size:14px;font-weight:500}",
    ".sma-f input[type=text],.sma-f input[type=email],.sma-f input[type=password]{width:100%;height:46px;padding:0 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);font:inherit}",
    ".sma-f input:focus{outline:3px solid var(--accent);outline-offset:1px;border-color:var(--accent)}",
    ".sma-pw{position:relative}",
    ".sma-pw input{padding-right:64px!important}",
    ".sma-show{position:absolute;right:6px;top:6px;height:34px;padding:0 10px;border:0;background:transparent;color:var(--accent);font-weight:500;font-size:13px;font-family:inherit;cursor:pointer}",
    ".sma-err,.sma-hint{display:none;margin-top:5px;font-size:13px}",
    ".sma-err{color:var(--bad)}",
    ".sma-hint{display:block;color:var(--muted)}",
    ".sma-f.bad input[type=text],.sma-f.bad input[type=email],.sma-f.bad input[type=password]{border-color:var(--bad)}",
    ".sma-f.bad .sma-err{display:block}",
    ".sma-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 6px;font-size:14px}",
    ".sma-chk{display:flex;gap:8px;align-items:flex-start;font-size:14px;color:var(--muted)}",
    ".sma-chk input{margin-top:4px}",
    ".sma-chk a{color:var(--text)}",
    ".sma-msg{display:none;margin:12px 0 0;padding:10px 12px;border-radius:10px;background:var(--soft);border:1px solid var(--line);font-size:14px}",
    ".sma-msg.on{display:block}",
    ".sma-safe{margin:18px 0 0;font-size:13px;color:var(--muted)}",
    ".sma-hide{display:none!important}",
    ".sma-terms{margin:14px 0 0;font-size:13px;color:var(--muted);text-align:center}",
    ".sma-terms a{color:var(--text);text-decoration:underline}",
    ".sma-foot{margin:12px 0 0;font-size:14px;color:var(--muted);text-align:center}",
    ".sma-dlg{height:630px}",
    ".sma-main{display:flex;flex-direction:column}",
    "#sma-v-main{flex:1;display:flex;flex-direction:column}",
    ".sma-terms{margin-top:auto!important;padding-top:14px}",
    "#sma-v-main h1{margin-bottom:22px}",
    "#sma-v-main.sma-center{justify-content:center}",
    "#sma-v-main.sma-center .sma-terms{margin-top:26px!important}",
    "@media (max-height:760px){.sma-dlg{height:550px}#sma-v-main h1{margin-bottom:16px}.sma-main{padding:30px 34px 20px}.sma-main h1{font-size:23px;margin-bottom:16px}.sma-f{margin:0 0 10px}.sma-f input[type=text],.sma-f input[type=email],.sma-f input[type=password]{height:42px}.sma-b{min-height:44px}.sma-terms{margin-top:10px}.sma-foot{margin-top:8px}}",
    "@media (max-width:760px){.sma-dlg{grid-template-columns:1fr;max-width:440px}.sma-side{display:none}.sma-main{padding:40px 22px 24px}}"
  ].join("\n");

  var ICONS =
    '<span><svg viewBox="0 0 48 48"><rect x="2" y="9" width="44" height="30" rx="9" fill="#f00"/><path d="M19.5 17.2 32 24l-12.5 6.8z" fill="#fff"/></svg></span>' +
    '<span><svg viewBox="0 0 48 48"><defs><radialGradient id="smig" cx=".3" cy="1.05" r="1.15"><stop offset="0" stop-color="#ffd776"/><stop offset=".25" stop-color="#fa7e1e"/><stop offset=".5" stop-color="#d62976"/><stop offset=".75" stop-color="#962fbf"/><stop offset="1" stop-color="#4f5bd5"/></radialGradient></defs><rect x="3" y="3" width="42" height="42" rx="12" fill="url(#smig)"/><rect x="12" y="12" width="24" height="24" rx="7.5" fill="none" stroke="#fff" stroke-width="3"/><circle cx="24" cy="24" r="5.8" fill="none" stroke="#fff" stroke-width="3"/><circle cx="31.6" cy="16.4" r="1.9" fill="#fff"/></svg></span>' +
    '<span><svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="11" fill="#000"/><path fill="#fff" d="M26.6 11h4.1c.3 3 2 4.9 5 5.2v4.1c-1.9 0-3.6-.6-5-1.6v8.3a7.6 7.6 0 1 1-7.6-7.6c.4 0 .8 0 1.2.1v4.2a3.5 3.5 0 1 0 2.3 3.3z"/></svg></span>' +
    '<span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877f2"/><path fill="#fff" d="M16.671 15.469l.532-3.469h-3.328V9.75c0-.949.465-1.875 1.956-1.875h1.513V4.922s-1.373-.234-2.686-.234c-2.741 0-4.533 1.662-4.533 4.669V12H7.078v3.469h3.047v8.385a12.1 12.1 0 0 0 3.75 0v-8.385z"/></svg></span>';

  var HTML =
    '<div class="sma-dlg" role="dialog" aria-modal="true" aria-labelledby="sma-h">' +
    '<aside class="sma-side"><h2>Your next account starts here</h2>' +
    '<ul><li>Verified accounts on every platform</li><li>Your money is held until you confirm</li><li>24 hours to check before you pay</li></ul>' +
    '<div class="sma-ic">' + ICONS + '</div></aside>' +
    '<div class="sma-main">' +
    '<button type="button" class="sma-x" aria-label="Close">&times;</button>' +

    '<div id="sma-v-main">' +
    '<h1 id="sma-h"></h1>' +
    '<p class="sma-sub" id="sma-sub"></p>' +
    '<button type="button" class="sma-b" id="sma-g"><b style="color:#ea4335;font-size:18px">G</b> Continue with Google</button>' +
    '<button type="button" class="sma-b" id="sma-em">&#9993;&nbsp; Continue with email</button>' +
    '<div class="sma-or">OR</div>' +

    '<form id="sma-in" novalidate>' +
    '<div class="sma-f"><label for="sma-ie">Email</label><input type="email" id="sma-ie" autocomplete="email" placeholder="you@example.com"><div class="sma-err">Enter a valid email.</div></div>' +
    '<div class="sma-f"><label for="sma-ip">Password</label><div class="sma-pw"><input type="password" id="sma-ip" autocomplete="current-password"><button type="button" class="sma-show" data-for="sma-ip">Show</button></div><div class="sma-err">Enter your password.</div></div>' +
    '<div class="sma-row"><label class="sma-chk"><input type="checkbox"> Keep me logged in</label><button type="button" class="sma-lnk" id="sma-fg">Forgot password?</button></div>' +
    '<button type="submit" class="sma-b pri">Sign in</button></form>' +

    '<form id="sma-jn" class="sma-hide" novalidate>' +
    '<div class="sma-f"><label for="sma-jname">Full name</label><input type="text" id="sma-jname" autocomplete="name"><div class="sma-err">Enter your name.</div></div>' +
    '<div class="sma-f"><label for="sma-je">Email</label><input type="email" id="sma-je" autocomplete="email" placeholder="you@example.com"><div class="sma-err">Enter a valid email.</div></div>' +
    '<div class="sma-f"><label for="sma-jp">Password</label><div class="sma-pw"><input type="password" id="sma-jp" autocomplete="new-password"><button type="button" class="sma-show" data-for="sma-jp">Show</button></div><div class="sma-hint">At least 8 characters.</div><div class="sma-err">Use at least 8 characters.</div></div>' +
    '<button type="submit" class="sma-b pri">Sign up</button></form>' +
    '<div class="sma-msg" id="sma-msg" role="status"></div>' +
    '<p class="sma-terms" id="sma-terms">By signing in, you agree to our <a href="terms.html" target="_blank" rel="noopener">Terms of Service</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</p>' +
    '<p class="sma-foot" id="sma-foot"></p>' +
    '</div>' +

    '<div id="sma-v-forgot" class="sma-hide">' +
    '<h1>Reset your password</h1><p class="sma-sub">Enter your email. We will send you a link.</p>' +
    '<form id="sma-rf" novalidate>' +
    '<div class="sma-f"><label for="sma-re">Email</label><input type="email" id="sma-re" placeholder="you@example.com"><div class="sma-err">Enter a valid email.</div></div>' +
    '<button type="submit" class="sma-b pri">Send reset link</button></form>' +
    '<div class="sma-msg" id="sma-rok" role="status"><b>Check your email.</b> If an account exists for that address, a reset link is on its way.</div>' +
    '<p class="sma-sub" style="margin-top:16px"><button type="button" class="sma-lnk" id="sma-bk">Back to sign in</button></p>' +
    '</div>' +

    '</div></div>';

  var ov, mode = "in", lastFocus = null, built = false;
  function $(id) { return ov.querySelector("#" + id); }
  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  function setBad(input, bad) { var f = input.closest(".sma-f"); if (f) f.classList.toggle("bad", !!bad); return !bad; }
  function msg(el, text) { el.textContent = text; el.classList.add("on"); }

  function render() {
    var join = mode === "join";
    $("sma-v-main").classList.toggle("sma-hide", mode === "forgot");
    $("sma-v-forgot").classList.toggle("sma-hide", mode !== "forgot");
    if (mode === "forgot") return;
    $("sma-h").textContent = join ? "Sign up to continue" : "Sign in to your account";
    $("sma-sub").classList.add("sma-hide");
    $("sma-in").classList.toggle("sma-hide", join || !ov.__emailOpen);
    $("sma-jn").classList.toggle("sma-hide", !join || !ov.__emailOpen);
    $("sma-em").classList.toggle("sma-hide", !!ov.__emailOpen);
    ov.querySelector(".sma-or").classList.toggle("sma-hide", !!ov.__emailOpen);
    $("sma-msg").classList.remove("on");
    $("sma-v-main").classList.toggle("sma-center", !ov.__emailOpen);
    $("sma-g").style.marginBottom = ov.__emailOpen ? "24px" : "";
    $("sma-terms").innerHTML = 'By ' + (join ? 'signing up' : 'signing in') + ', you agree to our '
      + '<a href="terms.html" target="_blank" rel="noopener">Terms of Service</a> and '
      + '<a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.';
    $("sma-foot").innerHTML = join
      ? 'Already have an account? <button type="button" class="sma-lnk" data-go="in">Sign in</button>'
      : 'New here? <button type="button" class="sma-lnk" data-go="join">Sign up</button>';
  }

  function build() {
    if (built) return;
    built = true;
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
    ov = document.createElement("div");
    ov.className = "sma-ov";
    ov.id = "smauth";
    ov.innerHTML = HTML;
    document.body.appendChild(ov);

    ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(); });
    ov.querySelector(".sma-x").onclick = close;
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && ov.classList.contains("on")) close(); });

    ov.addEventListener("click", function (e) {
      var go = e.target.closest("[data-go]");
      if (go) { mode = go.dataset.go; ov.__emailOpen = true; render(); return; }
      var sh = e.target.closest(".sma-show");
      if (sh) {
        var i = $(sh.dataset.for), t = i.type === "password";
        i.type = t ? "text" : "password"; sh.textContent = t ? "Hide" : "Show";
      }
    });

    $("sma-em").onclick = function () { ov.__emailOpen = true; render(); var f = mode === "join" ? $("sma-jname") : $("sma-ie"); f.focus(); };
    $("sma-fg").onclick = function () { mode = "forgot"; render(); $("sma-re").focus(); };
    $("sma-bk").onclick = function () { mode = "in"; $("sma-rok").classList.remove("on"); render(); };
    $("sma-g").onclick = function () {
      if (window.SMAuth.onGoogle) window.SMAuth.onGoogle();
      else { ov.__emailOpen = ov.__emailOpen; msg($("sma-msg"), "Google sign-in is not connected yet."); }
    };

    $("sma-in").onsubmit = function (e) {
      e.preventDefault();
      var a = setBad($("sma-ie"), !emailOk($("sma-ie").value));
      var b = setBad($("sma-ip"), !$("sma-ip").value);
      if (!(a && b)) return;
      if (window.SMAuth.onLogin) window.SMAuth.onLogin({ email: $("sma-ie").value.trim(), password: $("sma-ip").value }, close);
      else msg($("sma-msg"), "Sign-in is not connected to a service yet.");
    };
    $("sma-jn").onsubmit = function (e) {
      e.preventDefault();
      var a = setBad($("sma-jname"), !$("sma-jname").value.trim());
      var b = setBad($("sma-je"), !emailOk($("sma-je").value));
      var c = setBad($("sma-jp"), $("sma-jp").value.length < 8);
      if (!(a && b && c)) return;
      if (window.SMAuth.onJoin) window.SMAuth.onJoin({ name: $("sma-jname").value.trim(), email: $("sma-je").value.trim(), password: $("sma-jp").value }, close);
      else msg($("sma-msg"), "Sign-up is not connected to a service yet.");
    };
    $("sma-rf").onsubmit = function (e) {
      e.preventDefault();
      if (!setBad($("sma-re"), !emailOk($("sma-re").value))) return;
      if (window.SMAuth.onReset) window.SMAuth.onReset($("sma-re").value.trim());
      $("sma-rok").classList.add("on");
    };
  }

  function open(m) {
    build();
    mode = m === "join" ? "join" : "in";
    ov.__emailOpen = ov.__emailOpen || false;
    lastFocus = document.activeElement;
    render();
    ov.classList.add("on");
    document.documentElement.style.overflow = "hidden";
    setTimeout(function () { var b = $("sma-g"); if (b) b.focus(); }, 0);
  }
  function close() {
    if (!ov) return;
    ov.classList.remove("on");
    document.documentElement.style.overflow = "";
    if (/^#(login|signin|join|signup)$/i.test(location.hash)) {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (x) {}
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.SMAuth = { open: open, close: close };

  /* Any "Sign in", "Log in", "Join", "Sign up" button or link on the site opens the popup */
  var JOIN = /^(join|join now|join here|sign ?up|create account|get started)$/i;
  var SIGN = /^(sign ?in|log ?in|login)$/i;
  document.addEventListener("click", function (e) {
    if (ov && ov.contains(e.target)) return;
    var el = e.target.closest("a,button,[role=button]");
    if (!el || el.closest("form")) return;
    var t = (el.textContent || "").replace(/\s+/g, " ").trim();
    var h = (el.getAttribute("href") || "").toLowerCase();
    var k = null;
    if (JOIN.test(t) || /#(join|signup)$/.test(h)) k = "join";
    else if (SIGN.test(t) || /#(login|signin)$/.test(h) || /pages\/login(\.html)?$/.test(h)) k = "in";
    if (!k) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(k);
  }, true);

  function fromHash() {
    var h = location.hash.toLowerCase();
    if (h === "#login" || h === "#signin") open("in");
    else if (h === "#join" || h === "#signup") open("join");
  }
  window.addEventListener("hashchange", fromHash);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fromHash);
  else fromHash();
})();

/* ===== Popup connected to Supabase ===== */
(function () {
  function say(t) { var m = document.getElementById("sma-msg"); if (m) { m.textContent = t; m.classList.add("on"); } }
  function done(user) {
    return SM.loadUser(user).then(function () {
      window.SMAuth.close();
      var g = window.GO; window.GO = null;
      if (g) NAV.go(g);
      route();
    });
  }
  window.SMAuth.onLogin = function (d, close) {
    sb.auth.signInWithPassword({ email: d.email.toLowerCase(), password: d.password }).then(function (r) {
      if (r.error) { say(/invalid login/i.test(r.error.message) ? "Wrong email or password." : SM.msg(r.error)); return; }
      return done(r.data.user);
    }).catch(function (x) { say(SM.msg(x)); });
  };
  window.SMAuth.onJoin = function (d, close) {
    sb.auth.signUp({
      email: d.email.toLowerCase(), password: d.password,
      options: { data: { full_name: d.name.replace(/\s+/g, " ") }, emailRedirectTo: SM.home }
    }).then(function (r) {
      if (r.error) { say(SM.msg(r.error)); return; }
      if (!r.data.session) { say("We sent you an email. Click the link in it to confirm your account, then sign in."); return; }
      return done(r.data.user);
    }).catch(function (x) { say(SM.msg(x)); });
  };
  window.SMAuth.onGoogle = function () {
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: SM.home } });
  };
  window.SMAuth.onReset = function (email) {
    sb.auth.resetPasswordForEmail(email.toLowerCase(), { redirectTo: SM.home });
  };
})();
