(() => {
  'use strict';

  // Mobile Navigation Drawer Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Interactive Chat Centerpiece
  const interactiveBubble = document.getElementById('interactive-bubble');
  const actionPopover = document.getElementById('action-popover');
  const btnDeleteEveryone = document.getElementById('btn-delete-everyone');
  const btnDeleteMe = document.getElementById('btn-delete-me');
  const btnCopyText = document.getElementById('btn-copy-text');
  const btnCancelPopover = document.getElementById('btn-cancel-popover');
  const screenToast = document.getElementById('screen-toast');
  const interactiveText = document.getElementById('interactive-text');
  const btnResetPreview = document.getElementById('btn-reset-preview');

  // Lifespan Controls
  const lifespanSubtitle = document.getElementById('chat-lifespan-subtitle');
  const bubbleLifespanIndicator = document.getElementById('bubble-lifespan-indicator');
  const lifespanPills = document.querySelectorAll('.pill-option');

  function showToast(message) {
    if (!screenToast) return;
    screenToast.textContent = message;
    screenToast.classList.add('show');
    setTimeout(() => {
      screenToast.classList.remove('show');
    }, 2400);
  }

  function closePopover() {
    if (actionPopover) {
      actionPopover.classList.remove('active');
    }
    if (interactiveBubble) {
      interactiveBubble.setAttribute('aria-expanded', 'false');
    }
  }

  if (interactiveBubble && actionPopover) {
    interactiveBubble.addEventListener('click', (e) => {
      e.stopPropagation();
      if (interactiveBubble.classList.contains('deleted-shredded')) return;
      const isExpanded = actionPopover.classList.toggle('active');
      interactiveBubble.setAttribute('aria-expanded', String(isExpanded));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!actionPopover.contains(e.target) && e.target !== interactiveBubble) {
        closePopover();
      }
    });

    if (btnCancelPopover) {
      btnCancelPopover.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
      });
    }

    // Delete for Everyone
    if (btnDeleteEveryone) {
      btnDeleteEveryone.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
        interactiveBubble.classList.add('deleted-shredded');
        interactiveBubble.removeAttribute('role');
        interactiveBubble.removeAttribute('tabindex');
        interactiveText.textContent = 'You deleted this message for everyone';
        showToast('Message shredded across all devices');
      });
    }

    // Delete for Me
    if (btnDeleteMe) {
      btnDeleteMe.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
        const interactiveRow = document.getElementById('interactive-row');
        if (interactiveRow) {
          interactiveRow.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          interactiveRow.style.opacity = '0';
          interactiveRow.style.transform = 'scale(0.95)';
          setTimeout(() => {
            interactiveRow.style.display = 'none';
          }, 250);
        }
        showToast('Message removed from this device');
      });
    }

    // Copy Text
    if (btnCopyText) {
      btnCopyText.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
        if (interactiveText) {
          navigator.clipboard.writeText(interactiveText.textContent).catch(() => {});
        }
        showToast('Message copied to clipboard');
      });
    }
  }

  // Reset Conversation Preview
  if (btnResetPreview) {
    btnResetPreview.addEventListener('click', () => {
      closePopover();
      const interactiveRow = document.getElementById('interactive-row');
      if (interactiveRow) {
        interactiveRow.style.display = 'flex';
        interactiveRow.style.opacity = '1';
        interactiveRow.style.transform = 'none';
      }
      if (interactiveBubble && interactiveText) {
        interactiveBubble.classList.remove('deleted-shredded');
        interactiveBubble.setAttribute('role', 'button');
        interactiveBubble.setAttribute('tabindex', '0');
        interactiveText.textContent = 'Confidential financial schedule: reference code VES-8842 attached.';
      }
      showToast('Conversation preview reset');
    });
  }

  // Silent Lifespan Selectors
  if (lifespanPills.length > 0) {
    lifespanPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        lifespanPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const lifespan = pill.getAttribute('data-lifespan');
        let label = '24h';
        let sub = 'Encrypted · Silent Lifespan: 24h';

        if (lifespan === 'Off') {
          label = 'Lifespan off';
          sub = 'Encrypted · No auto-expiration';
        } else if (lifespan === '1h') {
          label = '1h lifespan';
          sub = 'Encrypted · Silent Lifespan: 1h';
        } else if (lifespan === '24h') {
          label = '24h lifespan';
          sub = 'Encrypted · Silent Lifespan: 24h';
        } else if (lifespan === '7d') {
          label = '7d lifespan';
          sub = 'Encrypted · Silent Lifespan: 7d';
        }

        if (lifespanSubtitle) {
          lifespanSubtitle.textContent = sub;
        }

        if (bubbleLifespanIndicator) {
          bubbleLifespanIndicator.textContent = label;
          bubbleLifespanIndicator.style.display = lifespan === 'Off' ? 'none' : 'inline-block';
        }

        showToast(`Silent lifespan updated to ${lifespan}`);
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
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(val)) {
        alert('Please enter a valid handle: 3 to 24 characters with letters, numbers, or underscores.');
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
})();
