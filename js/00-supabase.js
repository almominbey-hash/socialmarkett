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
    setUser({id:user.id,email:p.email||user.email||"",name:p.full_name||"",role:p.role||"member",kyc:(k==="pending"||k==="verified")?k:undefined});
    return SM.loadSaved();
  });
};
SM.refresh=function(){return sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;if(s)return SM.loadUser(s.user)})};
SM.boot=function(){return SM.refresh().catch(function(e){console.error(e)})};

SM.loadSaved=function(){
  if(!U)return Promise.resolve();
  return sb.from("saved_items").select("item_key").eq("user_id",U.id).then(function(r){
    SV.length=0;(r.data||[]).forEach(function(x){SV.push(x.item_key)});updSc();
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

SM.submitKyc=function(d){
  return Promise.all([SM.upload("kyc",d.front),SM.upload("kyc",d.back)]).then(function(p){
    return sb.rpc("submit_verification",{p_full_name:d.name,p_phone:d.phone,p_id_type:d.idType,p_id_number:d.idNumber,p_payout:d.payout,p_front:p[0],p_back:p[1]});
  }).then(function(r){if(r.error)throw r.error});
};

SM.createListing=function(d){
  return Promise.all([].map.call(d.shots,function(f){return SM.upload("listing-shots",f)})).then(function(paths){
    var urls=paths.map(function(p){return sb.storage.from("listing-shots").getPublicUrl(p).data.publicUrl});
    return sb.from("listings").insert({seller_id:U.id,platform:d.platform,niche:d.niche,title:d.title,description:d.description,
      followers:d.followers,income:d.income,price:d.price,account_link:d.link,shots:urls});
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
