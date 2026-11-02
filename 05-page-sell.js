/* Sell an account page */
init.sell=function(root){var $=function(i){return root.querySelector("#"+i)};var again=$("again"),aud=$("aud"),desc=$("desc"),files=$("files"),inc=$("inc"),link=$("link"),niche=$("niche"),own=$("own"),p1=$("p1"),rec=$("rec"),s1=$("s1"),s2=$("s2"),s3=$("s3"),title=$("title"),tos=$("tos");

var f=$("f"),done=$("done"),price=$("price"),shots=$("shots");
function money(n){return "$"+Math.round(n).toLocaleString("en-US")}
price.oninput=function(){var p=+price.value||0;s1.textContent=money(p);s2.textContent=money(p*.05);s3.textContent=money(p*.95)};
shots.onchange=function(){files.innerHTML=[].map.call(shots.files,function(x){return "<li>"+x.name.replace(/[<>&]/g,"")+"</li>"}).join("")};
function bad(el,on){var g=el.closest("[data-g]");if(g)g.classList.toggle("bad",on)}
f.onsubmit=function(e){
  e.preventDefault();
  var r=[
    [$("p1"),!!f.querySelector("[name=p]:checked")],
    [link,link.value.trim().length>2],[niche,!!niche.value],
    [aud,aud.value!==""&&+aud.value>=0],[inc,inc.value!==""&&+inc.value>=0],
    [shots,shots.files.length>=2],
    [title,title.value.trim().length>4],[desc,desc.value.trim().length>20],
    [price,+price.value>0],[own,own.checked],[rec,rec.checked],[tos,tos.checked]
  ],first=null;
  r.forEach(function(x){bad(x[0],!x[1]);if(!x[1]&&!first)first=x[0]});
  if(first){first.scrollIntoView({block:"center"});if(first.type!=="radio"&&first.id!=="shots")first.focus();return}
  if(!U){window.GO="sell";location.hash="login";return}
  if(!U.kyc){window.GO="sell";location.hash="verify";return}
  f.style.display="none";done.style.display="block";done.scrollIntoView({block:"start"});
};
$("again").onclick=function(){f.reset();files.innerHTML="";price.oninput();done.style.display="none";f.style.display="flex";window.scrollTo(0,0)};

};
