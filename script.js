/* ============================================================
   SYNEXIS SYSTEMS — script.js  v2
   ============================================================ */
'use strict';

/* ── Loader ───────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 1500);
  });
})();

/* ── Navbar ───────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.nav-mobile');
  if (!navbar) return;

  const updateNav = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  const links = document.querySelectorAll('.nav-links a, .nav-mobile a');
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobile.classList.toggle('open');
    });
    mobile.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobile.classList.remove('open');
      })
    );
  }
})();

/* ── Canvas Background ────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], raf;
  const NODE_COUNT = Math.min(55, Math.floor(window.innerWidth / 24));
  const MAX_DIST = 180;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function createNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-0.5)*0.35, vy:(Math.random()-0.5)*0.35, r:Math.random()*1.8+0.8 });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i+1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist/MAX_DIST) * 0.18;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`; ctx.lineWidth = 0.7; ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(0,212,255,0.45)'; ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  resize(); createNodes(); draw();
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => { cancelAnimationFrame(raf); resize(); createNodes(); draw(); }, 200);
  }, { passive: true });
})();

/* ── Scroll Reveal ────────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  targets.forEach(el => io.observe(el));
})();

/* ── Animated Counter ─────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = parseInt(el.dataset.target, 10), suffix = el.dataset.suffix || '';
      let start = 0;
      const dur = 1800, step = 16, inc = target / (dur / step);
      const timer = setInterval(() => {
        start += inc;
        if (start >= target) { el.textContent = target + suffix; clearInterval(timer); }
        else { el.textContent = Math.floor(start) + suffix; }
      }, step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => io.observe(el));
})();

/* ── Feature Tabs ─────────────────────────────────────────── */
(function initFeatureTabs() {
  const items = document.querySelectorAll('.feature-item');
  if (!items.length) return;
  items.forEach((item, i) => {
    item.addEventListener('click', () => { items.forEach(it => it.classList.remove('active')); item.classList.add('active'); });
    if (i === 0) item.classList.add('active');
  });
})();

/* ── Smooth Anchor Scroll ─────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Contact Form — REST API ──────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const errMsg  = document.getElementById('form-error-msg');
  if (!form) return;

  const WEBHOOK_URL = 'https://n8n-n8n.bb4ifw.easypanel.host/webhook/apex-invoice';

  const getGroup  = el => el.closest('.form-group');
  const setError  = (el, msg) => { const g = getGroup(el); g.classList.add('has-error'); const e = g.querySelector('.form-error'); if (e) e.textContent = msg; };
  const clearErr  = el => getGroup(el).classList.remove('has-error');
  const isEmail   = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  form.querySelectorAll('input, textarea, select').forEach(f => {
    f.addEventListener('input', () => clearErr(f));
    f.addEventListener('blur', () => validateField(f));
  });

  function validateField(field) {
    const v = field.value.trim();
    if (field.required && !v) { setError(field, 'This field is required.'); return false; }
    if (field.type === 'email' && v && !isEmail(v)) { setError(field, 'Please enter a valid email address.'); return false; }
    if (field.name === 'message' && v.length > 0 && v.length < 20) { setError(field, 'Message must be at least 20 characters.'); return false; }
    clearErr(field); return true;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (errMsg) errMsg.classList.remove('show');

    let valid = true;
    form.querySelectorAll('input[required], textarea[required], select[required]').forEach(f => {
      if (!validateField(f)) valid = false;
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending…`;
    if (!document.getElementById('spin-style')) {
      const s = document.createElement('style'); s.id = 'spin-style';
      s.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    // Collect form data
    const payload = {
      first_name:  form.fname.value.trim(),
      last_name:   form.lname.value.trim(),
      email:       form.email.value.trim(),
      company:     form.company.value.trim(),
      phone:       form.phone.value.trim(),
      service:     form.service.value,
      budget:      form.budget.value,
      message:     form.message.value.trim(),
      submitted_at: new Date().toISOString(),
      source: 'synexis-website'
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 200 || res.status === 201) {
        form.style.display = 'none';
        success.classList.add('show');
      } else {
        throw new Error(`Server responded with ${res.status}`);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      btn.disabled = false;
      btn.innerHTML = origHTML;
      if (errMsg) {
        errMsg.textContent = 'Something went wrong. Please try again or email us directly.';
        errMsg.classList.add('show');
      }
    }
  });
})();

/* ── Portfolio Filter ─────────────────────────────────────── */
(function initPortfolioFilter() {
  const btns  = document.querySelectorAll('.pf-filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        card.style.opacity = '0';
        if (match) requestAnimationFrame(() => { card.style.transition = 'opacity 0.4s ease'; card.style.opacity = '1'; });
      });
    });
  });
})();

/* ── WhatsApp Float: inject into every page ───────────────── */
(function injectWhatsApp() {
  const wa = document.createElement('div');
  wa.className = 'whatsapp-float';
  wa.innerHTML = `
    <div class="whatsapp-tooltip">Chat with us on WhatsApp</div>
    <a class="whatsapp-btn" href="https://wa.me/923000000000" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>`;
  document.body.appendChild(wa);
})();
