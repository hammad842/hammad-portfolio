/* Portfolio motion layer. Native browser animations; no CDN or dependencies. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const running = new Set();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const scale = () => Number(root.style.getPropertyValue('--scale')) || 1;
  const ease = 'cubic-bezier(.16,1,.3,1)';
  const play = (node, frames, options = {}) => {
    if (!node || reduced.matches || typeof node.animate !== 'function') return null;
    const animation = node.animate(frames, {duration: 1000, easing: ease, ...options});
    running.add(animation);
    animation.finished.then(() => running.delete(animation)).catch(() => running.delete(animation));
    return animation;
  };
  window.CarharttMotion = {
    switchTheme(update) {
      if (reduced.matches || typeof document.startViewTransition !== 'function') {update(); return;}
      try {document.startViewTransition(update);} catch {update();}
    }
  };
  if (reduced.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  root.classList.add('motion-ready');
  const stage = document.querySelector('.stage');
  const hero = document.querySelector('#hero');
  const statement = document.querySelector('#statement');
  const heroTitle = document.querySelector('#copy-0');
  let disposed = false;
  let entranceStarted = false;
  const entrance = () => {
    if (entranceStarted || disposed) return;
    entranceStarted = true;
    root.classList.add('motion-entered');
    play(document.querySelector('#masthead'), [{opacity:0,transform:'translateY(-14px)'},{opacity:1,transform:'translateY(0)'}], {duration:900});
    [...heroTitle.querySelectorAll('.glyph')].forEach((glyph, i) => play(glyph,
      [{opacity:0,transform:'perspective(650px) translateY(70px) rotateX(-65deg)',filter:'blur(8px)'},{opacity:1,transform:'perspective(650px) translateY(0) rotateX(0)',filter:'blur(0)'}],
      {duration:1150,delay:100 + i*35,fill:'backwards'}));
    play(document.querySelector('.photo-52'), [{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)'}], {duration:1400,delay:180,fill:'backwards'});
    play(document.querySelector('.photo-64'), [{opacity:0,transform:'translateY(45px)'},{opacity:1,transform:'translateY(0)'}], {duration:1400,delay:280,fill:'backwards'});
  };
  // A late font/image never holds the page invisible. Content remains visible without JS.
  const startTimer = setTimeout(entrance, 900);
  Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), ...[...hero.querySelectorAll('img')].map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve())]).then(() => {clearTimeout(startTimer); entrance();});

  const revealTargets = [];
  for (const region of document.querySelectorAll('.region:not(.masthead):not(.hero):not(.statement):not(.pattern)')) {
    const nodes = [...region.children].filter(node => node.matches('.image-frame,.copy,.vector,.panel,.social-rule'));
    nodes.forEach((node, i) => {
      node.classList.add('motion-reveal');
      node.style.setProperty('--reveal-delay', `${Math.min(i % 5 * 65, 260)}ms`);
      revealTargets.push(node);
    });
  }
  const reveals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const node = entry.target;
      node.classList.add('is-revealed');
      const delay = Number.parseFloat(node.style.getPropertyValue('--reveal-delay')) || 0;
      if (node.matches('.image-frame')) {
        play(node, [{opacity:0,clipPath:'inset(0 0 18% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)'}], {duration:1250,delay,fill:'backwards'});
      } else {
        play(node, [{opacity:0,transform:'translateY(32px)'},{opacity:1,transform:'translateY(0)'}], {duration:950,delay,fill:'backwards'});
      }
      reveals.unobserve(node);
    }
  }, {threshold:.08,rootMargin:'0px 0px -3% 0px'});
  revealTargets.forEach(node => reveals.observe(node));
  // Protect restored sessions and keyboard navigation from waiting for a reveal.
  const revealOnFocus = e => {
    const node = e.target.closest('.motion-reveal');
    if (node) {node.classList.add('is-revealed'); reveals.unobserve(node);}
  };
  document.addEventListener('focusin', revealOnFocus);

  // The supplied typography already contains two repeat units. Add the next one
  // so the oversized editorial line loops without a visible gap.
  const track = document.createElement('div');
  track.className = 'marquee-track';
  const firstLine = document.querySelector('#copy-18');
  const secondLine = document.querySelector('#copy-19');
  const repeated = secondLine.cloneNode(true);
  repeated.removeAttribute('id');
  repeated.setAttribute('aria-hidden','true');
  repeated.style.left = `${parseFloat(secondLine.style.left) + 2729}px`;
  track.append(firstLine, secondLine, repeated);
  statement.append(track);
  const marquee = play(track, [{transform:'translateX(0)'},{transform:'translateX(-2729px)'}], {duration:33000,iterations:Infinity,easing:'linear'});
  marquee?.pause();
  let statementVisible = false;
  const statementObserver = new IntersectionObserver(entries => {
    statementVisible = entries[0].isIntersecting;
    if (marquee) statementVisible && !document.hidden ? marquee.play() : marquee.pause();
    if (statementVisible) {
      play(document.querySelector('#copy-16'), [{opacity:0,transform:'translateX(-60px)'},{opacity:1,transform:'translateX(0)'}], {duration:1200});
      play(document.querySelector('#copy-17'), [{opacity:0,transform:'translateX(60px)'},{opacity:1,transform:'translateX(0)'}], {duration:1200,delay:100,fill:'backwards'});
    }
  }, {threshold:.06});
  statementObserver.observe(statement);
  track.addEventListener('pointerenter', () => marquee?.pause());
  track.addEventListener('pointerleave', () => {if (statementVisible && !document.hidden) marquee?.play();});

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.append(progress);
  const wall = document.querySelector('.photo-52 img');
  const portrait = document.querySelector('.photo-64 img');
  const tilted = document.querySelector('.tilted');
  const tiltShell = document.createElement('div');
  tiltShell.className = 'tilt-shell';
  tilted.before(tiltShell);
  tiltShell.append(tilted);
  let scrollFrame = 0;
  let scrollBusy = false;
  const renderScroll = () => {
    scrollBusy = false;
    if (disposed) return;
    const sy = window.scrollY;
    const height = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    progress.style.transform = `scaleX(${clamp(sy / height, 0, 1)})`;
    // Work in design coordinates because the original stage scales as one unit.
    const heroOffset = clamp(sy / scale(), 0, 1400);
    if (hero.getBoundingClientRect().bottom > 0) {
      wall.style.transform = `translate3d(0,${heroOffset * .055}px,0)`;
      portrait.style.transform = `translate3d(0,${heroOffset * .024}px,0)`;
      heroTitle.style.transform = `translate3d(0,${heroOffset * .08}px,0)`;
    }
    if (statementVisible) {
      const box = statement.getBoundingClientRect();
      const t = clamp((innerHeight * .5 - box.top - box.height * .5) / innerHeight, -1, 1);
      tiltShell.style.setProperty('--float-y', `${t * -35}px`);
      tiltShell.style.setProperty('--float-r', `${t * 2}deg`);
    }
  };
  const onScroll = () => {if (!scrollBusy && !disposed) {scrollBusy=true;scrollFrame=requestAnimationFrame(renderScroll);}};
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', onScroll, {passive:true});
  renderScroll();

  // Precise magnetic motion on the original icons; image geometry stays intact.
  const magnets = [...document.querySelectorAll('.masthead button, .intro [data-action=studio], .collection .vector[data-action=shop]')];
  magnets.forEach(node => {
    let box;
    node.addEventListener('pointerenter', () => {if (finePointer.matches) box=node.getBoundingClientRect();});
    node.addEventListener('pointermove', e => {
      if (!box || !finePointer.matches || disposed) return;
      node.style.setProperty('--magnet-x', `${clamp((e.clientX-box.left-box.width/2)/scale()*.18,-16,16)}px`);
      node.style.setProperty('--magnet-y', `${clamp((e.clientY-box.top-box.height/2)/scale()*.18,-12,12)}px`);
    });
    node.addEventListener('pointerleave', () => {box=null;node.style.removeProperty('--magnet-x');node.style.removeProperty('--magnet-y');});
  });

  let cursorFrame = 0;
  let cursor = null;
  let activeImage = null;
  let pointerX = 0, pointerY = 0, cursorX = 0, cursorY = 0;
  const imageNodes = [...document.querySelectorAll('.image-frame:not(.photo-52):not(.photo-64)')];
  if (finePointer.matches) {
    root.classList.add('has-portfolio-cursor');
    cursor = document.createElement('div');
    cursor.className = 'portfolio-cursor';
    cursor.textContent = 'VIEW';
    cursor.setAttribute('aria-hidden','true');
    document.body.append(cursor);
    const tickCursor = () => {
      cursorX += (pointerX-cursorX)*.22;
      cursorY += (pointerY-cursorY)*.22;
      cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%)`;
      if (!disposed && Math.abs(pointerX-cursorX)+Math.abs(pointerY-cursorY)>.5) cursorFrame=requestAnimationFrame(tickCursor);
      else cursorFrame=0;
    };
    imageNodes.forEach(node => {
      node.addEventListener('pointerenter', e => {
        if (disposed || !finePointer.matches) return;
        activeImage=node;pointerX=cursorX=e.clientX;pointerY=cursorY=e.clientY;
        cursor.classList.add('is-active');node.classList.add('is-hovered');
        if (!cursorFrame) cursorFrame=requestAnimationFrame(tickCursor);
      });
      node.addEventListener('pointermove', e => {pointerX=e.clientX;pointerY=e.clientY;if (activeImage && !cursorFrame && !disposed) cursorFrame=requestAnimationFrame(tickCursor);});
      node.addEventListener('pointerleave', () => {activeImage=null;cursor.classList.remove('is-active');node.classList.remove('is-hovered');});
    });
  }
  const dialog = document.querySelector('#dialog');
  const dialogObserver = new MutationObserver(records => {
    if (records.some(record => record.attributeName === 'open') && dialog.open)
      play(dialog, [{opacity:0,transform:'translateY(22px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}], {duration:550});
  });
  dialogObserver.observe(dialog, {attributes:true,attributeFilter:['open']});
  const visibility = () => {
    if (document.hidden) {marquee?.pause(); if(cursorFrame) cancelAnimationFrame(cursorFrame);cursorFrame=0;}
    else if (statementVisible && !disposed) marquee?.play();
  };
  document.addEventListener('visibilitychange', visibility);

  // Changing the OS motion preference restores the static original immediately.
  const stop = (force = false) => {
    if (!force && !reduced.matches) return;
    disposed=true;
    clearTimeout(startTimer);
    root.classList.remove('motion-ready','has-portfolio-cursor');
    for (const animation of running) animation.cancel();
    running.clear();
    reveals.disconnect();statementObserver.disconnect();dialogObserver.disconnect();
    cancelAnimationFrame(scrollFrame);cancelAnimationFrame(cursorFrame);
    window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);
    document.removeEventListener('focusin',revealOnFocus);document.removeEventListener('visibilitychange',visibility);
    [wall,portrait,heroTitle].forEach(node => node.style.removeProperty('transform'));
    magnets.forEach(node=>{node.style.removeProperty('--magnet-x');node.style.removeProperty('--magnet-y');});
    tiltShell.before(tilted);
    statement.append(firstLine,secondLine);
    track.remove();tiltShell.remove();cursor?.remove();progress.remove();
    imageNodes.forEach(node=>node.classList.remove('is-hovered'));
  };
  reduced.addEventListener('change',()=>stop());
  window.CarharttMotion.setEnabled = wanted => {if (!wanted) stop(true);else if (disposed) location.reload();};
})();
