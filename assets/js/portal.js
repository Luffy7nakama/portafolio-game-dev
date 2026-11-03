/* Android Runner — portal. GSAP and all assets are served locally. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const burger = $('.burger'), menu = $('#menu');
  const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded','false'); };
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', menu.classList.toggle('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); burger.focus(); } });
  const links = [...menu.querySelectorAll('a')];
  new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting) links.forEach(l => {
      const active = l.hash === '#' + e.target.id;
      l.classList.toggle('on',active);
      if(active) l.setAttribute('aria-current','location'); else l.removeAttribute('aria-current');
    });
  }),{rootMargin:'-15% 0px -60% 0px'}).observe($('#inicio'));
  const sectionSpy = new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting) links.forEach(l => {
      const active = l.hash === '#' + e.target.id;
      l.classList.toggle('on',active);
      if(active) l.setAttribute('aria-current','location'); else l.removeAttribute('aria-current');
    });
  }),{rootMargin:'-15% 0px -60% 0px'});
  document.querySelectorAll('.block[id]').forEach(s => sectionSpy.observe(s));

  // Load Unity only after an explicit click, leaving the landing page light.
  $('#play').addEventListener('click', () => {
    if($('#stage iframe')) return;
    const f = document.createElement('iframe');
    f.title = 'Android Runner — juego Unity WebGL';
    f.allow = 'fullscreen; autoplay; gamepad'; f.allowFullscreen = true;
    f.src = 'juego/index.html';
    f.addEventListener('load', () => f.focus(), {once:true});
    $('#stage').appendChild(f); $('#cover').remove();
  });

  // Highlight controls while reading the guide, without intercepting browser keys.
  const controlKeys = ['ArrowUp','ArrowDown','c','r',' ','x','z'];
  document.addEventListener('keydown', e => {
    if(/INPUT|TEXTAREA|BUTTON/.test(e.target.tagName)) return;
    const i = controlKeys.indexOf(e.key.length===1 ? e.key.toLowerCase() : e.key);
    if(i>=0) document.querySelectorAll('.key')[i].classList.add('pressed');
  });
  const release = () => document.querySelectorAll('.key.pressed').forEach(k=>k.classList.remove('pressed'));
  document.addEventListener('keyup',release); window.addEventListener('blur',release);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let context, manualPause = false;
  const toggle = $('.motion-toggle');
  function setupMotion() {
    if(context) { context.revert(); context = null; }
    document.querySelectorAll('[data-count]').forEach(el => { el.textContent=el.hasAttribute('data-sep') ? Number(el.dataset.count).toLocaleString('es-BO') : el.dataset.count; });
    const paused = manualPause || reduced.matches;
    document.body.classList.toggle('motion-paused',paused);
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent = paused ? 'Activar animaciones' : 'Pausar animaciones';
    toggle.disabled = reduced.matches;
    if(reduced.matches) { toggle.textContent = 'Movimiento reducido'; return; }
    if(paused || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    context = gsap.context(() => {
      const intro=gsap.timeline({defaults:{ease:'power3.out'}});
      intro.from('.title-line',{y:85,opacity:0,duration:1,stagger:.12})
        .from('.hero-meta,.hero-bottom,.quick',{y:25,opacity:0,duration:.65,stagger:.12},'-.5');
      gsap.to('#progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.25}});
      gsap.fromTo('#shot img',{scale:1.02,yPercent:0},{scale:1.26,yPercent:7,ease:'none',scrollTrigger:{trigger:'.cinema',start:'top 84px',end:'bottom bottom',scrub:.7}});
      gsap.fromTo('.cinema-copy',{y:80,opacity:0},{y:-25,opacity:1,ease:'none',scrollTrigger:{trigger:'.cinema',start:'top 65%',end:'70% bottom',scrub:.6}});
      gsap.to('.cinema-meter span',{scaleX:1,ease:'none',scrollTrigger:{trigger:'.cinema',start:'top 84px',end:'bottom bottom',scrub:true}});
      // Use DOM text nodes to preserve the emphasized phrase and accessible spacing.
      const statement=$('#statement');
      const words=[];
      const split = parent => [...parent.childNodes].forEach(node => {
        if(node.nodeType===3) {
          const fragment=document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(word=>{
            if(!word.trim()) fragment.appendChild(document.createTextNode(word));
            else { const span=document.createElement('span'); span.textContent=word; words.push(span); fragment.appendChild(span); }
          });
          node.replaceWith(fragment);
        } else if(node.nodeType===1) split(node);
      });
      const original=statement.innerHTML; split(statement);
      gsap.from(words,{opacity:.17,stagger:.06,ease:'none',scrollTrigger:{trigger:statement,start:'top 85%',end:'bottom 45%',scrub:.4}});
      document.querySelectorAll('.block > .wrap > h2,.block .intro,.story .card,.trait,.skills li,.mech > div,.charts .card,.req .card').forEach(el=>{
        gsap.from(el,{y:35,opacity:0,duration:.75,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 93%',once:true}});
      });
      gsap.from('#log > div',{opacity:0,x:-15,stagger:.25,duration:.55,scrollTrigger:{trigger:'#log',start:'top 90%'}});
      const mm = gsap.matchMedia();
      mm.add('(min-width: 861px)',()=>{
        const track=$('#bosses');
        const distance=()=>Math.max(0,track.scrollWidth-innerWidth);
        gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:'#bosses-pin',start:'top 84px',end:()=>'+='+distance(),pin:true,scrub:.65,invalidateOnRefresh:true}});
      });
      ScrollTrigger.create({trigger:'#personaje',start:'top bottom',end:'bottom top',onUpdate:s=>window.charScroll=s.progress});
      gsap.from('.key',{y:30,opacity:0,stagger:.06,duration:.65,ease:'power3.out',scrollTrigger:{trigger:'#keys',start:'top 90%'}});
      gsap.from('.stat',{y:30,opacity:0,stagger:.07,duration:.65,scrollTrigger:{trigger:'#stats',start:'top 90%'}});
      document.querySelectorAll('[data-count]').forEach(el=>{
        const value={n:0};
        gsap.to(value,{n:+el.dataset.count,duration:1.5,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 95%'},onUpdate:()=>{el.textContent=el.hasAttribute('data-sep') ? Math.round(value.n).toLocaleString('es-BO') : Math.round(value.n);}});
      });
      gsap.from('.fl',{scaleX:0,duration:1.2,stagger:.1,scrollTrigger:{trigger:'#bars',start:'top 85%'}});
      const line=$('#speed-line'), length=line.getTotalLength();
      gsap.fromTo(line,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.speed',start:'top 85%',end:'bottom 80%',scrub:.5}});
      gsap.fromTo('#game',{scale:.94},{scale:1,ease:'none',scrollTrigger:{trigger:'#game',start:'top 95%',end:'top 35%',scrub:.6}});
      return () => { mm.revert(); statement.innerHTML=original; };
    });
    ScrollTrigger.refresh();
  }
  toggle.addEventListener('click',()=>{manualPause=!manualPause;setupMotion();});
  reduced.addEventListener('change',setupMotion);
  setupMotion();
  window.addEventListener('load',()=>window.ScrollTrigger?.refresh(),{once:true});
  document.fonts?.ready.then(()=>window.ScrollTrigger?.refresh());
})();
