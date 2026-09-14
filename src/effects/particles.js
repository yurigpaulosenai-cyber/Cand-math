import { $ } from '../utils/dom.js';

let canvas, ctx2d;
const CONFETTI_COLORS = ['#FF6B9D','#FFD93D','#4ECDC4','#9B5DE5','#FF9A3C','#6BCB77','#3DBBFF'];
const particles = [];
let animating = false;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function setupParticleCanvas() {
  canvas = $('particleCanvas');
  if (!canvas) return;
  ctx2d  = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function showConfetti() {
  for (let i = 0; i < 50; i++) {
    setTimeout(() => spawnParticle(), i * 20);
  }
}

export function spawnLevelUpConfetti() {
  for (let i = 0; i < 120; i++) {
    setTimeout(() => spawnParticle(true), i * 15);
  }
}

function spawnParticle(big = false) {
  if (!canvas) return;
  particles.push({
    x: Math.random() * canvas.width,
    y: -10,
    vx: (Math.random()-0.5) * (big?6:4),
    vy: Math.random() * (big?5:3) + 2,
    size: Math.random()*(big?14:10)+4,
    color: pick(CONFETTI_COLORS),
    rot: Math.random()*360,
    rotV: (Math.random()-0.5)*10,
    life: 1,
    decay: Math.random()*0.01+0.008,
  });
  if (!animating) animateParticles();
}

function animateParticles() {
  if (!particles.length || !canvas) { animating=false; return; }
  animating = true;
  ctx2d.clearRect(0,0,canvas.width,canvas.height);
  for (let i = particles.length-1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.life -= p.decay;
    if (p.life <= 0 || p.y > canvas.height) { particles.splice(i,1); continue; }
    ctx2d.save();
    ctx2d.globalAlpha = p.life;
    ctx2d.fillStyle = p.color;
    ctx2d.translate(p.x, p.y);
    ctx2d.rotate(p.rot * Math.PI/180);
    ctx2d.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.5);
    ctx2d.restore();
  }
  requestAnimationFrame(animateParticles);
}
