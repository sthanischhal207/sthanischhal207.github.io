// Initialize Lucide icons
lucide.createIcons();

// Navbar scroll effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Typewriter Effect
const titles = [
    "Computer Engineering Student",
    "n8n Automation Expert",
    "Graphics Designer"
];

const typewriterElement = document.getElementById('typewriter-text');
let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;
let erasingDelay = 50;
let newTextDelay = 2000; // Delay between current and next text

function type() {
    const currentTitle = titles[titleIndex];
    
    if (isDeleting) {
        // Remove a character
        typewriterElement.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Add a character
        typewriterElement.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
    }
    
    // Determine the typing speed based on whether it's deleting or typing
    let typeSpeed = isDeleting ? erasingDelay : typingDelay;
    
    // If word is complete
    if (!isDeleting && charIndex === currentTitle.length) {
        // Pause at the end of the word
        typeSpeed = newTextDelay;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        // Move to the next word
        titleIndex++;
        // Reset to first word if at the end of the array
        if (titleIndex >= titles.length) {
            titleIndex = 0;
        }
        // Small pause before typing next word
        typeSpeed = 500;
    }
    
    setTimeout(type, typeSpeed);
}

// Start typewriter effect after an initial delay if element exists
document.addEventListener("DOMContentLoaded", function() {
    if (typewriterElement) {
        setTimeout(type, 1000);
    }
});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

// Projects Carousel and Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const projectsTrack = document.getElementById('projectsTrack');
const carouselDots = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentSlide = 0;
let visibleCards = Array.from(projectCards);

function getCardsPerView() {
    return window.innerWidth > 768 ? 2 : 1;
}

function updateCarousel() {
    const cardsPerView = getCardsPerView();
    const totalSlides = Math.ceil(visibleCards.length / cardsPerView);
    
    if (currentSlide >= totalSlides) currentSlide = Math.max(0, totalSlides - 1);
    
    if (projectsTrack) {
        projectsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    if (carouselDots) {
        carouselDots.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            if (i === currentSlide) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentSlide = i;
                updateCarousel();
            });
            carouselDots.appendChild(dot);
        }
    }
    
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= totalSlides - 1 || totalSlides === 0;
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalSlides = Math.ceil(visibleCards.length / getCardsPerView());
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateCarousel();
        }
    });
}

// Touch swipe logic for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const carouselViewport = document.getElementById('carouselViewport');

if (carouselViewport) {
    carouselViewport.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});
    
    carouselViewport.addEventListener('touchmove', e => {
        let touchCurrentX = e.changedTouches[0].screenX;
        let touchCurrentY = e.changedTouches[0].screenY;
        
        let diffX = Math.abs(touchStartX - touchCurrentX);
        let diffY = Math.abs(touchStartY - touchCurrentY);
        
        if (diffX > diffY) {
            e.preventDefault();
        }
    }, {passive: false});
    
    carouselViewport.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, {passive: true});
}

function handleSwipe() {
    const swipeThreshold = 50;
    let diffX = touchEndX - touchStartX;
    let diffY = Math.abs(touchEndY - touchStartY);
    
    if (Math.abs(diffX) > diffY && Math.abs(diffX) > swipeThreshold) {
        if (diffX < 0) {
            if (nextBtn && !nextBtn.disabled) nextBtn.click();
        } else {
            if (prevBtn && !prevBtn.disabled) prevBtn.click();
        }
    }
}

window.addEventListener('resize', () => {
    updateCarousel();
});

// Filter Logic Integration
if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            visibleCards = [];
            
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                    visibleCards.push(card);
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
            
            setTimeout(() => {
                currentSlide = 0;
                updateCarousel();
            }, 310);
        });
    });
    
    updateCarousel();
}

// Contact Form Validation
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent actual submission for demo
        let isValid = true;
        
        const fields = ['fullName', 'email', 'subject', 'message'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
                
                // Extra check for email
                if (fieldId === 'email' && !field.value.includes('@')) {
                    field.classList.add('error');
                    isValid = false;
                }
            }
            
            // Remove error class on input
            field.addEventListener('input', function() {
                this.classList.remove('error');
            });
        });
        
        if (isValid) {
            // Here you would normally submit the form data
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sent Successfully!';
            btn.style.backgroundColor = '#10B981'; // Success green
            btn.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
            
            setTimeout(() => {
                contactForm.reset();
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.style.boxShadow = '';
            }, 3000);
        }
    });
}

// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });

    // Close menu on link click
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// Scroll Spy
const sections = document.querySelectorAll('section[id]');
const navLinksItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - window.innerHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinksItems.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${current}`) {
            a.classList.add('active');
        }
    });
});
