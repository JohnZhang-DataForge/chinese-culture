import test from "node:test";
import assert from "node:assert/strict";
import { filterContent, paginate, parseTags, translationStatus, wordCount } from "../src/lib/admin-ui.mjs";
import { requestAdminApi, AdminApiError } from "../src/lib/admin-api.mjs";

const records = [
  {id:"one",slug:"one",type:"articles",title:{en:"Brush art",zh:"书法"},description:{en:"A guide",zh:"指南"},body:{en:"Text",zh:"正文"},status:"published",tags:["art"]},
  {id:"two",slug:"two",type:"articles",title:{en:"Festival guide",zh:""},description:{en:"A guide",zh:""},body:{en:"Text",zh:""},status:"draft",tags:["festival"]},
  {id:"three",slug:"three",type:"books",title:{en:"The Analects",zh:"论语"},description:{en:"A book",zh:"一本书"},body:{en:"Text",zh:"正文"},status:"published",tags:["classic"]}
];

test("filters content by title, ID, status and translation completeness", () => {
  assert.equal(filterContent(records,{query:"brush"}).length,1);
  assert.equal(filterContent(records,{query:"two"}).length,1);
  assert.equal(filterContent(records,{status:"draft"}).length,1);
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

test("translation status requires title, description and body independently", () => {
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

test("admin API transport includes same-origin credentials and JSON headers", async () => {
  let observed;
  const response = {status:200,ok:true,text:async()=>JSON.stringify({ok:true})};
  const payload = await requestAdminApi("/api/admin/example",{method:"POST",body:{title:"Test"}},async (path,options)=>{observed={path,options};return response;});
  assert.deepEqual(payload,{ok:true});
  assert.equal(observed.path,"/api/admin/example");
  assert.equal(observed.options.credentials,"include");
  assert.equal(observed.options.headers.get("Content-Type"),"application/json");
  assert.equal(observed.options.body,'{"title":"Test"}');
});

test("admin API transport distinguishes 401 and 403", async () => {
  await assert.rejects(()=>requestAdminApi("/api/admin/me",{},async()=>({status:401,ok:false})),(error)=>error instanceof AdminApiError && error.code==="AUTH_REQUIRED");
  await assert.rejects(()=>requestAdminApi("/api/admin/me",{},async()=>({status:403,ok:false})),(error)=>error instanceof AdminApiError && error.code==="FORBIDDEN");
});

test("admin API transport rejects non-API paths", async () => {
  await assert.rejects(()=>requestAdminApi("https://api.github.com/repos/example",{},async()=>({})),TypeError);
});
