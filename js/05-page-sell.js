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
title.maxLength=LIM.titleMax;
title.placeholder="e.g. Gaming channel, 80K subs";
$("te").textContent="Title must be "+LIM.titleMin+" to "+LIM.titleMax+" characters.";
$("de").textContent="Write at least "+LIM.descMin+" characters, up to "+LIM.descWords+" words.";
$("she").textContent="Add at least "+LIM.shotsMin+" screenshots (up to "+LIM.shotsMax+").";
$("dh").textContent="PNG or JPG. "+LIM.shotsMin+" to "+LIM.shotsMax+" pictures. The first picture is your main picture on the listing, so use the one that shows your account name and subscribers or followers.";

/* the questions of the chosen platform (account type, audience ...) */
function drawQs(p){
 QS=sellQuestions(p);
 qs.innerHTML=QS.map(function(q,i){
  var o='<option value="">Choose one</option>';
  q.groups.forEach(function(g){
   var items=g[1].map(function(it){return '<option value="'+(q.aud?"t:":"")+E(it[1])+'">'+E(it[0])+"</option>"}).join("");
   o+=g[0]?'<optgroup label="'+E(g[0])+'">'+items+"</optgroup>":items});
  if(q.aud)o+='<optgroup label="'+(q.groups.length?"Other countries":"Country")+'">'+(q.groups.length?[]:Object.keys(AUD_NAME).map(function(k){return AUD_NAME[k]})).concat(AUD_MORE).map(function(n){return '<option value="n:'+E(n)+'">'+E(n)+"</option>"}).join("")+"</optgroup>";
  return '<div class="f" data-g><label class="t" for="q'+i+'">'+E(q.label)+'</label><select id="q'+i+'">'+o+'</select>'+(q.aud?'<div class="hint">Where most of your followers or viewers live.</div>':"")+'<div class="err">Choose one.</div></div>'}).join("")}
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
 $("dt").textContent=FILES.length>=LIM.shotsMax?"Maximum "+LIM.shotsMax+" screenshots added":"Tap to add more screenshots ("+FILES.length+" of "+LIM.shotsMax+")";
 if(!FILES.length)$("dt").textContent="Tap to add screenshots of your followers, views and income"}
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
 QS.forEach(function(q,i){r.push([$("q"+i),!!$("q"+i).value])});
 if(pc&&!QS.length)r.push([qs,false]);
 r=r.concat([[niche,!!niche.value],[link,link.value.trim().length>2],
  [aud,aud.value!==""&&+aud.value>=0],[inc,inc.value!==""&&+inc.value>=0],
  [shots,FILES.length>=LIM.shotsMin&&FILES.length<=LIM.shotsMax],
  [title,tl>=LIM.titleMin&&tl<=LIM.titleMax],[desc,dl>=LIM.descMin&&wd<=LIM.descWords],
  [price,+price.value>0],[own,own.checked],[rec,rec.checked],[tos,tos.checked]]);
 var first=null;
 r.forEach(function(x){bad(x[0],!x[1]);if(!x[1]&&!first)first=x[0]});
 if(first){first.scrollIntoView({block:"center"});if(first.focus&&first.type!=="radio"&&first.id!=="shots"&&first!==plat&&first!==qs)first.focus();return}
 if(!U||U.kyc!=="verified"){NAV.go("start-selling");return}
 if(f.dataset.busy)return;f.dataset.busy="1";f.style.opacity=".6";
 var tags=[],audience="";
 QS.forEach(function(q,i){var v=$("q"+i).value;
  if(q.aud){if(v.indexOf("t:")===0){var k=v.slice(2);tags.push(k);audience=audName(pc.value,k)}else audience=v.slice(2)}
  else tags.push(v)});
 SM.createListing({platform:pc.value,niche:niche.value,audience:audience,tags:tags,title:title.value.trim(),description:desc.value.trim(),followers:Math.round(+aud.value),income:+inc.value,price:+price.value,link:link.value.trim(),shots:FILES})
  .then(function(){f.style.display="none";done.style.display="block";wrap.classList.add("sent");window.scrollTo(0,0)})
  .catch(function(x){alert("Could not send your listing: "+SM.msg(x))})
  .then(function(){delete f.dataset.busy;f.style.opacity=""});
};
$("again").onclick=function(){f.reset();FILES=[];QS=[];drawThumbs();qs.innerHTML='<p class="hint" style="margin-top:14px">Choose a platform to see its categories.</p>';title.oninput();desc.oninput();done.style.display="none";wrap.classList.remove("sent");f.style.display="flex";window.scrollTo(0,0)};
};
