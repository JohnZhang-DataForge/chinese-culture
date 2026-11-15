import test from "node:test";
import assert from "node:assert/strict";
import {isPublishedContent,buildPublicArticleUrls,missingTranslations} from "../src/lib/public-content.mjs";
test("only published Traditional Chinese variants enter public pages",()=>{
 assert.equal(isPublishedContent({data:{status:"published"}}),true);
 assert.equal(isPublishedContent({data:{}}),true);
 assert.equal(isPublishedContent({data:{status:"draft"}}),false);
 assert.equal(isPublishedContent({data:{status:"unpublished"}}),false);
});
test("public article URLs are generated only under /zh-tw/",()=>{
 const urls=buildPublicArticleUrls([{locale:"zh-tw",section:"culture",entries:[{id:"live-story",data:{status:"published"}},{id:"draft-story",data:{status:"draft"}}]}]);
 assert.deepEqual(urls,["/zh-tw/culture/live-story/"]);
});
test("the single authored language has no missing-translation state",()=>assert.deepEqual(missingTranslations(),[]));
