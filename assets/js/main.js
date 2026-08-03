/**
 * Portfolio Site - Main JavaScript
 * Vanilla JS, no dependencies
 */
(function () {
  'use strict';

  /* ----------------------------------------------
   * Footer year
   * -------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ----------------------------------------------
   * Header scroll style
   * -------------------------------------------- */
  const header = document.getElementById('header');
  const SCROLL_THRESHOLD = 40;

  const onScrollHeader = () => {
    if (!header) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ----------------------------------------------
   * Hamburger menu (mobile)
   * -------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const globalNav = document.getElementById('globalNav');
  const body = document.body;

  const closeNav = () => {
    if (!navToggle || !globalNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'メニューを開く');
    globalNav.classList.remove('is-open');
    body.classList.remove('is-nav-open');
  };

  const openNav = () => {
    if (!navToggle || !globalNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'メニューを閉じる');
    globalNav.classList.add('is-open');
    body.classList.add('is-nav-open');
  };

  if (navToggle && globalNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    globalNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeNav();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) closeNav();
    });
  }

  /* ----------------------------------------------
   * Page top button
   * -------------------------------------------- */
  const pageTop = document.getElementById('pageTop');
  const PAGE_TOP_THRESHOLD = 480;

  const onScrollPageTop = () => {
    if (!pageTop) return;
    if (window.scrollY > PAGE_TOP_THRESHOLD) {
      pageTop.classList.add('is-visible');
    } else {
      pageTop.classList.remove('is-visible');
    }
  };

  if (pageTop) {
    pageTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', onScrollPageTop, { passive: true });
    onScrollPageTop();
  }

  /* ----------------------------------------------
   * Scroll reveal animation (IntersectionObserver)
   * -------------------------------------------- */
  const revealTargets = [
    '.section__head',
    '.about__visual',
    '.about__content',
    '.strength',
    '.skill-card',
    '.skills__certs',
    '.timeline__item',
    '.work-card',
    '.contact__intro',
    '.contact__form'
  ];

  const revealEls = document.querySelectorAll(revealTargets.join(','));
  revealEls.forEach((el) => el.classList.add('js-reveal'));

  // Stagger: children of these groups reveal one by one
  const staggerGroups = document.querySelectorAll(
    '.about__strengths, .skills__grid, .portfolio__grid, .timeline'
  );
  staggerGroups.forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      if (child.classList.contains('js-reveal')) {
        child.style.setProperty('--reveal-delay', `${Math.min(index * 90, 450)}ms`);
      }
    });
  });

  // The timeline itself gets is-revealed (draws the rail line, no fade)
  const timelineEl = document.querySelector('.timeline');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    );

    revealEls.forEach((el) => io.observe(el));
    if (timelineEl) io.observe(timelineEl);
  } else {
    revealEls.forEach((el) => el.classList.add('is-revealed'));
    if (timelineEl) timelineEl.classList.add('is-revealed');
  }

  /* ----------------------------------------------
   * Contact form (graceful fallback for static hosting)
   *
   * Netlify Forms / Formspree などのサービスを使わない
   * 静的ホスティング環境では fetch が失敗するため、
   * mailto: にフォールバックして開きます。
   * -------------------------------------------- */
  const contactForm = document.querySelector('.contact__form');
  const formNote = document.getElementById('formNote');

  const setFormNote = (message, type) => {
    if (!formNote) return;
    formNote.textContent = message;
    formNote.classList.remove('is-success', 'is-error');
    if (type) formNote.classList.add(`is-${type}`);
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      const action = contactForm.getAttribute('action');
      const isNetlify = contactForm.hasAttribute('data-netlify');
      const isHosted = action && /^https?:/.test(action);

      if (!isHosted && !isNetlify) {
        e.preventDefault();
        const data = new FormData(contactForm);
        const company = data.get('company') || '';
        const name = data.get('name') || '';
        const email = data.get('email') || '';
        const subject = data.get('subject') || 'お問い合わせ';
        const message = data.get('message') || '';

        const mailBody = [
          company ? `会社名・団体名: ${company}` : null,
          `お名前: ${name}`,
          `メールアドレス: ${email}`,
          '',
          message
        ].filter(Boolean).join('\n');

        const href = `mailto:masagoro.isogai@gmail.com?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(mailBody)}`;

        window.location.href = href;
        setFormNote('メーラーを起動しました。送信が完了するとお問い合わせ完了となります。', 'success');
        return;
      }

      if (window.location.protocol === 'file:') {
        e.preventDefault();
        setFormNote('ローカル環境では送信できません。デプロイ後にお試しください。', 'error');
        return;
      }
    });
  }
})();
