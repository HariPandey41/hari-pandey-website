// ===========================================================
// Footer year
// ===========================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ===========================================================
// Live status clock (Nepal time, purely decorative "systems" feel)
// ===========================================================
const clockEl = document.getElementById('statusClock');
function tickClock(){
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(now);
  const get = t => parts.find(p => p.type === t).value;
  clockEl.textContent = `${get('hour')}:${get('minute')}:${get('second')} NPT`;
}
tickClock();
setInterval(tickClock, 1000);

// ===========================================================
// Mobile nav toggle
// ===========================================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===========================================================
// Scroll reveal
// ===========================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.reveal');
if (reduceMotion) {
  revealItems.forEach(el => el.classList.add('in-view'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach(el => io.observe(el));
}

// ===========================================================
// Count-up stats
// ===========================================================
const stats = document.querySelectorAll('.stat-num');
function animateCount(el){
  const target = parseInt(el.dataset.count, 10);
  if (reduceMotion) { el.textContent = target; return; }
  const duration = 1200;
  const start = performance.now();
  function step(now){
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
stats.forEach(s => statIO.observe(s));

// ===========================================================
// Hero network canvas — branch nodes reporting to a central node.
// A quiet nod to what the job actually is: keeping a distributed
// branch network alive and talking to Head Office.
// ===========================================================
(function networkCanvas(){
  const canvas = document.getElementById('netCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let nodes = [];
  let hub;
  let pulses = [];
  let lastPulse = 0;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNodes();
  }

  function buildNodes(){
    const count = w < 640 ? 8 : 14;
    hub = { x: w * 0.5, y: h * 0.46, r: 5 };
    nodes = [];
    for (let i = 0; i < count; i++){
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const radius = Math.min(w, h) * (0.32 + Math.random() * 0.22);
      nodes.push({
        x: hub.x + Math.cos(angle) * radius,
        y: hub.y + Math.sin(angle) * radius,
        r: 2 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.4
      });
    }
  }

  function spawnPulse(){
    if (!nodes.length) return;
    const target = nodes[Math.floor(Math.random() * nodes.length)];
    pulses.push({ x: hub.x, y: hub.y, tx: target.x, ty: target.y, t: 0 });
  }

  function draw(time){
    ctx.clearRect(0, 0, w, h);

    // lines hub -> node
    ctx.lineWidth = 1;
    nodes.forEach(n => {
      ctx.strokeStyle = 'rgba(63,224,197,0.10)';
      ctx.beginPath();
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    });

    // hub
    const hubGlow = 6 + Math.sin(time / 500) * 2;
    const grad = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, hubGlow * 3);
    grad.addColorStop(0, 'rgba(63,224,197,0.35)');
    grad.addColorStop(1, 'rgba(63,224,197,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, hubGlow * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3FE0C5';
    ctx.beginPath();
    ctx.arc(hub.x, hub.y, hub.r, 0, Math.PI * 2);
    ctx.fill();

    // nodes (gentle bob)
    nodes.forEach(n => {
      const bob = Math.sin(time / 1000 * n.speed + n.phase) * 2;
      ctx.fillStyle = 'rgba(234,240,245,0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y + bob, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // pulses traveling from hub to a node
    pulses.forEach(p => {
      p.t += 0.014;
      const x = p.x + (p.tx - p.x) * p.t;
      const y = p.y + (p.ty - p.y) * p.t;
      const alpha = Math.sin(Math.min(p.t, 1) * Math.PI);
      ctx.fillStyle = `rgba(232,179,85,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    pulses = pulses.filter(p => p.t < 1);

    if (time - lastPulse > 700){
      spawnPulse();
      lastPulse = time;
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);

  if (reduceMotion){
    draw(0); // static single frame
  } else {
    requestAnimationFrame(draw);
  }
})();
