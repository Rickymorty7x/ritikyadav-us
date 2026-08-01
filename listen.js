/* ================================================================
   Listen Page — Music Player Logic (158 tracks, no categories)
   ================================================================ */

// ─── Track Data ───
const tracks = [
  { title: 'Haaye Re', videoId: 'gJGcC3hlRcE' },
  { title: 'Sajna Tu Aaya Naa', videoId: 'Wv7xGldihbU' },
  { title: 'Ae Meri Jaan', videoId: 's9WskfC7q2U' },
  { title: 'Hum Tere Pyar Mein Sara Aalam Kho Baithe', videoId: 'xdZiUuwZeOI' },
  { title: 'Dekha Hi Nahi', videoId: '4NpMu__lFPQ' },
  { title: 'Raat Ke Shikari', videoId: 'SBfjg2VDqXw' },
  { title: 'Chaandni', videoId: 'mY6gkE7ahP8' },
  { title: 'Rani Mor Khajanwa Hau', videoId: 'FUL4_Bw9Kck' },
  { title: 'Unse Jaake Kehdo', videoId: '8aGmSnMT6ms' },
  { title: 'Matt Jaao', videoId: 'MBO5Q_zL3Yg' },
  { title: 'Aao Na', videoId: '3UkdcQW-4KE' },
  { title: 'Itna Na Mujhse Tu Pyar Badha', videoId: 'PUBaJz8eoRk' },
  { title: 'Soo Jao', videoId: 'ZIRDeD4_lUU' },
  { title: 'Andaaz E Bayan', videoId: 'C_KM_yYgyTY' },
  { title: 'Sigma Boy', videoId: 'ueNY30Cs8Lk' },
  { title: 'Gori Ho Tohar Tirchi Najariya', videoId: 'sTqdItlVYn0' },
  { title: 'Tu Tu Hai Wahi', videoId: 'H7aOCLPhuZo' },
  { title: 'Jiska Bhi Prem Adhura Rahega', videoId: 'bgibmrToaIw' },
  { title: 'Chahvan Sohneya', videoId: 'EBRvmc3VarQ' },
  { title: 'Jo Paar Lagaye Sab Naiya', videoId: '-2yLKW9722c' },
  { title: 'Songo Chhara Kore Sokhi', videoId: 'KHNlB-PZpN0' },
  { title: 'Ahista', videoId: 'wvmRswRlbfU' },
  { title: 'Likh Dega Ke Jaani 2', videoId: 'Vo-5IAjeSZQ' },
  { title: 'Ye Dunia Ye Mehfil', videoId: 'RF1gan5GWN4' },
  { title: 'Ik Kudi', videoId: 'Y6GtWgJGtmU' },
  { title: 'Devitsa', videoId: 'ZakHeSqpVY8' },
  { title: 'Na Pata Mujhe', videoId: 'PAoYqaHc_bY' },
  { title: 'Haseen', videoId: 'IltsOcCj1Ak' },
  { title: 'Succession Music', videoId: 'vuJt2sGdkdU' },
  { title: 'Jogan', videoId: 'YJg1rs0R2sE' },
  { title: 'Pal Pal', videoId: '8of5w7RgcTc' },
  { title: 'Kabhi Kabhi', videoId: 'ogBQ3VymYbk' },
  { title: 'Main Hi Kyon', videoId: 'gXKEaJXDmek' },
  { title: 'Meherban', videoId: 'uFUDGgJKuGI' },
  { title: 'Maand', videoId: 'HTeP7ja9UFY' },
  { title: 'Chaudhvi Ka Chand', videoId: 'yoZRGVLc6Hw' },
  { title: 'Hum Jaisa Chahega Kaun', videoId: '0jGu1yJKvYw' },
  { title: 'Italian x Bengali Rap Collab', videoId: '869-jaccY1k' },
  { title: 'Iktara', videoId: 'JKSoBqnQ5I4' },
  { title: 'Na Kajre Ki Dhar (Remix)', videoId: 'uebwV9mBgRg' },
  { title: 'In Aankhon Ki Masti (Remix)', videoId: 'PphkkJIkGFk' },
  { title: 'Dard Dilo Ke (Slowed + Reverb)', videoId: 'xaAnFZWuuUU' },
  { title: 'Sahiba', videoId: 'NW6Dgax2d6I' },
  { title: 'Yaadon Ke Jharokhon Se', videoId: 'ju6Gi6uivv8' },
  { title: 'Dumb', videoId: 'IgZsGLeBSic' },
  { title: 'Mujhsa Na', videoId: 'u2eO4OeMRZk' },
  { title: 'Bardali', videoId: 'HAcLoqZO-Z0' },
  { title: 'Sajna Ve Sajna', videoId: 'kuZ1hSfDrS4' },
  { title: 'Dhanush Ram Ne Toda Hai', videoId: 'RzGds1XowoA' },
  { title: 'Diamond Ni', videoId: 'adGR0QNxs0w' },
  { title: 'Ehsaan Tera Hoga', videoId: 'ognqU8UjMB8' },
  { title: 'Jo Tum Mere Ho X Wishes (Mashup)', videoId: 'qZwyzAzzQm4' },
  { title: 'Meri Jaan', videoId: 'XBET50SC7Dk' },
  { title: 'We Pray', videoId: 'knIbwsNGJyc' },
  { title: 'Mai Firta Aawara', videoId: 'M76UnIq3mOE' },
  { title: 'Raat', videoId: 'VR2LTo2ol0I' },
  { title: 'Ratiyaan', videoId: 'GnXyV87CbeM' },
  { title: 'Ek Dafa Tum Milo', videoId: 'XQMUTWhqJRg' },
  { title: 'Aasa Kooda', videoId: 'a3Ue-LN5B9U' },
  { title: 'Hamari Atariya Pe', videoId: '0_jaYRrVkNY' },
  { title: 'Ahista Ahista', videoId: 'J0_X4yHWDTc' },
  { title: 'Yeh Kaghazi Phool Jaise Chehre', videoId: '1wbKFj-HAHk' },
  { title: 'No One Noticed', videoId: 'Qn8F_u0vBNI' },
  { title: 'Kids', videoId: 'FEZ3fjvSyVM' },
  { title: "Callin' U (Tamally Maak)", videoId: 'PxJNNAezY0A' },
  { title: 'Ye Tune Kya Kiya', videoId: '4yZ-mn0u8NE' },
  { title: 'Army Dreamers', videoId: 'i4bWViFpd0Q' },
  { title: 'Sajdaa (Lofi Flip)', videoId: 'a93AQ5a-5iA' },
  { title: 'Yeh Jawaani Hai Deewani', videoId: 'LXtNqL2vxoA' },
  { title: 'Fast Ava', videoId: 'HMJtOY-ROfU' },
  { title: 'Another Day', videoId: 'sHMCtZt1V6Y' },
  { title: 'Ranjheya Ve', videoId: '55c6IlV7BEo' },
  { title: 'Saari Duniya Jalaa Denge', videoId: '6OXfgu8uKnE' },
  { title: 'Naresauna Maya (Reprise)', videoId: 'TgWA4otNzCQ' },
  { title: 'Hasta Hua Noorani Chehra', videoId: 'R-vnALzyUdg' },
  { title: 'Aap Se Milke', videoId: 'aRQFffb2Lt4' },
  { title: 'Hum Bhool Gaye Har Baat', videoId: 'w3Edz_P9bBk' },
  { title: 'Yeh Jism', videoId: 'HgTRRU-e91I' },
  { title: 'Sapanako Raja', videoId: 'Nr7qlhd0OdQ' },
  { title: 'Tohre Me Base Raja', videoId: 'qFr8dcTEf_4' },
  { title: 'Main Bhola Parvat Ka (Lofi)', videoId: 'LEGs7SrI8qQ' },
  { title: 'Tu Hai Kahan', videoId: 'AX6OrbgS8lI' },
  { title: 'Ankhain (Slowed & Reverb)', videoId: 'frGrrqhTTb8' },
  { title: 'Suna Suna', videoId: 'sFI6P1TRwmo' },
  { title: 'Tujhe Bhula Diya', videoId: '1LPtNHJckpw' },
  { title: 'Farki Aauna', videoId: 'VtB_gMFr_jw' },
  { title: 'Shukar Khuda Ka', videoId: 'ZbvQP5RKIRs' },
  { title: 'Mor Babooa Ko Najariyo Na Lage', videoId: 'smOfG4QhHjM' },
  { title: 'Julie Ka Pyar', videoId: 'Ho9Ouank_6A' },
  { title: 'Somewhere Only We Know', videoId: 'oY8pxDSJhgc' },
  { title: 'Phero Na Najariya', videoId: 'C6M-eLNzEIE' },
  { title: 'Tera Hi Naam', videoId: 'yDxWsN6hUms' },
  { title: 'Suzume', videoId: 'Xs0Lxif1u9E' },
  { title: 'Dil Se Dil', videoId: 'suC_Y2eZtAw' },
  { title: 'Yeh Ankhen Dekh Kar (Slowed & Reverb)', videoId: 'izKV6Xdzk78' },
  { title: 'Bepanah Pyar Hai Aaja', videoId: 'yMUW3GEWNjo' },
  { title: 'Rishta Dilon Ka Tode Na Toote', videoId: 'Dggqxvde11w' },
  { title: 'Allo', videoId: '22lBZpuyZxA' },
  { title: 'Na Jane Kyun Tu Hi Tu', videoId: 'KOiJwIFCAEw' },
  { title: 'RIP, Love', videoId: '0gJWTwPy4hA' },
  { title: 'Chaap Tilak', videoId: 'CaKXsXDLHhY' },
  { title: 'Матушка', videoId: '8mtxEbvzkHs' },
  { title: 'Gardashon Ke Ha Mare', videoId: 'JTrbrFitwsQ' },
  { title: 'Mere Humsafar (Female Version)', videoId: '5FU5j_DvZPg' },
  { title: 'Mohabbat Ki Daastaan', videoId: 'klZozPtwNLU' },
  { title: 'Mujh Mein Tu (Slowed + Reverb)', videoId: 'aCy15jBW6UU' },
  { title: 'Chaap Tilak (Lofi)', videoId: 'wKsl51jW13E' },
  { title: 'Kabhii Tumhhe', videoId: 'ByIZIKFmHOA' },
  { title: 'Agle Janam Milna Hoga', videoId: 'sQp7hSIA5fQ' },
  { title: 'Bekal Bhela Jiyara', videoId: 'HivoGnne6mM' },
  { title: 'Dil Na Todungi', videoId: 'uTuAgVwOWbE' },
  { title: 'Dil Di Gal', videoId: '2FgntzlPAcU' },
  { title: 'Isharon Isharon Mein', videoId: 'YeV4QrHlgCg' },
  { title: 'Dwadash Jyotirlinga Stotram', videoId: 'QgkBIoUeAa0' },
  { title: 'Raghupathi Raghava Rajaram', videoId: 'nRJD6kldukQ' },
  { title: 'Kabutari Bole Kabutar Se', videoId: 'xtqtsMiMyLY' },
  { title: 'La Haasil', videoId: 'osUMkh-B6Zw' },
  { title: 'Play Date', videoId: 'kknKs7cAcO8' },
  { title: 'Ek Mulaqat', videoId: 'hmAHjBIq1dU' },
  { title: 'Ye Parda Hatado', videoId: '7SIIYVnBI6I' },
  { title: 'Bhumari', videoId: 'ZMUMAeNqGgo' },
  { title: 'Flirting With June', videoId: 'cEVlEJA0Oic' },
  { title: 'Kaise Mujhe Tum Mil Gayi', videoId: 'MdhjLM-99lQ' },
  { title: 'The Seed', videoId: '_Mc_OM5oNA8' },
  { title: 'Laila', videoId: '4fHZQs6a1hc' },
  { title: 'Moral of the Story', videoId: 'WQq98YPV8yk' },
  { title: 'Panihari', videoId: 'pJAHNdhXJnY' },
  { title: 'Raat Hamari Toh', videoId: 'LSUGomran74' },
  { title: 'Parh Parh Ilm Hazar Kitaban', videoId: '1fSgtlRNQBI' },
  { title: 'Ek Bar Muskura Do', videoId: 'SvASxG8Nhp4' },
  { title: 'Tu Banja Gali Benaras Ki', videoId: 'pgc3J2hBBEU' },
  { title: 'Disfruto', videoId: 'jwP1HRmDVII' },
  { title: 'Eres Tú', videoId: '5TwAyUCJbl8' },
  { title: 'Phir Bhi Tumko Chaahunga', videoId: '_iktURk0X-A' },
  { title: 'Tum Se Hi', videoId: 'o_FjWLHXkAA' },
  { title: 'Bahon Mein Chale Aao', videoId: 'wxknUq6PrpE' },
  { title: 'Us Mod Se Shuroo Karen', videoId: 'l-Yj2ev-fUA' },
  { title: 'Humse Hoti Mohabbat Jo Tumko', videoId: 'pNl9o7MAAAw' },
  { title: 'Chalte Chalte Yun Hi Koi', videoId: 'ZQuS7VQXRes' },
  { title: 'Ek Dafaa', videoId: 'L3HabXRXfmw' },
  { title: 'Lo Maan Liya', videoId: 'KSGYVl4ZgRs' },
  { title: 'Aaja Re Moray Saiyaan', videoId: 'bq29w9MJKTQ' },
  { title: 'Tujhe Kitna Chahne Lage', videoId: 'aq5tAtOaqLA' },
  { title: 'Nahin Milta', videoId: 'umsrQSA2iOM' },
  { title: 'Tere Bin Nahi Laage', videoId: 's941l-rJZgw' },
  { title: 'Love Is a Waste of Time', videoId: 'jAmzBv3oq8M' },
  { title: 'Tum Todo Na', videoId: '502xhwUiGTs' },
  { title: 'Sajde', videoId: 'P4fzOSVy6-o' },
  { title: 'Preet', videoId: 'BJXl0kO0YC0' },
  { title: 'Mitti Di Khushboo', videoId: '8uJ-wOljP_s' },
  { title: 'Humdard', videoId: 'HnLtNrvfZTU' },
  { title: 'Sun Saathiya', videoId: 'wcVOgIItkKI' },
  { title: 'Aga Bai', videoId: 'CHwlXtF3zXs' },
  { title: 'Ranjha Ranjha', videoId: 'eoFkN53mMPA' },
  { title: 'Leja Leja Re', videoId: 'TQR70KKYMmQ' },
  { title: 'Happy Nation', videoId: 'HWjCStB6k4o' }
];

// ─── DOM refs ───
const tracklistEl    = document.getElementById('tracklist');
const playBtn        = document.getElementById('playBtn');
const playIcon       = document.getElementById('playIcon');
const pauseIcon      = document.getElementById('pauseIcon');
const prevBtn        = document.getElementById('prevBtn');
const nextBtn        = document.getElementById('nextBtn');
const npTitle        = document.getElementById('npTitle');
const npArtist       = document.getElementById('npArtist');
const npMonogram     = document.getElementById('npMonogram');
const npArt          = document.getElementById('npArt');
const progressEl     = document.getElementById('progress');
const progressFill   = document.getElementById('progressFill');
const progressThumb  = document.getElementById('progressThumb');
const curTime        = document.getElementById('curTime');
const totTime        = document.getElementById('totTime');
const shuffleBtn     = document.getElementById('shuffleBtn');
const repeatBtn      = document.getElementById('repeatBtn');
const heroCount      = document.getElementById('heroCount');
const trackCount     = document.getElementById('trackCount');
const searchInput    = document.getElementById('searchInput');

let ytPlayer        = null;
let ytReady         = false;
let currentIdx      = 0;
let pendingAutoplay = false;
let progressTimer   = null;
let isShuffled      = false;
let repeatMode      = 0; // 0 = off, 1 = all, 2 = one
let searchQuery     = '';

// ─── Helpers ───
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

// ─── Search/filter ───
function getFilteredIndices() {
  if (!searchQuery) return tracks.map((_, i) => i);
  const q = searchQuery.toLowerCase();
  return tracks
    .map((t, i) => t.title.toLowerCase().includes(q) ? i : -1)
    .filter(i => i !== -1);
}

// ─── Counts ───
function updateCounts() {
  const filtered = getFilteredIndices();
  if (heroCount) heroCount.innerHTML = `<strong>${tracks.length}</strong> songs in the library`;
  if (trackCount) trackCount.textContent = `${filtered.length} track${filtered.length !== 1 ? 's' : ''}`;
}

// ─── Tracklist rendering ───
function renderTracklist() {
  if (!tracklistEl) return;
  const filtered = getFilteredIndices();

  if (filtered.length === 0) {
    tracklistEl.innerHTML = `
      <li class="tracklist-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <p>No songs found.</p>
      </li>`;
    return;
  }

  tracklistEl.innerHTML = filtered.map(i => {
    const t = tracks[i];
    const isActive = i === currentIdx;
    const isPlaying = isActive && ytReady && ytPlayer?.getPlayerState?.() === 1;
    return `
    <li class="track${isActive ? ' active' : ''}${isPlaying ? ' is-playing' : ''}" data-idx="${i}">
      <span class="track-num">
        <span>${String(i + 1).padStart(2, '0')}</span>
        <span class="playing-bars"><i></i><i></i><i></i></span>
      </span>
      <span class="track-art">${monogramOf(t.title)}</span>
      <span class="track-info">
        <div class="track-title">${t.title}</div>
      </span>
      <span class="track-dur">♪</span>
    </li>`;
  }).join('');

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
  tracklistEl?.querySelectorAll('.track').forEach(el => {
    const idx = Number(el.dataset.idx);
    const isActive = idx === currentIdx;
    const isPlaying = isActive && ytReady && ytPlayer?.getPlayerState?.() === 1;
    el.classList.toggle('active', isActive);
    el.classList.toggle('is-playing', isPlaying);
  });
}

// ─── Now Playing UI ───
function updateNowPlaying() {
  const t = tracks[currentIdx];
  if (npTitle) npTitle.textContent = t.title;
  if (npArtist) npArtist.textContent = `Track ${currentIdx + 1} of ${tracks.length}`;
  if (npMonogram) npMonogram.textContent = monogramOf(t.title);
  if (curTime) curTime.textContent = '0:00';
  if (totTime) totTime.textContent = '0:00';
  if (progressFill) progressFill.style.width = '0%';
  if (progressThumb) progressThumb.style.left = '0%';
}

function setPlayingUI(isPlaying) {
  if (playIcon) playIcon.style.display = isPlaying ? 'none' : '';
  if (pauseIcon) pauseIcon.style.display = isPlaying ? '' : 'none';
  npArt?.classList.toggle('is-playing', isPlaying);
  playBtn?.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  if (isPlaying) startVisualizer();
  else stopVisualizer();
  setActiveRow();
}

// ─── Equalizer visualizer ───
const eqBars = Array.from(document.querySelectorAll('.np-equalizer span'));
let visualizerRaf = null;
let visualizerStart = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function startVisualizer() {
  if (!eqBars.length || reduceMotion) return;
  visualizerStart = performance.now();
  cancelAnimationFrame(visualizerRaf);
  eqBars.forEach(b => { b.style.transition = ''; });

  const tick = (now) => {
    const t = (now - visualizerStart) / 1000;
    for (let i = 0; i < eqBars.length; i++) {
      const phase = i * 0.42;
      const a = Math.sin(t * 1.85 + phase);
      const b = Math.sin(t * 3.10 + phase * 0.7 + 1.3);
      const c = Math.sin(t * 5.30 + phase * 1.4 + 2.1);
      const mix = a * 0.55 + b * 0.30 + c * 0.15;
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
  eqBars.forEach((bar, i) => {
    bar.style.transition = `transform .45s cubic-bezier(.4,0,.2,1) ${i * 18}ms`;
    bar.style.transform = 'scaleY(0.18)';
  });
  setTimeout(() => {
    eqBars.forEach(bar => { bar.style.transition = ''; });
  }, 700);
}

// ─── YouTube IFrame API ───
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('ytplayer', {
    height: '180',
    width: '320',
    videoId: tracks[currentIdx].videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      origin: location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
}

function onPlayerReady() {
  ytReady = true;
  updateNowPlaying();
  renderTracklist();
  if (pendingAutoplay) {
    pendingAutoplay = false;
    ytPlayer.playVideo();
  }
}

function onPlayerStateChange(e) {
  const state = e.data;
  if (state === YT.PlayerState.PLAYING) {
    setPlayingUI(true);
    startProgressTimer();
  } else if (state === YT.PlayerState.PAUSED) {
    setPlayingUI(false);
    stopProgressTimer();
  } else if (state === YT.PlayerState.ENDED) {
    setPlayingUI(false);
    stopProgressTimer();
    handleTrackEnd();
  }
}

function onPlayerError() {
  nextTrack();
}

function handleTrackEnd() {
  if (repeatMode === 2) {
    ytPlayer.seekTo(0);
    ytPlayer.playVideo();
  } else if (repeatMode === 1) {
    nextTrack();
  } else {
    if (currentIdx < tracks.length - 1) {
      nextTrack();
    }
  }
}

// ─── Playback controls ───
function loadTrack(idx, autoplay = false) {
  currentIdx = idx;
  updateNowPlaying();
  setActiveRow();

  if (ytReady) {
    ytPlayer.loadVideoById(tracks[idx].videoId);
    if (!autoplay) ytPlayer.pauseVideo();
  } else {
    pendingAutoplay = autoplay;
  }
}

function togglePlay() {
  if (!ytReady) return;
  const state = ytPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}

function prevTrack() {
  if (ytReady && ytPlayer.getCurrentTime() > 3) {
    ytPlayer.seekTo(0);
    return;
  }
  let newIdx;
  if (isShuffled) {
    newIdx = Math.floor(Math.random() * tracks.length);
  } else {
    newIdx = currentIdx > 0 ? currentIdx - 1 : tracks.length - 1;
  }
  loadTrack(newIdx, true);
}

function nextTrack() {
  let newIdx;
  if (isShuffled) {
    newIdx = Math.floor(Math.random() * tracks.length);
  } else {
    newIdx = currentIdx < tracks.length - 1 ? currentIdx + 1 : 0;
  }
  loadTrack(newIdx, true);
}

// ─── Progress ───
function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(updateProgress, 250);
}

function stopProgressTimer() {
  clearInterval(progressTimer);
  progressTimer = null;
}

function updateProgress() {
  if (!ytReady) return;
  const current = ytPlayer.getCurrentTime() || 0;
  const duration = ytPlayer.getDuration() || 1;
  const pct = Math.min((current / duration) * 100, 100);

  if (progressFill) progressFill.style.width = pct + '%';
  if (progressThumb) progressThumb.style.left = pct + '%';
  if (curTime) curTime.textContent = fmt(current);
  if (totTime) totTime.textContent = fmt(duration);
}

// ─── Seek ───
function setupSeek() {
  if (!progressEl) return;
  const seek = (e) => {
    if (!ytReady) return;
    const rect = progressEl.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const duration = ytPlayer.getDuration() || 1;
    ytPlayer.seekTo(pct * duration, true);
    updateProgress();
  };

  let dragging = false;
  progressEl.addEventListener('mousedown', (e) => { dragging = true; seek(e); });
  document.addEventListener('mousemove', (e) => { if (dragging) seek(e); });
  document.addEventListener('mouseup', () => { dragging = false; });
  progressEl.addEventListener('click', seek);
}

// ─── Shuffle / Repeat ───
function setupExtraControls() {
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      isShuffled = !isShuffled;
      shuffleBtn.classList.toggle('active', isShuffled);
    });
  }
  if (repeatBtn) {
    repeatBtn.addEventListener('click', () => {
      repeatMode = (repeatMode + 1) % 3;
      repeatBtn.classList.toggle('active', repeatMode > 0);
      if (repeatMode === 2) {
        repeatBtn.setAttribute('title', 'Repeat one');
      } else if (repeatMode === 1) {
        repeatBtn.setAttribute('title', 'Repeat all');
      } else {
        repeatBtn.setAttribute('title', 'Repeat off');
      }
    });
  }
}

// ─── Search ───
function setupSearch() {
  if (!searchInput) return;
  let debounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      renderTracklist();
      updateCounts();
    }, 200);
  });
}

// ─── Mobile nav ───
function setupNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  toggle?.addEventListener('click', () => {
    links.classList.toggle('open');
  });
  links?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// ─── Reveal on scroll ───
function setupReveal() {
  const targets = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in'), (i % 6) * 60);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => obs.observe(el));
}

// ─── Year in footer ───
function setupFooter() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupFooter();
  setupSeek();
  setupExtraControls();
  setupSearch();

  renderTracklist();
  updateNowPlaying();
  updateCounts();

  playBtn?.addEventListener('click', togglePlay);
  prevBtn?.addEventListener('click', prevTrack);
  nextBtn?.addEventListener('click', nextTrack);

  document.querySelectorAll('.np-panel, .tracklist-panel, .listen-hero-title, .listen-hero-sub').forEach(el => {
    el.classList.add('reveal');
  });
  setupReveal();
});

window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
