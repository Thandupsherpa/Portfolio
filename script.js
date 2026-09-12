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
     6. CUSTOM CURSOR (DESKTOP POINTER ONLY)
     -------------------------------------------------------------------------- */
  function initCustomCursor() {
    const dot = document.getElementById('custom-cursor-dot');
    const ring = document.getElementById('custom-cursor-ring');

    // Disable if touch screen or reduced motion requested
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!dot || !ring || isTouchDevice || prefersReducedMotion) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isMoving = false;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isMoving) {
        document.body.classList.add('cursor-active');
        isMoving = true;
      }

      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Smooth trailing ring loop
    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Hover state on interactive elements
    const interactiveTargets = document.querySelectorAll('a, button, input, textarea, .stat-card, .capability-card, .achievement-card, .learning-card, .project-placeholder-card');
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
  }

  /* --------------------------------------------------------------------------
     7. CONTACT FORM VALIDATION & DEMO ALERT UI
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

    if (!form) return;

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    form.addEventListener('submit', function (e) {
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

      // Show friendly demo notice banner
      if (statusMessage) {
        statusMessage.style.display = 'flex';
        statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Update direct mailto link with prepopulated message
        const alertBtn = statusMessage.querySelector('.alert-link-btn');
        if (alertBtn) {
          const mailSubject = encodeURIComponent(`Portfolio Inquiry from ${nameVal}`);
          const mailBody = encodeURIComponent(`Hi Thandup,\n\n${messageVal}\n\nFrom: ${nameVal} (${emailVal})`);
          alertBtn.href = `mailto:thandupsherpa153@gmail.com?subject=${mailSubject}&body=${mailBody}`;
        }
      }

      // Disable inputs to reflect submitted state
      if (nameInput) nameInput.disabled = true;
      if (emailInput) emailInput.disabled = true;
      if (messageInput) messageInput.disabled = true;

      const submitBtn = document.getElementById('form-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Message Prepared</span> <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 10l3 3 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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

    const cards = document.querySelectorAll('.stat-card, .capability-card, .skill-category-card, .achievement-card, .learning-card, .experience-card, .project-placeholder-card');
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
     10. INITIALIZATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initTheme();
    initMobileDrawer();
    initScrollReveal();
    initScrollSpy();
    initCustomCursor();
    initCardSpotlight();
    initContactForm();

    // Initial scroll check
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  });
})();

