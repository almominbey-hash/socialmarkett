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
var init={},R=["messages","account","order","sell","login","dash","start-selling","seller-dashboard","saved","start","landing"],T={messages:"Messages – socialmarket",landing:"socialmarket – Buy and sell social media accounts safely",start:"Welcome back – socialmarket","start-selling":"Start selling – socialmarket","seller-dashboard":"Seller Dashboard – socialmarket",saved:"Saved accounts – socialmarket",login:"Log in – socialmarket",dash:"Dashboard – socialmarket",home:"socialmarket – Buy and sell social media accounts safely",account:"Gaming channel, 82.5K subscribers – socialmarket",order:"Your order – socialmarket",sell:"Sell your account – socialmarket"},pages={},roots={},pendHow=false;
