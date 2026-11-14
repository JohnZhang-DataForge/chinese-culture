const API="/api/admin/v1";
const MANIFESTS=[
  "/admin/tools/draft-import-manifest-1.json",
  "/admin/tools/draft-import-manifest-2.json"
];
const LOCALES=["en","zh-CN","es"];
const $=(id)=>document.getElementById(id);
const state={session:null,concepts:[],items:[],mapping:[],ready:false,running:false};
const log=(message)=>{const node=$("log");node.textContent+=(node.textContent?"\n":"")+message;node.scrollTop=node.scrollHeight;};
const setStatus=(id,message,kind="")=>{const node=$(id);node.textContent=message;node.className="status"+(kind?" "+kind:"");};
const canonical=(value)=>JSON.stringify(value??null,Object.keys(value??{}).sort());
const same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
function payloadFor(concept,variant){
  return {
    locale:variant.locale,
    collection:concept.collection,
    slug:variant.slug,
    title:variant.title,
    description:variant.description,
    category:variant.category,
    featured:false,
    readingMinutes:variant.readingMinutes||5,
    sources:variant.sources||[],
    tags:[],
    media:[],
    bodyMarkdown:variant.bodyMarkdown
  };
}
async function request(path,{method="GET",body}={}){
  const headers={Accept:"application/json"};
  const options={method,credentials:"include",headers};
  if(body!==undefined){
    headers["Content-Type"]="application/json";
    headers["X-CSRF-Token"]=state.session.csrfToken;
    options.body=JSON.stringify(body);
  }
  const response=await fetch(API+path,options);
  const type=response.headers.get("content-type")||"";
  if(response.redirected||!type.includes("application/json")){
    throw new Error("Admin API did not return JSON. Sign in through Cloudflare Access at /admin/ and reload this tool.");
  }
  const data=await response.json();
  if(!response.ok)throw new Error((data.detail||data.title||data.message||"Admin API request failed")+" (HTTP "+response.status+", "+(data.code||"API_ERROR")+")");
  return data;
}
async function loadAllContent(){
  const first=await request("/content?page=1&pageSize=100");
  const items=Array.isArray(first.items)?first.items:[];
  const pages=Math.ceil(Number(first.total||items.length)/100);
  for(let page=2;page<=pages;page++){
    const next=await request("/content?page="+page+"&pageSize=100");
    items.push(...(next.items||[]));
  }
  return items;
}
function validateManifest(manifests){
  const concepts=manifests.flatMap(x=>x.concepts||[]);
  const ids=new Set(),slugs=new Set();
  if(manifests.length!==2||manifests.some(x=>x.manifestVersion!=="1.0"||x.importMode!=="create-draft-only"))throw new Error("Draft manifest version or mode is not approved.");
  if(concepts.length!==10)throw new Error("Expected exactly 10 conceptual articles; found "+concepts.length+".");
  for(const concept of concepts){
    if(!concept.batchId||ids.has(concept.batchId))throw new Error("Duplicate or missing source batch ID.");
    ids.add(concept.batchId);
    if(!["culture","festivals","books"].includes(concept.collection))throw new Error("Unsupported collection: "+concept.collection);
    if(!Array.isArray(concept.variants)||concept.variants.length!==3)throw new Error("Every article must have exactly three locale variants.");
    if(!same(concept.variants.map(v=>v.locale).sort(),[...LOCALES].sort()))throw new Error("Locale coverage is incomplete for "+concept.batchId+".");
    for(const v of concept.variants){
      if(!v.slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug))throw new Error("Invalid slug: "+v.slug);
      if(!v.title||!v.description||!v.category||!v.bodyMarkdown||v.featured!==false)throw new Error("Required draft fields missing for "+v.slug+".");
      if(!Array.isArray(v.sources)||!v.sources.length||v.sources.some(s=>!s.title||!/^https:\/\//.test(s.url)))throw new Error("Missing or invalid source metadata for "+v.slug+".");
      if(v.bodyMarkdown.length>200000)throw new Error("Article body exceeds CMS limit: "+v.slug+".");
      const slugKey=concept.collection+"|"+v.locale+"|"+v.slug;
      if(slugs.has(slugKey))throw new Error("Duplicate slug in import manifest: "+slugKey);
      slugs.add(slugKey);
    }
  }
  return concepts.map(c=>({...c,variants:[...c.variants].sort((a,b)=>LOCALES.indexOf(a.locale)-LOCALES.indexOf(b.locale))}));
}
function findExisting(concept,items){
  return concept.variants.map(v=>({variant:v,item:items.find(x=>x.collection===concept.collection&&x.locale===v.locale&&x.slug===v.slug)||null}));
}
function renderRows(plans){
  $("concept-rows").replaceChildren();
  for(const p of plans){
    const row=document.createElement("tr");
    const title=document.createElement("td");title.textContent=p.concept.variants.find(v=>v.locale==="en").title;
    const collection=document.createElement("td");collection.textContent=p.concept.collection;
    const locales=document.createElement("td");locales.textContent="EN · 中文 · ES";
    const status=document.createElement("td");status.textContent=p.state;
    row.append(title,collection,locales,status);$("concept-rows").append(row);
  }
}
async function verifyVariant(contentId,concept,variant){
  const actual=await request("/content/"+encodeURIComponent(contentId)+"?locale="+encodeURIComponent(variant.locale));
  const expected=payloadFor(concept,variant);
  for(const key of ["locale","collection","slug","title","description","category","featured","readingMinutes","bodyMarkdown"]){
    if(actual[key]!==expected[key])throw new Error("Read-back mismatch for "+variant.slug+" field "+key+". No existing data was overwritten.");
  }
  if(!same(actual.sources||[],expected.sources))throw new Error("Read-back source metadata mismatch for "+variant.slug+".");
  if(actual.status!=="draft")throw new Error("Safety stop: "+variant.slug+" is not a D1 draft.");
  return actual;
}
async function inspectExisting(concept,items){
  const matches=findExisting(concept,items);
  const found=matches.filter(x=>x.item);
  if(!found.length)return {matches,contentId:null,state:"New — 3 variants to create"};
  const ids=[...new Set(found.map(x=>x.item.contentId))];
  if(ids.length!==1)throw new Error("Existing locale slugs for "+concept.batchId+" belong to different content IDs. Manual review required.");
  const contentId=ids[0];
  for(const {variant,item} of found){
    if(item.status!=="draft")throw new Error("Existing "+variant.slug+" is not a draft. Import stopped without modifying it.");
    await verifyVariant(contentId,concept,variant);
  }
  const missing=matches.filter(x=>!x.item).length;
  return {matches,contentId,state:missing?("Partial — "+found.length+"/3 already present"): "Already imported — exact match"};
}
async function preflight(){
  const [session,manifests]=await Promise.all([
    request("/session"),
    Promise.all(MANIFESTS.map(async url=>{
      const r=await fetch(url,{credentials:"include",headers:{Accept:"application/json"}});
      if(!r.ok)throw new Error("Could not load protected draft manifest: "+url+" (HTTP "+r.status+").");
      return r.json();
    }))
  ]);
  if(session.role!=="admin"||!session.csrfToken||session.repository!=="JohnZhang-DataForge/chinese-culture")throw new Error("A verified administrator session for this repository is required.");
  state.session=session;
  state.concepts=validateManifest(manifests);
  state.items=await loadAllContent();
  const plans=[];
  for(const concept of state.concepts){
    const existing=await inspectExisting(concept,state.items);
    plans.push({concept,...existing});
  }
  $("concept-count").textContent=String(state.concepts.length);
  $("variant-count").textContent=String(state.concepts.reduce((n,c)=>n+c.variants.length,0));
  renderRows(plans);
  const newCount=plans.reduce((n,p)=>n+p.matches.filter(x=>!x.item).length,0);
  setStatus("session-status","Authorized Admin session ready. Mutation token remains in this page and is not displayed.","good");
  setStatus("preflight-status",newCount+" locale variants need creation; "+(30-newCount)+" exact variants already exist or can be resumed. No writes have been made.","good");
  $("confirm-drafts").disabled=false;
  $("import-button").disabled=!newCount;
  $("import-button").textContent=newCount?"Import missing draft variants ("+newCount+")":"All 30 variants already exist";
  state.ready=true;
  return plans;
}
async function runImport(){
  if(!state.ready||state.running||!$("confirm-drafts").checked)return;
  if(!window.confirm("Create only missing D1 drafts for these 10 articles? This will not submit, publish, unpublish, upload media or merge anything."))return;
  state.running=true;$("import-button").disabled=true;$("confirm-drafts").disabled=true;
  $("log").textContent="";
  setStatus("import-status","Import running. Each variant will be saved and read back before continuing.","warn");
  try{
    state.items=await loadAllContent();
    for(const concept of state.concepts){
      const plan=await inspectExisting(concept,state.items);
      let contentId=plan.contentId;
      if(!contentId){
        const first=concept.variants.find(v=>v.locale==="en");
        const created=await request("/content",{method:"POST",body:payloadFor(concept,first)});
        contentId=created.contentId;
        if(!contentId||created.locale!=="en")throw new Error("Create-content response did not contain the expected English contentId.");
        log("CREATED "+first.slug+" → "+contentId);
        await verifyVariant(contentId,concept,first);
        state.items.push(created);
      }
      for(const variant of concept.variants){
        const existing=state.items.find(x=>x.contentId===contentId&&x.locale===variant.locale);
        if(existing){await verifyVariant(contentId,concept,variant);continue;}
        const collision=state.items.find(x=>x.collection===concept.collection&&x.locale===variant.locale&&x.slug===variant.slug);
        if(collision)throw new Error("Slug collision for "+variant.slug+" belongs to a different D1 contentId.");
        const created=await request("/content/"+encodeURIComponent(contentId)+"/translations",{method:"POST",body:payloadFor(concept,variant)});
        if(created.contentId!==contentId||created.locale!==variant.locale)throw new Error("Translation response identity mismatch for "+variant.slug+".");
        await verifyVariant(contentId,concept,variant);
        state.items.push(created);
        log("CREATED "+variant.locale+" / "+variant.slug+" → revision "+created.revision);
      }
      for(const variant of concept.variants)await verifyVariant(contentId,concept,variant);
      state.mapping.push({batchId:concept.batchId,contentId,collection:concept.collection,variants:concept.variants.map(v=>({locale:v.locale,slug:v.slug}))});
      log("VERIFIED 3/3 draft variants — "+concept.variants.find(v=>v.locale==="en").title);
    }
    const createdVariants=state.mapping.length*3;
    setStatus("import-status","Completed. "+state.mapping.length+" conceptual items and "+createdVariants+" locale variants are present as D1 drafts; all were read back successfully.","good");
    $("copy-button").disabled=false;
    $("import-button").textContent="Import complete";
    log("COMPLETE — all ten concepts have three verified D1 draft variants.");
    log("Copy the D1 contentId mapping and reconcile the editorial source frontmatter before any publication review.");
  }catch(error){
    setStatus("import-status","Stopped safely: "+error.message+" Any earlier successful creates remain drafts and can be resumed after resolving the issue.","bad");
    log("STOPPED: "+error.message);
    $("confirm-drafts").disabled=false;
    $("import-button").disabled=false;
  }finally{
    state.running=false;
  }
}
$("import-button").addEventListener("click",runImport);
$("copy-button").addEventListener("click",async()=>{
  const text=JSON.stringify(state.mapping,null,2);
  try{await navigator.clipboard.writeText(text);setStatus("import-status","D1 contentId mapping copied to clipboard.","good");}
  catch{setStatus("import-status","Clipboard access was blocked. The mapping is available in the browser console as JSON.","warn");console.log("D1 contentId mapping",state.mapping);}
});
$("confirm-drafts").addEventListener("change",e=>{$("import-button").disabled=!state.ready||state.running||!e.target.checked||$("import-button").textContent==="All 30 variants already exist";});
(async()=>{
  try{await preflight();}
  catch(error){
    setStatus("session-status",error.message,"bad");
    setStatus("preflight-status","Preflight failed. No production writes were made.","bad");
    $("concept-rows").innerHTML='<tr><td colspan="4">Preflight failed — see status above.</td></tr>';
    log("PREFLIGHT FAILED: "+error.message);
  }
})();
