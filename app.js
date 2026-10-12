(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const trigger = $('decay-trigger');
  const triggerLabel = $('trigger-label');
  const text = $('decay-text');
  const bubble = $('decay-bubble');
  const status = $('decay-status');
  const timer = $('decay-timer');
  const ashLayer = $('ash-layer');
  const phrase = 'Then let this one fade on our terms.';
  const duration = 20;
  const halfLife = 4;
  const lambda = Math.log(2) / halfLife;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let started = 0;
  let lastSecond = -1;
  let running = false;
  const particles = [];
  function hash(i) { const n = Math.sin(i * 127.1 + 31.7) * 43758.5453; return n - Math.floor(n); }
  function renderLetters() {
    text.replaceChildren();
    particles.length = 0;
    [...phrase].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00a0' : char;
      span.dataset.threshold = String(hash(i + 17));
      span.style.setProperty('--dx', `${Math.round((hash(i + 60) - .5) * 34)}px`);
      span.style.setProperty('--dy', `${Math.round(-10 - hash(i + 98) * 26)}px`);
      span.style.setProperty('--rot', `${Math.round((hash(i + 126) - .5) * 50)}deg`);
      text.appendChild(span);
      particles.push(span);
    });
  }
  function spawnAsh() {
    if (reduceMotion.matches) return;
    const dot = document.createElement('span');
    dot.className = 'ash';
    dot.style.left = `${20 + Math.random() * 70}%`;
    dot.style.top = `${20 + Math.random() * 50}%`;
    dot.style.setProperty('--ax', `${Math.round((Math.random() - .5) * 75)}px`);
    dot.style.setProperty('--ay', `${-20 - Math.round(Math.random() * 55)}px`);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
    ashLayer.appendChild(dot);
  }
  function tick(now) {
    if (!running) return;
    const elapsed = Math.min(duration, (now - started) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    const fraction = Math.exp(-lambda * elapsed);
    const second = Math.ceil(remaining);
    if (second !== lastSecond) {
      timer.textContent = `00:${String(second).padStart(2, '0')}`;
      status.textContent = remaining > 0 ? `${Math.round(fraction * 100)}% of the signal remains` : 'The visual signal has faded';
      lastSecond = second;
      if (remaining > 0) spawnAsh();
    }
    particles.forEach((span) => span.classList.toggle('gone', Number(span.dataset.threshold) > fraction || remaining === 0));
    bubble.style.setProperty('--decay-blur', `${((1 - fraction) * 4).toFixed(2)}px`);
    bubble.style.setProperty('--decay-opacity', String(Math.max(0, fraction * 1.25 - .08)));
    bubble.style.setProperty('--decay-y', String((1 - fraction) * 9));
    bubble.style.setProperty('--decay-scale', String(1 - (1 - fraction) * .04));
    if (remaining <= 0) {
      running = false;
      bubble.classList.add('vanished');
      bubble.setAttribute('aria-label', 'The sample message has faded in the visual demo');
      trigger.disabled = false;
      triggerLabel.textContent = 'Replay decay';
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  function start() {
    cancelAnimationFrame(frame);
    ashLayer.replaceChildren();
    renderLetters();
    bubble.classList.remove('vanished');
    bubble.classList.add('decaying');
    bubble.removeAttribute('aria-label');
    bubble.style.setProperty('--decay-blur', '0px');
    bubble.style.setProperty('--decay-opacity', '1');
    bubble.style.setProperty('--decay-y', '0');
    bubble.style.setProperty('--decay-scale', '1');
    timer.textContent = '00:20';
    status.textContent = '100% of the signal remains';
    lastSecond = -1;
    trigger.disabled = true;
    triggerLabel.textContent = 'Decaying…';
    running = true;
    started = performance.now();
    frame = requestAnimationFrame(tick);
  }
  renderLetters();
  trigger.addEventListener('click', start);
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries, self) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); self.unobserve(entry.target); } });
    }, { threshold: .08, rootMargin: '0px 0px 70px 0px' });
    reveals.forEach((element) => observer.observe(element));
  } else reveals.forEach((element) => element.classList.add('is-visible'));
  const form = $('access-form');
  const input = $('handle');
  const error = $('handle-error');
  const dialog = $('confirmation-dialog');
  const close = () => { if (dialog.open) dialog.close(); };
  $('dialog-close').addEventListener('click', close);
  $('dialog-done').addEventListener('click', close);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  input.addEventListener('input', () => { error.textContent = ''; input.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim().replace(/^@/, '');
    if (!/^[a-zA-Z][a-zA-Z0-9_]{2,23}$/.test(value)) {
      error.textContent = 'Use 3–24 characters, beginning with a letter. Letters, numbers and underscores only.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    $('preview-handle').textContent = `@${value}`;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { error.textContent = `@${value} is a preview only. No reservation was made.`; }
  });
})();