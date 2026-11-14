/* Backend connection (Supabase). Put your own two values below (see SETUP-URDU.md). */
var SUPABASE_URL="https://jghgpncepmcmppefybvn.supabase.co";
var SUPABASE_ANON_KEY="sb_publishable__bdTHwvUBt7QE5wuCimz-w_MYJqTtR8";

var sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{flowType:"pkce",persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
var SM={};
SM.home=location.origin+"/";

SM.short=function(n){n=+n||0;if(n>=1e6)return (n/1e6).toFixed(1).replace(/\.0$/,"")+"M";if(n>=1e3)return (n/1e3).toFixed(1).replace(/\.0$/,"")+"K";return String(n)};

/* Load the profile of a signed-in user into the site (sets U) */
SM.loadUser=function(user){
  return sb.from("profiles").select("*").eq("id",user.id).maybeSingle().then(function(r){
    var p=r.data||{},k=p.kyc_status;
    setUser({id:user.id,email:p.email||user.email||"",name:p.full_name||"",role:p.role||"member",kyc:(k==="pending"||k==="verified"||k==="rejected")?k:undefined});
    return SM.loadSaved().then(function(){if(SM.notify)SM.notify()});
  });
};
SM.refresh=function(){return sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;if(s)return SM.loadUser(s.user)})};
SM.boot=function(){return SM.refresh().catch(function(e){console.error(e)})};

SM.loadSaved=function(){
  if(!U)return Promise.resolve();
  /* saved accounts (newest first, when the saved_at column exists) */
  var items=sb.from("saved_items").select("item_key,saved_at").eq("user_id",U.id).then(function(r){
    if(r.error)return sb.from("saved_items").select("item_key").eq("user_id",U.id);return r});
  /* the person's own lists and what is inside them (stay empty until supabase/saved-lists.sql is run) */
  var lists=sb.from("saved_lists").select("id,name,created_at").eq("user_id",U.id).order("created_at",{ascending:true}).then(function(r){return r.data||[]},function(){return[]});
  var inside=sb.from("saved_list_items").select("list_id,item_key").eq("user_id",U.id).then(function(r){return r.data||[]},function(){return[]});
  return Promise.all([items,lists,inside]).then(function(a){
    var rows=(a[0].data||[]).slice().sort(function(x,y){return String(y.saved_at||"").localeCompare(String(x.saved_at||""))});
    SV.length=0;SVT={};rows.forEach(function(x){SV.push(x.item_key);SVT[x.item_key]=x.saved_at||""});
    SVL=a[1].map(function(l){return{id:l.id,name:l.name,items:a[2].filter(function(i){return i.list_id===l.id}).map(function(i){return i.item_key})}});
    updSc();
  });
};

/* Upload one image. Returns the path inside the bucket. */
SM.upload=function(bucket,file){
  if(!file||!/^image\//.test(file.type))return Promise.reject(new Error("Please choose image files only."));
  if(file.size>8*1024*1024)return Promise.reject(new Error("Each image must be under 8 MB."));
  var ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,5)||"jpg";
  var path=U.id+"/"+Date.now()+"-"+Math.random().toString(36).slice(2,8)+"."+ext;
  return sb.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false}).then(function(r){
    if(r.error)throw r.error;return path});
};

SM.submitSeller=function(d){
  var up=function(f){return f?SM.upload("kyc",f):Promise.resolve(null)};
  return Promise.all([up(d.front),up(d.back),up(d.selfie),up(d.avatar)]).then(function(p){
    return sb.rpc("submit_seller_application",{p_full_name:d.name,p_display_name:d.display,p_country:d.country,p_city:d.city,p_bio:d.bio,p_phone:d.phone,p_platforms:d.platforms,p_niche:d.niche,p_experience:d.exp,p_count:d.count,p_source:d.source,p_id_type:d.idType,p_id_number:d.idNumber,p_front:p[0],p_back:p[1],p_selfie:p[2],p_avatar:p[3]});
  }).then(function(r){if(r.error)throw r.error});
};

SM.createListing=function(d){
  return Promise.all([].map.call(d.shots,function(f){return SM.upload("listing-shots",f)})).then(function(paths){
    var urls=paths.map(function(p){return sb.storage.from("listing-shots").getPublicUrl(p).data.publicUrl});
    var row={seller_id:U.id,platform:d.platform,niche:d.niche,title:d.title,description:d.description,
      followers:d.followers,income:d.income,price:d.price,account_link:d.link,shots:urls};
    var full=Object.assign({},row,d.audience?{audience:d.audience}:{},(d.tags&&d.tags.length)?{tags:d.tags}:{});
    var ins=function(x){return sb.from("listings").insert(x)};
    return ins(full).then(function(r){
      /* audience / tags columns come from supabase/audience-and-views.sql and supabase/listing-categories.sql; until then save without them */
      if(r.error&&/audience|tags/i.test(r.error.message||""))return ins(row);
      return r});
  }).then(function(r){if(r.error)throw r.error});
};

SM.listings=function(){
  return sb.from("public_listings").select("*").order("created_at",{ascending:false}).then(function(r){return r.data||[]},function(){return[]});
};

SM.msg=function(e){return (e&&e.message)?e.message:"Something went wrong. Please try again."};

sb.auth.onAuthStateChange(function(ev){
  if(ev==="PASSWORD_RECOVERY"){setTimeout(function(){
    var p=prompt("Enter your new password (at least 8 characters)");
    if(p&&p.length>=8)sb.auth.updateUser({password:p}).then(function(r){alert(r.error?r.error.message:"Password changed.")});
  },400)}
});
