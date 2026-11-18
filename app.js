/* Hammad Ahmed — portfolio. Native HTML, CSS and browser animation APIs. */
(() => {
  'use strict';
  const root=document.documentElement,data=window.PORTFOLIO,projects=data.projects;
  const settings=window.THUMBNAIL_SETTINGS||{},overrides=settings.items||{};
  const validAsset=path=>typeof path==='string'&&!path.includes('..')&&/^assets\/[a-zA-Z0-9_./-]+$/.test(path);
  projects.forEach(p=>{const v=overrides[p.slug];if(v&&validAsset(v.image)){p.cover=v.image;p.thumbnailFit=v.fit==='contain'?'contain':'cover';p.thumbnailPosition=Math.max(0,Math.min(100,(Number.isFinite(Number(v.position))?Number(v.position):50)));}});
  const featuredProjects=Array.isArray(settings.featured)?settings.featured.map(slug=>projects.find(p=>p.slug===slug)).filter(Boolean):projects.slice(0,7);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const ease='cubic-bezier(.16,1,.3,1)',animations=new Set();
  let motion=!reduced.matches,revealObserver=null,scrollFrame=0,currentProject=-1,themeTransition=null;
  const esc=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  root.classList.add('has-js');
  try {const theme=localStorage.getItem('hammad-theme');if(theme==='dark'||theme==='light')root.dataset.theme=theme;}catch{}
  document.querySelector('.theme-switch').setAttribute('aria-label',`Switch to ${root.dataset.theme==='dark'?'light':'dark'} theme`);
  const play=(node,frames,options={})=>{
    if(!node||!motion||typeof node.animate!=='function')return null;
    const animation=node.animate(frames,{duration:1050,easing:ease,...options});animations.add(animation);
    animation.finished.then(()=>animations.delete(animation)).catch(()=>animations.delete(animation));return animation;
  };
  const announce=text=>{const node=document.querySelector('#announcement');node.textContent=text;node.classList.add('visible');clearTimeout(announce.timer);announce.timer=setTimeout(()=>node.classList.remove('visible'),2500)};
  const cursorTargets='.project-launch,.hero-card';
  const viewer=document.querySelector('#project-viewer'),frameSlot=viewer.querySelector('.viewer-frame');
  viewer.setAttribute('aria-labelledby','viewer-title');
  const syncFrameMotion=()=>{
    document.querySelectorAll('.viewer-frame iframe,.carhartt-inline').forEach(frame=>{
      if(!frame.contentWindow)return;
      frame.contentWindow.postMessage({type:'onside-preview:motion',enabled:motion},location.protocol==='file:'?'*':location.origin);
      try{frame.contentWindow.CarharttMotion?.setEnabled(motion);}catch{}
    });
  };
  document.addEventListener('load',e=>{if(e.target.matches?.('.carhartt-inline'))syncFrameMotion()},true);
  const observeReveals=(scope=document)=>{
    scope.querySelectorAll('.reveal').forEach((node,i)=>{
      if(!motion||!revealObserver){node.classList.add('is-revealed');return;}
      node.dataset.revealDelay=String((i%3)*65);revealObserver.observe(node);
    });
  };
  const configureMotion=()=>{
    root.dataset.motion=motion?'on':'off';root.classList.toggle('motion-enabled',motion);
    const button=document.querySelector('.motion-toggle');button.textContent=reduced.matches?'Reduced motion':motion?'Pause motion Ⅱ':'Play motion ▷';button.setAttribute('aria-pressed',String(!motion));button.disabled=reduced.matches;
    if(!motion){for(const animation of animations)animation.cancel();animations.clear();root.classList.add('has-entered');document.querySelectorAll('.reveal').forEach(n=>n.classList.add('is-revealed'));document.querySelector('.portfolio-cursor')?.classList.remove('active');}
    syncFrameMotion();
  };
  if('IntersectionObserver'in window){
    revealObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const node=entry.target;node.classList.add('is-revealed');play(node,[{opacity:0,transform:'translate3d(0,38px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{delay:Number(node.dataset.revealDelay||0),fill:'backwards'});revealObserver.unobserve(node)}},{threshold:.07,rootMargin:'0px 0px -3% 0px'});
  }
  document.querySelector('.motion-toggle').addEventListener('click',()=>{motion=!motion;configureMotion()});
  reduced.addEventListener('change',()=>{motion=!reduced.matches;configureMotion()});
  document.addEventListener('focusin',e=>{const node=e.target.closest('.reveal');if(node){node.classList.add('is-revealed');revealObserver?.unobserve(node)}});
  document.querySelector('.theme-switch').addEventListener('click',()=>{
    const next=root.dataset.theme==='dark'?'light':'dark';
    const update=()=>{root.dataset.theme=next;document.querySelector('.theme-switch').setAttribute('aria-label',`Switch to ${next==='dark'?'light':'dark'} theme`);try{localStorage.setItem('hammad-theme',next)}catch{}};
    if(!motion||!document.startViewTransition){update();return;}
    themeTransition?.skipTransition();themeTransition=document.startViewTransition(update);themeTransition.ready.catch(()=>{});
  });
  const menu=document.querySelector('#navigation-dialog');menu.setAttribute('aria-label','Main navigation menu');
  document.querySelector('.menu-toggle').onclick=()=>{menu.showModal();play(menu,[{opacity:0,transform:'translateY(-25px)'},{opacity:1,transform:'translateY(0)'}],{duration:600})};
  menu.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>menu.close()));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close()}));
  const loadVersion=path=>{
    viewer.querySelector('.viewer-stage').classList.remove('loaded');
    const iframe=document.createElement('iframe');iframe.title=`${projects[currentProject].name} website design preview`;iframe.src=path+(path.includes('?')?'&':'?')+'embed=1';iframe.loading='eager';
    iframe.addEventListener('load',()=>{viewer.querySelector('.viewer-stage').classList.add('loaded');syncFrameMotion()},{once:true});
    frameSlot.replaceChildren(iframe);document.querySelector('#viewer-standalone').href=path;
  };
  const openProject=slug=>{
    const index=projects.findIndex(p=>p.slug===slug);if(index<0)return;currentProject=index;const p=projects[index];
    document.querySelector('#viewer-title').textContent=p.name;document.querySelector('#viewer-index').textContent=`${String(index+1).padStart(2,'0')} / ${projects.length} · WEBSITE DESIGN`;
    document.querySelector('#viewer-details').href='case-study.html?project='+encodeURIComponent(p.slug);
    const select=document.querySelector('#viewer-version');select.replaceChildren();
    const variants=[{label:p.slug==='carhartt'?'Black version':'Main version',path:p.preview},...p.variants];
    variants.forEach(v=>{const option=document.createElement('option');option.value=v.path;option.textContent=v.label;select.append(option)});select.hidden=variants.length<2;
    select.onchange=()=>loadVersion(select.value);loadVersion(p.preview);
    if(!viewer.open){viewer.showModal();play(viewer,[{opacity:0,transform:'translateY(30px) scale(.985)'},{opacity:1,transform:'none'}],{duration:650});}
  };
  document.querySelector('.viewer-close').onclick=()=>viewer.close();
  viewer.addEventListener('close',()=>{frameSlot.replaceChildren();currentProject=-1});
  document.querySelector('#viewer-prev').onclick=()=>openProject(projects[(currentProject-1+projects.length)%projects.length].slug);
  document.querySelector('#viewer-next').onclick=()=>openProject(projects[(currentProject+1)%projects.length].slug);
  document.addEventListener('click',e=>{const button=e.target.closest('[data-project]');if(button)openProject(button.dataset.project)});
  const card=(p,index)=>`<article class="project-card reveal" data-project-card="${p.slug}"><a class="project-launch" href="case-study/?project=${encodeURIComponent(p.slug)}" aria-label="View ${esc(p.name)} project"><span class="card-art"><img src="${p.cover}" alt="${esc(p.name)} website banner mockup" loading="lazy"></span></a><div class="project-caption"><h3><a href="case-study/?project=${encodeURIComponent(p.slug)}">${esc(p.name.toUpperCase())}</a></h3><span>/ ${esc(p.tags[0].toUpperCase())}</span></div></article>`;
  const artworks=data.artwork||[];
  const artCard=a=>`<article class="project-card artwork-card reveal"><a class="project-launch artwork-launch" href="case-study/?project=${encodeURIComponent(a.slug)}" aria-label="View ${esc(a.title)} project"><span class="card-art"><img src="${esc(a.images[0])}" alt="${esc(a.title)} design presentation" loading="lazy"></span></a><div class="project-caption"><h3><a href="case-study/?project=${encodeURIComponent(a.slug)}">${esc(a.title.toUpperCase())}</a></h3><span>/ ${a.images.length>1?a.images.length+' IMAGES':esc(a.discipline.toUpperCase())}</span></div></article>`;
  const artDialog=document.createElement('dialog');artDialog.className='artwork-viewer';artDialog.setAttribute('aria-labelledby','artwork-title');artDialog.innerHTML='<div class="artwork-toolbar"><div><span class="eyebrow" id="artwork-kind"></span><h2 id="artwork-title"></h2></div><button class="artwork-close" aria-label="Close artwork">Close ×</button></div><div class="artwork-stage"><img id="artwork-image" alt=""></div><div class="artwork-controls"><button aria-label="Previous artwork image">← Previous</button><span id="artwork-counter" role="status" aria-live="polite"></span><button aria-label="Next artwork image">Next →</button></div>';document.body.append(artDialog);
  let activeArt=null,artIndex=0;
  const showArtImage=()=>{const img=artDialog.querySelector('#artwork-image');img.src=activeArt.images[artIndex];img.alt=activeArt.title+' — image '+(artIndex+1);artDialog.querySelector('#artwork-counter').textContent=(artIndex+1)+' / '+activeArt.images.length;artDialog.querySelectorAll('.artwork-controls button').forEach(b=>b.disabled=activeArt.images.length<2);};
  const changeArt=step=>{if(!activeArt)return;artIndex=(artIndex+step+activeArt.images.length)%activeArt.images.length;showArtImage()};
  artDialog.querySelector('.artwork-close').onclick=()=>artDialog.close();artDialog.querySelector('[aria-label="Previous artwork image"]').onclick=()=>changeArt(-1);artDialog.querySelector('[aria-label="Next artwork image"]').onclick=()=>changeArt(1);
  artDialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();changeArt(1)}if(e.key==='ArrowLeft'){e.preventDefault();changeArt(-1)}});artDialog.addEventListener('close',()=>{artDialog.querySelector('#artwork-image').removeAttribute('src');activeArt=null});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-artwork]');if(!b)return;activeArt=artworks.find(a=>a.slug===b.dataset.artwork);if(!activeArt)return;artIndex=0;artDialog.querySelector('#artwork-title').textContent=activeArt.title;artDialog.querySelector('#artwork-kind').textContent=activeArt.discipline;showArtImage();artDialog.showModal();});
  const work=document.querySelector('#work-content');
  if(work){
    const full=document.body.dataset.page==='work',buttons=[...document.querySelectorAll('[data-category]')];let current='websites';
    const renderCategory=(category,initial=false)=>{
      const c=data.categories.find(c=>c.id===category)||data.categories[0];current=c.id;
      buttons.forEach(b=>{b.id='tab-category-'+b.dataset.category;b.setAttribute('aria-controls','work-content');b.setAttribute('aria-selected',String(b.dataset.category===current));b.tabIndex=b.dataset.category===current?0:-1});
      work.setAttribute('aria-labelledby','tab-category-'+current);
      work.setAttribute('aria-label',c.name+' portfolio');
      {
        work.querySelectorAll('.reveal').forEach(n=>revealObserver?.unobserve(n));
        if(current==='websites')work.innerHTML=`<div class="project-grid ${full?'full-grid':''}">${(full?projects:featuredProjects).map((p,i)=>card(p,i+1)).join('')}</div>`;
        else if(artworks.some(a=>a.category===current))work.innerHTML=`<div class="project-grid artwork-grid">${artworks.filter(a=>a.category===current).map(artCard).join('')}</div>`;
        else work.innerHTML=`<div class="category-empty"><h3 class="reveal">${esc(c.intro)}</h3><div class="reveal"><p>${esc(c.description)}</p><div class="empty-offerings">${c.offerings.map(o=>`<span>${esc(o)}</span>`).join('')}</div><a class="pill-button dark" href="mailto:${data.designer.email}?subject=${encodeURIComponent(c.name+' design enquiry')}">Let’s talk about ${esc(c.name.toLowerCase())} <span>↗</span></a></div></div>`;
      }
      const all=document.querySelector('.all-work-row');if(all)all.hidden=current!=='websites';
      const oldSearch=document.querySelector('.work-search-row');if(oldSearch)oldSearch.remove();
      if(full&&current==='websites'){
        const row=document.createElement('div');row.className='work-search-row';row.innerHTML='<span id="work-count">20 WEBSITE PROJECTS</span><label><span class="sr-only" style="position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden">Search projects</span><input type="search" placeholder="Find a project" aria-label="Search website projects"></label>';work.before(row);
        row.querySelector('input').oninput=e=>{const q=e.target.value.trim().toLowerCase();let count=0;work.querySelectorAll('[data-project-card]').forEach(node=>{const p=projects.find(p=>p.slug===node.dataset.projectCard);const visible=(p.name+' '+p.description+' '+p.tags.join(' ')).toLowerCase().includes(q);node.hidden=!visible;if(visible)count++});row.querySelector('#work-count').textContent=count+' WEBSITE PROJECT'+(count===1?'':'S');work.querySelector('.search-empty')?.remove();if(!count){const message=document.createElement('p');message.className='search-empty';message.textContent='No projects match that search. Try a name, industry or style.';work.append(message)}};
      }
      observeReveals(work);if(!initial)play(work,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:600});
      if(location.protocol!=='file:'&&!initial){const u=new URL(location.href);u.searchParams.set('category',current);history.replaceState(null,'',u)}
    };
    buttons.forEach((button,index)=>{button.onclick=()=>renderCategory(button.dataset.category);button.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[i].focus();renderCategory(buttons[i].dataset.category)})});
    const category=new URLSearchParams(location.search).get('category')||'websites';renderCategory(category,true);
  }
  if(document.body.dataset.page==='case'){
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.href=location.pathname+location.search+a.getAttribute('href'));
    const slug=new URLSearchParams(location.search).get('project'),p=projects.find(p=>p.slug===slug),art=artworks.find(a=>a.slug===slug),item=p||art,content=document.querySelector('#case-content');
    if(item){
      const name=p?p.name:art.title;document.title=name+' — Hammad Ahmed';content.className='';
      const media=images=>images.map((src,i)=>`<img src="${esc(src)}" alt="${esc(name)} — design ${i+1}" loading="${i?'lazy':'eager'}">`).join('');
      content.innerHTML=`<div class="case-intro section-pad"><a class="case-back" href="work.html${art?'?category='+encodeURIComponent(art.category):''}">← Back to selected work</a><div class="case-title-row"><h1 class="display">${esc(name)}</h1><div class="tags">${(p?p.tags:[art.discipline]).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><p class="case-description">${p?esc(p.description):'A selection of '+esc(art.discipline.toLowerCase())+' work, presented in full.'}</p></div>${p?`<figure class="case-natural-cover section-pad"><img src="${esc(p.cover)}" alt="${esc(name)} banner mockup"></figure>`:''}<section class="case-full-design section-pad"><div class="case-design-heading"><h2>${p?'THE DESIGN':'THE COLLECTION'}</h2>${p&&p.variants.length?'<label>Design version <select id="case-version" aria-label="Design version"></select></label>':''}</div><div id="case-design-media" class="${p?'website-design-media':'artwork-design-media'}">${p&&p.slug==='carhartt'?`<iframe class="carhartt-inline" title="Carhartt animated design" src="${p.preview}?embed=1" loading="lazy"></iframe><a class="text-link" href="${p.preview}" target="_blank" rel="noopener">Open full animated design ↗</a>`:media(p?p.designImages||[]:art.images)}</div></section>`;
      if(p&&p.variants.length){const select=document.querySelector('#case-version'),versions=[{label:p.slug==='carhartt'?'Black version':'Main version',path:p.preview,designImages:p.designImages},...p.variants];versions.forEach((v,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=v.label;select.append(option)});select.onchange=()=>{const v=versions[Number(select.value)],target=document.querySelector('#case-design-media');if(p.slug==='carhartt')target.innerHTML=`<iframe class="carhartt-inline" title="Carhartt animated design" src="${v.path}?embed=1" loading="lazy"></iframe><a class="text-link" href="${v.path}" target="_blank" rel="noopener">Open full animated design ↗</a>`;else target.innerHTML=media(v.designImages||[]);};}
    }else{content.innerHTML='<div class="case-intro section-pad"><h1>Project not found</h1><p>Choose a project from the portfolio.</p><a href="work.html">View all projects ↗</a></div>';}
  }
  const portrait=document.querySelector('.portrait-frame');
  if(portrait){const b=portrait.querySelector('.portrait-toggle');b.setAttribute('aria-pressed','false');b.onclick=()=>{const on=portrait.classList.toggle('in-colour');b.setAttribute('aria-pressed',String(on));b.textContent=on?'IN BLACK & WHITE ↗':'IN COLOUR ↗';b.setAttribute('aria-label',on?'Show black and white portrait':'Show colour portrait')}}
  document.querySelectorAll('.services-list details').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)document.querySelectorAll('.services-list details').forEach(other=>{if(other!==details)other.open=false})}));
  document.querySelector('.copy-email').onclick=async()=>{
    try{await navigator.clipboard.writeText(data.designer.email);announce('Email copied. Let’s make something good.');}
    catch{announce(data.designer.email);}
  };
  const words=document.querySelector('[data-word-reveal]');
  if(words){words.innerHTML=words.textContent.trim().split(/\s+/).map(word=>`<span class="word">${esc(word)}</span>`).join(' ')}
  const updateScroll=()=>{
    scrollFrame=0;const total=Math.max(document.documentElement.scrollHeight-innerHeight,1);document.querySelector('.reading-progress').style.transform=`scaleX(${clamp(scrollY/total,0,1)})`;
    if(words){const box=words.getBoundingClientRect(),progress=motion?clamp((innerHeight*.9-box.top)/(innerHeight*.72+box.height*.1),0,1):1;const nodes=[...words.children];nodes.forEach((node,i)=>{node.style.opacity=String(.18+.82*clamp(progress*nodes.length-i,0,1))})}
  };
  const onScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll)};
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});
  const deck=document.querySelector('.hero-deck');
  if(deck){deck.addEventListener('pointermove',e=>{if(!motion||!fine.matches)return;const b=deck.getBoundingClientRect();deck.style.setProperty('--deck-rx',`${clamp((e.clientY-b.top-b.height*.5)/b.height*-8,-4,4)}deg`);deck.style.setProperty('--deck-ry',`${clamp((e.clientX-b.left-b.width*.5)/b.width*10,-5,5)}deg`)});deck.addEventListener('pointerleave',()=>{deck.style.setProperty('--deck-rx','0deg');deck.style.setProperty('--deck-ry','0deg')})}
  if(fine.matches){
    const cursor=document.createElement('div');cursor.className='portfolio-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<span>EXPLORE ↗</span>';document.body.append(cursor);root.classList.add('has-cursor','dot-cursor');
    let frame=0,x=0,y=0,hasPosition=false;
    const hostCursor=()=>{
      // Modal dialogs live above every body z-index. Keep the cursor in the active top layer.
      const host=[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;
      if(cursor.parentElement!==host)host.append(cursor);
      cursor.classList.toggle('in-dialog',host!==document.body);
    };
    const place=()=>{
      frame=0;hostCursor();let px=x,py=y;const host=cursor.parentElement;
      if(host!==document.body){const r=host.getBoundingClientRect();const sx=r.width/host.offsetWidth||1,sy=r.height/host.offsetHeight||1;px=(x-r.left)/sx+host.scrollLeft-host.clientLeft;py=(y-r.top)/sy+host.scrollTop-host.clientTop;}
      cursor.style.transform=`translate3d(${px}px,${py}px,0) translate(-50%,-50%)`;
      if(host!==document.body&&host.getAnimations().some(a=>a.playState==='running'))frame=requestAnimationFrame(place);
    };
    const move=e=>{
      if(e.pointerType==='touch')return;x=e.clientX;y=e.clientY;hasPosition=true;
      const embedded=e.target.closest?.('iframe');cursor.classList.toggle('is-visible',!embedded);
      cursor.classList.toggle('is-explore',!!e.target.closest?.(cursorTargets));
      if(!frame)frame=requestAnimationFrame(place);
    };
    document.addEventListener('pointermove',move,{passive:true,capture:true});document.addEventListener('pointerover',move,{passive:true,capture:true});
    const observer=new MutationObserver(()=>{hostCursor();cursor.classList.remove('is-explore');if(hasPosition)place()});
    document.querySelectorAll('dialog').forEach(dialog=>{observer.observe(dialog,{attributes:true,attributeFilter:['open']});dialog.addEventListener('scroll',()=>{if(hasPosition)place()},{passive:true});});
    document.documentElement.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'));
    addEventListener('blur',()=>cursor.classList.remove('is-visible'));document.addEventListener('visibilitychange',()=>{if(document.hidden){cursor.classList.remove('is-visible');if(frame)cancelAnimationFrame(frame);frame=0;}});
  }
  configureMotion();observeReveals();updateScroll();
  let entered=false;
  const entrance=()=>{
    if(entered)return;entered=true;root.classList.add('has-entered');
    document.querySelectorAll('.hero-title-line>span').forEach((node,i)=>play(node,[{transform:'translateY(110%) rotate(3deg)'},{transform:'translateY(0) rotate(0)'}],{duration:1200,delay:i*110,fill:'backwards'}));
    document.querySelectorAll('.hero-card').forEach((node,i)=>{const transform=getComputedStyle(node).transform;play(node,[{opacity:0,transform:transform+' translateY(90px) rotate(10deg)'},{opacity:1,transform}],{duration:1450,delay:260+i*90,fill:'backwards'})});
    play(document.querySelector('.site-header'),[{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'translateY(0)'}],{duration:900});
  };
  const startTimer=setTimeout(entrance,650);(document.fonts?.ready||Promise.resolve()).then(()=>{clearTimeout(startTimer);entrance()});
})();
