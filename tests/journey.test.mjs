import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Exercise the journey's real reveal rules independently of browser rendering.
test('post office unlocks only after all five completed visits, even in free mode',async()=>{
 const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
 const rules=source.slice(source.indexOf('function contactUnlocked()'),source.indexOf('function nextStop()'));
 const storyKeys=['about','education','projects','experience','activities'];
 const context={storyKeys,completed:new Set(),encountered:new Set(['contact']),free:false};
 vm.createContext(context);vm.runInContext(rules,context);
 assert.equal(vm.runInContext("revealed('contact')",context),false);
 context.free=true;
 assert.equal(vm.runInContext("revealed('education')",context),true);
 assert.equal(vm.runInContext("revealed('contact')",context),false);
 for(const key of storyKeys.slice(0,-1))context.completed.add(key);
 assert.equal(vm.runInContext("revealed('contact')",context),false);
 context.completed.add('activities');
 assert.equal(vm.runInContext("revealed('contact')",context),true);
});

test('all story locations are accessible without following the suggested route',async()=>{
 const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
 const rules=source.slice(source.indexOf('function contactUnlocked()'),source.indexOf('function nextStop()'));
 const context={storyKeys:['about','education','projects','experience','activities'],completed:new Set(),free:false};
 vm.createContext(context);vm.runInContext(rules,context);
 for(const key of context.storyKeys)assert.equal(vm.runInContext(`revealed('${key}')`,context),true);
 assert.equal(vm.runInContext("revealed('contact')",context),false);
});

test('class routes cover every story once and skip completed detours when classes change',async()=>{
 const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
 const routes=source.slice(source.indexOf('const classRoutes='),source.indexOf('const levelRemarks='));
 const next=source.slice(source.indexOf('function nextStop()'),source.indexOf('function setClass'));
 const context={completed:new Set(),chosenClass:'explorer'};
 vm.createContext(context);vm.runInContext(routes+next,context);
 const expected={explorer:['about','education','experience','projects','activities'],engineer:['about','experience','projects','education','activities'],developer:['about','projects','experience','education','activities']};
 for(const [key,route] of Object.entries(expected)){
  context.chosenClass=key;context.completed.clear();
  assert.equal(new Set(route).size,5);
  for(const step of route){assert.equal(vm.runInContext('nextStop()',context),step);context.completed.add(step);}
  assert.equal(vm.runInContext('nextStop()',context),null);
 }
 context.completed=new Set(['projects','about']);context.chosenClass='explorer';
 assert.equal(vm.runInContext('nextStop()',context),'education');
 context.chosenClass='developer';
 assert.equal(vm.runInContext('nextStop()',context),'experience');
 assert.equal(context.completed.size,2);
});

test('restarting clears progress and rewards and opens customization without a reload',async()=>{
 const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
 const fn=source.slice(source.indexOf('function restartAdventure()'),source.indexOf("$$('[data-restart]')"));
 const nodes=new Map();
 const context={completed:new Set(['about','education','projects','experience','activities']),encountered:new Set(['about','contact']),free:true,currentPlace:'contact',rollTarget:'projects',atlasSeen:true,celebrationPending:true,rewardTimer:1,rewardRemaining:12,rewardStarted:99,traveler:'Previous visitor',newAdventure:false,location:{hash:'world'},cancelTravel(){},clearTimeout(){},document:{documentElement:{style:{setProperty(){}}}},$:id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,textContent:'Old reward'});return nodes.get(id);},$$:()=>[],update(){},openCharacter(){context.customizerOpened=true;},announce(){}};
 vm.createContext(context);vm.runInContext(fn+'restartAdventure();',context);
 assert.equal(context.completed.size,0);assert.equal(context.encountered.size,0);
 for(const key of ['free','atlasSeen','celebrationPending'])assert.equal(context[key],false);
 for(const key of ['currentPlace','rollTarget','rewardTimer'])assert.equal(context[key],null);
 assert.equal(context.location.hash,'login');assert.equal(context.newAdventure,true);assert.equal(context.customizerOpened,true);
 assert.equal(nodes.get('#reward').hidden,true);assert.equal(nodes.get('#reward-title').textContent,'');
});
