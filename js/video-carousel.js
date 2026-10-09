(() => {
  const section = document.querySelector('.video-gallery');
  if (!section) return;
  const track = section.querySelector('.video-track');
  const cards = [...section.querySelectorAll('.video-card')];
  const states = cards.map(card => ({ card, player: null, ready: null, wanted: false, sound: false }));
  let active = 0;
  let scriptReady;
  function loadRuntime() {
    if (!scriptReady) scriptReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://fast.wistia.com/player.js';
      script.async = true;
      script.onload = () => customElements.whenDefined('wistia-player').then(resolve);
      script.onerror = () => { script.remove(); scriptReady = null; reject(new Error('Player unavailable')); };
      document.head.append(script);
    });
    return scriptReady;
  }
  function stop(state) {
    state.wanted = false;
    state.player?.pause?.();
    state.card.classList.remove('is-playing', 'is-loading');
    state.card.querySelector('.video-play-icon').textContent = '▶';
    state.card.querySelector('.video-toggle').setAttribute('aria-pressed', 'false');
    state.card.querySelector('.video-toggle').setAttribute('aria-label', 'Phát video ' + (states.indexOf(state) + 1));
  }
  async function prepare(state) {
    if (state.ready) return state.ready;
    state.ready = (async () => {
      await loadRuntime();
      return new Promise((resolve, reject) => {
        const player = document.createElement('wistia-player');
        state.player = player;
        const timer = setTimeout(() => reject(new Error('Player timeout')), 20000);
        player.setAttribute('media-id', state.card.dataset.mediaId);
        player.setAttribute('preload', 'none');
        player.setAttribute('muted', 'true');
        player.setAttribute('do-not-track', 'true');
        player.setAttribute('big-play-button', 'false');
        player.setAttribute('controls-visible-on-load', 'false');
        player.addEventListener('api-ready', () => { clearTimeout(timer); resolve(player); }, { once: true });
        player.addEventListener('play', () => {
          if (!state.wanted || document.hidden) { player.pause(); return; }
          state.card.classList.add('is-playing');
          state.card.querySelector('.video-play-icon').textContent = 'Ⅱ';
          state.card.querySelector('.video-toggle').setAttribute('aria-pressed', 'true');
          state.card.querySelector('.video-toggle').setAttribute('aria-label', 'Tạm dừng video ' + (states.indexOf(state) + 1));
        });
        player.addEventListener('pause', () => state.card.classList.remove('is-playing'));
        player.addEventListener('ended', () => stop(state));
        state.card.querySelector('.video-mount').append(player);
      });
    })().catch(error => {
      state.player?.remove(); state.player = null; state.ready = null; throw error;
    });
    return state.ready;
  }
  async function start(state) {
    if (states[active] !== state) return;
    states.forEach(other => { if (other !== state) stop(other); });
    state.wanted = true;
    state.card.classList.add('is-loading');
    state.card.querySelector('.video-toggle').setAttribute('aria-busy', 'true');
    try {
      const player = await prepare(state);

      if (!state.wanted || document.hidden) return;
      player.muted = !state.sound;
      await player.play();
      if (!state.wanted) player.pause();
    } catch {
      stop(state);
    } finally {
      state.card.classList.remove('is-loading');
      state.card.querySelector('.video-toggle').removeAttribute('aria-busy');
    }
  }
  states.forEach(state => {
    state.card.querySelector('.video-toggle').addEventListener('click', () => {
      if (state.wanted) stop(state); else start(state);
    });
    state.card.querySelector('.video-sound').addEventListener('click', () => {
      state.sound = !state.sound;
      const button = state.card.querySelector('.video-sound');
      const label = state.sound ? 'Tắt tiếng' : 'Bật tiếng';
      button.setAttribute('aria-label', label);
      button.title = label;
      button.setAttribute('aria-pressed', String(state.sound));
      if (state.player) state.player.muted = !state.sound;
    });
  });
  const prev = section.querySelector('.video-prev');
  const next = section.querySelector('.video-next');
  function update() {
    cards.forEach((card, index) => {
      const offset = (index - active + cards.length) % cards.length;
      card.classList.toggle('is-active', offset === 0);
      card.classList.toggle('is-next', offset === 1);
      card.classList.toggle('is-prev', offset === cards.length - 1);
      card.inert = offset !== 0;
      card.setAttribute('aria-hidden', String(offset !== 0));
    });
  }
  function move(direction) {
    states.forEach(stop);
    active = (active + direction + cards.length) % cards.length;
    update();
  }
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  section.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
      track.focus({ preventScroll: true });
    }
  });
  let touchStart = null;
  let suppressClick = false;
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') touchStart = { x: event.clientX, y: event.clientY };
  });
  track.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick = true;
      move(dx < 0 ? 1 : -1);
      setTimeout(() => { suppressClick = false; }, 0);
    }
  });
  track.addEventListener('pointercancel', () => { touchStart = null; });
  track.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting || entry.intersectionRatio < .5) stop(states.find(state => state.card === entry.target));
  }), { threshold: [0, .5] });
  cards.forEach(card => observer.observe(card));
  document.addEventListener('visibilitychange', () => { if (document.hidden) states.forEach(stop); });
  window.addEventListener('resize', update);
  update();
})();
