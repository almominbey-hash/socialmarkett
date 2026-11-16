/* Profile page (top-right menu > Profile): picture, name (the name given at sign up, or the seller name), About, member since.
   ID card details are never shown. Needs supabase/seller-profile.sql (run once). */
init.dash=function(root){
var BUSY=false,EDIT="";
var PEN='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>';
var CAM='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function E(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function N(x){return Number(x||0).toLocaleString("en-US")}
function ini(n){return String(n||"S").trim().split(/\s+/).map(function(w){return w.charAt(0)}).join("").slice(0,2).toUpperCase()||"S"}
function since(){try{return new Date(U.since).toLocaleDateString("en-US",{month:"short",year:"numeric"})}catch(e){return ""}}
function $(i){return root.querySelector("#"+i)}
function say(t,bad){var s=$("pmsg");if(!s)return;s.textContent=t||"";s.className="pmsg"+(bad?" bad":(t?" ok":""))}
function setupMsg(e){return /function|schema cache|column|does not exist/i.test((e&&e.message)||"")?"Profile is not set up yet. In Supabase > SQL Editor run supabase/seller-profile.sql once, then try again.":(window.SM&&SM.msg?SM.msg(e):"Something went wrong. Please try again.")}
function shown(){return U.sname||U.meta||""}

function draw(){if(!U)return;
 var sel=!!U.kyc,v=$("dv");
 var nameBlock=EDIT==="name"
  ?'<div class="ed"><input id="psn" maxlength="40" value="'+E(shown())+'" placeholder="Your name" aria-label="Your name"><button type="button" class="btn sm" data-save="name">Save</button><button type="button" class="btn line sm" data-cancel="1">Cancel</button></div>'
  :'<h1>'+(shown()?E(shown()):'<span class="mut">Add your name</span>')+'<button type="button" class="ib" data-edit="name" aria-label="Edit name">'+PEN+'</button></h1>';
 var aboutBlock=EDIT==="about"
  ?'<textarea id="pab" rows="7" maxlength="600" placeholder="Write about yourself and the accounts you sell (up to 600 letters)">'+E(U.about)+'</textarea><div class="ed" style="margin-top:12px"><button type="button" class="btn sm" data-save="about">Save</button><button type="button" class="btn line sm" data-cancel="1">Cancel</button></div>'
  :'<p class="abt">'+(U.about?E(U.about):'<span class="mut">Tell buyers about yourself.</span>')+'</p>';
 v.innerHTML='<div class="pf">'+
  '<header class="ph2"><div class="pavw"><div class="pav">'+(U.avatar?'<img src="'+E(U.avatar)+'" alt="Your profile picture">':'<span>'+E(ini(shown()))+'</span>')+'</div>'+
   '<label class="cam" for="pfile" title="'+(U.avatar?"Change photo":"Add photo")+'" aria-label="'+(U.avatar?"Change photo":"Add photo")+'">'+CAM+'</label><input type="file" id="pfile" accept="image/jpeg,image/png,image/webp" hidden></div>'+
   '<div class="pinfo">'+nameBlock+
   '<div class="pstr">'+(since()?'<span>Member since <b>'+E(since())+'</b></span>':'')+'</div>'+
   (U.avatar?'<button type="button" class="lnk" data-rm="1">Remove photo</button>':'')+
   '<div id="pmsg" class="pmsg" role="status"></div></div></header>'+
  (sel?'<section class="pcard"><div class="ch2"><h2>About</h2>'+(EDIT==="about"?'':'<button type="button" class="ib" data-edit="about" aria-label="Edit About">'+PEN+'</button>')+'</div>'+aboutBlock+'</section>':'')+
 '</div>';
 if(EDIT){var f=$({name:"psn",about:"pab"}[EDIT]);if(f){f.focus();try{f.setSelectionRange(f.value.length,f.value.length)}catch(e){}}}
}


/* one save for everything; fields not being edited keep their current value */
function save(part,avatar){
 if(BUSY)return Promise.resolve();
 var a={sn:shown(),ab:U.about,co:U.country,ci:U.city};
 if(part==="name"){a.sn=String($("psn").value).trim().replace(/\s+/g," ");if(a.sn.length<2){say("Name must be at least 2 letters.",1);return Promise.resolve()}}
 if(part==="about")a.ab=$("pab").value;
 if(!a.sn||a.sn.length<2){say("Please add your name first.",1);return Promise.resolve()}
 BUSY=true;say("Saving...");
 var args={p_seller_name:a.sn,p_about:a.ab,p_country:a.co,p_city:a.ci};if(avatar!==undefined)args.p_avatar=avatar;
 return sb.rpc("save_profile",args).then(function(r){BUSY=false;
  if(r.error){say(setupMsg(r.error),1);return}
  EDIT="";return SM.refresh().then(function(){draw();say("Saved.")})},function(){BUSY=false;say("Could not save. Check your internet and try again.",1)})}

root.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("button");if(!t)return;
 if(t.dataset.edit){EDIT=t.dataset.edit;draw()}
 else if(t.dataset.cancel){EDIT="";draw()}
 else if(t.dataset.save)save(t.dataset.save);
 else if(t.dataset.rm){if(confirm("Remove your profile picture?"))save("","")}});
root.addEventListener("keydown",function(e){if(!EDIT)return;if(e.key==="Escape"){EDIT="";draw()}else if(e.key==="Enter"&&e.target.tagName==="INPUT")save(EDIT)});
root.addEventListener("change",function(e){var f=e.target;if(f.id!=="pfile"||!f.files||!f.files[0])return;
 var file=f.files[0];f.value="";
 if(!/^image\/(jpeg|png|webp)$/.test(file.type)){say("Please choose a JPG, PNG or WebP picture.",1);return}
 if(file.size>5*1024*1024){say("The picture must be under 5 MB.",1);return}
 if(!shown()){say("Add your name first, then add the photo.",1);return}
 say("Uploading photo...");
 SM.upload("avatars",file).then(function(path){return save("",sb.storage.from("avatars").getPublicUrl(path).data.publicUrl)},function(err){say(setupMsg(err),1)})});

/* a seller who already gave a seller name and "about you" when applying gets them here automatically (what the seller wrote in the profile is never overwritten) */
function adopt(){if(!U||!U.kyc||(U.sname&&U.about))return Promise.resolve();
 return sb.rpc("seller_profile_defaults").then(function(r){var d=r&&r.data;if(!r||r.error||!d)return;
  var sn=U.sname||String(d.display_name||"").trim(),ab=U.about||String(d.bio||"").trim();
  if(!sn||(sn===U.sname&&ab===U.about))return;
  return sb.rpc("save_profile",{p_seller_name:sn,p_about:ab,p_country:U.country||"",p_city:U.city||""}).then(function(x){if(!x.error)return SM.refresh()})}).catch(function(){})}
window.renderDash=function(){if(!U)return;EDIT="";SM.refresh().then(adopt).then(draw)};
};
