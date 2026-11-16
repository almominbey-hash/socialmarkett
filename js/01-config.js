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
var HK={YouTube:"youtube",Instagram:"instagram",TikTok:"tiktok",Facebook:"facebook",X:"x",Gaming:"gaming","E-commerce":"e-commerce",Websites:"websites",AdSense:"adsense"},lastN=null;
var AUD=[["Premium audience",[["USA audience","usa"],["UK audience","uk"]]],["Local audience",[["Pakistan audience","pakistan"],["Other countries","other"]]]]; /* top menu: both headings sit in ONE column (Premium, USA, UK, Local, Pakistan, Other). Create-listing form: only the country names, no headings */
var SUB={
YouTube:[["Channel status",[["Fresh YouTube Channels","fresh"],["Monetized YouTube Channels","monetized"],["Non-Monetized Channels","non-monetized"],["YouTube Partner Program Channels","ypp"]]],["Content format",[["YouTube Shorts Channels","shorts"],["Long-Form Video Channels","long-form"],["Faceless / Automation Channels","faceless"]]]].concat(AUD),
Instagram:[["Account type",[["Fresh Instagram Accounts","fresh"],["Instagram Creator Accounts","creator"],["Instagram Business Accounts","business"],["Monetized Instagram Accounts","monetized"],["Instagram Influencer Accounts","influencer"],["Verified (blue tick)","verified"]]],["Page type",[["Instagram Reels Accounts","reels"],["Instagram Theme Pages","theme"],["Instagram Meme Pages","meme"],["Instagram Fashion Pages","fashion"],["Instagram E-commerce Pages","ecommerce"]]]].concat(AUD),
TikTok:[["Monetization & programs",[["Monetized TikTok Accounts","monetized"],["Creator Rewards Program Accounts","creator-rewards"],["TikTok Shop Seller Accounts","shop-seller"],["TikTok Shop Affiliate Accounts","shop-affiliate"]]],["Account type",[["TikTok Gaming Accounts","gaming"],["TikTok LIVE Accounts","live"],["TikTok Agency Accounts","agency"],["TikTok Aged Accounts","aged"]]]].concat(AUD),
Facebook:[["Page status",[["Fresh Facebook Pages","fresh"],["Monetized Facebook Pages","monetized"],["Non-Monetized Facebook Pages","non-monetized"]]],["Monetization features",[["Content Monetization Enabled Pages","content-monetization"],["Monetization Eligible Pages","eligible"],["Monetization Criteria Completed Pages","criteria"],["Facebook Stars Enabled Pages","stars"],["Facebook Subscription Enabled Pages","subscriptions"]]],["Business",[["Facebook Business Portfolios","business-portfolios"]]]].concat(AUD),
X:[["Account type",[["Fresh Accounts","fresh"],["Aged Accounts","aged"],["Premium Accounts","premium"],["Monetized Accounts","monetized"],["Business Accounts","business"]]],["Verification",[["Verified (Blue Tick) Accounts","verified"],["Verified Organization (Gold Tick)","verified-gold"],["Verified Premium+ Accounts","verified-premium-plus"]]]].concat(AUD) 
};
/* every platform gets an "Others" item at the end of its categories: the top menu shows it, the Create-listing menu shows it (seller types the category) and listings saved there appear on the page /platform-others */
Object.keys(SUB).forEach(function(p){var c=SUB[p].filter(function(g){return AUD.indexOf(g)<0});if(c.length)c[c.length-1][1].push(["Others","others"])});
var PMAP={};Object.keys(SUB).forEach(function(p){PMAP[HK[p]]=[p,null];SUB[p].forEach(function(g){g[1].forEach(function(i){PMAP[HK[p]+"-"+i[1]]=[p,i[0],i[1]]})})});
function subLabel(p,t){var r=null;(SUB[p]||EXTRA_SUB[p]||[]).forEach(function(g){g[1].forEach(function(i){if(i[1]===t)r=i[0]})});return r}
/* ===== ONE PLACE TO CHANGE CATEGORIES =====
   Platforms, account types (Monetized, Fresh, Aged ...) and audiences are all written in SUB / AUD above.
   The top menu, the browse filters AND the "Create a new listing" form read from them.
   Add or remove an item there and the listing form follows by itself (nothing else to edit).
   Only for a NEW platform name also run supabase/listing-categories.sql once (it allows any platform name). */
var LIM={titleMin:10,titleMax:20,descMin:20,descWords:500,shotsMin:3,shotsMax:5}; /* limits used by the listing form */
var EXTRA_PLATFORMS=["Gaming","E-commerce","Websites","AdSense"]; /* platforms that have no big category list above; delete a name to hide it from the Create-listing form */
/* Basic categories for those platforms: [name shown, key saved]. Add or remove lines here and the Create-listing form, the top menu and the category pages follow by themselves. "Others" (seller types the category) is added automatically at the end. */
var EXTRA_SUB={
Gaming:[["Category",[["Game Accounts","game-accounts"],["Gaming Channels","channels"],["In-Game Items & Currency","in-game-items"]]]],
"E-commerce":[["Category",[["Online Stores","online-stores"],["Dropshipping Stores","dropshipping"],["Marketplace Seller Accounts","marketplace-sellers"]]]],
Websites:[["Category",[["Blogs","blogs"],["News Sites","news-sites"],["Niche Websites","niche-websites"]]]],
AdSense:[["Category",[["AdSense Approved Sites","adsense-sites"],["Monetized Blogs","monetized-blogs"],["AdSense Accounts","adsense-accounts"]]]]
};
Object.keys(EXTRA_SUB).forEach(function(p){var g=EXTRA_SUB[p];g[g.length-1][1].push(["Others","others"]);PMAP[HK[p]]=[p,null];g.forEach(function(x){x[1].forEach(function(i){PMAP[HK[p]+"-"+i[1]]=[p,i[0],i[1]]})})});
var NICHES=["Gaming","Tech","Beauty","Education","Lifestyle","Fitness","Food","Travel","Creative","Other"];
/* listing form + browse filter: monetization and account age (value, label) */
var MON=[["eligible","Fresh"],["enabled","Monetized"],["none","Non-Monetized"]]; /* the saved value stays the same (eligible / enabled / none), only the name changed */
var AGE=[["new","New"],["1plus","1+ Year"],["3plus","3+ Years"]];
var AUD_MORE=["India","UAE","Saudi Arabia","Canada","Global","Other"]; /* extra countries (no browse sub category) */
var AUD_NAME={usa:"United States",uk:"United Kingdom",pakistan:"Pakistan",other:"Other"}; /* tag key -> country name saved on the listing */
function audName(p,k){return AUD_NAME[k]||String(subLabel(p,k)||k).replace(/\s*audience$/i,"")}
function sellPlatforms(){return Object.keys(SUB).concat(EXTRA_PLATFORMS.filter(function(x){return !SUB[x]}))}
/* questions the seller must answer for one platform, built from SUB: every group = one question, audiences = one question */
function sellQuestions(p){var cat=[],au=[],qs=[];(SUB[p]||EXTRA_SUB[p]||[]).forEach(function(g){if(AUD.indexOf(g)>-1)au.push(g);else cat.push(g)});
 if(!au.length)au=AUD;
 /* one question for EACH category group (its own heading, choose one, its own "Others") */
 cat.forEach(function(g){var it=g[1].slice();if(!it.some(function(x){return x[1]==="others"}))it.push(["Others","others"]);qs.push({label:g[0],groups:[[g[0],it]],aud:false,menu:true})});
 qs.push({label:"Audience",groups:au.map(function(g){return[g[0],g[1]]}),aud:true});return qs}
var init={},R=["messages","account","order","sell","login","dash","start-selling","seller-dashboard","settings","saved","start","landing"],T={settings:"Account settings – socialmarket",messages:"Messages – socialmarket",landing:"socialmarket – Buy and sell social media accounts safely",start:"Welcome back – socialmarket","start-selling":"Start selling – socialmarket","seller-dashboard":"Seller Dashboard – socialmarket",saved:"Saved accounts – socialmarket",login:"Log in – socialmarket",dash:"Dashboard – socialmarket",home:"socialmarket – Buy and sell social media accounts safely",account:"Gaming channel, 82.5K subscribers – socialmarket",order:"Your order – socialmarket",sell:"Create a new listing – socialmarket"},pages={},roots={},pendHow=false;
