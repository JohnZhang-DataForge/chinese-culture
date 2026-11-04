import test from "node:test";
import assert from "node:assert/strict";
import { filterContent, paginate, parseTags, translationStatus, wordCount } from "../src/lib/admin-ui.mjs";
import {
  ADMIN_API_BASE, AdminApiError, clearAdminCsrfToken, getAdminSession,
  requestAdminApi, requestAdminApiWithMeta, setAdminCsrfToken
} from "../src/lib/admin-api.mjs";

const records = [
  {id:"one",slug:"one",type:"articles",title:{en:"Brush art",zh:"书法"},description:{en:"A guide",zh:"指南"},body:{en:"Text",zh:"正文"},status:"published",tags:["art"],translationLocales:["en","zh-CN"]},
  {id:"two",slug:"two",type:"articles",title:{en:"Festival guide",zh:""},description:{en:"A guide",zh:""},body:{en:"Text",zh:""},status:"draft",tags:["festival"],translationLocales:["en"]},
  {id:"three",slug:"three",type:"books",title:{en:"The Analects",zh:"论语"},description:{en:"A book",zh:"一本书"},body:{en:"Text",zh:"正文"},status:"published",tags:["classic"],translationLocales:["en","zh-CN"]}
];

test("filters content by title, ID, status and translation completeness", () => {
  assert.equal(filterContent(records,{query:"brush"}).length,1);
  assert.equal(filterContent(records,{query:"two"}).length,1);
  assert.equal(filterContent(records,{status:"draft"}).length,1);
  assert.equal(filterContent([{...records[0],status:"mixed",statuses:["published","draft"]}],{status:"published"}).length,1);
  assert.equal(filterContent(records,{language:"complete"}).length,2);
  assert.equal(filterContent(records,{language:"missing-zh"}).length,1);
});

test("pagination clamps page bounds and returns stable summary", () => {
  const page = paginate(records,9,2);
  assert.equal(page.page,2);
  assert.equal(page.pages,2);
  assert.equal(page.start,3);
  assert.equal(page.end,3);
  assert.deepEqual(page.items.map((item)=>item.id),["three"]);
  assert.equal(paginate([],1,10).start,0);
});

test("translation status uses canonical zh-CN locale", () => {
  assert.deepEqual(translationStatus(records[0]),{en:true,zh:true});
  assert.deepEqual(translationStatus(records[1]),{en:true,zh:false});
});

test("tags are trimmed, de-duplicated and empty entries removed", () => {
  assert.deepEqual(parseTags(" art, history, art ,, culture "),["art","history","culture"]);
});

test("word count supports Latin words and Chinese characters", () => {
  assert.equal(wordCount("Brush painting and calligraphy"),4);
  assert.equal(wordCount("中国传统文化"),6);
  assert.equal(wordCount(""),0);
});

test("API transport sends same-origin cookies and CSRF token for writes", async () => {
  setAdminCsrfToken("short-lived-csrf");
  let observed;
  const response = {status:201,ok:true,headers:new Headers({ETag:'"revision-1"'}),text:async()=>JSON.stringify({contentId:"abc"})};
  const payload = await requestAdminApi(ADMIN_API_BASE+"/content",{method:"POST",body:{title:"Test"}},async(path,options)=>{observed={path,options};return response;});
  assert.deepEqual(payload,{contentId:"abc"});
  assert.equal(observed.path,ADMIN_API_BASE+"/content");
  assert.equal(observed.options.credentials,"include");
  assert.equal(observed.options.headers.get("Content-Type"),"application/json");
  assert.equal(observed.options.headers.get("X-CSRF-Token"),"short-lived-csrf");
  assert.equal(observed.options.body,'{"title":"Test"}');
});

test("session bootstrap stores the short-lived CSRF token in memory", async () => {
  clearAdminCsrfToken();
  const response = {status:200,ok:true,headers:new Headers(),text:async()=>JSON.stringify({email:"editor@example.com",role:"editor",csrfToken:"csrf-one"})};
  const session = await getAdminSession(async()=>response);
  assert.equal(session.role,"editor");
  clearAdminCsrfToken();
  await assert.rejects(
    ()=>requestAdminApi(ADMIN_API_BASE+"/content",{method:"POST",body:{}},async()=>({status:201,ok:true,headers:new Headers(),text:async()=>"{}"})),
    (error)=>error instanceof AdminApiError && error.code==="CSRF_SESSION_MISSING"
  );
});

test("GET requests do not send a CSRF token", async () => {
  clearAdminCsrfToken();
  let headers;
  await requestAdminApi(ADMIN_API_BASE+"/content?locale=en",{},async(path,options)=>{headers=options.headers;return {status:200,ok:true,headers:new Headers(),text:async()=>'{"items":[]}'};});
  assert.equal(headers.has("X-CSRF-Token"),false);
});

test("API transport exposes the ETag required for optimistic concurrency", async () => {
  const response = {status:200,ok:true,headers:new Headers({ETag:'"rev-2"'}),text:async()=>'{"title":"Saved"}'};
  const result = await requestAdminApiWithMeta(ADMIN_API_BASE+"/content/abc?locale=en",{},async()=>response);
  assert.equal(result.etag,'"rev-2"');
  assert.deepEqual(result.data,{title:"Saved"});
});

test("API transport distinguishes 401 and 403 and clears expired session token", async () => {
  setAdminCsrfToken("expired");
  await assert.rejects(()=>requestAdminApi(ADMIN_API_BASE+"/session",{},async()=>({status:401,ok:false,headers:new Headers(),text:async()=>''})),(error)=>error instanceof AdminApiError && error.code==="AUTH_REQUIRED");
  await assert.rejects(()=>requestAdminApi(ADMIN_API_BASE+"/session",{},async()=>({status:403,ok:false,headers:new Headers(),text:async()=>''})),(error)=>error instanceof AdminApiError && error.code==="FORBIDDEN");
  await assert.rejects(()=>requestAdminApi(ADMIN_API_BASE+"/content",{method:"POST",body:{}},async()=>({status:201,ok:true,headers:new Headers(),text:async()=>"{}"})),(error)=>error instanceof AdminApiError && error.code==="CSRF_SESSION_MISSING");
});

test("API transport surfaces RFC 9457 problem details and request ID", async () => {
  const problem = {title:"Conflict",detail:"The revision is stale.",status:409,code:"revision_conflict",requestId:"req-123"};
  await assert.rejects(
    ()=>requestAdminApi(ADMIN_API_BASE+"/content/abc?locale=en",{},async()=>({status:409,ok:false,headers:new Headers(),text:async()=>JSON.stringify(problem)})),
    (error)=>error instanceof AdminApiError && error.status===409 && error.message==="The revision is stale." && error.requestId==="req-123"
  );
});

test("API transport rejects paths outside the approved versioned API", async () => {
  await assert.rejects(()=>requestAdminApi("https://api.github.com/repos/example",{},async()=>({})),TypeError);
  await assert.rejects(()=>requestAdminApi("/api/admin/session",{},async()=>({})),TypeError);
});
