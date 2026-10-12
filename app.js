(() => {
  'use strict';

  // Mobile Navigation Drawer Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.textContent = isOpen ? '✕' : '☰';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
        document.body.style.overflow = '';
      });
    });
  }

  // Handle Reservation Modal
  const claimForm = document.getElementById('claim-form');
  const claimInput = document.getElementById('claim-input');
  const modalOverlay = document.getElementById('claim-modal');
  const modalClose = document.getElementById('modal-close');
  const modalHandleText = document.getElementById('modal-handle-text');

  if (claimForm && claimInput && modalOverlay) {
    claimForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = claimInput.value.trim().replace(/^@/, '');
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,23}$/.test(val)) {
        alert('Please enter a valid handle: 3-24 characters, letters, numbers, or underscores.');
        return;
      }
      if (modalHandleText) {
        modalHandleText.textContent = `@${val}`;
      }
      modalOverlay.classList.add('active');
    });

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // Burn Timer Simulation
  const triggerBtn = document.getElementById('burn-trigger');
  const resetBtn = document.getElementById('burn-reset');
  const timerDisplay = document.getElementById('burn-timer-display');
  const statusDisplay = document.getElementById('burn-status-display');
  const decayBubble = document.getElementById('decay-bubble');
  const decayMessage = document.getElementById('decay-message');

  if (triggerBtn && timerDisplay && statusDisplay && decayBubble && decayMessage) {
    const totalDuration = 20; // 20 seconds total
    const legibilityThreshold = 0.8; // 80% duration is completely legible (~16s)
    let animationFrame = null;
    let startTime = 0;
    let isRunning = false;

    const originalText = decayMessage.textContent;

    function updateSimulation(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const progress = Math.min(1, elapsed / totalDuration);
      const remainingSeconds = Math.max(0, Math.ceil(totalDuration - elapsed));

      timerDisplay.textContent = `00:${String(remainingSeconds).padStart(2, '0')}`;

      if (progress < legibilityThreshold) {
        // First 80%: Text remains crisp and readable
        const remainingPct = Math.round((1 - progress) * 100);
        statusDisplay.textContent = `Decay active · ${remainingPct}% signal integrity`;
        decayBubble.style.opacity = '1';
        decayBubble.style.filter = 'none';
        decayMessage.textContent = originalText;
      } else {
        // Final 20%: Smooth dimming, subtle blur, dissolving into fine digital noise
        const decayPhase = (progress - legibilityThreshold) / (1 - legibilityThreshold); // 0 to 1
        const opacity = Math.max(0.05, 1 - decayPhase * 0.95);
        const blurAmount = (decayPhase * 5).toFixed(1);

        statusDisplay.textContent = progress >= 1 ? 'Message shredded from local RAM' : 'Shredding cryptographic payload...';
        decayBubble.style.opacity = String(opacity);
        decayBubble.style.filter = `blur(${blurAmount}px)`;

        if (progress >= 1) {
          decayBubble.classList.add('faded');
          decayMessage.textContent = '· · · [ shredded ] · · ·';
          isRunning = false;
          triggerBtn.disabled = false;
          triggerBtn.textContent = 'Replay Burn Timer';
          return;
        } else {
          // Scramble characters based on decay phase
          const chars = originalText.split('');
          const scrambled = chars.map((char, index) => {
            if (char === ' ') return ' ';
            const charNoise = (Math.sin(index * 99 + elapsed * 10) + 1) / 2;
            return charNoise < decayPhase ? '░' : char;
          }).join('');
          decayMessage.textContent = scrambled;
        }
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateSimulation);
      }
    }

    function startDecay() {
      if (isRunning) return;
      isRunning = true;
      triggerBtn.disabled = true;
      triggerBtn.textContent = 'Burning...';
      startTime = 0;
      decayBubble.classList.remove('faded');
      decayBubble.style.opacity = '1';
      decayBubble.style.filter = 'none';
      decayMessage.textContent = originalText;
      animationFrame = requestAnimationFrame(updateSimulation);
    }

    function resetDecay() {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      isRunning = false;
      startTime = 0;
      triggerBtn.disabled = false;
      triggerBtn.textContent = 'Trigger Burn Timer';
      timerDisplay.textContent = '00:20';
      statusDisplay.textContent = 'Timer armed · Standby';
      decayBubble.classList.remove('faded');
      decayBubble.style.opacity = '1';
      decayBubble.style.filter = 'none';
      decayMessage.textContent = originalText;
    }

    triggerBtn.addEventListener('click', startDecay);
    if (resetBtn) resetBtn.addEventListener('click', resetDecay);
  }
})();
