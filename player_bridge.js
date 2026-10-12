/**
 * Anime Catch - Web Video Bridge & Native HTML5/Iframe Player
 * Handles StreamTape, PixelDrain, MediaFire, KrakenFiles, SendVid,
 * HLS (m3u8), and MP4 seamlessly on Flutter Web without CORS restrictions.
 */

(function () {
  'use strict';

  let currentHlsInstance = null;

  function createPlayerOverlay() {
    let overlay = document.getElementById('anime-web-player-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'anime-web-player-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #000000;
      z-index: 9999999;
      display: none;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      user-select: none;
    `;

    // Top Header Bar
    const header = document.createElement('div');
    header.id = 'player-top-header';
    header.style.cssText = `
      height: 56px;
      background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
    `;

    // Left: Back button & Title
    const leftGroup = document.createElement('div');
    leftGroup.style.cssText = 'display: flex; align-items: center; gap: 12px; overflow: hidden;';

    const backBtn = document.createElement('button');
    backBtn.id = 'player-back-button';
    backBtn.innerHTML = '&#8592; رجوع';
    backBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    `;
    backBtn.onmouseenter = () => backBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    backBtn.onmouseleave = () => backBtn.style.background = 'rgba(255, 255, 255, 0.15)';
    backBtn.onclick = closeWebVideoPlayer;

    const titleEl = document.createElement('div');
    titleEl.id = 'player-video-title';
    titleEl.style.cssText = `
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    `;

    leftGroup.appendChild(backBtn);
    leftGroup.appendChild(titleEl);

    // Right: Open externally button
    const extBtn = document.createElement('button');
    extBtn.id = 'player-ext-button';
    extBtn.innerHTML = '&#x2197; فتح خارجي';
    extBtn.style.cssText = `
      background: transparent;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    extBtn.onmouseenter = () => extBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    extBtn.onmouseleave = () => extBtn.style.background = 'transparent';

    header.appendChild(leftGroup);
    header.appendChild(extBtn);

    // Main Video Container
    const videoContainer = document.createElement('div');
    videoContainer.id = 'player-content-area';
    videoContainer.style.cssText = `
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    overlay.appendChild(header);
    overlay.appendChild(videoContainer);
    document.body.appendChild(overlay);

    // ESC to close
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        closeWebVideoPlayer();
      }
    });

    return overlay;
  }

  function closeWebVideoPlayer() {
    const overlay = document.getElementById('anime-web-player-overlay');
    if (!overlay) return;

    if (currentHlsInstance) {
      currentHlsInstance.destroy();
      currentHlsInstance = null;
    }

    const container = document.getElementById('player-content-area');
    if (container) {
      container.innerHTML = '';
    }

    overlay.style.display = 'none';
  }

  function showLoading(container, text) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; gap: 16px;">
        <div style="width: 44px; height: 44px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #1e90ff; border-radius: 50%; animation: animeSpin 0.9s linear infinite;"></div>
        <div style="font-size: 14px; font-weight: 600; color: #e0e0e0;">${text}</div>
      </div>
      <style>
        @keyframes animeSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  async function resolveMediaFireUrl(url) {
    if (url.includes('download') && url.includes('mediafire.com')) {
      return url;
    }

    const encoded = encodeURIComponent(url);
    const proxies = [
      `https://api.allorigins.win/raw?url=${encoded}`,
      `https://api.codetabs.com/v1/proxy?quest=${encoded}`,
      `https://corsproxy.org/?url=${encoded}`,
    ];

    for (const p of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(p, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const text = await res.text();
          // Regex for direct download URL
          const mDirect = text.match(/https?:\/\/download[0-9]*\.mediafire\.com\/[^\s"'<>]+/i);
          if (mDirect) return mDirect[0];

          const mLabel = text.match(/aria-label=["']Download file["'][\s\S]*?href=["'](https?:\/\/[^"']+)["']/i);
          if (mLabel) return mLabel[1];

          const mBtn = text.match(/id=["']downloadButton["'][\s\S]*?href=["'](https?:\/\/[^"']+)["']/i);
          if (mBtn) return mBtn[1];
        }
      } catch (_) {}
    }
    return null;
  }

  async function openWebVideoPlayer(rawUrl, title, serverName) {
    if (!rawUrl || typeof rawUrl !== 'string') return;

    console.log('[AnimeCatch Web Player] Launching:', { rawUrl, title, serverName });

    const overlay = createPlayerOverlay();
    const titleEl = document.getElementById('player-video-title');
    const extBtn = document.getElementById('player-ext-button');
    const container = document.getElementById('player-content-area');

    if (titleEl) {
      titleEl.textContent = (title || 'مشاهدة الحلقة') + (serverName ? ` (${serverName})` : '');
    }

    if (extBtn) {
      extBtn.onclick = () => window.open(rawUrl, '_blank');
    }

    container.innerHTML = '';
    overlay.style.display = 'flex';

    const urlLower = rawUrl.toLowerCase();
    const srvLower = (serverName || '').toLowerCase();

    // ==========================================
    // 1. PixelDrain (PD) - Direct HTML5 Video
    // ==========================================
    if (urlLower.includes('pixeldrain.com') || srvLower.includes('pixeldrain') || srvLower.includes('pd')) {
      let fileId = '';
      const match = rawUrl.match(/pixeldrain\.com\/(?:u|api\/file|file|d|l)\/([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];
      else if (rawUrl.includes('id=')) fileId = rawUrl.split('id=')[1].split('&')[0];

      const streamUrl = fileId ? `https://pixeldrain.com/api/file/${fileId}?download` : rawUrl;

      const video = document.createElement('video');
      video.src = streamUrl;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = 'width: 100%; height: 100%; max-height: 100%; object-fit: contain; background: #000;';
      container.appendChild(video);
      return;
    }

    // ==========================================
    // 2. StreamTape (ST) - Embed IFrame
    // ==========================================
    if (urlLower.includes('streamtape.com') || srvLower.includes('streamtape') || srvLower.includes('st')) {
      let embedUrl = rawUrl;
      const match = rawUrl.match(/streamtape\.com\/(?:v|e)\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        embedUrl = `https://streamtape.com/e/${match[1]}/`;
      }

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
      iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
      iframe.setAttribute('allowfullscreen', 'true');
      container.appendChild(iframe);
      return;
    }

    // ==========================================
    // 3. KrakenFiles (KF) - Embed IFrame
    // ==========================================
    if (urlLower.includes('krakenfiles.com') || srvLower.includes('kraken') || srvLower.includes('kf')) {
      let fileId = '';
      const match = rawUrl.match(/krakenfiles\.com\/(?:view|embed-video)\/([a-zA-Z0-9]+)/);
      if (match && match[1]) fileId = match[1];

      const embedUrl = fileId ? `https://krakenfiles.com/embed-video/${fileId}` : rawUrl;

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
      iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
      iframe.setAttribute('allowfullscreen', 'true');
      container.appendChild(iframe);
      return;
    }

    // ==========================================
    // 4. SendVid (SF) - Embed IFrame
    // ==========================================
    if (urlLower.includes('sendvid.com') || srvLower.includes('sendvid')) {
      let videoId = '';
      const match = rawUrl.match(/sendvid\.com\/(?:embed\/)?([a-zA-Z0-9]+)/);
      if (match && match[1]) videoId = match[1];

      const embedUrl = videoId ? `https://sendvid.com/embed/${videoId}` : rawUrl;
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
      iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
      iframe.setAttribute('allowfullscreen', 'true');
      container.appendChild(iframe);
      return;
    }

    // ==========================================
    // 5. MediaFire (MF) - Live Resolve & Video Mount
    // ==========================================
    if (urlLower.includes('mediafire.com') || srvLower.includes('mf')) {
      showLoading(container, 'جاري فحص وتجهيز سيرفر MediaFire للمشاهدة المباشرة...');

      const direct = await resolveMediaFireUrl(rawUrl);
      if (direct) {
        container.innerHTML = '';
        const video = document.createElement('video');
        video.src = direct;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.style.cssText = 'width: 100%; height: 100%; max-height: 100%; object-fit: contain; background: #000;';
        container.appendChild(video);
        return;
      }

      // If scraping failed or timed out, display high-end fallback card + embed
      container.innerHTML = '';
      const card = document.createElement('div');
      card.style.cssText = `
        background: #14141e;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 18px;
        padding: 32px 28px;
        text-align: center;
        max-width: 480px;
        color: #ffffff;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      `;

      card.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 12px;">📁</div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">سيرفر MediaFire</h3>
        <p style="color: #a0a0b0; font-size: 13px; margin: 0 0 24px 0; line-height: 1.5;">
          نظراً لقيود المتصفح الأمنية على روابط ميديا فاير، يمكنك فتح الرابط مباشرة للمشاهدة والتحميل بأقصى سرعة.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <a href="${rawUrl}" target="_blank" rel="noopener noreferrer" style="
            background: #1e90ff;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
          ">▶ فتح ومشاهدة في MediaFire</a>
        </div>
      `;
      container.appendChild(card);
      return;
    }

    // ==========================================
    // 6. HLS Stream (.m3u8) via Hls.js
    // ==========================================
    if (urlLower.includes('.m3u8')) {
      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = 'width: 100%; height: 100%; object-fit: contain; background: #000;';

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        currentHlsInstance = hls;
        hls.loadSource(rawUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = rawUrl;
        video.play().catch(() => {});
      } else {
        video.src = rawUrl;
      }

      container.appendChild(video);
      return;
    }

    // ==========================================
    // 7. Standard MP4 Video
    // ==========================================
    if (urlLower.includes('.mp4') || urlLower.includes('.webm')) {
      const video = document.createElement('video');
      video.src = rawUrl;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = 'width: 100%; height: 100%; object-fit: contain; background: #000;';
      container.appendChild(video);
      return;
    }

    // ==========================================
    // 8. Generic Embed IFrame fallback
    // ==========================================
    const iframe = document.createElement('iframe');
    iframe.src = rawUrl;
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    iframe.setAttribute('allowfullscreen', 'true');
    container.appendChild(iframe);
  }

  // Export to window
  window.openWebVideoPlayer = openWebVideoPlayer;
  window.closeWebVideoPlayer = closeWebVideoPlayer;
})();
