/* Data-only content; no personal copy belongs in app.js. */
(function (root) {
  const escape = value => String(value??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = value => typeof value==='string'&&value.length>0&&!/[\u0000-\u0020\u007f\\]/.test(value)&&!value.startsWith('//')&&(/^(https?:|mailto:|tel:)/i.test(value)||(!/^[^/]*:/.test(value)&&!value.split('/').includes('..')));
  function inline(text){
    const pattern=/\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
    let result='',last=0;
    for(const match of text.matchAll(pattern)){
      result+=escape(text.slice(last,match.index));
      result+=match[1]?(safeURL(match[2])?`<a href="${escape(match[2])}">${escape(match[1])}</a>`:escape(match[1])):match[3]?`<strong>${escape(match[3])}</strong>`:`<code>${escape(match[4])}</code>`;
      last=match.index+match[0].length;
    }
    return result+escape(text.slice(last));
  }
  function markdown(text=''){
    let out='',paragraph=[],list=null;
    const flush=()=>{if(paragraph.length){out+=`<p>${inline(paragraph.join(' '))}</p>`;paragraph=[];}};
    const close=()=>{if(list){out+=`</${list}>`;list=null;}};
    for(const line of String(text).replace(/\r/g,'').split('\n')){
      const heading=line.match(/^(#{1,6})\s+(.+)/),bullet=line.match(/^\s*(?:[-*+] |\d+\. )(.+)/);
      if(!line.trim()){flush();close();continue;}
      if(heading){flush();close();const level=Math.min(heading[1].length+1,6);out+=`<h${level}>${inline(heading[2])}</h${level}>`;}
      else if(bullet){flush();const type=/^\s*\d+\./.test(line)?'ol':'ul';if(list!==type){close();list=type;out+=`<${type}>`;}out+=`<li>${inline(bullet[1])}</li>`;}
      else{close();paragraph.push(line.trim());}
    }
    flush();close();return out;
  }
  const links = items => items?.length?`<div class="content-links">${items.map(l=>safeURL(l.url)?`<a class="secondary" href="${escape(l.url)}">${escape(l.label)} ↗</a>`:'').join('')}</div>`:'';
  function detail(item){return `<h3>${escape(item.title)}</h3>${markdown(item.body)}`;}
  function entry(item,atlas=false){
    const project=item.id?.startsWith('projects-');
    const image=item.image&&safeURL(item.image.src)?`<div class="prototype"><img src="${escape(item.image.src)}" alt="${escape(item.image.alt)}" loading="lazy"></div>`:'';
    const meta=item.period?`<span class="content-meta">${escape(item.period)}</span>`:'';
    const overview=`<div class="project-summary">${project?`<div class="project-heading"><h2>${escape(item.title)}</h2>${links(item.links)}</div>`:`<h2>${escape(item.title)}</h2>`}${item.subtitle?`<p class="content-subtitle">${escape(item.subtitle)}</p>`:''}${meta}${item.summary?`<p>${escape(item.summary)}</p>`:''}${item.tags?.length?`<div class="tags">${item.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div>`:''}</div>`;
    const sections=item.sections||[];
    const details=!sections.length?'':atlas?`<div class="atlas-details">${sections.map(s=>`<section>${detail(s)}</section>`).join('')}</div>`:`<div class="inspect-choices" aria-label="Details for ${escape(item.title)}">${sections.map((s,i)=>`<button data-detail-index="${i}" aria-controls="detail-${escape(item.id)}" aria-pressed="${i===0}">${escape(s.title)}</button>`).join('')}</div><div class="inspect-answer" id="detail-${escape(item.id)}" role="region" aria-label="Selected detail for ${escape(item.title)}" aria-live="polite">${detail(sections[0])}</div>`;
    return `<section class="content-entry" data-entry-id="${escape(item.id)}">${item.placeholder?'<span class="sample-note">Sample content · Replace this entry with your own details.</span>':''}${image?`<div class="project-inspection">${image}${overview}</div>`:overview}${item.body?`<div class="content-body">${markdown(item.body)}</div>`:''}${details}${project?'':links(item.links)}</section>`;
  }
  function section(key,atlas=false){
    const entries=root.MINTVALE_CONTENT.collections[key]||[];
    return entries.length?entries.map(item=>entry(item,atlas)).join(''):'<p class="empty-content">Nothing to share here just yet.</p>';
  }
  function bind(container,key){
    const entries=new Map((root.MINTVALE_CONTENT.collections[key]||[]).map(item=>[item.id,item]));
    container.querySelectorAll('[data-entry-id]').forEach(el=>{
      const item=entries.get(el.dataset.entryId);
      el.querySelectorAll('[data-detail-index]').forEach(button=>button.onclick=()=>{
        el.querySelectorAll('[data-detail-index]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
        el.querySelector('.inspect-answer').innerHTML=detail(item.sections[Number(button.dataset.detailIndex)]);
      });
    });
  }
  function resume(){const r=root.MINTVALE_CONTENT.resume;return `${r.pdf?links([{label:'Download résumé (PDF)',url:r.pdf}]):''}<div class="resume-body">${markdown(r.body)}</div>`;}
  const api={escape,safeURL,markdown,entry,section,bind,resume};
  root.ContentRenderer=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
