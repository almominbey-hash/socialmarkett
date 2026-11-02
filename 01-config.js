/* Settings, category menu data, page list and page titles */
function openChat(sl,tt){window.pendChat={s:sl,t:tt};if(!U)window.GO="messages";location.hash="messages";route()}window.openChat=openChat;
var HK={YouTube:"youtube",Instagram:"instagram",TikTok:"tiktok",Facebook:"facebook",Gaming:"gaming"},lastN=null;
var AUD=[["Premium audience",[["USA audience","usa"],["UK audience","uk"]]],["Local audience",[["Pakistan audience","pakistan"]]]];
var SUB={
YouTube:[["Account type",[["Monetized channels","monetized"],["Fresh channels","fresh"],["Aged channels","aged"]]]].concat(AUD),
Instagram:[["Account type",[["Fresh accounts","fresh"],["Aged accounts","aged"],["Verified (blue tick)","verified"]]]].concat(AUD),
TikTok:[["Account type",[["Monetized accounts","monetized"],["Fresh accounts","fresh"],["Aged accounts","aged"]]]].concat(AUD),
Facebook:[["Page type",[["Monetized pages","monetized"],["Fresh pages","fresh"],["Criteria pages (ready to monetize)","criteria"],["Aged pages","aged"]]]].concat(AUD),
Gaming:[["Game",[["Fortnite","fortnite"],["Valorant","valorant"],["PUBG","pubg"]]],["Account quality",[["High rank accounts","highrank"]]]]
};
var PMAP={};Object.keys(SUB).forEach(function(p){PMAP[HK[p]]=[p,null];SUB[p].forEach(function(g){g[1].forEach(function(i){PMAP[HK[p]+"-"+i[1]]=[p,i[0],i[1]]})})});
function subLabel(p,t){var r=null;(SUB[p]||[]).forEach(function(g){g[1].forEach(function(i){if(i[1]===t)r=i[0]})});return r}
var init={},R=["messages","account","order","sell","login","dash","verify","saved","start","landing"],T={messages:"Messages – socialmarket",landing:"socialmarket – Buy and sell social media accounts safely",start:"Welcome back – socialmarket",verify:"Become a seller – socialmarket",saved:"Saved accounts – socialmarket",login:"Log in – socialmarket",dash:"Dashboard – socialmarket",home:"socialmarket – Buy and sell social media accounts safely",account:"Gaming channel, 82.5K subscribers – socialmarket",order:"Your order – socialmarket",sell:"Sell your account – socialmarket"},pages={},roots={},pendHow=false;
