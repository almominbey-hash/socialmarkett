/* Create a new listing page.
   Platforms, account types and audiences are NOT written here: they come from SUB / AUD in js/01-config.js
   (sellPlatforms() and sellQuestions()), so changing them there changes this form too.
   Limits (title, description words, number of screenshots) are in LIM in js/01-config.js. */
init.sell=function(root){var $=function(i){return root.querySelector("#"+i)};
var f=$("f"),done=$("done"),wrap=$("wrap"),plat=$("plat"),qs=$("qs"),niche=$("niche"),link=$("link"),aud=$("aud"),inc=$("inc"),price=$("price"),
 title=$("title"),desc=$("desc"),shots=$("shots"),thumbs=$("thumbs"),own=$("own"),rec=$("rec"),tos=$("tos");
var FILES=[],QS=[],URLS=[];
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function words(t){return (t.trim().match(/\S+/g)||[]).length}
function bad(el,on){var g=el.closest("[data-g]");if(g)g.classList.toggle("bad",on)}

/* platforms (from the config) */
var PL=sellPlatforms();
plat.innerHTML=PL.map(function(p,i){return '<input type="radio" name="p" id="p'+i+'" value="'+E(p)+'"><label for="p'+i+'">'+E(p)+'</label>'}).join("");
niche.innerHTML='<option value="">Choose one</option>'+NICHES.map(function(n){return "<option>"+E(n)+"</option>"}).join("");
$("mon").innerHTML='<option value="">Choose one</option>'+MON.map(function(o){return '<option value="'+o[0]+'">'+E(o[1])+"</option>"}).join("");
$("age").innerHTML='<option value="">Choose one</option>'+AGE.map(function(o){return '<option value="'+o[0]+'">'+E(o[1])+"</option>"}).join("");
title.maxLength=LIM.titleMax;
title.placeholder="e.g. Gaming channel, 80K subs";
$("te").textContent="Title must be "+LIM.titleMin+" to "+LIM.titleMax+" characters.";
$("de").textContent="Write at least "+LIM.descMin+" characters, up to "+LIM.descWords+" words.";
$("she").textContent="Add at least "+LIM.shotsMin+" screenshots (up to "+LIM.shotsMax+").";

/* the questions of the chosen platform (account type, audience ...) */
function drawQs(p){
 QS=sellQuestions(p);
 qs.innerHTML=QS.map(function(q,i){
  if(q.menu){
   var pn='<div class="cmh"><b>'+E(p)+'</b></div>';
   var pn2=q.groups.map(function(g){return '<div class="cmg"><h4>'+E(g[0])+'</h4>'+g[1].map(function(it){return '<button type="button" class="cmi" data-v="'+E(it[1])+'">'+E(it[0])+'</button>'}).join("")+'</div>'}).join("");
   return '<div class="f" data-g><span class="t" style="display:block;font-weight:500;font-size:15px;margin-bottom:6px">'+E(q.label)+'</span><div class="cm" id="q'+i+'" data-val=""><button type="button" class="cmb" aria-haspopup="true" aria-expanded="false"><span class="cml">Choose one</span></button><div class="cmp" hidden>'+pn+'<div class="cmc">'+pn2+'</div></div></div><div class="err">Choose one.</div></div>'}
  var o='<option value="">Choose one</option>';
  q.groups.forEach(function(g){
   var items=g[1].map(function(it){return '<option value="t:'+E(it[1])+'">'+E(audShort(it))+"</option>"}).join("");
   o+=g[0]?'<optgroup label="'+E(g[0])+'">'+items+"</optgroup>":items});
  return '<div class="f" data-g><label class="t" for="q'+i+'">'+E(q.label)+'</label><select id="q'+i+'">'+o+'</select><div class="err">Choose one.</div></div>'}).join("")}
/* audience names in this form are only the country: USA, UK, Pakistan, Other */
function audShort(it){return AUD_NAME[it[1]]==="United States"?"USA":AUD_NAME[it[1]]==="United Kingdom"?"UK":AUD_NAME[it[1]]||String(it[0]).replace(/\s*audience$/i,"").replace(/^Other countries$/i,"Other")}
/* category menu: opens like the top menu, one choice only */
function cmClose(){[].forEach.call(root.querySelectorAll(".cm"),function(c){var p=c.querySelector(".cmp"),b=c.querySelector(".cmb");if(p)p.hidden=true;if(b)b.setAttribute("aria-expanded","false")})}
qs.addEventListener("click",function(e){var b=e.target.closest(".cmb"),it=e.target.closest(".cmi"),c=e.target.closest(".cm");
 if(it&&c){c.dataset.val=it.dataset.v;c.querySelector(".cml").textContent=it.textContent;[].forEach.call(c.querySelectorAll(".cmi"),function(x){x.classList.toggle("on",x===it)});c.classList.add("has");bad(c,false);cmClose();return}
 if(b&&c){var p=c.querySelector(".cmp"),open=p.hidden;cmClose();p.hidden=!open;b.setAttribute("aria-expanded",open?"true":"false")}});
root.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest(".cm"))cmClose()});
root.addEventListener("keydown",function(e){if(e.key==="Escape")cmClose()});
/* Monetized and Non-Monetized can not both be true: ticking one un-ticks the other */
qs.addEventListener("change",function(e){var t=e.target;if(!t||t.type!=="checkbox"||!t.checked)return;var o=t.value==="monetized"?"non-monetized":t.value==="non-monetized"?"monetized":"";if(!o)return;var x=t.closest(".chk").querySelector('input[value="'+o+'"]');if(x)x.checked=false});
function qval(i){var el=$("q"+i);if(el.classList.contains("cm"))return el.dataset.val||"";return el.tagName==="SELECT"?el.value:[].filter.call(el.querySelectorAll("input"),function(c){return c.checked}).map(function(c){return c.value})}
plat.addEventListener("change",function(){var c=f.querySelector("[name=p]:checked");if(c){bad(plat,false);drawQs(c.value)}});

/* counters */
title.oninput=function(){$("tc").textContent=title.value.trim().length};
desc.oninput=function(){var n=words(desc.value);$("dc").textContent=n+" / "+LIM.descWords}
desc.oninput();

/* screenshots: the FIRST one is the main picture of the listing */
function drawThumbs(){
 URLS.forEach(function(u){URL.revokeObjectURL(u)});URLS=[];
 thumbs.innerHTML=FILES.map(function(x,i){var u=URL.createObjectURL(x);URLS.push(u);
  return '<div class="th'+(i===0?" main":"")+'"><img src="'+u+'" alt=""><span class="cv">'+(i===0?"Main picture":"Picture "+(i+1))+'</span>'+(i===0?"":'<button type="button" data-mk="'+i+'">Make main</button>')+'<button type="button" class="x" data-rm="'+i+'" aria-label="Remove picture">&times;</button></div>'}).join("");
 $("dt").textContent=FILES.length>=LIM.shotsMax?"Maximum "+LIM.shotsMax+" screenshots added":FILES.length?"Add more ("+FILES.length+" of "+LIM.shotsMax+")":"Add "+LIM.shotsMin+" to "+LIM.shotsMax+" screenshots"}
shots.onchange=function(){
 var over=false;
 [].forEach.call(shots.files,function(x){
  if(!/^image\//.test(x.type))return;
  if(FILES.some(function(y){return y.name===x.name&&y.size===x.size&&y.lastModified===x.lastModified}))return;
  if(FILES.length>=LIM.shotsMax){over=true;return}FILES.push(x)});
 shots.value="";drawThumbs();
 if(over)alert("You can add up to "+LIM.shotsMax+" screenshots.");
 if(FILES.length>=LIM.shotsMin)bad(shots,false)};
thumbs.addEventListener("click",function(e){
 var b=e.target.closest&&e.target.closest("button");if(!b)return;
 if(b.dataset.rm!=null)FILES.splice(+b.dataset.rm,1);
 else if(b.dataset.mk!=null){var x=FILES.splice(+b.dataset.mk,1)[0];FILES.unshift(x)}
 drawThumbs()});

/* send */
f.onsubmit=function(e){
 e.preventDefault();
 var pc=f.querySelector("[name=p]:checked"),tl=title.value.trim().length,wd=words(desc.value),dl=desc.value.trim().length;
 var r=[[plat,!!pc]];
 QS.forEach(function(q,i){var v=qval(i);r.push([$("q"+i),q.aud?!!v:v.length>0])});
 if(pc&&!QS.length)r.push([qs,false]);
 r=r.concat([[niche,!!niche.value],[$("mon"),!!$("mon").value],[$("age"),!!$("age").value],[link,link.value.trim().length>2],
  [aud,/^\d+$/.test(aud.value.trim())],[inc,/^\d+$/.test(inc.value.trim())],
  [shots,FILES.length>=LIM.shotsMin&&FILES.length<=LIM.shotsMax],
  [title,tl>=LIM.titleMin&&tl<=LIM.titleMax],[desc,dl>=LIM.descMin&&wd<=LIM.descWords],
  [price,/^\d+$/.test(price.value.trim())&&+price.value>0],[own,own.checked],[rec,rec.checked],[tos,tos.checked]]);
 var first=null;
 r.forEach(function(x){bad(x[0],!x[1]);if(!x[1]&&!first)first=x[0]});
 if(first){first.scrollIntoView({block:"center"});if(first.focus&&first.type!=="radio"&&first.id!=="shots"&&first!==plat&&first!==qs)first.focus();return}
 if(!U||U.kyc!=="verified"){NAV.go("start-selling");return}
 if(f.dataset.busy)return;f.dataset.busy="1";f.style.opacity=".6";
 var tags=[],audience="";
 QS.forEach(function(q,i){var v=qval(i);
  if(q.aud){if(v.indexOf("t:")===0){var k=v.slice(2);tags.push(k);audience=audName(pc.value,k)}else{audience=v.slice(2);tags.push("other")}}
  else if(typeof v==="string"){if(v)tags.push(v)}else v.forEach(function(x){tags.push(x)})});
 SM.createListing({platform:pc.value,niche:niche.value,monetization:$("mon").value,age:$("age").value,audience:audience,tags:tags,title:title.value.trim(),description:desc.value.trim(),followers:Math.round(+aud.value),income:+inc.value,price:+price.value,link:link.value.trim(),shots:FILES})
  .then(function(){f.style.display="none";done.style.display="block";wrap.classList.add("sent");window.scrollTo(0,0)})
  .catch(function(x){alert("Could not send your listing: "+SM.msg(x))})
  .then(function(){delete f.dataset.busy;f.style.opacity=""});
};
$("again").onclick=function(){f.reset();FILES=[];QS=[];drawThumbs();qs.innerHTML="";title.oninput();desc.oninput();done.style.display="none";wrap.classList.remove("sent");f.style.display="flex";window.scrollTo(0,0)};
};
