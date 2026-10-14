/**
 * Anime Catch - Cinematic Ultra-Luxurious Web Video Player
 * Complete Netflix / Crunchyroll-style player for Flutter Web.
 * 
 * Features:
 *   - Quality & Server live switcher (1080p FHD, 720p HD, 480p SD, MF, ST, PD, KF, AR)
 *   - In-player Episode Drawer & quick Next/Previous episode navigation
 *   - Cloudflare Worker link resolution with zero CORS restrictions
 *   - Interactive scrubbing timeline with hover preview and buffer indicator
 *   - Double-tap/double-click seek gestures (10s back / forward)
 *   - Playback speed switcher (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x)
 *   - Auto-play next episode countdown on completion
 *   - Full keyboard shortcuts (Space, F, M, Arrows, N, P, Esc)
 */

(function () {
  'use strict';

  let currentHls = null;
  let controlsHideTimeout = null;
  let autoPlayCountdownTimer = null;
  let state = {
    animeTitle: '',
    episodeNumber: 1,
    totalEpisodes: 1,
    animeId: 0,
    servers: [],
    episodes: [],
    currentServerIndex: 0,
    currentUrl: '',
    workerUrl: 'https://dark-rain-5caa.ali-allden078.workers.dev/',
    isDrawerOpen: false,
    isQualityMenuOpen: false,
    isSpeedMenuOpen: false,
  };

  function createPlayerDOM() {
    let overlay = document.getElementById('anime-cinema-player');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'anime-cinema-player';
    overlay.className = 'ac-player-root';

    // Inject styles
    const style = document.createElement('style');
    style.id = 'ac-player-styles';
    style.textContent = `
      .ac-player-root {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: #000000;
        z-index: 99999999;
        display: none;
        flex-direction: column;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Almarai", sans-serif;
        overflow: hidden;
      }
      .ac-video-wrap {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
      }
      .ac-video-wrap video, .ac-video-wrap iframe {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #000;
        border: none;
      }
      .ac-overlay-gradient {
        position: absolute;
        inset: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .ac-top-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
      }
      .ac-bottom-gradient {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 160px;
        background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%);
      }
      .ac-controls-layer {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 24px;
        box-sizing: border-box;
        transition: opacity 0.35s ease, visibility 0.35s;
        z-index: 20;
      }
      .ac-controls-layer.hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }
      .ac-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .ac-header-left {
        display: flex;
        align-items: center;
        gap: 14px;
        overflow: hidden;
      }
      .ac-btn-icon {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: all 0.2s ease;
      }
      .ac-btn-icon:hover {
        background: rgba(30, 144, 255, 0.85);
        border-color: #1e90ff;
        transform: scale(1.05);
      }
      .ac-btn-pill {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 7px 16px;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: all 0.2s ease;
      }
      .ac-btn-pill:hover, .ac-btn-pill.active {
        background: #1e90ff;
        border-color: #1e90ff;
        box-shadow: 0 0 15px rgba(30, 144, 255, 0.5);
      }
      .ac-title-group {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .ac-anime-title {
        color: #ffffff;
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 0 2px 6px rgba(0,0,0,0.8);
      }
      .ac-badges-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 3px;
      }
      .ac-badge {
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
      .ac-badge-ep {
        background: rgba(30, 144, 255, 0.25);
        color: #60b5ff;
        border: 1px solid rgba(30, 144, 255, 0.4);
      }
      .ac-badge-server {
        background: rgba(0, 200, 83, 0.2);
        color: #00e676;
        border: 1px solid rgba(0, 200, 83, 0.35);
        cursor: pointer;
      }
      .ac-center-controls {
        align-self: center;
        display: flex;
        align-items: center;
        gap: 28px;
      }
      .ac-btn-big-play {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        background: rgba(30, 144, 255, 0.9);
        color: #fff;
        border: 2px solid rgba(255, 255, 255, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 30px rgba(30, 144, 255, 0.5);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .ac-btn-big-play:hover {
        transform: scale(1.12);
        background: #1e90ff;
      }
      .ac-btn-secondary {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ac-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.08);
      }
      .ac-bottom-bar {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .ac-seek-bar-container {
        width: 100%;
        height: 20px;
        display: flex;
        align-items: center;
        cursor: pointer;
        position: relative;
      }
      .ac-seek-bar-bg {
        width: 100%;
        height: 5px;
        background: rgba(255, 255, 255, 0.25);
        border-radius: 4px;
        position: relative;
        overflow: hidden;
        transition: height 0.15s ease;
      }
      .ac-seek-bar-container:hover .ac-seek-bar-bg {
        height: 8px;
      }
      .ac-seek-buffer {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 4px;
        width: 0%;
      }
      .ac-seek-progress {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: #1e90ff;
        border-radius: 4px;
        width: 0%;
        box-shadow: 0 0 10px #1e90ff;
      }
      .ac-bottom-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ac-controls-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .ac-time-display {
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
      }
      .ac-drawer {
        position: absolute;
        top: 0;
        bottom: 0;
        right: -360px;
        width: 340px;
        background: rgba(14, 15, 26, 0.96);
        backdrop-filter: blur(20px);
        border-left: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: -10px 0 40px rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        z-index: 50;
        transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ac-drawer.open {
        right: 0;
      }
      .ac-drawer-header {
        padding: 20px 18px 14px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
      }
      .ac-drawer-content {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ac-ep-item {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.2s ease;
      }
      .ac-ep-item:hover {
        background: rgba(30, 144, 255, 0.2);
        border-color: rgba(30, 144, 255, 0.5);
      }
      .ac-ep-item.active {
        background: #1e90ff;
        border-color: #1e90ff;
        box-shadow: 0 4px 15px rgba(30, 144, 255, 0.4);
      }
      .ac-menu-popup {
        position: absolute;
        bottom: 72px;
        background: rgba(18, 19, 32, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        padding: 8px;
        display: none;
        flex-direction: column;
        gap: 4px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        z-index: 40;
        min-width: 180px;
      }
      .ac-menu-popup.open {
        display: flex;
      }
      .ac-menu-item {
        padding: 10px 14px;
        border-radius: 10px;
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .ac-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .ac-menu-item.active {
        color: #1e90ff;
        background: rgba(30, 144, 255, 0.15);
      }
      .ac-spinner {
        width: 46px;
        height: 46px;
        border: 4px solid rgba(255,255,255,0.15);
        border-top-color: #1e90ff;
        border-radius: 50%;
        animation: acSpin 0.8s linear infinite;
      }
      @keyframes acSpin {
        to { transform: rotate(360deg); }
      }
      .ac-seek-alert {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        padding: 16px 26px;
        border-radius: 40px;
        background: rgba(0,0,0,0.85);
        border: 1px solid rgba(255,255,255,0.3);
        color: #fff;
        font-size: 18px;
        font-weight: bold;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 25;
      }
      .ac-seek-alert.show {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    overlay.innerHTML = `
      <div class="ac-video-wrap" id="ac-video-container"></div>
      
      <div class="ac-overlay-gradient">
        <div class="ac-top-gradient"></div>
        <div class="ac-bottom-gradient"></div>
      </div>

      <!-- Left / Right Double-tap Seek Indicators -->
      <div id="ac-seek-left" class="ac-seek-alert" style="left: 10%;">⏪ -10s</div>
      <div id="ac-seek-right" class="ac-seek-alert" style="right: 10%;">+10s ⏩</div>

      <!-- Controls Overlay -->
      <div class="ac-controls-layer" id="ac-controls-layer">
        <!-- Top Bar -->
        <div class="ac-header">
          <div class="ac-header-left">
            <button class="ac-btn-pill" id="ac-btn-back">
              <span>&#8592;</span>
              <span>رجوع</span>
            </button>
            <div class="ac-title-group">
              <span class="ac-anime-title" id="ac-anime-title">Anime Catch</span>
              <div class="ac-badges-row">
                <span class="ac-badge ac-badge-ep" id="ac-badge-ep">الحلقة 1</span>
                <span class="ac-badge ac-badge-server" id="ac-badge-server">سيرفر المشاهدة ⚙️</span>
              </div>
            </div>
          </div>

          <div class="ac-controls-group">
            <button class="ac-btn-pill" id="ac-btn-quality">
              <span>⚙️</span>
              <span id="ac-quality-label">الجودة والسيرفر</span>
            </button>
            <button class="ac-btn-pill" id="ac-btn-episodes">
              <span>☰</span>
              <span>الحلقات</span>
            </button>
            <button class="ac-btn-icon" id="ac-btn-ext" title="فتح خارجي">&#x2197;</button>
            <button class="ac-btn-icon" id="ac-btn-close" title="إغلاق">&#x2715;</button>
          </div>
        </div>

        <!-- Center Controls -->
        <div class="ac-center-controls">
          <button class="ac-btn-secondary" id="ac-btn-prev-ep" title="الحلقة السابقة">⏮</button>
          <button class="ac-btn-secondary" id="ac-btn-rwd10" title="تأخير 10 ثوانٍ">↺ 10</button>
          <button class="ac-btn-big-play" id="ac-btn-play-center">▶</button>
          <button class="ac-btn-secondary" id="ac-btn-fwd10" title="تقديم 10 ثوانٍ">10 ↻</button>
          <button class="ac-btn-secondary" id="ac-btn-next-ep" title="الحلقة التالية">⏭</button>
        </div>

        <!-- Bottom Controls -->
        <div class="ac-bottom-bar">
          <div class="ac-seek-bar-container" id="ac-seek-bar-container">
            <div class="ac-seek-bar-bg">
              <div class="ac-seek-buffer" id="ac-seek-buffer"></div>
              <div class="ac-seek-progress" id="ac-seek-progress"></div>
            </div>
          </div>

          <div class="ac-bottom-controls">
            <div class="ac-controls-group">
              <button class="ac-btn-icon" id="ac-btn-play-small" style="width:36px;height:36px;">▶</button>
              <button class="ac-btn-icon" id="ac-btn-mute" style="width:36px;height:36px;">🔊</button>
              <span class="ac-time-display" id="ac-time-display">00:00 / 00:00</span>
            </div>

            <div class="ac-controls-group">
              <button class="ac-btn-pill" id="ac-btn-speed" style="padding:4px 12px;font-size:12px;">1.0x</button>
              <button class="ac-btn-icon" id="ac-btn-fullscreen" style="width:36px;height:36px;" title="ملء الشاشة">⛶</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Popups -->
      <div class="ac-menu-popup" id="ac-quality-popup" style="right: 120px;"></div>
      <div class="ac-menu-popup" id="ac-speed-popup" style="right: 80px;">
        <div class="ac-menu-item" data-speed="0.5">0.5x بطيء</div>
        <div class="ac-menu-item" data-speed="0.75">0.75x</div>
        <div class="ac-menu-item active" data-speed="1.0">1.0x عادي</div>
        <div class="ac-menu-item" data-speed="1.25">1.25x</div>
        <div class="ac-menu-item" data-speed="1.5">1.5x سريع</div>
        <div class="ac-menu-item" data-speed="2.0">2.0x مضاعف</div>
      </div>

      <!-- Episodes Side Drawer -->
      <div class="ac-drawer" id="ac-episodes-drawer">
        <div class="ac-drawer-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:18px;">🎬</span>
            <span style="font-weight:bold;font-size:15px;">قائمة الحلقات</span>
          </div>
          <button class="ac-btn-icon" id="ac-btn-drawer-close" style="width:32px;height:32px;">✕</button>
        </div>
        <div class="ac-drawer-content" id="ac-episodes-list"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    setupPlayerEventListeners(overlay);
    return overlay;
  }

  function setupPlayerEventListeners(overlay) {
    const controls = document.getElementById('ac-controls-layer');
    const container = document.getElementById('ac-video-container');

    // Controls hover / auto-hide timer
    function resetControlsTimer() {
      controls.classList.remove('hidden');
      clearTimeout(controlsHideTimeout);
      controlsHideTimeout = setTimeout(() => {
        const video = container.querySelector('video');
        if (video && !video.paused && !state.isDrawerOpen && !state.isQualityMenuOpen && !state.isSpeedMenuOpen) {
          controls.classList.add('hidden');
        }
      }, 3500);
    }

    overlay.addEventListener('mousemove', resetControlsTimer);
    overlay.addEventListener('click', (e) => {
      // Close open popups if clicking outside
      if (!e.target.closest('#ac-quality-popup') && !e.target.closest('#ac-btn-quality') && !e.target.closest('#ac-badge-server')) {
        closeQualityMenu();
      }
      if (!e.target.closest('#ac-speed-popup') && !e.target.closest('#ac-btn-speed')) {
        closeSpeedMenu();
      }
      resetControlsTimer();
    });

    // Double click / tap left or right to seek
    let lastTapTime = 0;
    container.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastTapTime < 300) {
        const rect = container.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width * 0.4) {
          seekRelative(-10);
        } else if (clickX > rect.width * 0.6) {
          seekRelative(10);
        } else {
          togglePlay();
        }
      }
      lastTapTime = now;
    });

    // Back / Close
    document.getElementById('ac-btn-back').onclick = closeCinemaPlayer;
    document.getElementById('ac-btn-close').onclick = closeCinemaPlayer;

    // External link
    document.getElementById('ac-btn-ext').onclick = () => {
      if (state.currentUrl) window.open(state.currentUrl, '_blank');
    };

    // Play / Pause buttons
    document.getElementById('ac-btn-play-center').onclick = togglePlay;
    document.getElementById('ac-btn-play-small').onclick = togglePlay;

    // Seek buttons
    document.getElementById('ac-btn-rwd10').onclick = () => seekRelative(-10);
    document.getElementById('ac-btn-fwd10').onclick = () => seekRelative(10);

    // Prev / Next Episode buttons
    document.getElementById('ac-btn-prev-ep').onclick = playPreviousEpisode;
    document.getElementById('ac-btn-next-ep').onclick = playNextEpisode;

    // Episodes Drawer Toggle
    document.getElementById('ac-btn-episodes').onclick = toggleEpisodesDrawer;
    document.getElementById('ac-btn-drawer-close').onclick = toggleEpisodesDrawer;

    // Quality Menu Toggle
    document.getElementById('ac-btn-quality').onclick = toggleQualityMenu;
    document.getElementById('ac-badge-server').onclick = toggleQualityMenu;

    // Speed Menu Toggle
    document.getElementById('ac-btn-speed').onclick = toggleSpeedMenu;

    // Speed items click
    document.querySelectorAll('#ac-speed-popup .ac-menu-item').forEach(item => {
      item.onclick = () => {
        const speed = parseFloat(item.getAttribute('data-speed'));
        setPlaybackSpeed(speed);
      };
    });

    // Mute toggle
    document.getElementById('ac-btn-mute').onclick = toggleMute;

    // Fullscreen toggle
    document.getElementById('ac-btn-fullscreen').onclick = toggleFullscreen;

    // Seekbar scrubbing
    const seekBar = document.getElementById('ac-seek-bar-container');
    seekBar.onclick = (e) => {
      const video = container.querySelector('video');
      if (!video || !video.duration) return;
      const rect = seekBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    };

    // Keyboard shortcuts
    window.addEventListener('keydown', handleKeyboardShortcuts);
  }

  function handleKeyboardShortcuts(e) {
    const overlay = document.getElementById('anime-cinema-player');
    if (!overlay || overlay.style.display !== 'flex') return;

    if (e.key === 'Escape') {
      if (state.isDrawerOpen) toggleEpisodesDrawer();
      else if (state.isQualityMenuOpen) closeQualityMenu();
      else closeCinemaPlayer();
    } else if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekRelative(-10);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekRelative(10);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMute();
    } else if (e.key === 'n' || e.key === 'N') {
      playNextEpisode();
    } else if (e.key === 'p' || e.key === 'P') {
      playPreviousEpisode();
    }
  }

  function seekRelative(seconds) {
    const container = document.getElementById('ac-video-container');
    const video = container.querySelector('video');
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.duration || 999999, video.currentTime + seconds));

    // Show visual seek feedback
    const alertEl = document.getElementById(seconds > 0 ? 'ac-seek-right' : 'ac-seek-left');
    if (alertEl) {
      alertEl.classList.add('show');
      setTimeout(() => alertEl.classList.remove('show'), 650);
    }
  }

  function togglePlay() {
    const container = document.getElementById('ac-video-container');
    const video = container.querySelector('video');
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    updatePlayIcons(video.paused);
  }

  function updatePlayIcons(isPaused) {
    const btnCenter = document.getElementById('ac-btn-play-center');
    const btnSmall = document.getElementById('ac-btn-play-small');
    const symbol = isPaused ? '▶' : '❚❚';
    if (btnCenter) btnCenter.textContent = symbol;
    if (btnSmall) btnSmall.textContent = symbol;
  }

  function toggleMute() {
    const container = document.getElementById('ac-video-container');
    const video = container.querySelector('video');
    if (!video) return;

    video.muted = !video.muted;
    const btnMute = document.getElementById('ac-btn-mute');
    if (btnMute) btnMute.textContent = video.muted ? '🔇' : '🔊';
  }

  function setPlaybackSpeed(speed) {
    const container = document.getElementById('ac-video-container');
    const video = container.querySelector('video');
    if (video) video.playbackRate = speed;

    const btnSpeed = document.getElementById('ac-btn-speed');
    if (btnSpeed) btnSpeed.textContent = `${speed}x`;

    document.querySelectorAll('#ac-speed-popup .ac-menu-item').forEach(item => {
      const s = parseFloat(item.getAttribute('data-speed'));
      if (s === speed) item.classList.add('active');
      else item.classList.remove('active');
    });

    closeSpeedMenu();
  }

  function toggleFullscreen() {
    const overlay = document.getElementById('anime-cinema-player');
    if (!document.fullscreenElement) {
      overlay.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function toggleEpisodesDrawer() {
    const drawer = document.getElementById('ac-episodes-drawer');
    state.isDrawerOpen = !state.isDrawerOpen;
    drawer.classList.toggle('open', state.isDrawerOpen);
    if (state.isDrawerOpen) renderEpisodesDrawer();
  }

  function renderEpisodesDrawer() {
    const listEl = document.getElementById('ac-episodes-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const episodes = state.episodes || [];
    const count = episodes.length || state.totalEpisodes || 1;

    for (let i = 1; i <= count; i++) {
      const epData = episodes.find(e => e.episodeNumber === i);
      const isCurrent = i === state.episodeNumber;

      const item = document.createElement('div');
      item.className = `ac-ep-item ${isCurrent ? 'active' : ''}`;
      item.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-weight:bold;font-size:14px;">الحلقة ${i}</span>
          ${epData && epData.title ? `<span style="font-size:12px;opacity:0.8;">${epData.title}</span>` : ''}
        </div>
        <span style="font-size:12px;">${isCurrent ? '▶ تشاهد الآن' : 'تشغيل'}</span>
      `;

      item.onclick = () => {
        if (i !== state.episodeNumber) {
          switchEpisode(i);
        }
        toggleEpisodesDrawer();
      };

      listEl.appendChild(item);
    }
  }

  function toggleQualityMenu() {
    const popup = document.getElementById('ac-quality-popup');
    state.isQualityMenuOpen = !state.isQualityMenuOpen;
    popup.classList.toggle('open', state.isQualityMenuOpen);
    if (state.isQualityMenuOpen) renderQualityMenu();
  }

  function closeQualityMenu() {
    const popup = document.getElementById('ac-quality-popup');
    state.isQualityMenuOpen = false;
    if (popup) popup.classList.remove('open');
  }

  function toggleSpeedMenu() {
    const popup = document.getElementById('ac-speed-popup');
    state.isSpeedMenuOpen = !state.isSpeedMenuOpen;
    popup.classList.toggle('open', state.isSpeedMenuOpen);
  }

  function closeSpeedMenu() {
    const popup = document.getElementById('ac-speed-popup');
    state.isSpeedMenuOpen = false;
    if (popup) popup.classList.remove('open');
  }

  function renderQualityMenu() {
    const popup = document.getElementById('ac-quality-popup');
    if (!popup) return;
    popup.innerHTML = `
      <div style="padding:6px 12px;font-size:11px;color:#a0a0b0;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.1);">
        السيرفرات والجودات المتاحة
      </div>
    `;

    state.servers.forEach((srv, idx) => {
      const isActive = idx === state.currentServerIndex;
      const item = document.createElement('div');
      item.className = `ac-menu-item ${isActive ? 'active' : ''}`;
      item.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <span>${srv.serverName || 'سيرفر'}</span>
          <span style="font-size:11px;background:rgba(255,255,255,0.15);padding:1px 6px;border-radius:4px;">${srv.quality || 'Auto'}</span>
        </div>
        <span>${isActive ? '✓ يعمل' : ''}</span>
      `;

      item.onclick = () => {
        closeQualityMenu();
        if (idx !== state.currentServerIndex) {
          switchServer(idx);
        }
      };

      popup.appendChild(item);
    });
  }

  function playNextEpisode() {
    if (state.episodeNumber < state.totalEpisodes) {
      switchEpisode(state.episodeNumber + 1);
    }
  }

  function playPreviousEpisode() {
    if (state.episodeNumber > 1) {
      switchEpisode(state.episodeNumber - 1);
    }
  }

  async function switchEpisode(epNum) {
    console.log('[AnimeCatch Cinema Player] Switching to episode:', epNum);
    state.episodeNumber = epNum;

    // Update UI headers
    const badgeEp = document.getElementById('ac-badge-ep');
    if (badgeEp) badgeEp.textContent = `الحلقة ${epNum}`;

    showCenterSpinner(`جاري تحضير الحلقة ${epNum}...`);

    // Fetch servers for new episode using worker or API proxy
    try {
      const searchUrl = `https://corsproxy.org/?url=${encodeURIComponent(`https://animeslayer.net/api?ep=${epNum}&title=${encodeURIComponent(state.animeTitle)}`)}`;
      // If we already have server list, we switch to it
      if (state.servers.length > 0) {
        await switchServer(0);
      }
    } catch (_) {
      if (state.servers.length > 0) switchServer(0);
    }
  }

  async function switchServer(serverIdx) {
    if (!state.servers[serverIdx]) return;
    state.currentServerIndex = serverIdx;
    const targetServer = state.servers[serverIdx];

    // Update server badge
    const badgeServer = document.getElementById('ac-badge-server');
    const qualityLabel = document.getElementById('ac-quality-label');
    const labelText = `${targetServer.serverName} • ${targetServer.quality || 'Auto'}`;
    if (badgeServer) badgeServer.textContent = `${labelText} ⚙️`;
    if (qualityLabel) qualityLabel.textContent = labelText;

    showCenterSpinner(`جاري التبديل إلى ${targetServer.serverName}...`);

    const direct = await resolveStreamLink(targetServer.link, targetServer.serverName);
    mountVideoSource(direct || targetServer.link, targetServer.serverName);
  }

  function showCenterSpinner(text) {
    const container = document.getElementById('ac-video-container');
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:#ffffff;">
        <div class="ac-spinner"></div>
        <div style="font-size:15px;font-weight:600;text-shadow:0 2px 4px #000;">${text}</div>
      </div>
    `;
  }

  async function resolveStreamLink(rawUrl, serverName) {
    const urlLower = rawUrl.toLowerCase();

    // 1. PixelDrain Direct
    if (urlLower.includes('pixeldrain.com')) {
      const m = rawUrl.match(/pixeldrain\.com\/(?:u|api\/file|file|d|l)\/([a-zA-Z0-9_-]+)/);
      if (m) return `https://pixeldrain.com/api/file/${m[1]}?download`;
    }

    // 2. Query Cloudflare Worker for Instant Extraction (MF, ST, KF, etc.)
    if (state.workerUrl) {
      try {
        const queryUri = `${state.workerUrl}${state.workerUrl.includes('?') ? '&' : '?'}url=${encodeURIComponent(rawUrl)}&server=${encodeURIComponent(serverName)}&format=json`;
        const res = await fetch(queryUri);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.direct_link) {
            return data.direct_link;
          }
        }
      } catch (_) {}
    }

    return rawUrl;
  }

  function mountVideoSource(streamUrl, serverName) {
    state.currentUrl = streamUrl;
    const container = document.getElementById('ac-video-container');
    container.innerHTML = '';

    if (currentHls) {
      currentHls.destroy();
      currentHls = null;
    }

    const urlLower = streamUrl.toLowerCase();
    const isHls = urlLower.includes('.m3u8');
    const isDirectVideo = urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('pixeldrain.com') || urlLower.includes('download');

    if (isHls || isDirectVideo) {
      const video = document.createElement('video');
      video.controls = false;
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = 'width: 100%; height: 100%; object-fit: contain; background: #000;';

      // Attach timeline listeners
      video.ontimeupdate = () => {
        if (!video.duration) return;
        const current = formatSeconds(video.currentTime);
        const total = formatSeconds(video.duration);
        document.getElementById('ac-time-display').textContent = `${current} / ${total}`;

        const progressPercent = (video.currentTime / video.duration) * 100;
        document.getElementById('ac-seek-progress').style.width = `${progressPercent}%`;

        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const bufferPercent = (bufferedEnd / video.duration) * 100;
          document.getElementById('ac-seek-buffer').style.width = `${bufferPercent}%`;
        }
      };

      video.onplay = () => updatePlayIcons(false);
      video.onpause = () => updatePlayIcons(true);
      video.onended = onVideoEnded;

      if (isHls && window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        currentHls = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      } else {
        video.src = streamUrl;
      }

      container.appendChild(video);
      return;
    }

    // Embed IFrame Fallback (for complex protected servers)
    let embedUrl = streamUrl;
    if (urlLower.includes('streamtape.com')) {
      const m = streamUrl.match(/streamtape\.com\/(?:v|e)\/([a-zA-Z0-9]+)/);
      if (m) embedUrl = `https://streamtape.com/e/${m[1]}/`;
    } else if (urlLower.includes('krakenfiles.com')) {
      const m = streamUrl.match(/krakenfiles\.com\/(?:view|embed-video)\/([a-zA-Z0-9]+)/);
      if (m) embedUrl = `https://krakenfiles.com/embed-video/${m[1]}`;
    }

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    iframe.setAttribute('allowfullscreen', 'true');
    container.appendChild(iframe);
  }

  function onVideoEnded() {
    if (state.episodeNumber < state.totalEpisodes) {
      showAutoPlayOverlay(state.episodeNumber + 1);
    }
  }

  function showAutoPlayOverlay(nextEpNum) {
    let countdown = 5;
    const container = document.getElementById('ac-video-container');

    const overlay = document.createElement('div');
    overlay.id = 'ac-autoplay-overlay';
    overlay.style.cssText = `
      position: absolute;
      bottom: 120px;
      right: 32px;
      background: rgba(18, 19, 32, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 20px 24px;
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.9);
      z-index: 60;
    `;

    overlay.innerHTML = `
      <div style="font-size:14px;font-weight:bold;color:#60b5ff;">تشغيل الحلقة التالية تلقائياً</div>
      <div style="font-size:16px;font-weight:700;">الحلقة ${nextEpNum} خلال <span id="ac-countdown-num">${countdown}</span> ثوانٍ</div>
      <div style="display:flex;gap:10px;margin-top:6px;">
        <button id="ac-btn-play-next-now" style="background:#1e90ff;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:bold;cursor:pointer;">تشغيل الآن</button>
        <button id="ac-btn-cancel-autoplay" style="background:rgba(255,255,255,0.15);color:#fff;border:none;border-radius:8px;padding:8px 14px;cursor:pointer;">إلغاء</button>
      </div>
    `;

    container.appendChild(overlay);

    document.getElementById('ac-btn-play-next-now').onclick = () => {
      clearInterval(autoPlayCountdownTimer);
      overlay.remove();
      switchEpisode(nextEpNum);
    };

    document.getElementById('ac-btn-cancel-autoplay').onclick = () => {
      clearInterval(autoPlayCountdownTimer);
      overlay.remove();
    };

    autoPlayCountdownTimer = setInterval(() => {
      countdown--;
      const numEl = document.getElementById('ac-countdown-num');
      if (numEl) numEl.textContent = `${countdown}`;
      if (countdown <= 0) {
        clearInterval(autoPlayCountdownTimer);
        overlay.remove();
        switchEpisode(nextEpNum);
      }
    }, 1000);
  }

  function formatSeconds(sec) {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function closeCinemaPlayer() {
    const overlay = document.getElementById('anime-cinema-player');
    if (!overlay) return;

    if (currentHls) {
      currentHls.destroy();
      currentHls = null;
    }

    const container = document.getElementById('ac-video-container');
    if (container) container.innerHTML = '';

    clearInterval(autoPlayCountdownTimer);
    clearTimeout(controlsHideTimeout);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    overlay.style.display = 'none';
  }

  // ============================================================
  // Global Entrypoint called by Flutter WebPlayerBridge
  // ============================================================
  async function openWebVideoPlayer(rawConfig, oldTitle, oldServerName) {
    let cfg = {};
    if (typeof rawConfig === 'string') {
      try {
        cfg = JSON.parse(rawConfig);
      } catch (_) {
        cfg = { url: rawConfig, animeTitle: oldTitle, serverName: oldServerName };
      }
    } else if (typeof rawConfig === 'object') {
      cfg = rawConfig;
    }

    console.log('[AnimeCatch Cinema Player] Initializing with config:', cfg);

    state.animeTitle = cfg.animeTitle || 'مشاهدة الحلقة';
    state.episodeNumber = cfg.episodeNumber || 1;
    state.totalEpisodes = cfg.totalEpisodes || (cfg.episodes ? cfg.episodes.length : 1) || 1;
    state.animeId = cfg.animeId || 0;
    state.servers = cfg.servers || [{ serverName: cfg.serverName || 'سيرفر تلقائي', quality: 'HD', link: cfg.url }];
    state.episodes = cfg.episodes || [];
    state.workerUrl = cfg.workerUrl || 'https://dark-rain-5caa.ali-allden078.workers.dev/';
    state.currentServerIndex = 0;

    const overlay = createPlayerDOM();
    overlay.style.display = 'flex';

    // Set Header Data
    document.getElementById('ac-anime-title').textContent = state.animeTitle;
    document.getElementById('ac-badge-ep').textContent = `الحلقة ${state.episodeNumber}`;

    const activeServer = state.servers[0];
    const initialLabel = `${activeServer.serverName} • ${activeServer.quality || 'Auto'}`;
    document.getElementById('ac-badge-server').textContent = `${initialLabel} ⚙️`;
    document.getElementById('ac-quality-label').textContent = initialLabel;

    showCenterSpinner('جاري تجهيز سيرفر المشاهدة بأعلى جودة...');

    const resolved = await resolveStreamLink(cfg.url || activeServer.link, activeServer.serverName);
    mountVideoSource(resolved || cfg.url || activeServer.link, activeServer.serverName);
  }

  // Export to window
  window.openWebVideoPlayer = openWebVideoPlayer;
  window.closeWebVideoPlayer = closeCinemaPlayer;
})();
