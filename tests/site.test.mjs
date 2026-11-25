import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {join,dirname,resolve} from 'node:path';
import {ingredients,walmart} from '../content/ingredients.mjs';
import {recipes,weeks} from '../content/recipes.mjs';
import {after} from 'node:test';
const out=mkdtempSync(join(tmpdir(),'fieldbook-qa-'));
const get=p=>readFileSync(join(out,p),'utf8');
execFileSync(process.execPath,['build.mjs',out]);
after(()=>rmSync(out,{recursive:true,force:true}));
test('Unique slugs and linked valid ingredients',()=>{
 const ids=new Set(recipes.map(r=>r.id));
 assert.equal(ids.size,recipes.length);
 assert.equal(new Set(weeks.map(w=>w.id)).size,weeks.length);
 for(const r of recipes){
  assert.ok(r.steps.length&&r.items.length&&r.serves>0&&r.time>0);
  for(const [key,qty] of r.items){assert.ok(qty&&ingredients[key]);assert.equal(new URL(walmart(ingredients[key])).hostname,'www.walmart.com');}
  if(r.from){assert.ok(ids.has(r.from));assert.notEqual(r.from,r.id);}
 }
});
test('Every issue references recipes, with one linked grocery row per distinct ingredient',()=>{
 for(const w of weeks){
  const selected=[...w.days,...w.extras].map(id=>recipes.find(r=>r.id===id));
  assert.ok(selected.every(Boolean));
  const keys=new Set([...selected.flatMap(r=>r.items.map(([key])=>key)),...(w.bench??[])]);
  const page=get('weeks/'+w.id+'/groceries/index.html');
  const actual=[...page.matchAll(/data-item="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(actual.length,keys.size);
  assert.deepEqual(new Set(actual),keys);
  assert.equal([...page.matchAll(/https:\/\/www\.walmart\.com\/(?:ip\/|search\?q=)/g)].length,keys.size);
  assert.ok(page.includes('Open Walmart Sparky'));
  assert.ok(page.includes('doesn’t access or change your Walmart cart'));
 }
});
test('Every relative link and asset works offline with static HTML',()=>{
 const walk=(d)=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
 const html=walk(out).filter(f=>f.endsWith('.html'));
 assert.equal(html.length,4+2*weeks.length+recipes.length);
 for(const f of html){
  const page=readFileSync(f,'utf8');
  assert.equal([...page.matchAll(/<h1(?: |>)/g)].length,1);
  for(const m of page.matchAll(/(?:href|src)="([^"]+)"/g)){
   const u=m[1];
   if(u.startsWith('https://')||u.startsWith('#')) continue;
   assert.ok(existsSync(resolve(dirname(f),u,u.endsWith('/')?'index.html':'')),f+': '+u);
  }
 }
});
