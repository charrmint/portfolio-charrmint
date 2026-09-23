import { readFile, readdir, mkdir, writeFile, cp, rm, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const COLLECTIONS = {about:'about', education:'education', experience:'experience', projects:'portfolio', activities:'activities', contact:'contact'};
const fail = (file, message) => { throw new Error(`${file}: ${message}`); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function json(file){try{return JSON.parse(await readFile(file,'utf8'));}catch(e){fail(file,`cannot read JSON (${e.message})`);}}
function string(value,file,key,required=false){if(value===undefined&&!required)return;if(typeof value!=='string'||(required&&!value.trim()))fail(file,`${key} must be ${required?'a nonempty':'a'} string`);}
function array(value,file,key){if(value!==undefined&&!Array.isArray(value))fail(file,`${key} must be an array`);}
export function safeURL(value){return typeof value==='string'&&value.length>0&&!/[\u0000-\u0020\u007f\\]/.test(value)&&!value.startsWith('//')&&(/^(https?:|mailto:|tel:)/i.test(value)||(!/^[^/]*:/.test(value)&&!value.split('/').includes('..')));}
function validate(item,file){
 if(!item||typeof item!=='object'||Array.isArray(item))fail(file,'entry must be an object');
 string(item.title,file,'title',true);
 for(const key of ['summary','subtitle','period','body','bodyFile'])string(item[key],file,key);
 for(const key of ['draft','placeholder'])if(item[key]!==undefined&&typeof item[key]!=='boolean')fail(file,`${key} must be true or false`);
 if(item.order!==undefined&&(!Number.isFinite(item.order)))fail(file,'order must be a number');
 for(const key of ['tags','sections','links'])array(item[key],file,key);
 (item.tags||[]).forEach(t=>string(t,file,'tag',true));
 (item.sections||[]).forEach(s=>{if(!s||typeof s!=='object')fail(file,'section must be an object');string(s.title,file,'section title',true);string(s.body,file,'section body',true);});
 (item.links||[]).forEach(l=>{if(!l||typeof l!=='object')fail(file,'link must be an object');string(l.label,file,'link label',true);if(!safeURL(l.url))fail(file,'link URL must use https, http, mailto, tel, or a local path');});
 if(item.image){string(item.image.alt,file,'image alt',true);if(!safeURL(item.image.src)||/^(mailto:|tel:)/i.test(item.image.src))fail(file,'invalid image URL');}
}
async function localFile(root,relative,file){
 const resolved=path.resolve(root,relative);
 if(!resolved.startsWith(root+path.sep))fail(file,'file path must stay inside its content folder');
 const actual=await realpath(resolved).catch(()=>fail(file,`missing file: ${relative}`));
 const actualRoot=await realpath(root);
 if(!actual.startsWith(actualRoot+path.sep))fail(file,'file must not link outside its content folder');
 const info=await stat(resolved).catch(()=>fail(file,`missing file: ${relative}`));
 if(!info.isFile())fail(file,`not a file: ${relative}`);
 return resolved;
}
export async function collectContent(root=ROOT){
 const site=await json(path.join(root,'content/site.json'));
 for(const key of ['name','worldName','description','greeting'])string(site[key],'content/site.json',key,true);
 const sections=await json(path.join(root,'content/sections.json'));
 for(const key of Object.keys(sections))if(!Object.keys(COLLECTIONS).includes(key))fail('content/sections.json',`unknown section: ${key}`);
 for(const key of Object.keys(COLLECTIONS)){if(!sections[key])fail('content/sections.json',`missing ${key}`);string(sections[key].title,'content/sections.json',`${key}.title`,true);string(sections[key].intro,'content/sections.json',`${key}.intro`);}
 const collections={};
 for(const [key,folder] of Object.entries(COLLECTIONS)){
  const dir=path.join(root,'content',folder);let files=[];
  try{files=(await readdir(dir)).filter(f=>f.endsWith('.json')).sort();}catch(e){if(e.code!=='ENOENT')throw e;}
  const entries=[];
  for(const file of files){
   const full=path.join(dir,file),item=await json(full);validate(item,full);
   if(item.draft)continue;
   if(item.bodyFile)item.body=await readFile(await localFile(dir,item.bodyFile,full),'utf8');
   entries.push({...item,id:`${key}-${file.slice(0,-5)}`});
  }
  collections[key]=entries.sort((a,b)=>(a.order??100)-(b.order??100)||a.id.localeCompare(b.id));
 }
 const resumeDir=path.join(root,'content/resume'),config=await json(path.join(resumeDir,'config.json'));
 string(config.title,'resume/config.json','title',true);string(config.pdf,'resume/config.json','pdf');
 if(typeof config.enabled!=='boolean')fail('resume/config.json','enabled must be true or false');
 const body=await readFile(path.join(resumeDir,'resume.md'),'utf8').catch(e=>{if(e.code==='ENOENT')return '';throw e;});
 const resume={title:config.title,body:config.enabled?body:'',pdf:'',enabled:config.enabled&&!!(body.trim()||config.pdf)};
 let resumeFile=null;
 if(config.enabled&&config.pdf){if(!config.pdf.toLowerCase().endsWith('.pdf'))fail('resume/config.json','pdf must name a .pdf file');resumeFile=await localFile(resumeDir,config.pdf,'resume/config.json');resume.pdf='resume/resume.pdf';}
 return {data:{site,sections,collections,resume},resumeFile};
}
export async function build(root=ROOT){
 const {data,resumeFile}=await collectContent(root); // Validate before replacing the previous build.
 const dist=path.join(root,'dist');await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
 for(const file of ['app.js','content-renderer.js','village.js','styles.css'])await cp(path.join(root,file),path.join(dist,file));
 await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
 // Only this explicitly public folder is copied. Source content and drafts stay out of the deploy.
 const publicDir=path.join(root,'public');
 for(const entry of await readdir(publicDir,{withFileTypes:true}).catch(()=>[])){
  if(entry.name.startsWith('.'))continue;
  if(['assets','resume','index.html','app.js','content-renderer.js','content-data.js','village.js','styles.css'].includes(entry.name))fail('public',`${entry.name} is reserved`);
  await cp(path.join(publicDir,entry.name),path.join(dist,entry.name),{recursive:true,filter:src=>!path.basename(src).startsWith('.')});
 }
 if(resumeFile){await mkdir(path.join(dist,'resume'),{recursive:true});await cp(resumeFile,path.join(dist,'resume/resume.pdf'));}
 await writeFile(path.join(dist,'content-data.js'),`/* Generated by npm run build. Edit content/ instead. */\nwindow.MINTVALE_CONTENT = ${JSON.stringify(data).replace(/</g,'\\u003c')};\n`);
 let html=await readFile(path.join(root,'index.html'),'utf8');
 html=html.replace(/<title>.*?<\/title>/,'<title>Charrmint’s Portfolio</title>');
 html=html.replace('</head>',`<meta name="description" content="${esc(data.site.description)}"></head>`);
 await writeFile(path.join(dist,'index.html'),html);
 return data;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const data=await build();console.log(`Built dist/: ${Object.values(data.collections).reduce((n,x)=>n+x.length,0)} entries; résumé ${data.resume.enabled?'enabled':'empty/disabled'}.`);}catch(e){console.error(e.message);process.exitCode=1;}
}
