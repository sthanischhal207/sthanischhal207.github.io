const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

/* ---------- Navbar + scroll progress ---------- */
const navbar = document.getElementById('navbar');
const progress = document.getElementById('scrollProgress');

function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Theme toggle ---------- */
const themeBtn = document.getElementById('themeToggle');
function setThemeIcon() {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeBtn.innerHTML = `<i class="fa-solid ${dark ? 'fa-moon' : 'fa-sun'}"></i>`;
}
setThemeIcon();
themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    setThemeIcon();
});

/* ---------- Mobile menu ---------- */
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('navLinks');
mobileMenu.addEventListener('click', e => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
});
document.addEventListener('click', e => {
    if (!navLinks.contains(e.target)) navLinks.classList.remove('active');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('active')));

/* ---------- Footer year ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Typewriter ---------- */
const typeEl = document.getElementById('typewriter-text');
let titles = [];
try { titles = JSON.parse(typeEl?.dataset.titles || '[]'); } catch (e) {}
let tIdx = 0, cIdx = 0, deleting = false;

function type() {
    const current = titles[tIdx];
    cIdx += deleting ? -1 : 1;
    typeEl.textContent = current.substring(0, cIdx);

    let delay = deleting ? 45 : 90;
    if (!deleting && cIdx === current.length) { delay = 2000; deleting = true; }
    else if (deleting && cIdx === 0) { deleting = false; tIdx = (tIdx + 1) % titles.length; delay = 450; }
    setTimeout(type, delay);
}
if (typeEl && titles.length) setTimeout(type, 900);

/* ---------- Scroll reveal ---------- */
const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ---------- Counters ---------- */
const counterObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.count;
        const start = performance.now();
        const dur = 1400;
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
        obs.unobserve(el);
    });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

/* ---------- Cursor glow ---------- */
const glow = document.getElementById('cursorGlow');
if (!isTouch && !reduceMotion) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
        gx += (tx - gx) * 0.12;
        gy += (ty - gy) * 0.12;
        glow.style.transform = `translate(${gx}px, ${gy}px)`;
        requestAnimationFrame(loop);
    })();
}

/* ---------- Spotlight hover ---------- */
document.querySelectorAll('.spotlight').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
});

/* ---------- 3D tilt (project cards + hero photo) ---------- */
if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transition = 'transform 0.1s';
            card.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s var(--ease), opacity 0.4s';
            card.style.transform = '';
        });
    });

    const frame = document.getElementById('photoFrame');
    const hero = document.getElementById('home');
    if (frame && hero) { // hero only exists on the home page
        hero.addEventListener('mousemove', e => {
            const r = hero.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            frame.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
        });
        hero.addEventListener('mouseleave', () => { frame.style.transform = ''; });
    }

    /* Magnetic buttons */
    document.querySelectorAll('.magnetic').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
}

/* ---------- Project filter ---------- */
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');
const emptyNote = document.getElementById('emptyNote');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        let shown = 0;

        cards.forEach(card => {
            const match = f === 'all' || card.dataset.category === f;
            if (match) {
                shown++;
                card.classList.remove('hide');
                requestAnimationFrame(() => card.classList.remove('fade-out'));
            } else {
                card.classList.add('fade-out');
                setTimeout(() => { if (card.classList.contains('fade-out')) card.classList.add('hide'); }, 300);
            }
        });
        emptyNote.hidden = shown !== 0;
    });
});

/* ---------- Contact form ---------- */
const form = document.getElementById('contactForm');
// Turnstile calls these when it needs to show (or hides) a visible challenge.
window.onTurnstileInteractive = () => form && form.classList.add('ts-interactive');
window.onTurnstileDone = () => form && form.classList.remove('ts-interactive');
if (form) {
    const fields = ['fullName', 'email', 'subject', 'message'].map(id => document.getElementById(id));
    const honeypot = document.getElementById('website');
    const status = document.getElementById('formStatus');
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('span');
    const icon = btn.querySelector('i');
    const origLabel = label.textContent;
    let sending = false;

    const setStatus = (msg, kind) => {
        status.textContent = msg; // textContent, never innerHTML: server text can't inject markup
        status.classList.toggle('is-error', kind === 'error');
        status.classList.toggle('is-success', kind === 'success');
    };
    const resetButton = () => {
        btn.disabled = false;
        label.textContent = origLabel;
        icon.className = 'fa-solid fa-paper-plane';
    };

    fields.forEach(f => f.addEventListener('input', () => f.classList.remove('error')));

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (sending) return;

        let ok = true;
        fields.forEach(f => {
            const v = f.value.trim();
            const bad = !v || v.length > f.maxLength || (f.id === 'email' && !/^\S+@\S+\.\S+$/.test(v));
            f.classList.toggle('error', bad);
            if (bad) ok = false;
        });
        if (!ok) { setStatus('Please fill in every field correctly.', 'error'); return; }

        sending = true;
        btn.disabled = true;
        label.textContent = 'Sending…';
        icon.className = 'fa-solid fa-spinner fa-spin';
        setStatus('', null);

        const payload = { website: honeypot ? honeypot.value : '' };
        const tokenField = form.querySelector('[name="cf-turnstile-response"]');
        payload.turnstileToken = tokenField ? tokenField.value : '';
        fields.forEach(f => { payload[f.id] = f.value.trim(); });

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (data.field) document.getElementById(data.field)?.classList.add('error');
                throw new Error(typeof data.error === 'string' ? data.error : 'Could not send. Please email me directly.');
            }
            form.reset();
            label.textContent = 'Sent Successfully!';
            icon.className = 'fa-solid fa-check';
            setStatus("Thanks! I'll get back to you soon.", 'success');
            setTimeout(resetButton, 3000);
        } catch (err) {
            resetButton();
            setStatus(err.name === 'AbortError' ? 'Request timed out. Please try again.' : err.message, 'error');
        } finally {
            clearTimeout(timer);
            sending = false;
            if (window.turnstile) window.turnstile.reset(); // each token works only once
        }
    });
}

/* ---------- Design gallery (images from a public Google Drive folder) ---------- */
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
    const note = document.getElementById('galleryNote');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCaption = document.getElementById('lbCaption');
    const imgUrl = (id, width) => `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${width}`;
    let images = [];
    let current = 0;

    const showNote = text => {
        galleryGrid.replaceChildren();
        galleryGrid.setAttribute('aria-busy', 'false');
        note.textContent = text;
        note.hidden = false;
    };

    const show = i => {
        current = (i + images.length) % images.length;
        const img = images[current];
        lbImg.src = imgUrl(img.id, 2000);
        lbImg.alt = img.title || 'Design work';
        lbCaption.textContent = img.title ? `${img.title} · ${current + 1} / ${images.length}` : `${current + 1} / ${images.length}`;
    };
    const open = i => { show(i); lightbox.showModal(); document.body.classList.add('no-scroll'); };
    const close = () => lightbox.close();

    lightbox.addEventListener('close', () => { document.body.classList.remove('no-scroll'); lbImg.removeAttribute('src'); });
    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', () => show(current - 1));
    document.getElementById('lbNext').addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); }); // backdrop click
    lightbox.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });
    let touchX = null;
    lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
        touchX = null;
    });

    fetch('/api/gallery')
        .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
        .then(data => {
            images = (Array.isArray(data.images) ? data.images : [])
                .filter(img => img && typeof img.id === 'string' && /^[A-Za-z0-9_-]+$/.test(img.id));
            if (!images.length) return showNote('New designs coming soon.');

            const frag = document.createDocumentFragment();
            images.forEach((img, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'gallery-item spotlight reveal';
                btn.style.setProperty('--delay', `${Math.min(i % 6, 5) * 0.06}s`);
                btn.setAttribute('aria-label', `Open ${img.title || 'design'} in viewer`);
                if (img.w && img.h) btn.style.aspectRatio = `${img.w} / ${img.h}`;

                const el = document.createElement('img');
                el.src = imgUrl(img.id, 800);
                el.alt = img.title || 'Design work';
                el.loading = i < 6 ? 'eager' : 'lazy';
                el.decoding = 'async';
                el.referrerPolicy = 'no-referrer';
                el.addEventListener('load', () => btn.classList.add('loaded'));
                el.addEventListener('error', () => btn.remove());
                btn.appendChild(el);

                if (img.title) {
                    const cap = document.createElement('span');
                    cap.className = 'gallery-caption';
                    cap.textContent = img.title;
                    btn.appendChild(cap);
                }
                btn.addEventListener('click', () => open(i));
                btn.addEventListener('mousemove', e => {
                    const r = btn.getBoundingClientRect();
                    btn.style.setProperty('--mx', `${e.clientX - r.left}px`);
                    btn.style.setProperty('--my', `${e.clientY - r.top}px`);
                });
                frag.appendChild(btn);
                revealObs.observe(btn);
            });
            galleryGrid.replaceChildren(frag);
            galleryGrid.setAttribute('aria-busy', 'false');
        })
        .catch(() => showNote("The gallery couldn't load right now. Please try again later."));
}
