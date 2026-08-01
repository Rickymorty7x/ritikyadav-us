// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => {
  links.classList.toggle('open');
});
links?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => links.classList.remove('open'))
);

// Reveal-on-scroll with late-bound cards (blog + projects may render after fetch)
const revealSelector = '.section-head, .about-card, .focus-card, .skill, .contact-card, .stat, .music-card, .love-card, .love-section-label';
const revealTargets = document.querySelectorAll(revealSelector);
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), (i % 6) * 60);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observeRevealed(nodes) {
  const list = typeof nodes === 'string' ? document.querySelectorAll(nodes) : nodes;
  list.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
}

revealTargets.forEach(el => io.observe(el));

/* ---------------- Music Player (YouTube) ---------------- */
// All IDs verified by user to be embeddable in their environment.
const tracks = [
  {
    title: 'Parinaam',
    artist: 'Dorwin John',
    genre: 'John',
    videoId: 'R2sjywzbxfU',
    duration: 270
  },
  {
    title: 'Deva Deva',
    artist: 'Arijit Singh, Jonita Gandhi',
    genre: 'Brahmāstra',
    videoId: '9SJ76Gw3JF4',
    duration: 279
  },
  {
    title: 'Channa Mereya (Unplugged)',
    artist: 'Arijit Singh',
    genre: 'Ae Dil Hai Mushkil',
    videoId: 'pfdhc26gpsM',
    duration: 167
  },
  {
    title: 'Tere Vaaste',
    artist: 'Varun Jain, Sachin-Jigar',
    genre: 'Zara Hatke Zara Bachke',
    videoId: 'g5WZLO8BAC8',
    duration: 254
  },
  {
    title: 'Tu Hai Kahan',
    artist: 'AUR feat. ZAYN',
    genre: 'Indie Pop',
    videoId: 'A7NDb0iDZd0',
    duration: 218
  }
];

const tracklistEl = document.getElementById('tracklist');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const npTitle = document.getElementById('npTitle');
const npArtist = document.getElementById('npArtist');
const npMonogram = document.getElementById('npMonogram');
const npArt = document.getElementById('npArt');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const curTime = document.getElementById('curTime');
const totTime = document.getElementById('totTime');

let ytPlayer = null;
let ytReady = false;
let currentIdx = 0;
let pendingAutoplay = false;
let progressTimer = null;

function monogramOf(title) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function fmt(t) {
  if (!isFinite(t) || t < 0) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderTracklist() {
  if (!tracklistEl) return;
  tracklistEl.innerHTML = tracks.map((t, i) => `
    <li class="track" data-idx="${i}">
      <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="track-art">${monogramOf(t.title)}</span>
      <span class="track-info">
        <div class="track-title">${t.title}</div>
        <div class="track-sub">${t.artist} · ${t.genre}</div>
      </span>
      <span class="track-dur">${fmt(t.duration)}</span>
    </li>
  `).join('');

  tracklistEl.querySelectorAll('.track').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      if (idx === currentIdx && ytReady) {
        togglePlay();
      } else {
        loadTrack(idx, true);
      }
    });
  });
}

function setActiveRow() {
  tracklistEl?.querySelectorAll('.track').forEach((el, i) => {
    el.classList.toggle('active', i === currentIdx);
  });
}

function setPlayingUI(isPlaying) {
  playIcon.style.display = isPlaying ? 'none' : '';
  pauseIcon.style.display = isPlaying ? '' : 'none';
  npArt.classList.toggle('is-playing', isPlaying);
  playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  if (isPlaying) startVisualizer();
  else stopVisualizer();
}

/* ---------------- Visualizer (smooth sine-wave bars) ---------------- */
const eqBars = Array.from(document.querySelectorAll('.np-equalizer span'));
let visualizerRaf = null;
let visualizerStart = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function startVisualizer() {
  if (!eqBars.length || reduceMotion) return;
  visualizerStart = performance.now();
  cancelAnimationFrame(visualizerRaf);
  // Clear any pending settle transitions
  eqBars.forEach(b => { b.style.transition = ''; });

  const tick = (now) => {
    const t = (now - visualizerStart) / 1000;
    for (let i = 0; i < eqBars.length; i++) {
      // Three blended sines + a position-dependent phase produce
      // smooth, organic motion that travels across the bars like a wave.
      const phase = i * 0.42;
      const a = Math.sin(t * 1.85 + phase);
      const b = Math.sin(t * 3.10 + phase * 0.7 + 1.3);
      const c = Math.sin(t * 5.30 + phase * 1.4 + 2.1);
      const mix = a * 0.55 + b * 0.30 + c * 0.15;
      // Map [-1, 1] -> [0.18, 1.00] (always at least slightly visible)
      const v = 0.18 + 0.82 * (0.5 + 0.5 * mix);
      eqBars[i].style.transform = `scaleY(${v.toFixed(3)})`;
    }
    visualizerRaf = requestAnimationFrame(tick);
  };
  visualizerRaf = requestAnimationFrame(tick);
}

function stopVisualizer() {
  cancelAnimationFrame(visualizerRaf);
  visualizerRaf = null;
  if (!eqBars.length) return;
  // Gracefully settle every bar back to the resting height
  eqBars.forEach((bar, i) => {
    bar.style.transition = `transform .45s cubic-bezier(.4,0,.2,1) ${i * 18}ms`;
    bar.style.transform = 'scaleY(0.18)';
  });
  setTimeout(() => {
    eqBars.forEach(bar => { bar.style.transition = ''; });
  }, 700);
}

/* ---------------- Blog ---------------- */
// Each post lives at posts/{id}.html as a real, indexable, shareable page.
// Entries from data/blog-manifest.json are merged in when present.
const posts = [
  {
    id: 'training-transformer',
    title: 'Training my first transformer from scratch',
    date: 'Apr 14, 2026',
    readTime: '6 min read',
    tags: ['Deep Learning', 'Transformers', 'PyTorch'],
    excerpt: "I'd read \"Attention is All You Need\" four times before actually sitting down to implement it. Here's what the gap between reading and building feels like.",
    url: 'posts/training-transformer.html'
  },
  {
    id: 'small-models',
    title: "Why I'm bullish on small models",
    date: 'Mar 22, 2026',
    readTime: '4 min read',
    tags: ['LLMs', 'Efficiency', 'Opinion'],
    excerpt: 'Everyone wants the biggest model. I keep finding the most interesting problems live at the other end of the scale curve.',
    url: 'posts/small-models.html'
  },
  {
    id: 'rag-weekend',
    title: 'Building a RAG app in a weekend',
    date: 'Feb 8, 2026',
    readTime: '5 min read',
    tags: ['RAG', 'LangChain', 'Side Projects'],
    excerpt: 'Spec on Friday night, working app by Sunday afternoon. A walk-through of what stuck, what broke, and what I would redo.',
    url: 'posts/rag-weekend.html'
  }
];

const blogGrid = document.getElementById('blogGrid');

function escapeHtmlUi(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadBlogManifestExtra() {
  try {
    const r = await fetch('data/blog-manifest.json', { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

async function mergedBlogListing() {
  const extra = await loadBlogManifestExtra();
  const seen = new Set();
  const merged = [...extra, ...posts];
  const out = [];
  for (const p of merged) {
    const url = p.url || `posts/${p.slug || p.id || '_'}.html`;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ ...p, url });
  }
  return out;
}

async function renderBlogCards() {
  if (!blogGrid) return;
  const base = blogGrid.dataset.base || '';
  const list = await mergedBlogListing();
  blogGrid.innerHTML = list.map(p => `
    <a href="${escapeHtmlUi(base)}${escapeHtmlUi(p.url)}" class="glass blog-card">
      <div class="blog-card-meta">
        <span>${escapeHtmlUi(p.date)}</span>
        <span class="dot"></span>
        <span>${escapeHtmlUi(p.readTime)}</span>
      </div>
      <h3>${escapeHtmlUi(p.title)}</h3>
      <p>${escapeHtmlUi(p.excerpt)}</p>
      <div class="blog-card-tags">
        ${(p.tags || []).map(t => `<span>${escapeHtmlUi(t)}</span>`).join('')}
      </div>
      <span class="blog-card-cta">
        Read post
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      </span>
    </a>
  `).join('');
  observeRevealed(blogGrid.querySelectorAll('.blog-card'));
}

if (blogGrid) void renderBlogCards();

/* Homepage projects — merged with data/projects-manifest.json when present */

const ICON_GH = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2A10 10 0 0 0 8.84 21.5c.5.09.66-.22.66-.48v-1.7c-2.78.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.58.67.48A10 10 0 0 0 12 2Z"/></svg>`;

const ICON_EXT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6"/><path d="M10 14 21 3"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>`;

const ICON_ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

const DEFAULT_PROJECTS = [
  {
    slug: 'documind',
    eyebrow: 'LLM · RAG',
    title: 'DocuMind',
    excerpt: 'A retrieval-augmented Q&A app that lets you chat with your PDFs. Built with LangChain, FAISS, and a sleek Streamlit UI.',
    chips: ['Python', 'LangChain', 'FAISS', 'OpenAI'],
    githubUrl: 'https://github.com/ritikyadav/documind',
    liveUrl: 'https://documind.example.com'
  },
  {
    slug: 'leaflens',
    eyebrow: 'Computer Vision',
    title: 'LeafLens',
    excerpt: 'CNN-based plant disease classifier trained on PlantVillage, served via FastAPI with a real-time camera demo.',
    chips: ['PyTorch', 'FastAPI', 'OpenCV'],
    githubUrl: 'https://github.com/ritikyadav/leaflens',
    liveUrl: 'https://leaflens.example.com'
  },
  {
    slug: 'sentipulse',
    eyebrow: 'NLP',
    title: 'SentiPulse',
    excerpt: 'Real-time sentiment dashboard for tweets & reviews using a fine-tuned DistilBERT and a Plotly dashboard.',
    chips: ['Transformers', 'Plotly', 'SQLite'],
    githubUrl: 'https://github.com/ritikyadav/sentipulse',
    liveUrl: 'https://sentipulse.example.com'
  },
  {
    slug: 'dreamframe',
    eyebrow: 'Generative AI',
    title: 'DreamFrame',
    excerpt: 'Text-to-image playground experimenting with Stable Diffusion, ControlNet, and prompt engineering workflows.',
    chips: ['Diffusers', 'Gradio', 'CUDA'],
    githubUrl: 'https://github.com/ritikyadav/dreamframe',
    liveUrl: 'https://dreamframe.example.com'
  }
];

function renderHomeProjectCard(p) {
  const study = `projects/${p.slug}.html`;
  const label = `${p.title} — open project case study`;
  const chipsHtml = (p.chips || []).map(c => `<span>${escapeHtmlUi(c)}</span>`).join('');
  return `
          <article class="glass card project">
            <a class="project-link" href="${escapeHtmlUi(study)}" aria-label="${escapeHtmlUi(label)}"></a>
            <div class="project-tag">${escapeHtmlUi(p.eyebrow)}</div>
            <h3>${escapeHtmlUi(p.title)}</h3>
            <p>${escapeHtmlUi(p.excerpt)}</p>
            <div class="chips">${chipsHtml}</div>
            <div class="project-actions">
              <a class="project-action" href="${escapeHtmlUi(p.githubUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtmlUi(p.title + ' on GitHub')}" title="GitHub repo">${ICON_GH}</a>
              <a class="project-action" href="${escapeHtmlUi(p.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtmlUi(p.title + ' live link')}" title="Live">${ICON_EXT}</a>
              <span class="project-cta">Case study ${ICON_ARROW}</span>
            </div>
          </article>`;
}

async function loadProjectsManifestExtra() {
  try {
    const r = await fetch('data/projects-manifest.json', { cache: 'no-store' });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

async function renderProjectsGridHome() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  const extra = await loadProjectsManifestExtra();
  const seen = new Set();
  const merged = [...extra, ...DEFAULT_PROJECTS].filter(entry => {
    const k = entry.slug;
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  grid.innerHTML = merged.map(renderHomeProjectCard).join('');
  grid.removeAttribute('aria-busy');
  observeRevealed(grid.querySelectorAll('.project'));
}

void renderProjectsGridHome();

/* ---------------- Share buttons (used on post pages) ---------------- */
document.querySelectorAll('[data-share-copy]').forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const orig = btn.dataset.label || btn.textContent;
      btn.dataset.label = orig;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    } catch {
      // ignore
    }
  });
});

/* ---------------- Nepali theme + national anthem ---------------- */
(() => {
  const STORAGE_THEME = 'nepal-theme';
  const STORAGE_MUTE  = 'nepal-anthem-muted';

  /* Restore theme on EVERY page (visual only) so it persists across navigation */
  try {
    if (localStorage.getItem(STORAGE_THEME) === 'on') {
      document.body.dataset.theme = 'nepal';
    }
  } catch {}

  /* Below this point — only runs on pages with the nationality button (index.html) */
  const btn = document.getElementById('nationalityBtn');
  if (!btn) return;

  const audio    = document.getElementById('anthemAudio');
  const widget   = document.getElementById('anthemWidget');
  const muteBtn  = document.getElementById('anthemMute');
  const statusEl = document.getElementById('anthemStatus');

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function isMuted() {
    return muteBtn?.dataset.muted === 'true';
  }

  function tryPlayAnthem() {
    if (!audio || isMuted()) { if (isMuted()) setStatus('Muted'); return; }
    setStatus('Sayaun Thunga Phool Ka');
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        console.warn('Anthem play blocked or failed:', err);
        setStatus('Tap the speaker to play');
      });
    }
  }

  function pauseAnthem() {
    if (!audio) return;
    try { audio.pause(); } catch {}
  }

  function activateTheme({ playMusic = true } = {}) {
    document.body.dataset.theme = 'nepal';
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Proudly Nepali — tap to reset theme');
    if (widget) {
      widget.dataset.show = 'true';
      widget.setAttribute('aria-hidden', 'false');
    }
    if (playMusic) tryPlayAnthem();
    try { localStorage.setItem(STORAGE_THEME, 'on'); } catch {}
  }

  function deactivateTheme() {
    delete document.body.dataset.theme;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Reveal my nationality');
    if (widget) {
      widget.dataset.show = 'false';
      widget.setAttribute('aria-hidden', 'true');
    }
    pauseAnthem();
    if (audio) { try { audio.currentTime = 0; } catch {} }
    try { localStorage.setItem(STORAGE_THEME, 'off'); } catch {}
  }

  btn.addEventListener('click', () => {
    const isOn = document.body.dataset.theme === 'nepal';
    if (isOn) deactivateTheme();
    else      activateTheme();
  });

  /* Mute/unmute anthem without disabling the theme */
  if (muteBtn && audio) {
    const savedMute = (() => { try { return localStorage.getItem(STORAGE_MUTE); } catch { return null; } })();
    if (savedMute === 'true') muteBtn.dataset.muted = 'true';

    muteBtn.addEventListener('click', () => {
      const muted = muteBtn.dataset.muted === 'true';
      const next = !muted;
      muteBtn.dataset.muted = String(next);
      muteBtn.setAttribute('aria-label', next ? 'Unmute anthem' : 'Mute anthem');
      if (next) {
        pauseAnthem();
        setStatus('Muted');
      } else {
        tryPlayAnthem();
      }
      try { localStorage.setItem(STORAGE_MUTE, String(next)); } catch {}
    });

    audio.addEventListener('error', () => setStatus('Audio unavailable'));
    audio.addEventListener('playing', () => setStatus('Sayaun Thunga Phool Ka'));
  }

  /* If theme was already restored at the top of this IIFE, sync the button + widget UI */
  if (document.body.dataset.theme === 'nepal') {
    activateTheme({ playMusic: false });
    setStatus('Tap the speaker to play');
  }
})();

/* ---------------- Story timeline ---------------- */
document.querySelectorAll('.timeline-card .timeline-summary').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.timeline-card');
    const isOpen = card.dataset.open === 'true';
    const next = !isOpen;
    card.dataset.open = String(next);
    btn.setAttribute('aria-expanded', String(next));
  });
});

/* ---------------- Photo gallery / lightbox ---------------- */
(() => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const photos = Array.from(document.querySelectorAll('.timeline-photo'));
  if (!photos.length) return;

  const frame      = document.getElementById('lightboxFrame');
  const captionEl  = document.getElementById('lightboxCaption');
  const counterEl  = document.getElementById('lightboxCounter');
  const prevBtn    = lightbox.querySelector('.lightbox-prev');
  const nextBtn    = lightbox.querySelector('.lightbox-next');
  const closeBtn   = lightbox.querySelector('.lightbox-close');
  const openBtn    = document.getElementById('openGalleryBtn');
  const photoCount = document.getElementById('galleryPhotoCount');

  if (photoCount) photoCount.textContent = String(photos.length);

  let currentIdx = 0;
  let lastFocused = null;

  /* Make every figure clickable + keyboard-accessible */
  photos.forEach((fig, idx) => {
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', `Open photo ${idx + 1} of ${photos.length}`);
    fig.addEventListener('click', () => openLightbox(idx));
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  function getPhotoMeta(fig) {
    const entry = fig.closest('.timeline-entry');
    const year = entry?.querySelector('.timeline-year')?.textContent?.trim() || '';
    const title = entry?.querySelector('.timeline-summary-text h3')?.textContent?.trim() || '';
    const customCaption = fig.dataset.caption || '';
    return { year, title, customCaption };
  }

  function render(idx) {
    const fig = photos[idx];
    const img = fig.querySelector('img');
    const { year, title, customCaption } = getPhotoMeta(fig);

    frame.innerHTML = '';
    if (img && img.src) {
      const big = document.createElement('img');
      big.src = img.src;
      big.alt = img.alt || `Photo from ${year}`;
      frame.appendChild(big);
    } else {
      const ph = document.createElement('div');
      ph.className = 'lightbox-placeholder';
      ph.innerHTML = `<span>${year ? year + ' · ' : ''}${title}</span><small>Photo placeholder — drop an image here.</small>`;
      frame.appendChild(ph);
    }

    const captionParts = [];
    if (year)  captionParts.push(year);
    if (title) captionParts.push(title);
    captionEl.textContent = customCaption || captionParts.join(' · ');
    counterEl.textContent = `${idx + 1} / ${photos.length}`;
    currentIdx = idx;
  }

  function openLightbox(idx) {
    lastFocused = document.activeElement;
    render(idx);
    lightbox.dataset.open = 'true';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus({ preventScroll: true });
  }

  function closeLightbox() {
    lightbox.dataset.open = 'false';
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function step(delta) {
    let next = currentIdx + delta;
    if (next < 0) next = photos.length - 1;
    if (next >= photos.length) next = 0;
    render(next);
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  closeBtn.addEventListener('click', closeLightbox);

  if (openBtn) {
    openBtn.addEventListener('click', () => openLightbox(0));
  }

  /* Click outside the photo to close */
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* Keyboard nav */
  document.addEventListener('keydown', (e) => {
    if (lightbox.dataset.open !== 'true') return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft')  step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  /* Touch swipe (mobile) */
  let touchStartX = null;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
    if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
    touchStartX = null;
  });
})();

function updateNowPlayingMeta() {
  const t = tracks[currentIdx];
  npTitle.textContent = t.title;
  npArtist.textContent = `${t.artist} · ${t.genre}`;
  npMonogram.textContent = monogramOf(t.title);
  progressFill.style.width = '0%';
  progressThumb.style.left = '0%';
  curTime.textContent = '0:00';
  totTime.textContent = fmt(t.duration);
  setActiveRow();
}

function loadTrack(idx, autoplay = false) {
  currentIdx = (idx + tracks.length) % tracks.length;
  updateNowPlayingMeta();
  const t = tracks[currentIdx];
  if (!ytReady) {
    pendingAutoplay = autoplay;
    return;
  }
  if (autoplay) ytPlayer.loadVideoById(t.videoId);
  else ytPlayer.cueVideoById(t.videoId);
}

function togglePlay() {
  if (!ytReady) {
    pendingAutoplay = true;
    return;
  }
  const state = ytPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
  else ytPlayer.playVideo();
}

function startProgressLoop() {
  stopProgressLoop();
  progressTimer = setInterval(() => {
    if (!ytReady) return;
    const cur = ytPlayer.getCurrentTime() || 0;
    const dur = ytPlayer.getDuration() || tracks[currentIdx].duration || 0;
    if (dur > 0) {
      const pct = Math.min(100, (cur / dur) * 100);
      progressFill.style.width = pct + '%';
      progressThumb.style.left = pct + '%';
      curTime.textContent = fmt(cur);
      totTime.textContent = fmt(dur);
    }
  }, 250);
}

function stopProgressLoop() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

const playerNote = document.getElementById('playerNote');
function showNote(msg) {
  if (!playerNote) return;
  playerNote.textContent = msg;
  playerNote.hidden = false;
}
function clearNote() {
  if (!playerNote) return;
  playerNote.hidden = true;
  playerNote.textContent = '';
}

// If opened via file://, YouTube embeds will not play. Tell the user.
if (location.protocol === 'file:') {
  showNote('Heads up: open this site through a local server (e.g. python3 -m http.server) — YouTube needs an http(s) origin to play.');
}

let attemptedSkips = 0;

// YouTube IFrame API entry point (called by the loaded API script)
window.onYouTubeIframeAPIReady = function () {
  if (!document.getElementById('ytplayer')) return;
  ytPlayer = new YT.Player('ytplayer', {
    height: '180',
    width: '320',
    videoId: tracks[currentIdx].videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      iv_load_policy: 3,
      origin: location.origin
    },
    events: {
      onReady: () => {
        ytReady = true;
        if (pendingAutoplay) {
          pendingAutoplay = false;
          ytPlayer.playVideo();
        }
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          attemptedSkips = 0;
          clearNote();
          setPlayingUI(true);
          startProgressLoop();
        } else if (e.data === YT.PlayerState.PAUSED) {
          setPlayingUI(false);
        } else if (e.data === YT.PlayerState.ENDED) {
          setPlayingUI(false);
          stopProgressLoop();
          loadTrack(currentIdx + 1, true);
        } else if (e.data === YT.PlayerState.BUFFERING) {
          // keep current UI
        } else if (e.data === YT.PlayerState.CUED) {
          setPlayingUI(false);
        }
      },
      onError: (e) => {
        // 2 = invalid id, 5 = HTML5 error, 100 = removed/private,
        // 101 / 150 = embedding disabled by uploader
        setPlayingUI(false);
        stopProgressLoop();
        const code = e && e.data;
        const reason = (code === 101 || code === 150)
          ? "this track can't be embedded — skipping"
          : (code === 100 ? 'video unavailable — skipping' : 'playback error — skipping');
        showNote(reason + '…');
        // Try to skip to the next playable track, but stop after one full loop
        attemptedSkips++;
        if (attemptedSkips < tracks.length) {
          setTimeout(() => loadTrack(currentIdx + 1, true), 600);
        } else {
          showNote('Unable to play any track right now. Try refreshing or check your connection.');
          attemptedSkips = 0;
        }
      }
    }
  });
};

if (tracklistEl) {
  renderTracklist();
  updateNowPlayingMeta();

  // Fallback note if the YouTube IFrame API never loads (blocked / offline)
  setTimeout(() => {
    if (!ytReady && !pendingAutoplay) {
      showNote("If the player doesn't respond, the YouTube API may be blocked. Try disabling content blockers or check your network.");
    }
  }, 6000);

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => {
    const wasPlaying = ytReady && ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
    loadTrack(currentIdx - 1, wasPlaying);
  });
  nextBtn.addEventListener('click', () => {
    const wasPlaying = ytReady && ytPlayer.getPlayerState() === YT.PlayerState.PLAYING;
    loadTrack(currentIdx + 1, wasPlaying);
  });

  const seek = (e) => {
    if (!ytReady) return;
    const rect = progress.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const dur = ytPlayer.getDuration();
    if (dur) ytPlayer.seekTo(pct * dur, true);
  };
  progress.addEventListener('click', seek);
  progress.addEventListener('keydown', (e) => {
    if (!ytReady) return;
    const cur = ytPlayer.getCurrentTime();
    const dur = ytPlayer.getDuration();
    if (e.key === 'ArrowRight') ytPlayer.seekTo(Math.min(dur, cur + 5), true);
    if (e.key === 'ArrowLeft') ytPlayer.seekTo(Math.max(0, cur - 5), true);
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  });

  // Spacebar toggles play when the music section is in view
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.code !== 'Space') return;
    const sec = document.getElementById('love');
    if (!sec) return;
    const r = sec.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.2) {
      e.preventDefault();
      togglePlay();
    }
  });
}
