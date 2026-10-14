/**
 * Anime Catch - Cinematic Ultra-Luxurious Web Video Player
 * Complete Netflix / Crunchyroll-style player for Flutter Web.
 * 
 * Features:
 *   - Quality & Server live switcher (1080p FHD, 720p HD, 480p SD, MF, ST, PD, KF, BK, SA)
 *   - In-player Episode Drawer & quick Next/Previous episode navigation
 *   - High-precision SVG vector icons (Zero childish emojis)
 *   - Strictly oriented seek controls: Left = Rewind -10s, Right = Forward +10s
 *   - Zeroed-out initial time indicator (00:00 / 00:00) during loading and buffering
 *   - High-grade error modal dialog on link failure or server disconnection
 *   - Full Android & Mobile responsiveness with prominent fullscreen controls
 *   - Cloudflare Worker link resolution with zero CORS restrictions
 *   - Interactive scrubbing timeline with buffer indicator
 *   - Full keyboard shortcuts (Space, F, M, Arrows, N, P, Esc)
 */

(function () {
  'use strict';

  // Crisp, professional SVG Vector Icons
  const ICONS = {
    play: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
    rewind10: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12.5 4a8.5 8.5 0 1 0 8.5 8.5" stroke-linecap="round"/><path d="M12.5 1.5l-3 2.5 3 2.5v-5z" fill="currentColor"/><text x="12" y="16.2" font-size="7.5" font-weight="900" fill="currentColor" text-anchor="middle" stroke="none">10</text></svg>',
    forward10: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11.5 4a8.5 8.5 0 1 1-8.5 8.5" stroke-linecap="round"/><path d="M11.5 1.5l3 2.5-3 2.5v-5z" fill="currentColor"/><text x="12" y="16.2" font-size="7.5" font-weight="900" fill="currentColor" text-anchor="middle" stroke="none">10</text></svg>',
    prevEp: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2.5v12H6zm3 6l9 6V6z"/></svg>',
    nextEp: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18l9-6-9-6v12zm9.5-12v12H18V6z"/></svg>',
    volumeUp: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    volumeMute: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
    fullscreenExit: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
    episodes: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 10h12v2H4zm0-4h12v2H4zm0 8h8v2H4zm10 0v6l5-3z"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    external: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    error: '<svg viewBox="0 0 24 24" width="34" height="34" fill="#ff5252"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
  };

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
    isLoading: false,
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
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        width: 100dvw;
        height: 100vh;
        height: 100dvh;
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
        background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 100%);
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
        gap: 12px;
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
        backdrop-filter: blur(10px);
        transition: all 0.2s ease;
        flex-shrink: 0;
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
        backdrop-filter: blur(10px);
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .ac-btn-pill:hover, .ac-btn-pill.active {
        background: #1e90ff;
        border-color: #1e90ff;
        box-shadow: 0 0 16px rgba(30, 144, 255, 0.5);
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
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .ac-center-controls {
        align-self: center;
        display: flex;
        align-items: center;
        gap: 24px;
        direction: ltr; /* Strict left-to-right geometry for control positioning */
      }
      .ac-btn-big-play {
        width: 66px;
        height: 66px;
        border-radius: 50%;
        background: #1e90ff;
        color: #fff;
        border: 2px solid rgba(255, 255, 255, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 30px rgba(30, 144, 255, 0.6);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .ac-btn-big-play:hover {
        transform: scale(1.12);
        background: #0077ea;
      }
      .ac-btn-secondary {
        width: 46px;
        height: 46px;
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
        height: 22px;
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
        gap: 12px;
      }
      .ac-controls-group {
        display: flex;
        align-items: center;
        gap: 10px;
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
        width: 330px;
        background: rgba(14, 15, 26, 0.98);
        backdrop-filter: blur(24px);
        border-left: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: -10px 0 40px rgba(0,0,0,0.85);
        display: flex;
        flex-direction: column;
        z-index: 50;
        transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ac-drawer.open {
        right: 0;
      }
      .ac-drawer-header {
        padding: 18px 18px 14px 18px;
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
        bottom: 74px;
        background: rgba(18, 19, 32, 0.96);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        padding: 8px;
        display: none;
        flex-direction: column;
        gap: 4px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.85);
        z-index: 40;
        min-width: 190px;
        max-height: 280px;
        overflow-y: auto;
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
        width: 50px;
        height: 50px;
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
        padding: 14px 24px;
        border-radius: 40px;
        background: rgba(0,0,0,0.85);
        border: 1px solid rgba(255,255,255,0.3);
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 25;
      }
      .ac-seek-alert.show {
        opacity: 1;
      }

      /* Professional Error Modal */
      .ac-error-modal {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(12px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 60;
        padding: 16px;
      }
      .ac-error-modal.show {
        display: flex;
      }
      .ac-error-card {
        background: #151622;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 20px;
        padding: 28px 24px;
        max-width: 420px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 15px 50px rgba(0,0,0,0.9);
      }
      .ac-error-title {
        color: #ffffff;
        font-size: 18px;
        font-weight: 700;
        margin-top: 12px;
      }
      .ac-error-msg {
        color: rgba(255,255,255,0.7);
        font-size: 13.5px;
        line-height: 1.5;
        margin-top: 8px;
        margin-bottom: 22px;
      }
      .ac-error-actions {
        display: flex;
        gap: 10px;
        width: 100%;
      }
      .ac-btn-modal {
        flex: 1;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
      }
      .ac-btn-modal.primary {
        background: #1e90ff;
        color: #ffffff;
      }
      .ac-btn-modal.primary:hover {
        background: #0077ea;
      }
      .ac-btn-modal.secondary {
        background: rgba(255,255,255,0.12);
        color: #ffffff;
        border: 1px solid rgba(255,255,255,0.2);
      }
      .ac-btn-modal.secondary:hover {
        background: rgba(255,255,255,0.22);
      }

      .ac-btn-fullscreen-top {
        background: rgba(30, 144, 255, 0.3) !important;
        border: 1.5px solid #1e90ff !important;
        color: #ffffff !important;
      }
      .ac-btn-fullscreen-floating {
        display: none;
        position: absolute;
        bottom: 86px;
        right: 18px;
        background: #1e90ff;
        color: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 28px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 700;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        box-shadow: 0 4px 22px rgba(30, 144, 255, 0.85), 0 2px 8px rgba(0,0,0,0.8);
        z-index: 35;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .ac-btn-fullscreen-floating:hover {
        transform: scale(1.08);
      }

      /* Mobile & Android Responsiveness */
      @media (max-width: 650px) {
        .ac-controls-layer {
          padding: 10px 12px 34px 12px !important;
          padding-top: max(12px, env(safe-area-inset-top, 12px)) !important;
          padding-bottom: max(36px, env(safe-area-inset-bottom, 36px)) !important;
        }
        .ac-header {
          gap: 6px;
        }
        .ac-header-left {
          gap: 6px;
          flex: 1;
          min-width: 0;
        }
        .ac-title-group {
          flex: 1;
          min-width: 0;
        }
        .ac-anime-title {
          max-width: 120px;
          font-size: 12.5px;
        }
        .ac-badges-row {
          gap: 4px;
        }
        .ac-badge {
          font-size: 10px;
          padding: 1px 6px;
        }
        .ac-controls-group {
          gap: 6px;
        }
        .ac-btn-pill {
          padding: 5px 8px;
          font-size: 11px;
          gap: 4px;
        }
        .ac-btn-icon {
          width: 36px;
          height: 36px;
        }
        .ac-center-controls {
          gap: 14px;
        }
        .ac-btn-big-play {
          width: 54px;
          height: 54px;
        }
        .ac-btn-secondary {
          width: 40px;
          height: 40px;
        }
        .ac-drawer {
          width: 82vw;
        }
        #ac-btn-ext {
          display: none;
        }
        .ac-btn-fullscreen-floating {
          display: flex !important;
          bottom: 84px !important;
          right: 14px !important;
        }
        .ac-bottom-bar {
          margin-bottom: max(18px, env(safe-area-inset-bottom, 18px)) !important;
          gap: 10px !important;
        }
        .ac-bottom-controls {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          visibility: visible !important;
          opacity: 1 !important;
          min-height: 46px !important;
        }
        .ac-btn-fullscreen-prominent {
          width: 44px !important;
          height: 44px !important;
          background: #1e90ff !important;
          color: #ffffff !important;
          border: 2px solid #ffffff !important;
          box-shadow: 0 0 16px rgba(30, 144, 255, 0.9) !important;
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      }
    `;
    document.head.appendChild(style);

    overlay.innerHTML = `
      <div class="ac-video-wrap" id="ac-video-container"></div>
      
      <div class="ac-overlay-gradient">
        <div class="ac-top-gradient"></div>
        <div class="ac-bottom-gradient"></div>
      </div>

      <!-- Strict Seek Feedback Indicators: Left = Rewind -10s, Right = Forward +10s -->
      <div id="ac-seek-left" class="ac-seek-alert" style="left: 10%;">
        ${ICONS.rewind10}
        <span>10s-</span>
      </div>
      <div id="ac-seek-right" class="ac-seek-alert" style="right: 10%;">
        <span>10s+</span>
        ${ICONS.forward10}
      </div>

      <!-- Controls Overlay -->
      <div class="ac-controls-layer" id="ac-controls-layer">
        <!-- Top Bar -->
        <div class="ac-header">
          <div class="ac-header-left">
            <button class="ac-btn-pill" id="ac-btn-back">
              ${ICONS.back}
              <span>رجوع</span>
            </button>
            <div class="ac-title-group">
              <span class="ac-anime-title" id="ac-anime-title">Anime Catch</span>
              <div class="ac-badges-row">
                <span class="ac-badge ac-badge-ep" id="ac-badge-ep">الحلقة 1</span>
                <span class="ac-badge ac-badge-server" id="ac-badge-server">
                  ${ICONS.settings}
                  <span id="ac-badge-server-text">سيرفر المشاهدة</span>
                </span>
              </div>
            </div>
          </div>

          <div class="ac-controls-group">
            <button class="ac-btn-pill" id="ac-btn-quality">
              ${ICONS.settings}
              <span id="ac-quality-label">السيرفر والجودة</span>
            </button>
            <button class="ac-btn-pill" id="ac-btn-episodes">
              ${ICONS.episodes}
              <span>الحلقات</span>
            </button>
            <button class="ac-btn-icon ac-btn-fullscreen-top" id="ac-btn-fullscreen-top" title="ملء الشاشة">${ICONS.fullscreen}</button>
            <button class="ac-btn-icon" id="ac-btn-ext" title="فتح خارجي">${ICONS.external}</button>
            <button class="ac-btn-icon" id="ac-btn-close" title="إغلاق">${ICONS.close}</button>
          </div>
        </div>

        <!-- Center Controls: Strictly [Previous] [Rewind -10s] [PLAY] [Forward +10s] [Next] -->
        <div class="ac-center-controls">
          <button class="ac-btn-secondary" id="ac-btn-prev-ep" title="الحلقة السابقة">${ICONS.prevEp}</button>
          <button class="ac-btn-secondary" id="ac-btn-rwd10" title="تأخير 10 ثوانٍ (Rewind -10s)">${ICONS.rewind10}</button>
          <button class="ac-btn-big-play" id="ac-btn-play-center" title="تشغيل / إيقاف">${ICONS.play}</button>
          <button class="ac-btn-secondary" id="ac-btn-fwd10" title="تقديم 10 ثوانٍ (Forward +10s)">${ICONS.forward10}</button>
          <button class="ac-btn-secondary" id="ac-btn-next-ep" title="الحلقة التالية">${ICONS.nextEp}</button>
        </div>

        <!-- Floating Fullscreen Button: Always visible above the line on all phone screens -->
        <button class="ac-btn-fullscreen-floating" id="ac-btn-fullscreen-float" title="ملء الشاشة">
          ${ICONS.fullscreen}
          <span id="ac-fullscreen-float-text">تكبير الشاشة</span>
        </button>

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
              <button class="ac-btn-icon" id="ac-btn-play-small" style="width:38px;height:38px;" title="تشغيل / إيقاف">${ICONS.play}</button>
              <button class="ac-btn-icon" id="ac-btn-mute" style="width:38px;height:38px;" title="كتم / تفعيل الصوت">${ICONS.volumeUp}</button>
              <span class="ac-time-display" id="ac-time-display">00:00 / 00:00</span>
            </div>

            <div class="ac-controls-group">
              <button class="ac-btn-pill" id="ac-btn-speed" style="padding:4px 12px;font-size:12px;" title="سرعة التشغيل">1.0x</button>
              <button class="ac-btn-icon ac-btn-fullscreen-prominent" id="ac-btn-fullscreen" style="width:38px;height:38px;" title="ملء الشاشة">${ICONS.fullscreen}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Popups -->
      <div class="ac-menu-popup" id="ac-quality-popup" style="right: 120px;"></div>
      <div class="ac-menu-popup" id="ac-speed-popup" style="right: 60px;">
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
            ${ICONS.episodes}
            <span style="font-weight:bold;font-size:15px;">قائمة الحلقات</span>
          </div>
          <button class="ac-btn-icon" id="ac-btn-drawer-close" style="width:32px;height:32px;">${ICONS.close}</button>
        </div>
        <div class="ac-drawer-content" id="ac-episodes-list"></div>
      </div>

      <!-- Error Modal Dialog -->
      <div class="ac-error-modal" id="ac-error-modal">
        <div class="ac-error-card">
          ${ICONS.error}
          <div class="ac-error-title">تعذر تشغيل هذا السيرفر</div>
          <div class="ac-error-msg" id="ac-error-msg">السيرفر الحالي لا يستجيب أو الرابط غير صالح حالياً.</div>
          <div class="ac-error-actions">
            <button class="ac-btn-modal primary" id="ac-btn-err-next">تجربة سيرفر آخر</button>
            <button class="ac-btn-modal secondary" id="ac-btn-err-retry">إعادة المحاولة</button>
            <button class="ac-btn-modal secondary" id="ac-btn-err-close">إغلاق</button>
          </div>
        </div>
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
          seekRelative(-10); // Strictly Rewind on left
        } else if (clickX > rect.width * 0.6) {
          seekRelative(10); // Strictly Forward on right
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

    // Strictly: Left = Rewind -10, Right = Forward +10
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

    // Fullscreen toggle (Android, Mobile & Desktop compatible)
    document.getElementById('ac-btn-fullscreen').onclick = toggleFullscreen;
    const btnFsTop = document.getElementById('ac-btn-fullscreen-top');
    if (btnFsTop) btnFsTop.onclick = toggleFullscreen;
    const btnFsFloat = document.getElementById('ac-btn-fullscreen-float');
    if (btnFsFloat) btnFsFloat.onclick = toggleFullscreen;

    // Seekbar scrubbing
    const seekBar = document.getElementById('ac-seek-bar-container');
    seekBar.onclick = (e) => {
      const video = container.querySelector('video');
      if (!video || !video.duration) return;
      const rect = seekBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    };

    // Error Dialog Buttons
    document.getElementById('ac-btn-err-next').onclick = () => {
      hideErrorDialog();
      playNextServer();
    };
    document.getElementById('ac-btn-err-retry').onclick = () => {
      hideErrorDialog();
      switchServer(state.currentServerIndex);
    };
    document.getElementById('ac-btn-err-close').onclick = () => {
      hideErrorDialog();
      closeCinemaPlayer();
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
      seekRelative(-10); // Strictly Rewind
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekRelative(10); // Strictly Forward
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
    const symbol = isPaused ? ICONS.play : ICONS.pause;
    if (btnCenter) btnCenter.innerHTML = symbol;
    if (btnSmall) btnSmall.innerHTML = symbol;
  }

  function toggleMute() {
    const container = document.getElementById('ac-video-container');
    const video = container.querySelector('video');
    if (!video) return;

    video.muted = !video.muted;
    const btnMute = document.getElementById('ac-btn-mute');
    if (btnMute) btnMute.innerHTML = video.muted ? ICONS.volumeMute : ICONS.volumeUp;
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
    const video = overlay ? overlay.querySelector('video') : null;

    const isFs = document.fullscreenElement || 
                 document.webkitFullscreenElement || 
                 document.mozFullScreenElement || 
                 document.msFullscreenElement ||
                 (video && video.webkitDisplayingFullscreen);

    const btnFs = document.getElementById('ac-btn-fullscreen');

    if (!isFs) {
      const reqFs = (overlay && (overlay.requestFullscreen || overlay.webkitRequestFullscreen || overlay.mozRequestFullScreen || overlay.msRequestFullscreen)) ||
                    (document.documentElement && (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen));

      if (reqFs) {
        reqFs.call(overlay || document.documentElement).then(() => {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        }).catch(() => {
          if (video && video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
          }
        });
      } else if (video && video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }

      if (btnFs) btnFs.innerHTML = ICONS.fullscreenExit;
      const btnFsTop = document.getElementById('ac-btn-fullscreen-top');
      if (btnFsTop) btnFsTop.innerHTML = ICONS.fullscreenExit;
      const btnFsFloat = document.getElementById('ac-btn-fullscreen-float');
      if (btnFsFloat) {
        btnFsFloat.innerHTML = `${ICONS.fullscreenExit}<span>تصغير</span>`;
      }
    } else {
      const exitFs = document.exitFullscreen || 
                     document.webkitExitFullscreen || 
                     document.mozCancelFullScreen || 
                     document.msExitFullscreen;
      if (exitFs) {
        exitFs.call(document).catch(() => {});
      }
      if (video && video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      if (btnFs) btnFs.innerHTML = ICONS.fullscreen;
      const btnFsTop = document.getElementById('ac-btn-fullscreen-top');
      if (btnFsTop) btnFsTop.innerHTML = ICONS.fullscreen;
      const btnFsFloat = document.getElementById('ac-btn-fullscreen-float');
      if (btnFsFloat) {
        btnFsFloat.innerHTML = `${ICONS.fullscreen}<span>تكبير الشاشة</span>`;
      }
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
        <span style="font-size:12px;">${isCurrent ? 'تشاهد الآن' : 'تشغيل'}</span>
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
        <span>${isActive ? ICONS.check : ''}</span>
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

  function playNextServer() {
    if (state.servers.length > 1) {
      const nextIdx = (state.currentServerIndex + 1) % state.servers.length;
      switchServer(nextIdx);
    } else {
      switchServer(state.currentServerIndex);
    }
  }

  async function switchEpisode(epNum) {
    console.log('[AnimeCatch Cinema Player] Switching to episode:', epNum);
    state.episodeNumber = epNum;

    // Update UI headers
    const badgeEp = document.getElementById('ac-badge-ep');
    if (badgeEp) badgeEp.textContent = `الحلقة ${epNum}`;

    showCenterSpinner(`جاري تحضير الحلقة ${epNum}...`);

    // Reset progress and zero out time
    resetTimeDisplay();

    // Notify Flutter Web parent if registered
    if (window.flutterOnEpisodeChange) {
      try {
        window.flutterOnEpisodeChange(epNum);
      } catch (_) {}
    }
  }

  async function switchServer(serverIdx) {
    if (!state.servers || !state.servers[serverIdx]) return;
    state.currentServerIndex = serverIdx;
    const targetServer = state.servers[serverIdx];

    // Update server badge
    const badgeText = document.getElementById('ac-badge-server-text');
    const qualityLabel = document.getElementById('ac-quality-label');
    const labelText = `${targetServer.serverName} • ${targetServer.quality || 'Auto'}`;
    if (badgeText) badgeText.textContent = labelText;
    if (qualityLabel) qualityLabel.textContent = labelText;

    resetTimeDisplay();
    showCenterSpinner(`جاري التبديل إلى ${targetServer.serverName}...`);

    const direct = await resolveStreamLink(targetServer.link, targetServer.serverName);
    mountVideoSource(direct || targetServer.link, targetServer.serverName);
  }

  function showCenterSpinner(text) {
    state.isLoading = true;
    const container = document.getElementById('ac-video-container');
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:#ffffff;">
        <div class="ac-spinner"></div>
        <div style="font-size:15px;font-weight:600;text-shadow:0 2px 4px #000;">${text}</div>
      </div>
    `;
  }

  function resetTimeDisplay() {
    const timeDisplay = document.getElementById('ac-time-display');
    if (timeDisplay) timeDisplay.textContent = '00:00 / 00:00';
    const progress = document.getElementById('ac-seek-progress');
    if (progress) progress.style.width = '0%';
    const buffer = document.getElementById('ac-seek-buffer');
    if (buffer) buffer.style.width = '0%';
  }

  function showErrorDialog(serverName, customMsg) {
    const modal = document.getElementById('ac-error-modal');
    const msgEl = document.getElementById('ac-error-msg');
    if (msgEl) {
      msgEl.innerHTML = customMsg || `تعذر تشغيل سيرفر المشاهدة (<b>${serverName}</b>). يمكنك الانتقال لسيرفر آخر أو إعادة المحاولة.`;
    }
    if (modal) modal.classList.add('show');
  }

  function hideErrorDialog() {
    const modal = document.getElementById('ac-error-modal');
    if (modal) modal.classList.remove('show');
  }

  async function resolveStreamLink(rawUrl, serverName) {
    if (!rawUrl) return '';
    const urlLower = rawUrl.toLowerCase();

    // 1. PixelDrain Direct Conversion (Use INLINE stream, NOT ?download to allow HTML5 <video> streaming)
    if (urlLower.includes('pixeldrain.com')) {
      const cleanUrl = rawUrl.replace('?download', '').replace('&download', '');
      const m = cleanUrl.match(/pixeldrain\.com\/(?:u|api\/file|file|d|l)\/([a-zA-Z0-9_-]+)/);
      let fileId = m ? m[1] : '';
      if (!fileId && cleanUrl.includes('id=')) {
        fileId = cleanUrl.split('id=')[1].split('&')[0];
      }
      if (fileId) {
        return `https://pixeldrain.com/api/file/${fileId}`;
      }
    }

    // 2. Query Cloudflare Worker for Instant Link Resolution (MF, ST, KF, BK, etc.)
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
      } catch (err) {
        console.warn('[Cinema Player] Worker resolution error:', err);
      }
    }

    return rawUrl;
  }

  function mountVideoSource(streamUrl, serverName) {
    hideErrorDialog();
    state.currentUrl = streamUrl;
    const container = document.getElementById('ac-video-container');
    container.innerHTML = '';

    if (currentHls) {
      currentHls.destroy();
      currentHls = null;
    }

    const urlLower = streamUrl.toLowerCase();
    const isHls = urlLower.includes('.m3u8');
    const isDirectVideo = urlLower.includes('.mp4') || 
                          urlLower.includes('.webm') || 
                          urlLower.includes('pixeldrain.com') || 
                          urlLower.includes('tapecontent.net') ||
                          urlLower.includes('bkvideo') ||
                          urlLower.includes('download');

    if (isHls || isDirectVideo) {
      const video = document.createElement('video');
      video.controls = false;
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = 'width: 100%; height: 100%; object-fit: contain; background: #000;';

      // Always reset time while loading
      resetTimeDisplay();

      video.onloadedmetadata = () => {
        state.isLoading = false;
        if (video.duration && !isNaN(video.duration)) {
          const total = formatSeconds(video.duration);
          document.getElementById('ac-time-display').textContent = `00:00 / ${total}`;
        }
      };

      // Attach timeline listeners
      video.ontimeupdate = () => {
        if (!video.duration || isNaN(video.duration)) return;
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

      video.onerror = (e) => {
        console.warn('[Cinema Player] Video direct playback error:', e);
        // Automatic Fallback: If direct stream fails (e.g. ISP block or CORS), retry through worker proxy!
        if (state.workerUrl && !streamUrl.startsWith(state.workerUrl)) {
          console.log('[Cinema Player] Retrying video via Cloudflare Worker proxy stream...');
          const proxiedUrl = `${state.workerUrl}${state.workerUrl.includes('?') ? '&' : '?'}url=${encodeURIComponent(streamUrl)}`;
          video.onerror = () => {
            showErrorDialog(serverName);
          };
          video.src = proxiedUrl;
          video.load();
          video.play().catch(() => {});
          return;
        }
        showErrorDialog(serverName);
      };

      if (isHls && window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        currentHls = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            showErrorDialog(serverName);
          }
        });
      } else {
        video.src = streamUrl;
        video.load();
        video.play().catch(() => {});
      }

      container.appendChild(video);
      return;
    }

    // Embed IFrame Fallback (for complex protected web embeds)
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
    hideErrorDialog();

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    overlay.style.display = 'none';
  }

  // ============================================================
  // Global Entrypoints called by Flutter WebPlayerBridge
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
    state.servers = (cfg.servers && cfg.servers.length > 0)
        ? cfg.servers
        : [{ serverName: cfg.serverName || 'سيرفر تلقائي', quality: 'HD', link: cfg.url }];
    state.episodes = cfg.episodes || [];
    state.workerUrl = cfg.workerUrl || 'https://dark-rain-5caa.ali-allden078.workers.dev/';

    // Match exact clicked server index
    let activeIdx = 0;
    if (cfg.serverName || cfg.url) {
      const found = state.servers.findIndex(s =>
        (cfg.url && s.link === cfg.url) ||
        (cfg.serverName && s.serverName && s.serverName.toLowerCase() === cfg.serverName.toLowerCase())
      );
      if (found !== -1) activeIdx = found;
    }
    state.currentServerIndex = activeIdx;

    const overlay = createPlayerDOM();
    overlay.style.display = 'flex';

    // Set Header Data
    document.getElementById('ac-anime-title').textContent = state.animeTitle;
    document.getElementById('ac-badge-ep').textContent = `الحلقة ${state.episodeNumber}`;

    const activeServer = state.servers[activeIdx] || state.servers[0];
    const initialLabel = `${activeServer.serverName} • ${activeServer.quality || 'Auto'}`;
    const badgeText = document.getElementById('ac-badge-server-text');
    if (badgeText) badgeText.textContent = initialLabel;
    const qualityLabel = document.getElementById('ac-quality-label');
    if (qualityLabel) qualityLabel.textContent = initialLabel;

    resetTimeDisplay();
    showCenterSpinner('جاري تجهيز سيرفر المشاهدة بأعلى جودة...');

    const resolved = await resolveStreamLink(cfg.url || activeServer.link, activeServer.serverName);
    mountVideoSource(resolved || cfg.url || activeServer.link, activeServer.serverName);
  }

  // Dynamic server update from Flutter when episode changes
  function updateWebPlayerServers(rawServers, epNum) {
    let servers = [];
    if (typeof rawServers === 'string') {
      try { servers = JSON.parse(rawServers); } catch (_) {}
    } else if (Array.isArray(rawServers)) {
      servers = rawServers;
    }

    if (servers && servers.length > 0) {
      state.servers = servers;
      if (epNum) state.episodeNumber = epNum;
      switchServer(0);
    }
  }

  // Export to window
  window.openWebVideoPlayer = openWebVideoPlayer;
  window.closeWebVideoPlayer = closeCinemaPlayer;
  window.updateWebPlayerServers = updateWebPlayerServers;
})();
