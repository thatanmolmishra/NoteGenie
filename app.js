/* ═══════════════════════════════════════════
   NoteGenie — Main Application JavaScript
   ═══════════════════════════════════════════ */

// ── Data Store ──────────────────────────────
const DATA = {
  notes: [
    { id:1, title:'Quantum Mechanics - Wave Functions', topic:'Physics', type:'PDF', size:'3.2 MB', date:'2 hours ago', icon:'📄', color:'#7C3AED', lastRevised: 8, starred:true, summary:'Wave-particle duality and the Schrödinger equation explain quantum states through probability amplitudes.' },
    { id:2, title:'Organic Chemistry Reactions', topic:'Chemistry', type:'PDF', size:'5.8 MB', date:'Yesterday', icon:'📄', color:'#0EA5E9', lastRevised: 3, starred:false, summary:'Nucleophilic and electrophilic reactions including SN1, SN2 mechanisms and their stereochemistry.' },
    { id:3, title:'Data Structures - Trees & Graphs', topic:'CS', type:'Note', size:'1.1 MB', date:'2 days ago', icon:'📝', color:'#10B981', lastRevised: 1, starred:true, summary:'BFS, DFS traversal algorithms, AVL trees, red-black trees and their time complexities.' },
    { id:4, title:'Linear Algebra - Eigenvectors', topic:'Mathematics', type:'Image', size:'2.4 MB', date:'3 days ago', icon:'🖼️', color:'#F59E0B', lastRevised: 12, starred:false, summary:'Eigenvalue decomposition, diagonalisation, PCA foundations and applications in machine learning.' },
    { id:5, title:'Operating Systems - Scheduling', topic:'CS', type:'PDF', size:'4.1 MB', date:'4 days ago', icon:'📄', color:'#EF4444', lastRevised: 5, starred:false, summary:'Round-robin, FCFS, SRTF scheduling algorithms analysis with Gantt charts and turnaround times.' },
    { id:6, title:'Electromagnetism Notes', topic:'Physics', type:'Note', size:'0.8 MB', date:'5 days ago', icon:'📝', color:'#7C3AED', lastRevised: 9, starred:true, summary:'Maxwell\'s equations in differential and integral forms, Faraday\'s law, and electromagnetic waves.' },
    { id:7, title:'Thermodynamics Laws', topic:'Physics', type:'PDF', size:'2.9 MB', date:'6 days ago', icon:'📄', color:'#06B6D4', lastRevised: 15, starred:false, summary:'Laws of thermodynamics, Carnot cycle, entropy changes and Gibbs free energy calculations.' },
    { id:8, title:'Dynamic Programming Patterns', topic:'CS', type:'Note', size:'1.4 MB', date:'1 week ago', icon:'📝', color:'#10B981', lastRevised: 2, starred:true, summary:'Memoization vs tabulation techniques with LCS, knapsack, and coin change problem solutions.' },
  ],
  topics: [
    { name:'Physics', count:14, color:'#7C3AED', pct:35 },
    { name:'Chemistry', count:8, color:'#0EA5E9', pct:20 },
    { name:'Computer Science', count:12, color:'#10B981', pct:30 },
    { name:'Mathematics', count:6, color:'#F59E0B', pct:15 },
    { name:'Biology', count:4, color:'#EF4444', pct:10 },
    { name:'History', count:3, color:'#A855F7', pct:8 },
  ],
  revisionDue: [
    { title:'Quantum Mechanics', topic:'Physics', lastRevised:8, difficulty:4, urgency:'high' },
    { title:'Organic Chemistry', topic:'Chemistry', lastRevised:7, difficulty:5, urgency:'high' },
    { title:'Linear Algebra', topic:'Mathematics', lastRevised:12, difficulty:3, urgency:'high' },
    { title:'Thermodynamics', topic:'Physics', lastRevised:6, difficulty:4, urgency:'med' },
    { title:'Theory of Computation', topic:'CS', lastRevised:5, difficulty:3, urgency:'med' },
  ],
  completed: [
    { title:'Data Structures Trees', date:'Today, 9:00 AM' },
    { title:'Operating Systems Scheduling', date:'Today, 7:30 AM' },
    { title:'Dynamic Programming Patterns', date:'Yesterday' },
    { title:'Graph Algorithms BFS/DFS', date:'Yesterday' },
  ],
  chatHistory: [],
};

const AI_RESPONSES = [
  { text: "Based on your notes on **Quantum Mechanics**, the wave function ψ(x,t) describes the probability amplitude of finding a particle at position x at time t. The Schrödinger equation governs its time evolution: iℏ ∂ψ/∂t = Ĥψ", source: 'Quantum Mechanics - Wave Functions.pdf · Page 3' },
  { text: "Your **Organic Chemistry** notes explain that SN2 reactions proceed through a concerted mechanism — the nucleophile attacks from the back face simultaneously as the leaving group departs. This results in **inversion of configuration** (Walden inversion).", source: 'Organic Chemistry Reactions.pdf · Page 12' },
  { text: "From your **Dynamic Programming** notes: The key insight is *optimal substructure* — the solution to a larger problem contains optimal solutions to sub-problems. Memoization (top-down) stores results, while tabulation (bottom-up) fills a table iteratively.", source: 'Dynamic Programming Patterns.md · Section 2' },
  { text: "Your **Linear Algebra** notes on eigenvectors state: For a square matrix A, vector v is an eigenvector if Av = λv, where λ is the eigenvalue. The characteristic equation det(A - λI) = 0 gives us the eigenvalues.", source: 'Linear Algebra - Eigenvectors.jpg · Page 1' },
  { text: "According to your **OS Scheduling** notes, Round-Robin uses a time quantum q. If q is too large it degrades to FCFS; if too small it becomes processor sharing. Optimal q is typically 10-100ms based on your lecture notes.", source: 'Operating Systems - Scheduling.pdf · Page 7' },
];

let currentView = 'dashboard';
let searchQuery = '';
let selectedTopic = null;
let chatMessageCount = 0;

// ── Utility ──────────────────────────────────
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initLogoOrb();
  initUploadOrb();
  initBotOrb();
  initNavigation();
  renderDashboard();
  renderFileGrid();
  renderTopics();
  renderChat();
  renderRevision();
  renderAnalytics();
  initUploadZone();
  initSearch();
  initChat();
  initModal();
  animateCounters();
  initMenuToggle();
});

// ── Navigation ──────────────────────────────
function initNavigation() {
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });

  $('uploadQuickBtn').addEventListener('click', () => switchView('upload'));
  $('addNoteBtn').addEventListener('click', () => switchView('upload'));

  $('globalSearchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      switchView('search');
      setTimeout(() => {
        $('semanticSearchInput').value = e.target.value;
        performSearch(e.target.value);
      }, 100);
    }
  });
}

function switchView(viewName) {
  // Close mobile sidebar
  $('sidebar').classList.remove('open');

  currentView = viewName;
  $$('.view').forEach(v => v.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));

  const viewEl = $('view-' + viewName);
  const navEl = $('nav-' + viewName);

  if (viewEl) viewEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  // Special inits
  if (viewName === 'topics') initTopicCanvas();
  if (viewName === 'analytics') initDonutChart();
}

// ── Mobile Menu ─────────────────────────────
function initMenuToggle() {
  $('menuToggle').addEventListener('click', () => {
    $('sidebar').classList.toggle('open');
  });
}

// ══════════════════════════════════════════
// 3D CANVAS EFFECTS
// ══════════════════════════════════════════

// ── Particle Background ──────────────────
function initParticles() {
  const canvas = $('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      const colors = ['124,58,237', '6,182,212', '16,185,129', '245,158,11'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 80) {
        this.x += dx / dist * 0.8;
        this.y += dy / dist * 0.8;
      }
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = `rgba(${this.color},1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist/100) * 0.06;
          ctx.strokeStyle = '#7C3AED';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
}

// ── Logo Orb ─────────────────────────────
function initLogoOrb() {
  drawSpinningOrb('logoOrb', 36, ['#7C3AED', '#06B6D4', '#A855F7'], 0.02);
}

// ── Upload Orb ───────────────────────────
function initUploadOrb() {
  drawSpinningOrb('uploadOrb', 120, ['#7C3AED', '#06B6D4', '#10B981'], 0.015);
}

// ── Bot Orb ──────────────────────────────
function initBotOrb() {
  drawSpinningOrb('botOrb', 60, ['#7C3AED', '#A855F7', '#06B6D4'], 0.025);
}

// ── AI Processing Orb ────────────────────
function initAiOrb() {
  drawSpinningOrb('aiOrb', 100, ['#7C3AED', '#06B6D4', '#10B981'], 0.03);
}

// Generic orb renderer
function drawSpinningOrb(canvasId, size, colors, speed) {
  const canvas = $(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let angle = 0, angle2 = 0;
  const cx = size/2, cy = size/2, r = size*0.38;

  function draw() {
    ctx.clearRect(0, 0, size, size);

    // Base glow
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size/2);
    gradient.addColorStop(0, colors[0] + 'AA');
    gradient.addColorStop(0.5, colors[1] + '44');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, size/2, 0, Math.PI*2);
    ctx.fill();

    // Orbiting rings
    [1, 0.7, 0.5].forEach((scale, i) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + i * (Math.PI*2/3));
      ctx.scale(1, 0.35 * scale);
      ctx.strokeStyle = colors[i % colors.length] + '60';
      ctx.lineWidth = size * 0.025;
      ctx.beginPath();
      ctx.arc(0, 0, r * scale, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    });

    // Inner core
    const coreGrad = ctx.createRadialGradient(cx-r*0.1, cy-r*0.1, 0, cx, cy, r*0.5);
    coreGrad.addColorStop(0, '#fff');
    coreGrad.addColorStop(0.3, colors[0]);
    coreGrad.addColorStop(1, colors[1] + '00');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r*0.45, 0, Math.PI*2);
    ctx.fill();

    // Orbiting dots
    for (let i = 0; i < 3; i++) {
      const theta = angle2 * 2 + i * (Math.PI*2/3);
      const ox = cx + Math.cos(theta) * r * 0.9;
      const oy = cy + Math.sin(theta) * r * 0.32;
      ctx.fillStyle = colors[(i+1) % colors.length];
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(ox, oy, size*0.04, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    angle += speed;
    angle2 += speed * 1.3;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Topic Canvas (Network Graph) ─────────
function initTopicCanvas() {
  const canvas = $('topicCanvas');
  if (!canvas) return;
  const overlay = $('topicCardsOverlay');
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  canvas.width = W; canvas.height = H;

  const nodes = DATA.topics.map((t, i) => {
    const angle = (i / DATA.topics.length) * Math.PI * 2 - Math.PI/2;
    const radius = Math.min(W, H) * 0.3;
    return {
      x: W/2 + Math.cos(angle) * radius,
      y: H/2 + Math.sin(angle) * radius,
      vx: (Math.random()-0.5) * 0.3,
      vy: (Math.random()-0.5) * 0.3,
      topic: t,
      r: 30 + t.count * 1.5,
    };
  });

  // Center node
  nodes.push({ x: W/2, y: H/2, vx:0, vy:0, topic:{name:'All Notes', count:47, color:'#7C3AED'}, r:50, isCenter:true });

  let animID;
  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    nodes.forEach(n => {
      if (!n.isCenter) {
        const center = nodes[nodes.length-1];
        ctx.save();
        const grad = ctx.createLinearGradient(n.x, n.y, center.x, center.y);
        grad.addColorStop(0, n.topic.color + '30');
        grad.addColorStop(1, '#7C3AED30');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(center.x, center.y);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw nodes
    nodes.forEach(n => {
      // Glow
      ctx.save();
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r*1.5);
      glow.addColorStop(0, n.topic.color + '25');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r*1.5, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      // Circle
      ctx.save();
      ctx.fillStyle = n.topic.color + '22';
      ctx.strokeStyle = n.topic.color + '88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(240,244,255,0.9)';
      ctx.font = `bold ${n.isCenter ? 13 : 11}px Space Grotesk, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.topic.name, n.x, n.y - 6);
      ctx.font = `10px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(136,146,164,0.9)';
      ctx.fillText(n.topic.count + ' notes', n.x, n.y + 8);
      ctx.restore();

      // Float
      n.x += n.vx; n.y += n.vy;
      if (n.x < n.r || n.x > W-n.r) n.vx *= -1;
      if (n.y < n.r || n.y > H-n.r) n.vy *= -1;
    });

    animID = requestAnimationFrame(animate);
  }
  animate();
}

// ══════════════════════════════════════════
// RENDER FUNCTIONS
// ══════════════════════════════════════════

// ── Dashboard ────────────────────────────
function renderDashboard() {
  const list = $('recentNotesList');
  DATA.notes.slice(0,5).forEach(note => {
    const div = document.createElement('div');
    div.className = 'note-item';
    div.style.setProperty('--accent', note.color);
    div.innerHTML = `
      <div class="note-icon">${note.icon}</div>
      <div class="note-info">
        <div class="note-name">${note.title}</div>
        <div class="note-meta">${note.topic} · ${note.date}</div>
      </div>
      <span class="note-badge">${note.type}</span>
    `;
    div.addEventListener('click', () => openNoteModal(note));
    list.appendChild(div);
  });

  const preview = $('clusterPreview');
  DATA.topics.sort((a,b) => b.count - a.count).slice(0,5).forEach(t => {
    const div = document.createElement('div');
    div.className = 'cluster-item';
    div.innerHTML = `
      <div class="cluster-top">
        <span class="cluster-name">${t.name}</span>
        <span class="cluster-count">${t.count} notes</span>
      </div>
      <div class="cluster-bar-track">
        <div class="cluster-bar-fill" style="width:0%;--accent:${t.color}" data-width="${t.pct}%"></div>
      </div>
    `;
    div.addEventListener('click', () => switchView('topics'));
    preview.appendChild(div);
  });

  // animate bars
  setTimeout(() => {
    $$('.cluster-bar-fill').forEach(b => {
      b.style.width = b.dataset.width;
      b.style.background = b.style.getPropertyValue('--accent') || 'var(--purple)';
    });
  }, 300);
}

// ── File Grid ─────────────────────────────
function renderFileGrid() {
  const grid = $('fileGrid');
  const typeColors = { PDF:'#EF4444', Image:'#0EA5E9', Note:'#10B981', DOCX:'#F59E0B' };

  DATA.notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'file-card';
    const tc = typeColors[note.type] || '#7C3AED';
    div.innerHTML = `
      <span class="file-card-type" style="background:${tc}22;color:${tc}">${note.type}</span>
      <span class="file-card-icon">${note.icon}</span>
      <div class="file-card-name">${note.title}</div>
      <div class="file-card-meta">${note.size} · ${note.date}</div>
      <div class="file-card-actions">
        <button class="file-action-btn" onclick="openSummary(${note.id})">✦ Summary</button>
        <button class="file-action-btn" onclick="openNoteModal(DATA.notes.find(n=>n.id===${note.id}))">View</button>
      </div>
    `;
    grid.appendChild(div);
  });
}

// ── Topics Render ─────────────────────────
function renderTopics() {
  // Topics rendered via canvas — see initTopicCanvas()
}

// ── Chat Render ──────────────────────────
function renderChat() {
  const sources = $('contextSources');
  DATA.notes.slice(0,5).forEach(note => {
    const div = document.createElement('div');
    div.className = 'context-source-item ' + (note.id <= 2 ? 'active' : '');
    div.innerHTML = `
      <span class="cs-icon">${note.icon}</span>
      <div>
        <div class="cs-name" title="${note.title}">${note.title}</div>
        <div class="cs-type">${note.type} · ${note.topic}</div>
      </div>
    `;
    div.addEventListener('click', () => div.classList.toggle('active'));
    sources.appendChild(div);
  });
}

// ── Revision Render ──────────────────────
function renderRevision() {
  // Heatmap
  const heatmap = $('revisionHeatmap');
  for (let i = 0; i < 52*5; i++) {
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    const rnd = Math.random();
    if (rnd > 0.85) cell.dataset.level = '4';
    else if (rnd > 0.7) cell.dataset.level = '3';
    else if (rnd > 0.55) cell.dataset.level = '2';
    else if (rnd > 0.4) cell.dataset.level = '1';
    heatmap.appendChild(cell);
  }

  // Due cards
  const cards = $('revisionCards');
  DATA.revisionDue.forEach(r => {
    const div = document.createElement('div');
    div.className = 'revision-card';
    const dots = Array.from({length:5}, (_,i) =>
      `<div class="diff-dot ${i < r.difficulty ? 'filled' : ''}"></div>`
    ).join('');
    div.innerHTML = `
      <div class="rev-urgency urgency-${r.urgency}"></div>
      <div class="rev-info">
        <div class="rev-title">${r.title}</div>
        <div class="rev-meta">${r.topic} · Not revised for ${r.lastRevised} days</div>
      </div>
      <div class="rev-difficulty">${dots}</div>
      <button class="rev-action" onclick="startRevision('${r.title}')">Revise Now</button>
    `;
    cards.appendChild(div);
  });

  // Completed
  const comp = $('completedList');
  DATA.completed.forEach(c => {
    const div = document.createElement('div');
    div.className = 'completed-item';
    div.innerHTML = `
      <div class="completed-check">✓</div>
      <span class="completed-name">${c.title}</span>
      <span class="completed-date">${c.date}</span>
    `;
    comp.appendChild(div);
  });
}

// ── Analytics Render ─────────────────────
function renderAnalytics() {
  // Weekly bar chart
  const chart = $('weeklyChart');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vals = [3, 6, 4, 8, 5, 11, 7];
  const maxV = Math.max(...vals);
  days.forEach((d,i) => {
    const col = document.createElement('div');
    col.className = 'bar-col';
    const pct = (vals[i]/maxV) * 100;
    col.innerHTML = `
      <span class="bar-val">${vals[i]}</span>
      <div class="bar-fill" data-h="${pct}" style="height:0;background:linear-gradient(180deg,#7C3AED,rgba(124,58,237,0.2))"></div>
      <span class="bar-label">${d}</span>
    `;
    chart.appendChild(col);
  });
  setTimeout(() => {
    $$('.bar-fill').forEach(b => {
      b.style.transition = 'height 1s cubic-bezier(0.4,0,0.2,1)';
      b.style.height = b.dataset.h + '%';
    });
  }, 200);

  // Top categories
  const catList = $('topCatList');
  DATA.topics.slice(0,5).forEach((t,i) => {
    const div = document.createElement('div');
    div.className = 'cat-item';
    div.innerHTML = `
      <div class="cat-rank">${i+1}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between">
          <span class="cat-name">${t.name}</span>
          <span class="cat-count">${t.count} notes</span>
        </div>
        <div class="cat-bar"><div class="cat-bar-fill" style="width:0%;background:${t.color}" data-w="${t.pct}%"></div></div>
      </div>
    `;
    catList.appendChild(div);
  });
  setTimeout(() => {
    $$('.cat-bar-fill').forEach(b => { b.style.width = b.dataset.w; });
  }, 500);

  // Frequency chart
  const freq = $('freqChart');
  const freqColors = ['#7C3AED','#0EA5E9','#10B981','#F59E0B','#EF4444','#A855F7'];
  for (let i = 0; i < 30; i++) {
    const bar = document.createElement('div');
    bar.className = 'freq-bar';
    const h = Math.random() * 70 + 10;
    bar.style.height = h + '%';
    bar.style.background = freqColors[Math.floor(Math.random()*freqColors.length)] + 'BB';
    freq.appendChild(bar);
  }
}

// ── Donut Chart ──────────────────────────
function initDonutChart() {
  const canvas = $('donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 100, cy = 100, r = 72, lineW = 18;
  let angles = [], total = DATA.topics.reduce((s,t) => s+t.count, 0);
  let current = 0;

  DATA.topics.forEach(t => {
    angles.push({ start: current/total * Math.PI*2 - Math.PI/2, end: (current+t.count)/total * Math.PI*2 - Math.PI/2, color: t.color, name: t.name });
    current += t.count;
  });

  // Animate
  let progress = 0;
  function drawDonut() {
    ctx.clearRect(0, 0, 200, 200);
    progress = Math.min(progress + 0.04, 1);

    // BG circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = lineW;
    ctx.stroke();

    // Segments
    angles.forEach(s => {
      const endAngle = s.start + (s.end - s.start) * progress;
      ctx.beginPath();
      ctx.arc(cx, cy, r, s.start, endAngle);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = lineW;
      ctx.lineCap = 'round';
      ctx.stroke();
    });

    // Center text
    ctx.fillStyle = 'rgba(240,244,255,0.9)';
    ctx.font = 'bold 22px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);
    ctx.fillStyle = 'rgba(136,146,164,0.8)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('notes', cx, cy + 10);

    if (progress < 1) requestAnimationFrame(drawDonut);
  }
  drawDonut();

  // Legend
  const legend = $('donutLegend');
  legend.innerHTML = '';
  DATA.topics.forEach(t => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-dot" style="background:${t.color}"></div><span>${t.name} (${t.count})</span>`;
    legend.appendChild(item);
  });
}

// ══════════════════════════════════════════
// UPLOAD FUNCTIONALITY
// ══════════════════════════════════════════
function initUploadZone() {
  const zone = $('uploadZone');
  const input = $('fileInput');
  const browse = $('browseBtn');

  browse.addEventListener('click', () => input.click());
  zone.addEventListener('click', (e) => { if (e.target !== browse) input.click(); });

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files));
  });

  input.addEventListener('change', () => handleFiles(Array.from(input.files)));
}

function handleFiles(files) {
  if (!files.length) return;
  const queue = $('uploadQueue');
  const items = $('queueItems');
  queue.style.display = 'block';

  files.forEach(file => {
    const ext = file.name.split('.').pop().toUpperCase();
    const icons = { PDF:'📄', PNG:'🖼️', JPG:'🖼️', JPEG:'🖼️', TXT:'📝', DOCX:'📄' };
    const icon = icons[ext] || '📎';

    const item = document.createElement('div');
    item.className = 'queue-item';
    item.id = 'qi-' + Date.now();
    item.innerHTML = `
      <span class="queue-file-icon">${icon}</span>
      <div class="queue-info">
        <div class="queue-name">${file.name}</div>
        <div class="queue-status">Uploading…</div>
        <div class="queue-progress-track"><div class="queue-progress-fill" style="width:0%"></div></div>
      </div>
    `;
    items.appendChild(item);

    simulateUpload(item, file.name, icon, ext, file);
  });
}

async function simulateUpload(item, name, icon, ext, file) {
  const fill = item.querySelector('.queue-progress-fill');
  const status = item.querySelector('.queue-status');
  
  fill.style.width = '30%';
  status.textContent = 'Uploading & analyzing...';

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://notegenie-rt35.onrender.com/api/upload', {
      method: 'POST',
      body: formData
    });
    
    fill.style.width = '80%';
    status.textContent = 'Generating AI summary...';
    
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Upload failed');
    }
    const newNote = await response.json();
    
    fill.style.width = '100%';
    status.textContent = '✨ Summary generated!';
    fill.style.background = 'linear-gradient(90deg, #10B981, #06B6D4)';
    item.style.borderColor = 'rgba(16,185,129,0.3)';

    // Add to notes state
    DATA.notes.unshift(newNote);

    // Refresh file grid
    const grid = $('fileGrid');
    grid.innerHTML = '';
    renderFileGrid();
    
  } catch (error) {
    status.textContent = '❌ ' + error.message;
    fill.style.background = '#ef4444';
    item.style.borderColor = 'rgba(239,68,68,0.3)';
    console.error(error);
  }
}

// ══════════════════════════════════════════
// SEARCH FUNCTIONALITY
// ══════════════════════════════════════════
function initSearch() {
  const input = $('semanticSearchInput');
  const submit = $('searchSubmit');

  const doSearch = () => performSearch(input.value);
  submit.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (input.value) doSearch();
    });
  });
}

function setSearch(query) {
  switchView('search');
  setTimeout(() => {
    $('semanticSearchInput').value = query;
    performSearch(query);
  }, 100);
}

function performSearch(query) {
  if (!query.trim()) return;
  searchQuery = query;
  const results = $('searchResults');
  results.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted)">Searching with AI…</div>';

  setTimeout(() => {
    const q = query.toLowerCase();
    // Fuzzy: split query into words and match any word
    const words = q.split(/\s+/).filter(w => w.length > 2);
    const synonyms = {
      'physics': ['quantum', 'mechanics', 'electro', 'wave', 'thermodynamics'],
      'math': ['algebra', 'linear', 'calculus', 'eigen'],
      'cs': ['data structures', 'algorithm', 'operating', 'dynamic'],
      'chem': ['organic', 'chemistry', 'reaction'],
    };
    const filtered = DATA.notes.filter(n => {
      const haystack = (n.title + ' ' + n.topic + ' ' + n.summary).toLowerCase();
      return words.some(w => haystack.includes(w)) || q.split(/\s+/).some(w => haystack.includes(w));
    });

    if (!filtered.length) {
      results.innerHTML = `<div class="search-empty-state"><div class="empty-3d-orb"></div><p>No results found for "<strong>${query}</strong>"</p></div>`;
      return;
    }

    results.innerHTML = `<p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Found ${filtered.length} result${filtered.length > 1 ? 's' : ''} for "<strong style="color:var(--text-primary)">${query}</strong>"</p>`;

    filtered.forEach((note, i) => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.style.animationDelay = (i * 0.06) + 's';

      const highlight = (text) => {
        const re = new RegExp('(' + query + ')', 'gi');
        return text.replace(re, '<mark>$1</mark>');
      };

      div.innerHTML = `
        <div class="result-source">
          <span class="result-source-icon">${note.icon}</span>
          <span class="result-source-name">${note.topic} · ${note.type} · ${note.date}</span>
        </div>
        <div class="result-title">${highlight(note.title)}</div>
        <div class="result-snippet">${highlight(note.summary)}</div>
        <div class="result-relevance">${Math.round(80 + Math.random()*18)}% match</div>
      `;
      div.addEventListener('click', () => openNoteModal(note));
      results.appendChild(div);
    });
  }, 700);
}

// ══════════════════════════════════════════
// CHAT FUNCTIONALITY
// ══════════════════════════════════════════
function initChat() {
  const input = $('chatInput');
  const send = $('chatSend');

  const doSend = async () => {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    addChatMessage('user', msg);
    setTimeout(() => showTyping(), 300);

    try {
      const response = await fetch('https://notegenie-rt35.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: [] })
      });
      removeTyping();
      if (!response.ok) throw new Error('Chat failed');
      const data = await response.json();
      addChatMessage('bot', data.answer);
    } catch (err) {
      removeTyping();
      addChatMessage('bot', "❌ Error: Could not connect to NoteGenie AI backend. Ensure `node server.js` is running.");
      console.error(err);
    }
  };

  send.addEventListener('click', doSend);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSend(); });
}

function addChatMessage(role, text, source) {
  const messages = $('chatMessages');
  const welcome = messages.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  const div = document.createElement('div');
  div.className = `chat-message ${role}`;

  const avatarHtml = role === 'bot'
    ? '<div class="msg-avatar bot">AI</div>'
    : '<div class="msg-avatar user">AM</div>';

  const md = text
    .replace(/^### (.*$)/gim, '<h3 style="margin-top:10px;margin-bottom:6px">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="margin-top:10px;margin-bottom:6px">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="margin-top:10px;margin-bottom:6px">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li style="margin-left:20px;margin-bottom:4px">$1</li>')
    .replace(/^- (.*$)/gim, '<li style="margin-left:20px;margin-bottom:4px">$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  const sourceHtml = source ? `<div class="msg-source">📎 ${source}</div>` : '';

  div.innerHTML = `
    ${avatarHtml}
    <div class="msg-bubble">${md}${sourceHtml}</div>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = $('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-message bot';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="msg-avatar bot">AI</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const t = $('typingIndicator');
  if (t) t.remove();
}

// ══════════════════════════════════════════
// NOTE MODAL
// ══════════════════════════════════════════
function initModal() {
  $('modalClose').addEventListener('click', closeModal);
  $('noteModalOverlay').addEventListener('click', (e) => {
    if (e.target === $('noteModalOverlay')) closeModal();
  });
}

function openNoteModal(note) {
  $('noteModalOverlay').style.display = 'flex';
  $('noteModalBody').innerHTML = `
    <div style="display:flex;gap:16px;margin-bottom:20px;align-items:center">
      <div style="width:56px;height:56px;border-radius:14px;background:${note.color}22;border:1px solid ${note.color}44;display:flex;align-items:center;justify-content:center;font-size:28px;">${note.icon}</div>
      <div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:4px">${note.title}</h3>
        <div style="font-size:13px;color:var(--text-secondary)">${note.topic} · ${note.type} · ${note.size}</div>
      </div>
      <button class="btn-primary" style="margin-left:auto" onclick="switchView('chat')">💬 Chat</button>
    </div>
    <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:10px">AI Summary</div>
      <p style="font-size:14px;line-height:1.7;color:var(--text-secondary)">${note.summary}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
      <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">Last Revised</div>
        <div style="font-size:16px;font-weight:700;color:var(--amber)">${note.lastRevised}d ago</div>
      </div>
      <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">File Type</div>
        <div style="font-size:16px;font-weight:700;color:var(--cyan)">${note.type}</div>
      </div>
      <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
        <div style="font-size:10px;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px">Topic</div>
        <div style="font-size:16px;font-weight:700;color:var(--purple-light)">${note.topic}</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn-primary" onclick="startRevision('${note.title}');closeModal()">▶ Start Revision</button>
      <button class="btn-secondary" onclick="openSummary(${note.id});closeModal()">✦ View Summary</button>
      <button class="btn-secondary" style="margin-left:auto;color:var(--red);border-color:rgba(239,68,68,0.3)">🗑 Delete</button>
    </div>
  `;
}

function closeModal() {
  $('noteModalOverlay').style.display = 'none';
}

// ── Revision Start ────────────────────────
function startRevision(title) {
  switchView('chat');
  setTimeout(() => {
    $('chatInput').value = `Help me revise: ${title}`;
    $('chatSend').click();
  }, 200);
}

// ── Summary ───────────────────────────────
function openSummary(id) {
  const note = DATA.notes.find(n => n.id === id);
  if (!note) return;
  openNoteModal(note);
}

// ── Counter Animations ────────────────────
function animateCounters() {
  $$('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(interval);
    }, 16);
  });
}

// Restart counters when revision view loaded
const origSwitch = switchView;
window.switchView = function(view) {
  origSwitch(view);
  if (view === 'revision') {
    $$('.counter').forEach(el => {
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(interval);
      }, 16);
    });
  }
};
