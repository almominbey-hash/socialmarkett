/* Clean URLs: /youtube, /sell, /login ... (no # and no index.html) */
var NAV={
 cur:function(){return location.pathname.replace(/\/index\.html$/,"/").replace(/\.html$/,"").replace(/^\/+|\/+$/g,"")},
 path:function(h){if(h==="start"||h==="home")return U?"/":"/browse";return "/"+h},
 swap:function(p){if(location.pathname!==p)history.replaceState(null,"",p+location.search)},
 go:function(h){var p=NAV.path(h);if(location.pathname!==p)history.pushState(null,"",p);window.dispatchEvent(new Event("navchange"))}
};
/* Settings, category menu data, page list and page titles */
function openChat(id){
 if(!U){window.GO="start";NAV.go("login");route();return}
 sb.rpc("start_conversation",{p_listing:id}).then(function(r){if(r.error){alert(SM.msg(r.error));return}window.pendChat={id:r.data};NAV.go("messages");route()})}window.openChat=openChat;
var HK={YouTube:"youtube",Instagram:"instagram",TikTok:"tiktok",Facebook:"facebook"},lastN=null;
var AUD=[["Premium audience",[["USA audience","usa"],["UK audience","uk"]]],["Local audience",[["Pakistan audience","pakistan"]]]];
var SUB={
YouTube:[["Account type",[["Monetized channels","monetized"],["Fresh channels","fresh"],["Aged channels","aged"]]]].concat(AUD),
Instagram:[["Account type",[["Fresh accounts","fresh"],["Aged accounts","aged"],["Verified (blue tick)","verified"]]]].concat(AUD),
TikTok:[["Account type",[["Monetized accounts","monetized"],["Fresh accounts","fresh"],["Aged accounts","aged"]]]].concat(AUD),
Facebook:[["Page type",[["Monetized pages","monetized"],["Fresh pages","fresh"],["Criteria pages (ready to monetize)","criteria"],["Aged pages","aged"]]]].concat(AUD) 
};
var PMAP={};Object.keys(SUB).forEach(function(p){PMAP[HK[p]]=[p,null];SUB[p].forEach(function(g){g[1].forEach(function(i){PMAP[HK[p]+"-"+i[1]]=[p,i[0],i[1]]})})});
function subLabel(p,t){var r=null;(SUB[p]||[]).forEach(function(g){g[1].forEach(function(i){if(i[1]===t)r=i[0]})});return r}
/* ===== ONE PLACE TO CHANGE CATEGORIES =====
   Platforms, account types (Monetized, Fresh, Aged ...) and audiences are all written in SUB / AUD above.
   The top menu, the browse filters AND the "Create a new listing" form read from them.
   Add or remove an item there and the listing form follows by itself (nothing else to edit).
   Only for a NEW platform name also run supabase/listing-categories.sql once (it allows any platform name). */
var LIM={titleMin:10,titleMax:20,descMin:20,descWords:500,shotsMin:3,shotsMax:5}; /* limits used by the listing form */
var EXTRA_PLATFORMS=["Gaming"]; /* platforms that have no sub categories above; delete the name to hide it from the form */
var NICHES=["Lifestyle","Fitness","Technology","Food","Travel","Creative","Other"];
var AUD_MORE=["India","UAE","Saudi Arabia","Canada","Global","Other"]; /* extra countries (no browse sub category) */
var AUD_NAME={usa:"United States",uk:"United Kingdom",pakistan:"Pakistan"}; /* tag key -> country name saved on the listing */
function audName(p,k){return AUD_NAME[k]||String(subLabel(p,k)||k).replace(/\s*audience$/i,"")}
function sellPlatforms(){return Object.keys(SUB).concat(EXTRA_PLATFORMS.filter(function(x){return !SUB[x]}))}
/* questions the seller must answer for one platform, built from SUB: every group = one question, audiences = one question */
function sellQuestions(p){var qs=[],au=[];(SUB[p]||[]).forEach(function(g){if(AUD.indexOf(g)>-1)au.push(g);else qs.push({label:g[0],groups:[[null,g[1]]],aud:false})});
 qs.push({label:"Audience",groups:au.map(function(g){return[g[0],g[1]]}),aud:true});return qs}
var init={},R=["messages","account","order","sell","login","dash","start-selling","seller-dashboard","saved","start","landing"],T={messages:"Messages – socialmarket",landing:"socialmarket – Buy and sell social media accounts safely",start:"Welcome back – socialmarket","start-selling":"Start selling – socialmarket","seller-dashboard":"Seller Dashboard – socialmarket",saved:"Saved accounts – socialmarket",login:"Log in – socialmarket",dash:"Dashboard – socialmarket",home:"socialmarket – Buy and sell social media accounts safely",account:"Gaming channel, 82.5K subscribers – socialmarket",order:"Your order – socialmarket",sell:"Create a new listing – socialmarket"},pages={},roots={},pendHow=false;
