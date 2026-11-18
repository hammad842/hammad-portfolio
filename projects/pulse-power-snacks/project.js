/* Standalone, offline portfolio preview. No external libraries or network calls. */
(() => {
  'use strict';
  const root=document.documentElement,body=document.body,main=document.querySelector('main');
  const data=JSON.parse(document.querySelector('#project-data').textContent);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=matchMedia('(hover:hover) and (pointer:fine)');
  const sections=[...document.querySelectorAll('.design-section')];
  const dialog=document.querySelector('#project-dialog'),content=document.querySelector('#dialog-content');
  const toggle=document.querySelector('[data-action=motion]');
  const motionType=main.dataset.motion;
  const settings={luxury:[1600,28],editorial:[1400,30],playful:[1000,48],tech:[1100,36],saas:[1150,32],warm:[1300,26],organic:[1500,22],corporate:[1250,25]}[motionType]||[1200,30];
  const ease=motionType==='playful'?'cubic-bezier(.2,1.12,.35,1)':'cubic-bezier(.16,1,.3,1)';
  const animations=new Set();let enabled=false,observer=null,frame=0,cursor=null,cursorFrame=0;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const animate=(node,frames,options={})=>{
    if(!enabled||typeof node.animate!=='function')return null;
    const a=node.animate(frames,{duration:settings[0],easing:ease,...options});animations.add(a);
    a.finished.then(()=>animations.delete(a)).catch(()=>animations.delete(a));return a;
  };
  const reveal=section=>{
    if(section.classList.contains('has-revealed'))return;
    section.classList.add('has-revealed');
    const visual=section.querySelector('.visual-window');
    const frames=motionType==='tech'?[{opacity:0,clipPath:'inset(0 0 14% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)'}]:[{opacity:0,transform:`translateY(${settings[1]}px)`},{opacity:1,transform:'translateY(0)'}];
    animate(visual,frames,{fill:'backwards'});
    if(section.classList.contains('hero'))animate(section.querySelector('.visual-image'),[{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:settings[0]+450});
    section.querySelectorAll('.detail-target').forEach((node,i)=>animate(node,[{opacity:0},{opacity:1}],{duration:700,delay:Math.min(i*65,300),fill:'backwards'}));
  };
  const updateScroll=()=>{
    frame=0;
    const total=Math.max(document.documentElement.scrollHeight-innerHeight,1);
    document.querySelector('.scroll-progress').style.transform=`scaleX(${clamp(scrollY/total,0,1)})`;
    if(enabled){
      const hero=sections[0],box=hero.getBoundingClientRect();
      if(box.bottom>0){const progress=clamp(scrollY/Math.max(box.height,1),0,1);hero.querySelector('.visual-image').style.transform=`translate3d(0,${progress*14}px,0) scale(${1+progress*.035})`;}
    }
  };
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(updateScroll)};
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});
  const setMotion=want=>{
    enabled=!!want&&!reduced.matches&&'IntersectionObserver'in window&&typeof Element.prototype.animate==='function';
    body.classList.toggle('motion-enabled',enabled);toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=reduced.matches?'Reduced motion':enabled?'Motion on':'Motion off';toggle.disabled=reduced.matches;
    observer?.disconnect();observer=null;
    if(!enabled){for(const a of animations)a.cancel();animations.clear();sections.forEach(s=>s.classList.add('has-revealed'));sections[0].querySelector('.visual-image').style.removeProperty('transform');cursor?.classList.remove('is-active');if(cursorFrame)cancelAnimationFrame(cursorFrame);cursorFrame=0;return;}
    sections.forEach((s,i)=>{if(i>0&&s.getBoundingClientRect().top>innerHeight)s.classList.remove('has-revealed')});
    observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target)}},{threshold:.06,rootMargin:'0px 0px 5% 0px'});
    sections.forEach(s=>observer.observe(s));reveal(sections[0]);onScroll();
  };
  toggle.addEventListener('click',()=>setMotion(!enabled));
  reduced.addEventListener('change',()=>setMotion(!reduced.matches));
  const focusReveal=e=>{const s=e.target.closest('.design-section');if(s){s.classList.add('has-revealed');observer?.unobserve(s)}};
  document.addEventListener('focusin',focusReveal);
  const show=(html,kind='preview')=>{dialog.dataset.kind=kind;content.innerHTML=html;if(!dialog.open)dialog.showModal();animate(dialog,[{opacity:0,transform:'translateY(20px) scale(.97)'},{opacity:1,transform:'none'}],{duration:500})};
  const scrollTo=id=>{
    const target=document.getElementById(id);if(!target)return;
    target.classList.add('has-revealed');dialog.close();target.scrollIntoView({behavior:enabled?'smooth':'instant',block:'start'});
  };
  const openContact=()=>{
    show('<p class="eyebrow">'+data.name+'</p><h2>Let’s talk.</h2><form id="preview-form"><label>Name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Message<textarea name="message" required></textarea></label><button class="submit-button">Preview submission ↗</button></form><p class="form-note">Portfolio demo: this form validates locally. Your details are not sent or stored.</p>','contact');
    content.querySelector('form').onsubmit=e=>{e.preventDefault();show('<p class="eyebrow">Preview complete</p><h2>Thank you.</h2><p>Your form is valid. No message was sent or stored.</p>')};
  };
  const openMenu=()=>{
    show('<p class="eyebrow">Website design preview</p><h2>'+data.name+'</h2><nav class="menu-links">'+data.sections.map((s,i)=>'<button data-section="'+s.id+'" style="--delay:'+Math.min(i*35,250)+'ms">'+s.label+' <span aria-hidden="true">↗</span></button>').join('')+'</nav>','menu');
    content.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>scrollTo(b.dataset.section));
  };
  const openDetail=node=>{
    const box=JSON.parse(node.dataset.crop),image=node.querySelector('.hover-window img').cloneNode(true);
    image.removeAttribute('loading');image.setAttribute('alt',node.getAttribute('aria-label'));
    show('<p class="eyebrow">'+data.name+'</p><h2>Design detail.</h2><div class="detail-preview" style="aspect-ratio:'+box[2]+'/'+box[3]+'"></div>','detail');content.querySelector('.detail-preview').append(image);
  };
  document.querySelectorAll('[data-action]').forEach(node=>{
    if(node===toggle)return;
    node.addEventListener('click',()=>{
      if(node.dataset.action==='scroll')scrollTo(node.dataset.destination);
      else if(node.dataset.action==='contact')openContact();
      else if(node.dataset.action==='menu')openMenu();
      else if(node.dataset.action==='detail')openDetail(node);
    });
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
  if(pointer.matches){
    cursor=document.createElement('div');cursor.className='portfolio-cursor';cursor.textContent='VIEW ↗';cursor.setAttribute('aria-hidden','true');body.append(cursor);body.classList.add('has-cursor');
    let x=0,y=0,tx=0,ty=0;
    const tick=()=>{cursorFrame=0;if(!enabled||document.hidden)return;x+=(tx-x)*.24;y+=(ty-y)*.24;cursor.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;if(Math.abs(tx-x)+Math.abs(ty-y)>.4)cursorFrame=requestAnimationFrame(tick)};
    document.querySelectorAll('.detail-target').forEach(node=>{
      node.addEventListener('pointerenter',e=>{if(!enabled)return;x=tx=e.clientX;y=ty=e.clientY;cursor.classList.add('is-active');if(!cursorFrame)cursorFrame=requestAnimationFrame(tick)});
      node.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;if(enabled&&!cursorFrame)cursorFrame=requestAnimationFrame(tick)});
      node.addEventListener('pointerleave',()=>cursor.classList.remove('is-active'));
    });
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(cursorFrame)cancelAnimationFrame(cursorFrame);cursorFrame=0;cursor?.classList.remove('is-active')}});
  const embedded=new URLSearchParams(location.search).get('embed')==='1';root.classList.toggle('is-embedded',embedded);
  const sendSize=()=>{if(embedded&&parent!==window)parent.postMessage({type:'onside-preview:resize',slug:data.slug,height:document.documentElement.scrollHeight},'*')};
  if('ResizeObserver'in window)new ResizeObserver(sendSize).observe(main);
  addEventListener('load',sendSize);addEventListener('resize',sendSize,{passive:true});
  addEventListener('message',e=>{if(e.source!==parent)return;if(location.protocol!=='file:'&&e.origin!==location.origin)return;if(e.data?.type==='onside-preview:motion')setMotion(e.data.enabled===true)});
  setMotion(!reduced.matches);updateScroll();
})();
