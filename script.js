const root = document.documentElement;
const body = document.body;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Footer and live Nepal time.
const yearEl = document.getElementById('year');
const clockEl = document.getElementById('statusClock');
const syncEl = document.getElementById('syncTime');
yearEl.textContent = new Date().getFullYear();
function updateClock(){
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kathmandu',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(now);
  const get = type => parts.find(part => part.type === type)?.value || '--';
  const current = `${get('hour')}:${get('minute')}:${get('second')} NPT`;
  clockEl.textContent = current;
  syncEl.textContent = `today · ${current}`;
}
updateClock();
setInterval(updateClock, 1000);

// Theme preference with a small, persistent control.
const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('hari-theme');
if(storedTheme === 'light') body.classList.add('light');
function updateThemeButton(){
  const light = body.classList.contains('light');
  themeToggle.setAttribute('aria-pressed', String(light));
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  themeToggle.querySelector('.theme-icon').textContent = light ? '☼' : '◐';
}
updateThemeButton();
themeToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  localStorage.setItem('hari-theme', body.classList.contains('light') ? 'light' : 'dark');
  updateThemeButton();
});

// Mobile navigation.
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
function closeMenu(){
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation');
}
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

// Scroll chrome: navbar state, progress bar, and active section.
const navbar = document.getElementById('navbar');
const progress = document.getElementById('scrollProgress');
const sectionLinks = [...document.querySelectorAll('.nav-link')];
const observedSections = sectionLinks.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
function updateScrollChrome(){
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0}%`;
  navbar.classList.toggle('scrolled', scrollTop > 20);
}
window.addEventListener('scroll', updateScrollChrome, {passive:true});
updateScrollChrome();
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      sectionLinks.forEach(link => link.classList.toggle('active', link.dataset.section === entry.target.id));
    }
  });
},{rootMargin:'-28% 0px -58% 0px',threshold:0});
observedSections.forEach(section => sectionObserver.observe(section));

// Reveal sections as they enter the viewport.
const revealItems = document.querySelectorAll('.reveal');
if(reduceMotion){ revealItems.forEach(item => item.classList.add('in-view')); }
else{
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry,index) => {
      if(entry.isIntersecting){
        entry.target.style.transitionDelay = `${Math.min(index * 35, 180)}ms`;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  revealItems.forEach(item => revealObserver.observe(item));
}

// Metric count-up.
const countItems = document.querySelectorAll('.count');
function animateCount(el){
  const target = Number(el.dataset.count);
  if(reduceMotion){el.textContent = target;return;}
  const started = performance.now();
  const duration = 950;
  function step(now){
    const progressValue = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    el.textContent = Math.round(target * eased);
    if(progressValue < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){animateCount(entry.target);countObserver.unobserve(entry.target);}
  });
},{threshold:.8});
countItems.forEach(item => countObserver.observe(item));

// Project filters.
const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  const filter = button.dataset.filter;
  projectCards.forEach(card => {
    const visible = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('is-hidden', !visible);
    if(visible){card.classList.remove('in-view');requestAnimationFrame(() => card.classList.add('in-view'));}
  });
}));

// Copy contact detail with a visible confirmation.
const toast = document.getElementById('toast');
let toastTimer;
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
document.querySelectorAll('.copy-button').forEach(button => button.addEventListener('click', async () => {
  const value = button.dataset.copy;
  try{
    await navigator.clipboard.writeText(value);
    showToast('Email copied to clipboard');
    button.querySelector('span').textContent = 'copied';
    setTimeout(() => {button.querySelector('span').textContent = 'copy';}, 1800);
  }catch(error){
    showToast(value);
  }
}));

// Lightweight network field for the hero. It is decorative and respects reduced motion.
(function networkCanvas(){
  const canvas = document.getElementById('netCanvas');
  const ctx = canvas.getContext('2d');
  let width = 0; let height = 0; let dpr = 1; let nodes = []; let pulses = []; let lastPulse = 0;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = width < 650 ? 9 : 17;
    nodes = Array.from({length:count},(_,index) => {
      const angle = (index / count) * Math.PI * 2 + (index % 3) * .09;
      const radius = Math.min(width,height) * (.32 + (index % 4) * .045);
      return {x:width*.51 + Math.cos(angle)*radius,y:height*.48 + Math.sin(angle)*radius,r:1.5 + (index%3)*.5,phase:index*1.31};
    });
  }
  function spawnPulse(){
    const target = nodes[Math.floor(Math.random()*nodes.length)];
    if(target) pulses.push({target,t:0});
  }
  function draw(time){
    ctx.clearRect(0,0,width,height);
    const hub = {x:width*.51,y:height*.48};
    nodes.forEach(node => {ctx.strokeStyle='rgba(109,231,207,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hub.x,hub.y);ctx.lineTo(node.x,node.y);ctx.stroke();});
    nodes.forEach(node => {const bob=reduceMotion?0:Math.sin(time/1150+node.phase)*2;ctx.fillStyle='rgba(243,247,247,.48)';ctx.beginPath();ctx.arc(node.x,node.y+bob,node.r,0,Math.PI*2);ctx.fill();});
    const glow=10 + (reduceMotion?0:Math.sin(time/700)*2);const gradient=ctx.createRadialGradient(hub.x,hub.y,0,hub.x,hub.y,glow*4);gradient.addColorStop(0,'rgba(109,231,207,.32)');gradient.addColorStop(1,'rgba(109,231,207,0)');ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(hub.x,hub.y,glow*4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6de7cf';ctx.beginPath();ctx.arc(hub.x,hub.y,3.5,0,Math.PI*2);ctx.fill();
    pulses.forEach(pulse => {pulse.t += .013;const x=hub.x+(pulse.target.x-hub.x)*pulse.t;const y=hub.y+(pulse.target.y-hub.y)*pulse.t;ctx.fillStyle=`rgba(243,188,114,${Math.sin(Math.min(pulse.t,1)*Math.PI)})`;ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();});
    pulses=pulses.filter(pulse => pulse.t<1);
    if(!reduceMotion && time-lastPulse>800){spawnPulse();lastPulse=time;requestAnimationFrame(draw);}
  }
  resize();window.addEventListener('resize',resize);draw(0);if(!reduceMotion)requestAnimationFrame(draw);
})();
