/**
 * Thandup Sherpa — Professional Portfolio
 * Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Theme Management (Dark / Light toggle with localStorage & system sync)
 * - Scroll Progress Bar & Dynamic Glass Header
 * - Scroll Spy & Active Navigation Link Highlighter
 * - Accessible Mobile Drawer Menu (Focus & Escape key management)
 * - Scroll Reveal via IntersectionObserver
 * - Smooth Interactive Custom Cursor (Desktop only, motion-safe)
 * - Contact Form Validation & Friendly Demo Alert UI
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. THEME MANAGEMENT
     -------------------------------------------------------------------------- */
  const THEME_STORAGE_KEY = 'thandup_portfolio_theme';
  const themeToggleBtn = document.getElementById('theme-toggle');
  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

  function getCurrentTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to dark mode
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (colorSchemeMeta) {
      colorSchemeMeta.content = theme === 'dark' ? 'dark light' : 'light dark';
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage', e);
    }
  }

  function initTheme() {
    const activeTheme = getCurrentTheme();
    applyTheme(activeTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      });
    }

    // React to system preference changes if user has not explicitly chosen
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     2. SCROLL PROGRESS & HEADER BLUR STATE
     -------------------------------------------------------------------------- */
  const scrollProgressBar = document.getElementById('scroll-progress');
  const siteHeader = document.getElementById('site-header');

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Update Progress Bar
    if (scrollProgressBar && documentHeight > 0) {
      const progressPercent = Math.min(100, Math.max(0, (scrollY / documentHeight) * 100));
      scrollProgressBar.style.width = `${progressPercent}%`;
    }

    // Header Background Blur on Scroll
    if (siteHeader) {
      if (scrollY > 24) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Floating Back to Top Button Visibility
    const floatingBackToTop = document.getElementById('floating-back-to-top');
    if (floatingBackToTop) {
      if (scrollY > 380) {
        floatingBackToTop.classList.add('visible');
      } else {
        floatingBackToTop.classList.remove('visible');
      }
    }
  }

  /* --------------------------------------------------------------------------
     2.5 SMOOTH SCROLL ENGINE (EASED ANCHORS & NATIVE HARDWARE SCROLLING)
     -------------------------------------------------------------------------- */
  function initSmoothScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mathematical Easing Function: easeInOutCubic for buttery transitions
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    let isSmoothAnimating = false;
    let smoothAnimId = null;

    /**
     * Smoothly scrolls to a specific Y position with custom cubic-bezier easing
     */
    function smoothScrollTo(targetY, duration) {
      if (prefersReducedMotion) {
        window.scrollTo(0, targetY);
        return;
      }

      if (smoothAnimId) {
        cancelAnimationFrame(smoothAnimId);
      }

      const startY = window.scrollY || window.pageYOffset;
      const distance = targetY - startY;
      if (Math.abs(distance) < 2) return;

      // Adaptive duration based on scroll distance (450ms to 850ms)
      const computedDuration = duration || Math.min(850, Math.max(450, Math.abs(distance) * 0.38));
      let startTime = null;
      isSmoothAnimating = true;

      function step(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / computedDuration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, Math.round(startY + distance * ease));

        if (progress < 1) {
          smoothAnimId = requestAnimationFrame(step);
        } else {
          isSmoothAnimating = false;
          smoothAnimId = null;
        }
      }

      smoothAnimId = requestAnimationFrame(step);
    }

    /**
     * Intercept all internal anchor links: a[href^="#"]
     */
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      let targetElement = null;
      try {
        targetElement = document.querySelector(href);
      } catch (err) {
        return;
      }
      if (!targetElement) return;

      e.preventDefault();

      // Close mobile menu drawer if open
      if (typeof closeMobileMenu === 'function') {
        closeMobileMenu();
      }

      // Calculate header offset
      const headerOffset = siteHeader ? siteHeader.offsetHeight + 14 : 76;
      const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = Math.max(0, href === '#hero' ? 0 : Math.round(elementPosition - headerOffset));

      smoothScrollTo(offsetPosition);

      // Update URL hash smoothly without abrupt browser jump
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });

    // Cancel programmatic smooth scroll immediately if user manually scrolls with mouse wheel or touch
    window.addEventListener('wheel', function () {
      if (isSmoothAnimating && smoothAnimId) {
        cancelAnimationFrame(smoothAnimId);
        isSmoothAnimating = false;
        smoothAnimId = null;
      }
    }, { passive: true });

    window.addEventListener('touchstart', function () {
      if (isSmoothAnimating && smoothAnimId) {
        cancelAnimationFrame(smoothAnimId);
        isSmoothAnimating = false;
        smoothAnimId = null;
      }
    }, { passive: true });

    window.smoothScrollTo = smoothScrollTo;
  }

  /* --------------------------------------------------------------------------
     3. SCROLL SPY (ACTIVE NAVIGATION HIGHLIGHTER)
     -------------------------------------------------------------------------- */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          updateActiveNavLinks(currentId);
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    function updateActiveNavLinks(id) {
      navLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });

      mobileLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     4. MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileDrawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta-link');

  function openMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  function initMobileDrawer() {
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function () {
        const isOpen = mobileDrawer && mobileDrawer.classList.contains('open');
        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    if (mobileDrawerClose) {
      mobileDrawerClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileDrawerBackdrop) {
      mobileDrawerBackdrop.addEventListener('click', closeMobileMenu);
    }

    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. SCROLL REVEAL ANIMATIONS
     -------------------------------------------------------------------------- */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealElements.forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* --------------------------------------------------------------------------
     6. DRAGON CURSOR SYSTEM (DESKTOP POINTER ONLY)
     -------------------------------------------------------------------------- */
  function initDragonCursor() {
    const container = document.getElementById('dragon-cursor');
    const lead = document.getElementById('dragon-lead');
    const trail = document.getElementById('dragon-body-trail');
    const canvas = document.getElementById('dragon-canvas');

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!container || !lead || !trail || !canvas || isTouchDevice || prefersReducedMotion) {
      return;
    }

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Build undulating dragon body segments
    const segmentCount = 10;
    const segments = [];
    for (let i = 0; i < segmentCount; i++) {
      const el = document.createElement('div');
      el.className = 'dragon-segment';
      const ratio = i / (segmentCount - 1);
      const size = Math.round(18 - ratio * 12); // 18px down to 6px at tail
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.opacity = (0.92 - ratio * 0.45).toFixed(2);
      if (i === segmentCount - 1) {
        el.style.background = 'radial-gradient(circle, #ffffff 15%, #ffd700 45%, #00f2fe 90%)';
        el.style.boxShadow = '0 0 10px #00f2fe, 0 0 16px #ffd700';
      }
      trail.appendChild(el);
      segments.push({ el, x: -100, y: -100, size, angle: 0 });
    }

    let mouseX = -100;
    let mouseY = -100;
    let isMoving = false;
    const sparks = [];

    function addSpark(x, y, vx, vy, color, radius, maxLife) {
      if (sparks.length > 50) return;
      sparks.push({
        x: x,
        y: y,
        vx: vx || (Math.random() - 0.5) * 2,
        vy: vy || (Math.random() - 0.5) * 2,
        life: 1.0,
        decay: 1.0 / (maxLife || 24),
        color: color || '#00f2fe',
        radius: radius || (Math.random() * 2.2 + 1.2)
      });
    }

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isMoving) {
        document.body.classList.add('cursor-active');
        isMoving = true;
        lead.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        for (let i = 0; i < segmentCount; i++) {
          segments[i].x = mouseX - (i + 1) * 10;
          segments[i].y = mouseY;
        }
      }
    });

    // Dragon pulse on click
    window.addEventListener('mousedown', function () {
      lead.classList.add('dragon-pulse');
      // Spawn burst of flame embers at cursor point
      for (let i = 0; i < 8; i++) {
        const rad = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3.5 + 1;
        addSpark(mouseX, mouseY, Math.cos(rad) * spd, Math.sin(rad) * spd, i % 2 === 0 ? '#ffd700' : '#00f2fe', 2.8, 28);
      }
      setTimeout(function () {
        lead.classList.remove('dragon-pulse');
      }, 160);
    });

    // Hover state on interactive elements
    const interactiveTargets = document.querySelectorAll('a, button, input, textarea, .stat-card, .capability-card, .achievement-card, .learning-card, .project-card, .project-placeholder-card, .contact-method-card, .skill-pill');
    interactiveTargets.forEach(function (target) {
      target.addEventListener('mouseenter', function () {
        document.body.classList.add('cursor-hover');
      });
      target.addEventListener('mouseleave', function () {
        document.body.classList.remove('cursor-hover');
      });
    });

    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-active');
      isMoving = false;
    });

    document.addEventListener('mouseenter', function () {
      if (mouseX > 0 && mouseY > 0) {
        document.body.classList.add('cursor-active');
        isMoving = true;
      }
    });

    // Main animation loop
    function renderDragon() {
      if (isMoving) {
        // Lead point directly tracks the mouse pointer
        lead.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

        // Calculate speed
        const headDx = mouseX - segments[0].x;
        const headDy = mouseY - segments[0].y;
        const speed = Math.hypot(headDx, headDy);

        // Update body segments with organic trailing physics
        let prevX = mouseX;
        let prevY = mouseY;

        for (let i = 0; i < segmentCount; i++) {
          const seg = segments[i];
          const segDx = prevX - seg.x;
          const segDy = prevY - seg.y;

          seg.x += segDx * 0.44;
          seg.y += segDy * 0.44;

          const segAngle = Math.atan2(segDy, segDx) * (180 / Math.PI);
          seg.el.style.transform = `translate3d(${seg.x - seg.size / 2}px, ${seg.y - seg.size / 2}px, 0) rotate(${segAngle}deg)`;

          prevX = seg.x;
          prevY = seg.y;
        }

        // Emit sparks from tail tip when moving
        if (speed > 2 && Math.random() < 0.6) {
          const tail = segments[segmentCount - 1];
          addSpark(
            tail.x + (Math.random() - 0.5) * 6,
            tail.y + (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            Math.random() > 0.4 ? '#00f2fe' : '#a855f7',
            Math.random() * 2 + 1.2,
            24
          );
        }
      }

      // Render sparks canvas
      ctx.clearRect(0, 0, width, height);
      if (sparks.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.96;
          sp.vy *= 0.96;
          sp.life -= sp.decay;

          if (sp.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius * sp.life, 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = sp.life * 0.85;
          ctx.fill();
        }
        ctx.restore();
      }

      requestAnimationFrame(renderDragon);
    }

    requestAnimationFrame(renderDragon);
  }

  /* --------------------------------------------------------------------------
     7. LIVE CONTACT FORM SUBMISSION & RESILIENT FALLBACK UI
     -------------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const statusMessage = document.getElementById('form-status-message');
    const alertTitle = document.getElementById('alert-title');
    const alertText = document.getElementById('alert-text');
    const alertIconWrap = document.getElementById('alert-icon-wrap');
    const alertFallbackBtn = document.getElementById('alert-fallback-btn');
    const submitBtn = document.getElementById('form-submit-btn');

    if (!form) return;

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    // Clear field-level error messages as user types
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        if (nameError) nameError.textContent = '';
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        if (emailError) emailError.textContent = '';
      });
    }
    if (messageInput) {
      messageInput.addEventListener('input', function () {
        if (messageError) messageError.textContent = '';
      });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      let hasError = false;

      // Clear previous error messages
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (messageError) messageError.textContent = '';

      // Validate Name
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        if (nameError) nameError.textContent = 'Please enter your name (minimum 2 characters).';
        hasError = true;
      }

      // Validate Email
      const emailVal = emailInput ? emailInput.value.trim() : '';
      if (!emailVal || !validateEmail(emailVal)) {
        if (emailError) emailError.textContent = 'Please provide a valid email address.';
        hasError = true;
      }

      // Validate Message
      const messageVal = messageInput ? messageInput.value.trim() : '';
      if (!messageVal || messageVal.length < 5) {
        if (messageError) messageError.textContent = 'Please enter a message (minimum 5 characters).';
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Store initial button state and display loading spinner
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending Message...</span> <span class="btn-spinner" aria-hidden="true"></span>`;
      }

      const payload = {
        name: nameVal,
        email: emailVal,
        message: messageVal,
        _subject: `New Portfolio Message from ${nameVal}`,
        _template: 'table',
        _captcha: 'false'
      };

      try {
        const response = await fetch('https://formsubmit.co/ajax/thandupsherpa153@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(function () { return {}; });

        if (response.ok && (data.success === 'true' || data.success === true || response.status === 200)) {
          // Success State
          if (statusMessage) {
            statusMessage.style.display = 'flex';
            statusMessage.className = 'form-alert-banner alert-success';
            if (alertTitle) alertTitle.textContent = 'Message Sent Successfully!';
            if (alertText) alertText.textContent = `Thank you, ${nameVal}! Your message has been sent directly to my inbox. I will get back to you shortly.`;
            if (alertIconWrap) {
              alertIconWrap.innerHTML = `
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>`;
            }
            if (alertFallbackBtn) alertFallbackBtn.style.display = 'none';
            statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          // Reset Form inputs
          form.reset();

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Message Sent!</span> <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10l3 3 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            setTimeout(function () {
              submitBtn.innerHTML = originalBtnHTML;
            }, 5000);
          }
        } else if (data && data.message && data.message.toLowerCase().includes('activation')) {
          // One-time activation required by FormSubmit
          if (statusMessage) {
            statusMessage.style.display = 'flex';
            statusMessage.className = 'form-alert-banner alert-success';
            if (alertTitle) alertTitle.textContent = 'Form Setup: One-Time Activation Sent';
            if (alertText) alertText.textContent = "A one-time confirmation email was sent to thandupsherpa153@gmail.com. Click 'Activate Form' in your inbox to enable direct submissions! You can also send this message immediately via your email client below:";
            if (alertIconWrap) {
              alertIconWrap.innerHTML = `
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>`;
            }
            if (alertFallbackBtn) {
              const mailSubject = encodeURIComponent(`Portfolio Inquiry from ${nameVal}`);
              const mailBody = encodeURIComponent(`Hi Thandup,\n\n${messageVal}\n\nFrom: ${nameVal} (${emailVal})`);
              alertFallbackBtn.href = `mailto:thandupsherpa153@gmail.com?subject=${mailSubject}&body=${mailBody}`;
              alertFallbackBtn.style.display = 'inline-flex';
              alertFallbackBtn.textContent = 'Send via Email App Now →';
            }
            statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
          }
        } else {
          throw new Error(data.message || 'Submission request was not accepted.');
        }
      } catch (err) {
        // Fallback / Error State: Provide direct pre-populated mailto action
        console.warn('Form submission encountered an issue, launching direct mailto fallback:', err);
        if (statusMessage) {
          statusMessage.style.display = 'flex';
          statusMessage.className = 'form-alert-banner alert-error';
          if (alertTitle) alertTitle.textContent = 'Direct Email Fallback';
          if (alertText) alertText.textContent = 'Could not deliver directly through the web endpoint. Click below to launch your email client with your message already composed:';
          if (alertIconWrap) {
            alertIconWrap.innerHTML = `
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>`;
          }

          if (alertFallbackBtn) {
            const mailSubject = encodeURIComponent(`Portfolio Inquiry from ${nameVal}`);
            const mailBody = encodeURIComponent(`Hi Thandup,\n\n${messageVal}\n\nFrom: ${nameVal} (${emailVal})`);
            alertFallbackBtn.href = `mailto:thandupsherpa153@gmail.com?subject=${mailSubject}&body=${mailBody}`;
            alertFallbackBtn.style.display = 'inline-flex';
            alertFallbackBtn.textContent = 'Launch Email App (Pre-filled) →';
          }
          statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. PAGE PRELOADER & ENTRANCE ANIMATIONS
     -------------------------------------------------------------------------- */
  function initPreloader() {
    const preloader = document.getElementById('page-preloader');
    if (!preloader) {
      document.body.classList.add('loaded');
      return;
    }

    // Dismiss preloader after brief entrance
    function dismissPreloader() {
      preloader.classList.add('fade-out');
      document.body.classList.add('loaded');
      setTimeout(function () {
        preloader.style.display = 'none';
      }, 650);
    }

    if (document.readyState === 'complete') {
      setTimeout(dismissPreloader, 600);
    } else {
      window.addEventListener('load', function () {
        setTimeout(dismissPreloader, 600);
      });
      // Safety fallback timeout
      setTimeout(dismissPreloader, 1800);
    }
  }

  /* --------------------------------------------------------------------------
     9. INTERACTIVE 3D CARD SPOTLIGHT & TILT (DESKTOP)
     -------------------------------------------------------------------------- */
  function initCardSpotlight() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const cards = document.querySelectorAll('.stat-card, .capability-card, .skill-category-card, .achievement-card, .learning-card, .experience-card, .project-card, .project-placeholder-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // Gentle terminal interactive 3D tilt
    const terminal = document.querySelector('.terminal-window');
    const heroVisual = document.querySelector('.hero-visual');
    if (terminal && heroVisual) {
      heroVisual.addEventListener('mousemove', function (e) {
        const rect = heroVisual.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);
        terminal.style.transform = `perspective(1000px) rotateX(${-deltaY * 5}deg) rotateY(${deltaX * 5}deg) translateY(-2px)`;
      });

      heroVisual.addEventListener('mouseleave', function () {
        terminal.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        terminal.style.transition = 'transform 0.5s ease';
      });

      heroVisual.addEventListener('mouseenter', function () {
        terminal.style.transition = 'transform 0.1s ease-out';
      });
    }
  }

  /* --------------------------------------------------------------------------
     9.5 HERO VISUAL SHOWCASE (TABS & 3D PARALLAX TILT)
     -------------------------------------------------------------------------- */
  function initHeroVisualShowcase() {
    const tabProfileBtn = document.getElementById('tab-profile-btn');
    const tabCodeBtn = document.getElementById('tab-code-btn');
    const panelProfile = document.getElementById('showcase-panel-profile');
    const panelCode = document.getElementById('showcase-panel-code');
    const btnInspectTerminal = document.getElementById('btn-inspect-terminal');
    const btnReturnProfile = document.getElementById('btn-return-profile');

    function switchMode(mode) {
      if (mode === 'code') {
        if (tabProfileBtn) {
          tabProfileBtn.classList.remove('active');
          tabProfileBtn.setAttribute('aria-selected', 'false');
        }
        if (tabCodeBtn) {
          tabCodeBtn.classList.add('active');
          tabCodeBtn.setAttribute('aria-selected', 'true');
        }
        if (panelProfile) {
          panelProfile.classList.remove('active');
        }
        if (panelCode) {
          panelCode.classList.add('active');
        }
      } else {
        if (tabCodeBtn) {
          tabCodeBtn.classList.remove('active');
          tabCodeBtn.setAttribute('aria-selected', 'false');
        }
        if (tabProfileBtn) {
          tabProfileBtn.classList.add('active');
          tabProfileBtn.setAttribute('aria-selected', 'true');
        }
        if (panelCode) {
          panelCode.classList.remove('active');
        }
        if (panelProfile) {
          panelProfile.classList.add('active');
        }
      }
    }

    if (tabProfileBtn) {
      tabProfileBtn.addEventListener('click', function () {
        switchMode('profile');
      });
    }

    if (tabCodeBtn) {
      tabCodeBtn.addEventListener('click', function () {
        switchMode('code');
      });
    }

    if (btnInspectTerminal) {
      btnInspectTerminal.addEventListener('click', function () {
        switchMode('code');
      });
    }

    if (btnReturnProfile) {
      btnReturnProfile.addEventListener('click', function () {
        switchMode('profile');
      });
    }

    // 3D Parallax Tilt on Profile Card
    const profileCard = document.getElementById('hero-profile-card');
    const portraitImg = document.querySelector('.hero-portrait-image');
    const heroVisual = document.querySelector('.hero-visual');

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (profileCard && heroVisual && !isTouch && !prefersReducedMotion) {
      let isHovering = false;

      heroVisual.addEventListener('mouseenter', function () {
        isHovering = true;
        profileCard.style.transition = 'transform 0.12s ease-out, border-color 0.3s ease, box-shadow 0.3s ease';
        if (portraitImg) {
          portraitImg.style.transition = 'transform 0.15s ease-out, filter 0.3s ease';
        }
      });

      heroVisual.addEventListener('mousemove', function (e) {
        if (!isHovering) return;
        const rect = heroVisual.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / (rect.width / 2);
        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        // Smooth 3D tilt with depth
        const rotX = -deltaY * 7;
        const rotY = deltaX * 7;
        profileCard.style.transform = `perspective(1100px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;

        // Parallax offset on portrait photo
        if (portraitImg) {
          const imgX = deltaX * 8;
          const imgY = deltaY * 6;
          portraitImg.style.transform = `translate3d(${imgX.toFixed(1)}px, ${imgY.toFixed(1)}px, 20px) scale(1.02)`;
        }
      });

      heroVisual.addEventListener('mouseleave', function () {
        isHovering = false;
        profileCard.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease';
        profileCard.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)';
        if (portraitImg) {
          portraitImg.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease';
          portraitImg.style.transform = 'translate3d(0, 0, 0) scale(1)';
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     10. INITIALIZATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initTheme();
    initMobileDrawer();
    initScrollReveal();
    initScrollSpy();
    initDragonCursor();
    initCardSpotlight();
    initHeroVisualShowcase();
    initSmoothScroll();
    initContactForm();

    // Initial scroll check
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  });
})();

