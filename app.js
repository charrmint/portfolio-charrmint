const portfolio = window.MINTVALE_CONTENT;
const content = window.ContentRenderer;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const classes = {
 explorer:{name:'Explorer',subtitle:'Learning & discovery',gear:'notebook',hint:'Follow the learning path: the academy, then the campfire.',tool:'▤'},
 engineer:{name:'Engineer',subtitle:'Mechanical engineering',gear:'caliper',hint:'Start with the workshop. Look for constraints, tradeoffs, and testing.',tool:'⊣'},
 developer:{name:'Developer',subtitle:'Software engineering',gear:'terminal',hint:'Visit the workshop for implementation decisions and a closer look under the hood.',tool:'⌘'}
};
const places = {
 about:{name:'About Me',place:'The cottage',title:'Come in. The kettle’s on.',intro:'A little introduction before the paths begin.',xy:[24,46],mobile:[26,32]},
 education:{name:'Education',place:'The academy',title:'Open a page. Follow an idea.',intro:'Foundations matter most when you put them to work.',xy:[61,32],mobile:[73,25]},
 projects:{name:'Projects',place:'The workshop',title:'A little world, built by hand.',intro:'Inspect Mintvale: an interactive portfolio made with HTML, CSS, JavaScript, and original artwork.',xy:[34,72],mobile:[27,61]},
 experience:{name:'Experience',place:'The guild hall',title:'Good work is a shared quest.',intro:'Choose a commission to see the story behind the work.',xy:[71,50],mobile:[72,51]},
 activities:{name:'Beyond work',place:'The campfire',title:'The side quests matter, too.',intro:'There’s more to a person than a résumé.',xy:[17,79],mobile:[27,82]},
 contact:{name:'Say hello',place:'The post office',title:'The next chapter starts here.',intro:'For a collaboration, a new opportunity, or a shared curiosity.',xy:[67,79],mobile:[73,82]}
};
for(const [key,copy] of Object.entries(portfolio.sections))Object.assign(places[key],copy);
const keys=Object.keys(places), completed=new Set();
let traveler='Wandering visitor', chosenClass='explorer',gear='notebook',free=false,currentPlace=null,travelTimer=null,rewardTimer=null,rollTarget=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hosts={
 about:{name:portfolio.site.name,role:'Your host',color:'#8c6b4f'},
 education:{name:'The Scholar',role:'Academy guide',color:'#687d91'},
 projects:{name:'The Maker',role:'Workshop keeper',color:'#9b6d5d'},
 experience:{name:'The Steward',role:'Guild hall guide',color:'#7b7694'},
 activities:{name:'The Wanderer',role:'Campfire storyteller',color:'#597659'},
 contact:{name:'The Postkeeper',role:'A friendly face at the post office',color:'#927548'}
};
const storyKeys=keys.filter(k=>k!=='contact');
const skills={about:['Find Common Ground','Discover the person behind the work.'],education:['Connect the Dots','See how learning becomes practice.'],projects:['Bring Ideas to Life','Follow an idea through to implementation.'],experience:['Build Together','Understand a contribution to a team.'],activities:['Follow Your Curiosity','Discover what matters beyond work.']};
const flavor={explorer:[['Curiosity','99'],['Preparedness','42'],['Unread tabs','128']],engineer:[['Precision','95'],['Prototype patience','80'],['Safety factor','2']],developer:[['Logic','90'],['Debugging persistence','99'],['Open terminals','12']]};
const equipment={explorer:'Field notebook',engineer:'Caliper',developer:'Pocket terminal'};
const classRoutes={
 explorer:['about','education','experience','projects','activities'],
 engineer:['about','experience','projects','education','activities'],
 developer:['about','projects','experience','education','activities']
};
const levelRemarks={
 explorer:['Every expedition starts by meeting someone.','Another piece of the map makes sense.','There’s a story behind every milestone.','Curiosity has a way of finding the interesting details.','A full journal, and still more to discover.'],
 engineer:['First, understand who’s behind the work.','Good systems start with understanding the process.','Constraints make the design interesting.','Another connection between theory and practice.','Time to put the tools down and join the campfire.'],
 developer:['Getting to know the person behind the commits.','From an idea to something you can run.','The interesting work often happens behind the scenes.','Another foundation for the next thing you build.','Exploration complete. Time for a well-earned break.']
};
let atlasSeen=false,celebrationPending=false,newAdventure=false;
const encountered=new Set();
function announce(s){$('#announcement').textContent=s;}
function level(){return 1+completed.size;}
function title(){return completed.size===5?'Fellow Builder':completed.size>=2?'Curious Traveler':'New Arrival';}
function contactUnlocked(){return storyKeys.every(k=>completed.has(k));}
function revealed(k){return k!=='contact'||contactUnlocked();}
function nextStop(){return classRoutes[chosenClass].find(k=>!completed.has(k))||null;}
function setClass(k){chosenClass=k;gear=classes[k].gear;renderCharacter();$('#dialog-classes [aria-pressed=true]').focus();announce(`${classes[k].name} selected. ${equipment[k]} equipped.`);}
function renderCharacter(){
 $('#dialog-classes').innerHTML=Object.entries(classes).map(([k,c])=>`<button type="button" data-class="${k}" aria-pressed="${k===chosenClass}"><b aria-hidden="true">${c.tool}</b><strong>${c.name}</strong><small>${c.subtitle}</small></button>`).join('');
 $$('[data-class]').forEach(b=>b.onclick=()=>setClass(b.dataset.class));
 $('#class-hint').textContent='Suggested route: '+classRoutes[chosenClass].map(k=>places[k].name).join(' → ')+'. You can visit story locations in any order; changing class keeps your progress.';
 $('#creator-class').textContent=classes[chosenClass].name;
 $('#creator-equipment').textContent=`Equipment: ${equipment[chosenClass]} · assigned by class`;
 $('#creator-level').textContent=`Level ${level()} · ${title()}`;
 $('#flavor-stats').innerHTML=flavor[chosenClass].map(([name,value])=>`<div><span>${name}</span><strong>${value}</strong></div>`).join('');
 $('#earned-skills').innerHTML=completed.size?storyKeys.filter(k=>completed.has(k)).map(k=>`<div class="skill-badge"><span aria-hidden="true">✦</span><div><strong>${skills[k][0]}</strong><p>${skills[k][1]}</p></div></div>`).join(''):'<p>Your first skill awaits at the cottage. Finish a story location to discover one.</p>';
 $$('.avatar').forEach(a=>a.dataset.gear=gear);
 $('.map-player').dataset.gear=gear;
 $('.map-player').setAttribute('aria-label',`${classes[chosenClass].name} carrying ${equipment[chosenClass]}`);
 $('#level-label').textContent=`LV. ${String(level()).padStart(2,'0')} · ${title().toUpperCase()}`;
 $('#player-name').textContent=traveler;$('#entry-name').textContent=traveler;$('#entry-class').textContent=`${classes[chosenClass].name} · ${equipment[chosenClass]}`;
}
function guide(){const n=nextStop(),done=contactUnlocked();
 $('#guide').classList.add('compact');
 $('#world').classList.toggle('has-started',completed.has('about')||free);
 $('#guide-kicker').textContent=done?'ALL FIVE STORIES COMPLETE':free?'FREE EXPLORATION':classes[chosenClass].name.toUpperCase()+' ROUTE';
 $('#guide-title').textContent=done?'The post office is now open.':free?'Choose any story location.':`Next stop: ${places[n].name}.`;
 $('#guide-copy').textContent=done?'All five stories explored.':'Follow the route, or explore in any order.';
 $('#class-route').innerHTML=classRoutes[chosenClass].map(k=>`<span class="route-step${completed.has(k)?' route-complete':''}"${k===n?' aria-current="step"':''}>${completed.has(k)?'✓ ':''}${content.escape(places[k].name)}</span>`).join(' <span aria-hidden="true">→</span> ');
 $('#guide-go').hidden=free&&!done;
 $('#guide-go').textContent=done?'Visit the postkeeper →':'Take me there →';
 $('#guide-go').onclick=()=>travel(done?'contact':n);
 $('#discovery-count').textContent=`Level ${level()} · ${completed.size} / 5 stories discovered`;
}
function update(){
 $('#replay-prompt').hidden=!contactUnlocked();
 $$('.guide-meta [data-restart]').forEach(b=>b.hidden=!contactUnlocked());
 $('#mode-toggle').textContent=free?'Return to guided journey':'Explore freely';
 $('#atlas-badge').textContent=completed.size===5?(atlasSeen?'READY':'NEW'):'LV. 6';$('#atlas-button').classList.toggle('atlas-new',completed.size===5&&!atlasSeen);
 $('#atlas-button').setAttribute('aria-label',completed.size===5?(atlasSeen?'Atlas':'Atlas, newly unlocked'):`Atlas, unlocks at Level 6. ${completed.size} of 5 stories complete`);
 $('#progress').value=completed.size;$('#progress-text').textContent=`${completed.size} / 5`;
 if(!$('#world').hidden)Village.layout();
 const n=nextStop();
 $$('[data-section]').forEach(b=>{const k=b.dataset.section,open=revealed(k),seen=encountered.has(k)||completed.has(k);b.classList.toggle('unrevealed',!seen);b.classList.toggle('visited',completed.has(k));b.classList.toggle('suggested',!free&&k===n);if(k==='contact'&&!open)b.setAttribute('aria-disabled','true');else b.removeAttribute('aria-disabled');b.setAttribute('aria-label',places[k].name+(k===n&&!free?', recommended next stop':'')+(seen?', visited':', not yet visited')+(k==='contact'&&!open?', unlocks after all five story visits':''));b.querySelector('.quest-mark').textContent=completed.has(k)?'✓':k===n&&!free?'':seen?'Visited':k==='contact'&&!open?'Visit all 5 places first':'Unexplored';b.querySelector('.quest-mark').setAttribute('aria-hidden','true');const building=$('#building-'+k);if(building){building.classList.toggle('mist',!seen);building.classList.toggle('restored',completed.has(k));building.classList.remove('destination-glow');}});
 renderCharacter();guide();if(!$('#world').hidden){drawRoutes();renderResidents();}
}
function anchor(k){return Village.anchor(k);}
function drawRoutes(selected=null){
 const svg=$('#route-overlay'),map=$('.world-map');svg.setAttribute('viewBox',`0 0 ${map.clientWidth} ${map.clientHeight}`);
 const n=nextStop(),targets=selected?[selected]:free?[]:n?[n]:[];
 svg.innerHTML=targets.filter(k=>k!==currentPlace).map(k=>{const d=Village.path(Village.route(currentPlace,k));return `<path class="route-shadow" d="${d}"/><path class="gold-route" d="${d}"/>${selected?`<path class="route-spark" pathLength="100" d="${d}"/>`:''}`;}).join('');
}
function renderResidents(){
 const done=completed.size===5,fire=Village.center('activities');
 const seats=[[-100,-3],[-57,-45],[0,-61],[57,-45],[100,-3]];
 $('#village-residents').innerHTML=keys.filter(k=>revealed(k)&&(k!=='contact'||done)).map(k=>{
  const i=storyKeys.indexOf(k);let [x,y]=anchor(k);
  if(done&&k!=='contact'){x=fire[0]+seats[i][0];y=fire[1]+seats[i][1];}
  else if(k==='activities'){x=fire[0]-85;y=fire[1];}
  else if(k==='contact'){const office=Village.center(k);x=office[0]+(innerWidth<=760?-115:100);y=office[1]+(innerWidth<=760?40:128);}
  else{x-=43;y-=5;}
  return `<div class="resident" style="left:${x-26}px;top:${y-48}px"><span class="npc-sprite npc-${k}" aria-hidden="true"></span></div>`;
 }).join('');$('.world-map').classList.toggle('celebrating',done);
}
function placePlayer(k,animate=false){
 const p=$('.map-player'),pos=anchor(k);p.style.left=(pos[0]-17)+'px';p.style.top=(pos[1]-42)+'px';
 let duration=0;
 if(animate&&!reduced.matches&&k!==currentPlace){const motion=Village.travelFrames(Village.route(currentPlace,k));duration=motion.duration;p.animate(motion.frames,{duration,easing:'linear'});}
 p.querySelector('span').textContent=k?places[k].place:'You are here';return duration;
}
function cancelTravel(){clearTimeout(travelTimer);travelTimer=null;$('.map-player').getAnimations().forEach(a=>a.cancel());$('#skip-travel').hidden=true;$('#travel-status').textContent='';}
function arrive(k){cancelTravel();location.hash=k;}
function travel(k){if(!k)return;if(k==='contact'&&!contactUnlocked()){announce('The post office opens after you finish visiting all five story locations.');return;}
 encountered.add(k);if($('#world').hidden){location.hash=k;return;}cancelTravel();drawRoutes(k);const duration=placePlayer(k,true);currentPlace=k;$('.map-player').scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});$('#travel-status').textContent=`Traveling to ${places[k].place.toLowerCase()}…`;$('#skip-travel').hidden=false;$('#skip-travel').onclick=()=>arrive(k);const spark=$('.route-spark');if(spark)spark.style.animationDuration=duration+'ms';travelTimer=setTimeout(()=>arrive(k),duration+30);}
const encounters=Object.fromEntries(keys.map(k=>[k,()=>content.section(k)]));
function renderEncounter(k){const p=places[k];$('#encounter-location').textContent=p.place;$('#chapter').innerHTML=`<span class="eyebrow">${p.place.toUpperCase()} · ${completed.has(k)?'DISCOVERED':k==='contact'?'UNLOCKED':'A STORY TO DISCOVER'}</span><h1>${content.escape(p.title)}</h1><div class="encounter-host" style="--cloak:${hosts[k].color}"><div class="npc-portrait" aria-hidden="true"><span class="npc-sprite npc-${k}"></span></div><div><span class="eyebrow">${hosts[k].role}</span><h2>${content.escape(hosts[k].name)}</h2></div></div>${encounters[k]()}<div class="chapter-actions"><button id="complete-encounter" class="primary">${k==='contact'||completed.has(k)?'Return to village':`Finish visiting ${p.place.toLowerCase()}`} →</button></div>`;
 content.bind($('#chapter'),k);
 $('#complete-encounter').onclick=()=>{if(k!=='contact'&&!completed.has(k)){const before=level();completed.add(k);if(completed.size===5){celebrationPending=true;currentPlace='activities';}showReward(k,before);}location.hash='world';};
}
let rewardRemaining=6000,rewardStarted=0;
function pauseReward(){if(rewardTimer!==null){clearTimeout(rewardTimer);rewardTimer=null;rewardRemaining=Math.max(0,rewardRemaining-(performance.now()-rewardStarted));}}
function resumeReward(){
 if($('#reward').hidden||$('#reward').matches(':hover')||$('#reward').contains(document.activeElement)||document.hidden)return;
 clearTimeout(rewardTimer);rewardStarted=performance.now();rewardTimer=setTimeout(()=>dismissReward(),rewardRemaining);
}
function dismissReward(){
 clearTimeout(rewardTimer);rewardTimer=null;
 const hadFocus=$('#reward').contains(document.activeElement);
 $('#reward').hidden=true;
 if(hadFocus)$('#main').focus({preventScroll:true});
 if(celebrationPending&&location.hash==='#world'){celebrationPending=false;$('#celebration-dialog').showModal();}
}
function showReward(k,before){
 clearTimeout(rewardTimer);rewardTimer=null;rewardRemaining=6000;
 $('#reward-title').textContent=`Level ${before} → ${level()}`;
 $('#reward-skill').textContent=`${skills[k][0]} unlocked`;
 $('#reward-flavor').textContent=classes[chosenClass].name+' · '+levelRemarks[chosenClass][completed.size-1];
 $('#reward').hidden=false;
 resumeReward();
}
function renderAtlas(selected){
 const hasResume=portfolio.resume.enabled,key=selected==='resume'&&hasResume?'resume':places[selected]?selected:'about';
 const atlasKeys=hasResume?[...keys,'resume']:keys;
 const label=k=>k==='resume'?portfolio.resume.title:k==='contact'?'Contact':places[k].name;
 $('#atlas-nav').innerHTML=atlasKeys.map(k=>`<a href="#atlas/${k}" ${k===key?'aria-current="page"':''}>${content.escape(label(k))}</a>`).join('');
 $('#atlas-content').innerHTML=`<h1>${content.escape(label(key))}</h1>${key==='resume'?content.resume():content.section(key,true)}`;
 if(completed.size===5){atlasSeen=true;$('#atlas-button').classList.remove('atlas-new');$('#atlas-badge').textContent='READY';$('#atlas-button').setAttribute('aria-label','Atlas');}
 document.title=`${label(key)} — ${portfolio.site.name}’s Portfolio`;
}
function route(){if(location.hash==='#contact'&&!contactUnlocked()){location.hash='world';announce('The post office opens after you finish visiting all five story locations.');return;}cancelTravel();const k=location.hash.slice(1),isAtlas=k==='atlas'||k.startsWith('atlas/'),view=isAtlas?'atlas':places[k]?'journal':k==='world'?'world':'login';$$('.screen').forEach(s=>s.hidden=s.id!==view);$('#action-bar').hidden=view==='login'||view==='atlas';document.body.classList.toggle('in-adventure',view==='world'||view==='journal');document.body.classList.toggle('reading-atlas',view==='atlas');
 document.querySelector('.top-right a').href=view==='atlas'?'#atlas/contact':'#contact';

 if(places[k]){currentPlace=k;encountered.add(k);renderEncounter(k);}
 if(view==='world'){update();placePlayer(currentPlace);}
 document.title=`${places[k]?.name||'Your adventure'} — ${portfolio.site.worldName}`;
 if(view!=='world'){clearTimeout(rewardTimer);rewardTimer=null;$('#reward').hidden=true;}
 if(view==='atlas')renderAtlas(k.split('/')[1]);
 window.scrollTo(0,0);(view==='journal'?$('#chapter'):view==='atlas'?$('#atlas-content'):$('#main')).focus({preventScroll:true});
 if(view==='world'&&celebrationPending&&$('#reward').hidden){celebrationPending=false;$('#celebration-dialog').showModal();}
}
function openAtlas(){if(completed.size===5){location.hash='atlas';}else{$('#atlas-info-copy').textContent=`You’re Level ${level()}, with ${completed.size} of 5 skills discovered.`;$('#atlas-info').showModal();}}
function roll(){const pool=storyKeys.filter(k=>!completed.has(k));const choices=pool.length?pool:storyKeys;const face=1+Math.floor(Math.random()*6);rollTarget=choices[(face-1)%choices.length];$('#dice-face').textContent=String(face);$('#dice-result').textContent=`You rolled ${face}. Your suggested side quest: ${places[rollTarget].place} — ${places[rollTarget].name}. Travel there, roll again, or keep your own course.`;}
function openCharacter(){$('#traveler-name').value=traveler==='Wandering visitor'?'':traveler;renderCharacter();$('#character-dialog').showModal();}
function openJourney(){if(location.hash==='#world'){$('#guide-title').focus();$('#guide').scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});}else location.hash='world';}
$('#login-form').onsubmit=e=>{e.preventDefault();newAdventure=false;location.hash='world';};
$('#journal-toggle').onclick=()=>{location.hash='atlas';};
$('#mode-toggle').onclick=()=>{free=!free;update();announce(free?'Explore in any order. Places gain color when visited. The post office opens after all five story visits.':'Your suggested route is highlighted again.');};
$('#journey-button').onclick=openJourney;$('#atlas-button').onclick=openAtlas;$('#character-button').onclick=openCharacter;
$('#leave-world').onclick=()=>location.hash='login';$$('[data-section]').forEach(b=>b.onclick=()=>travel(b.dataset.section));
$('#customize').onclick=$('#edit-traveler').onclick=openCharacter;
$('#traveler-name').addEventListener('input',()=>{traveler=$('#traveler-name').value.trim()||'Wandering visitor';$('#entry-name').textContent=traveler;$('#player-name').textContent=traveler;});
$$('[data-color]').forEach(b=>b.onclick=()=>{document.documentElement.style.setProperty('--cloak',{fern:'#527f64',clay:'#b56e53',iris:'#7b75a5'}[b.dataset.color]);$$('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
$('#save-character').onclick=()=>{$('#character-dialog').close();update();if(newAdventure){newAdventure=false;location.hash='world';announce('New adventure started. Level 1, '+classes[chosenClass].name+' route.');}else announce(classes[chosenClass].name+' route selected. Your completed visits are kept.');};
$('#direction-button').onclick=()=>$('#direction-dialog').showModal();
$('#roll-dice').onclick=()=>{roll();$('#dice-dialog').showModal();};$('#reroll').onclick=roll;$('#accept-roll').onclick=()=>{$('#dice-dialog').close();travel(rollTarget);};
$('#join-campfire').onclick=()=>$('#celebration-dialog').close();
$('#celebration-dialog').addEventListener('close',()=>{if(location.hash==='#world'&&currentPlace==='activities')$('.map-player').scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});});
$('#celebration-atlas').onclick=()=>{$('#celebration-dialog').close();openAtlas();};$('#celebration-contact').onclick=()=>$('#celebration-dialog').close();
$('.skip').onclick=e=>{e.preventDefault();$('#main').focus();};
window.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.repeat||$('dialog[open]')||$('#action-bar').hidden||e.target.closest('input,textarea,select,[contenteditable]'))return;const actions={'1':openJourney,'2':openCharacter,'3':()=>$('#roll-dice').click(),'4':openAtlas};if(actions[e.key]){e.preventDefault();actions[e.key]();}});
window.addEventListener('hashchange',route);window.addEventListener('resize',()=>{if(!$('#world').hidden){const wasTraveling=travelTimer!==null,target=currentPlace;cancelTravel();Village.layout();update();placePlayer(currentPlace);if(wasTraveling)arrive(target);}});
// Personal identity comes from content/site.json; the adventure design stays in code.
$('.brand-name').textContent='('+portfolio.site.name+')';
$('.guide-identity>span:not(.npc-sprite)').firstChild.textContent=portfolio.site.name.toUpperCase();
$('.atlas-heading .eyebrow').textContent=portfolio.site.name.toUpperCase()+' / PORTFOLIO';
$('.world-top h1').textContent='Welcome to '+portfolio.site.worldName+'.';
$('.map-label strong').textContent=portfolio.site.worldName+' Village';
update();route();

// Dismiss the navigation hint without moving keyboard focus.
$$('.portfolio-nav').forEach(nav=>{
 nav.addEventListener('keydown',e=>{if(e.key==='Escape')nav.classList.add('hint-dismissed');});
 nav.addEventListener('pointerleave',()=>nav.classList.remove('hint-dismissed'));
 nav.addEventListener('focusout',()=>nav.classList.remove('hint-dismissed'));
});

$('#dismiss-reward').onclick=dismissReward;
$('#reward').addEventListener('pointerenter',pauseReward);
$('#reward').addEventListener('pointerleave',resumeReward);
$('#reward').addEventListener('focusin',pauseReward);
$('#reward').addEventListener('focusout',()=>setTimeout(resumeReward,0));
$('#reward').addEventListener('keydown',e=>{if(e.key==='Escape')dismissReward();});
document.addEventListener('visibilitychange',()=>document.hidden?pauseReward():resumeReward());

function restartAdventure(){
 cancelTravel();clearTimeout(rewardTimer);rewardTimer=null;
 completed.clear();encountered.clear();free=false;currentPlace=null;rollTarget=null;
 atlasSeen=false;celebrationPending=false;rewardRemaining=6000;rewardStarted=0;
 traveler='Wandering visitor';newAdventure=true;
 $('#reward').hidden=true;$('#reward-title').textContent='';$('#reward-skill').textContent='';$('#reward-flavor').textContent='';
 document.documentElement.style.setProperty('--cloak','#527f64');
 $$('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color==='fern')));
 $$('dialog[open]').forEach(dialog=>dialog.close());
 location.hash='login';update();openCharacter();
 announce('New adventure ready. Choose your class and cloak. Your level and visits have been reset.');
}
$$('[data-restart]').forEach(button=>button.onclick=restartAdventure);
