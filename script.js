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

/* ---------- Scroll spy ---------- */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');
const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        }
    });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

/* ---------- Typewriter ---------- */
const titles = ['Computer Engineering Student', 'n8n Automation Expert', 'Graphics Designer'];
const typeEl = document.getElementById('typewriter-text');
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
if (typeEl) setTimeout(type, 900);

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
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        frame.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    hero.addEventListener('mouseleave', () => { frame.style.transform = ''; });

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

/* ---------- Contact form (demo, no backend) ---------- */
const form = document.getElementById('contactForm');
if (form) {
    const fields = ['fullName', 'email', 'subject', 'message'].map(id => document.getElementById(id));
    fields.forEach(f => f.addEventListener('input', () => f.classList.remove('error')));

    form.addEventListener('submit', e => {
        e.preventDefault();
        let ok = true;
        fields.forEach(f => {
            const bad = !f.value.trim() || (f.id === 'email' && !/^\S+@\S+\.\S+$/.test(f.value.trim()));
            f.classList.toggle('error', bad);
            if (bad) ok = false;
        });
        if (!ok) return;

        const btn = form.querySelector('button[type="submit"]');
        const label = btn.querySelector('span');
        const icon = btn.querySelector('i');
        const orig = label.textContent;
        label.textContent = 'Sent Successfully!';
        icon.className = 'fa-solid fa-check';
        setTimeout(() => {
            form.reset();
            label.textContent = orig;
            icon.className = 'fa-solid fa-paper-plane';
        }, 3000);
    });
}