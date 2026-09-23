import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, writeFile, readFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, collectContent, build, safeURL } from '../scripts/build.mjs';

async function fixture(t){
 const dir=await mkdtemp(path.join(tmpdir(),'mintvale-content-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 // Fixtures must not depend on the owner's changing portfolio or résumé.
 for(const folder of ['about','education','experience','portfolio','activities','contact','resume'])await mkdir(path.join(dir,'content',folder),{recursive:true});
 await put(dir,'site.json',{name:'Test Author',worldName:'Test Village',description:'Test description',greeting:'Hello'});
 await put(dir,'sections.json',Object.fromEntries(['about','education','experience','projects','activities','contact'].map(key=>[key,{title:key,intro:'Test intro'}])));
 await put(dir,'about/introduction.json',{order:1,title:'Introduction'});
 await put(dir,'portfolio/mintvale.json',{order:1,title:'Test project',sections:[{title:'Design',body:'Test detail'}]});
 await put(dir,'resume/config.json',{title:'Résumé',enabled:true,pdf:''});
 await writeFile(path.join(dir,'content/resume/resume.md'),'');
 return dir;
}
async function put(root,file,data){await writeFile(path.join(root,'content',file),JSON.stringify(data));}
async function renderer(data){const window={MINTVALE_CONTENT:data};vm.runInNewContext(await readFile(path.join(ROOT,'content-renderer.js'),'utf8'),{window});return window.ContentRenderer;}

test('discovers arbitrary entry counts, orders them, skips drafts, and handles removals',async t=>{
 const root=await fixture(t);
 await Promise.all(Array.from({length:52},(_,i)=>put(root,`portfolio/project-${i}.json`,{title:`Project ${i}`,order:i+2,sections:[{title:'One',body:'First'},{title:'Two',body:'Second'}]})));
 await put(root,'portfolio/secret.json',{title:'Unpublished',draft:true,body:'DRAFT MUST NOT SHIP'});
 let {data}=await collectContent(root);assert.equal(data.collections.projects.length,53);assert.equal(data.collections.projects[0].id,'projects-mintvale');assert.equal(data.collections.projects.at(-1).title,'Project 51');
 await rm(path.join(root,'content/portfolio'),{recursive:true});
 ({data}=await collectContent(root));assert.deepEqual(data.collections.projects,[]);
 const r=await renderer(data);assert.match(r.section('projects'),/Nothing to share/);
});

test('per-entry detail IDs remain distinct; Atlas exposes every detail',async t=>{
 const root=await fixture(t);await put(root,'portfolio/second.json',{title:'Second project',sections:[{title:'Design',body:'Design body'},{title:'Testing',body:'Testing body'}]});
 const {data}=await collectContent(root),r=await renderer(data),game=r.section('projects'),atlas=r.section('projects',true);
 assert.match(game,/id="detail-projects-mintvale"/);assert.match(game,/id="detail-projects-second"/);
 assert.match(atlas,/Design body/);assert.match(atlas,/Testing body/);assert.doesNotMatch(atlas,/data-detail-index|npc-sprite/);
});

test('résumé auto-enables for pasted text or PDF and can be disabled',async t=>{
 const root=await fixture(t);assert.equal((await collectContent(root)).data.resume.enabled,false);
 await writeFile(path.join(root,'content/resume/resume.md'),'# Your Name\n\n## Experience\n- A real achievement.');
 let result=await collectContent(root);assert.equal(result.data.resume.enabled,true);assert.match((await renderer(result.data)).resume(),/<h2>Your Name/);
 await writeFile(path.join(root,'content/resume/example.pdf'),'%PDF-1.4\nTest fixture');
 await put(root,'resume/config.json',{title:'CV',enabled:true,pdf:'example.pdf'});
 result=await collectContent(root);assert.equal(result.data.resume.pdf,'resume/resume.pdf');assert.ok(result.resumeFile.endsWith('example.pdf'));
 await put(root,'resume/config.json',{title:'CV',enabled:false,pdf:'example.pdf'});
 result=await collectContent(root);assert.equal(result.data.resume.enabled,false);assert.equal(result.data.resume.body,'');assert.equal(result.resumeFile,null);
});

test('loads Markdown body files and reports invalid data with its filename',async t=>{
 const root=await fixture(t);await writeFile(path.join(root,'content/about/story.md'),'## Story\n\nSome **detail**.');
 await put(root,'about/story.json',{title:'Story',bodyFile:'story.md'});assert.match((await collectContent(root)).data.collections.about[1].body,/Some \*\*detail/);
 await put(root,'about/broken.json',{title:'Broken',sections:'not an array'});await assert.rejects(collectContent(root),/broken.json: sections must be an array/);
 await writeFile(path.join(root,'content/about/broken.json'),'{invalid');await assert.rejects(collectContent(root),/broken.json: cannot read JSON/);
});

test('escapes text and Markdown HTML and rejects unsafe URLs',async t=>{
 const {data}=await collectContent(await fixture(t)),r=await renderer(data);
 const html=r.entry({id:'example',title:'<script>alert(1)</script>',summary:'<img onerror="bad">',body:'[bad](javascript:alert)\n\n**Good** and `code`'});
 assert.doesNotMatch(html,/<script>|<img onerror|href="javascript:/);assert.match(html,/&lt;script&gt;/);assert.match(html,/<strong>Good<\/strong>/);
 for(const url of ['javascript:alert(1)','data:text/html,bad','//example.com','\\evil','../private','']){assert.equal(safeURL(url),false);assert.equal(r.safeURL(url),false);}
 assert.equal(safeURL('mailto:hello@example.com'),true);assert.equal(safeURL('images/project.png'),true);
});

test('rejects body-file traversal and missing configured PDF',async t=>{
 const root=await fixture(t);await put(root,'about/outside.json',{title:'Outside',bodyFile:'../../package.json'});await assert.rejects(collectContent(root),/must stay inside/);
 await rm(path.join(root,'content/about/outside.json'));await put(root,'resume/config.json',{title:'Résumé',enabled:true,pdf:'missing.pdf'});await assert.rejects(collectContent(root),/missing file: missing.pdf/);
});

test('build includes only deployable assets, generated content and selected résumé',async t=>{
 const root=await fixture(t);
 for(const file of ['index.html','app.js','styles.css','village.js','content-renderer.js'])await cp(path.join(ROOT,file),path.join(root,file));
 await cp(path.join(ROOT,'assets'),path.join(root,'assets'),{recursive:true});await cp(path.join(ROOT,'public'),path.join(root,'public'),{recursive:true});
 await put(root,'portfolio/draft.json',{title:'Hidden project',draft:true,body:'DRAFT MUST NOT SHIP'});
 await writeFile(path.join(root,'content/resume/test.pdf'),'%PDF-1.4\nTest fixture');await put(root,'resume/config.json',{title:'CV',enabled:true,pdf:'test.pdf'});
 await build(root);const output=await readdir(path.join(root,'dist'));assert.ok(output.includes('content-data.js'));assert.ok(output.includes('resume'));assert.ok(!output.includes('content'));assert.ok(!output.includes('scripts'));
 assert.doesNotMatch(await readFile(path.join(root,'dist/content-data.js'),'utf8'),/DRAFT MUST NOT SHIP/);
 assert.match(await readFile(path.join(root,'dist/index.html'),'utf8'),/name="description"/);
 assert.equal(await readFile(path.join(root,'dist/resume/resume.pdf'),'utf8'),'%PDF-1.4\nTest fixture');
});
