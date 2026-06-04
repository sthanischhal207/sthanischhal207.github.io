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

// Projects Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                // If filter is all or matches the card's category
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                    // Small delay to allow display block to apply before transition
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    // Wait for transition before hiding completely
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
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

