/* One responsive coordinate system drives buildings, roads, guidance and travel. */
const Village = (() => {
  const map = document.querySelector('.world-map');
  const desktop = {about:[18,24],education:[72,21],projects:[32,48],experience:[78,46],contact:[76,71],activities:[32,79]};
  const phone = {about:[26,17],education:[74,30],projects:[26,43],experience:[74,56],contact:[73,70],activities:[50,83]};
  const keys = Object.keys(desktop);
  let points = {}, branches = {}, spine = 0, size = '';
  const cubic = (a,b) => [a,[a[0],(a[1]+b[1])/2],[b[0],(a[1]+b[1])/2],b];
  const reverse = segment => [...segment].reverse();
  const path = segments => segments.length ? `M ${segments[0][0].join(' ')} ` + segments.map(s=>`C ${s.slice(1).map(p=>p.join(' ')).join(' ')}`).join(' ') : '';
  function center(k){return points[k];}
  function anchor(k){return k?branches[k][3]:[spine,map.clientHeight*.4];}
  function route(from,to){
    const start=from?branches[from][0]:anchor(null),end=branches[to][0];
    return [...(from?[reverse(branches[from])]:[]),cubic(start,end),branches[to]];
  }
  function layout(){
    const w=map.clientWidth,h=map.clientHeight,mobile=window.innerWidth<=760,next=`${w}:${h}`;
    if(!w||!h||size===next)return;
    size=next;spine=w*.5;
    const coords=mobile?phone:desktop;
    points=Object.fromEntries(keys.map(k=>[k,[w*coords[k][0]/100,h*coords[k][1]/100]]));
    branches=Object.fromEntries(keys.map(k=>{
      const [x,y]=points[k];
      if(k==='activities')return [k,[[spine,y-140],[x+145,y-130],[x+145,y+87],[x,y+87]]];
      const end=[x,y+128],start=[spine,y+94];
      return [k,[start,[spine,end[1]],[x+(spine-x)*.45,end[1]],end]];
    }));
    const scene=document.querySelector('#village-scene');scene.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const roadSegments=[cubic([spine,h*.18],[spine,Math.max(...keys.map(k=>branches[k][0][1]))]),...Object.values(branches)];
    const roads=roadSegments.map(s=>path([s])).join(' ');
    document.querySelector('#village-roads').innerHTML=`<path class="road-edge" d="${roads}"/><path class="road-bed" d="${roads}"/><path class="road-center" d="${roads}"/>`;
    // Reuse the original village's tree and building artwork at an undistorted scale.
    const trees=mobile?[[.05,.1],[.93,.1],[.07,.31],[.94,.42],[.06,.57],[.95,.68],[.08,.78],[.94,.94]]:[[.07,.2],[.12,.13],[.36,.16],[.59,.12],[.91,.22],[.94,.4],[.07,.43],[.1,.68],[.57,.71],[.92,.72],[.63,.85]];
    document.querySelector('#village-trees').innerHTML=trees.map(([x,y],i)=>`<use href="#tree" transform="translate(${w*x} ${h*y}) scale(${mobile?.55:.85+(i%3)*.1})"/>`).join('');
    const scale=mobile?.57:Math.min(.72,w/1550);
    document.querySelector('#village-landmarks').innerHTML=keys.filter(k=>k!=='activities').map(k=>`<g id="building-${k}" class="landmark" transform="translate(${points[k].join(' ')}) scale(${scale})"><use href="#art-${k}"/></g>`).join('')+`<use href="#art-fountain" transform="translate(${w*.5} ${h*(mobile?.095:.19)}) scale(${mobile?.43:.65})"/><g id="building-activities" class="landmark camp-clearing" transform="translate(${points.activities.join(' ')})"><ellipse rx="145" ry="96" fill="#a9b887" opacity=".7"/><ellipse rx="135" ry="87" fill="#dbd1a8" stroke="#c1bf95" stroke-width="3"/><ellipse cy="16" rx="41" ry="22" fill="#8a8267" stroke="#b9b59a" stroke-width="9"/><image href="assets/log.svg" x="-131" y="24" width="66" height="42" transform="rotate(25 -98 45)"/><image href="assets/log.svg" x="66" y="24" width="66" height="42" transform="rotate(-25 98 45)"/><image href="assets/log.svg" x="-34" y="-90" width="68" height="36"/><image href="assets/campfire.svg" x="-44" y="-52" width="88" height="88"/></g>`;
    keys.forEach(k=>{const button=document.querySelector(`[data-section="${k}"]`),[x,y]=points[k];button.style.left=x+'px';button.style.top=(y+(k==='activities'?142:21))+'px';});
  }
  // Sample the actual SVG route by length for constant-speed movement.
  function travelFrames(segments){
    const el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',path(segments));
    const length=el.getTotalLength(),end=segments.at(-1)[3];
    return {duration:Math.min(1700,Math.max(700,length*1.5)),frames:Array.from({length:81},(_,i)=>{const p=el.getPointAtLength(length*i/80);return {transform:`translate(${p.x-end[0]}px,${p.y-end[1]}px)`,offset:i/80};})};
  }
  return {layout,center,anchor,route,path,travelFrames};
})();
