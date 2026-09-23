import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, ROOT } from './build.mjs';
const dist=path.join(ROOT,'dist'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.md':'text/plain; charset=utf-8'};
await build();
let rebuilding=Promise.resolve();
createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname),file=path.resolve(dist,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(dist+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  if(file===path.join(dist,'index.html')){rebuilding=rebuilding.catch(()=>{}).then(()=>build());await rebuilding;}
  else await rebuilding;
  if(!(await stat(file)).isFile())throw new Error('Not a file');
  const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500,{'Content-Type':'text/plain; charset=utf-8'});res.end(e.message);console.error(e.message);}
}).listen(port,'127.0.0.1',()=>console.log(`Mintvale: http://127.0.0.1:${port}\nEdit content files, then refresh the page to rebuild.`));
