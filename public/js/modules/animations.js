/* ============================================
   ANIMATIONS ET EFFETS VISUELS
   ============================================ */

/**
 * Initialise l'effet parallaxe
 */
function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const heroHeight = window.innerHeight;

                if (scrollY < heroHeight) {
                    const translateY = scrollY * 0.5;
                    heroBackground.style.transform = `translateY(${translateY}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Initialise les animations au scroll
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
        '.schedule-card, .teacher-card, .gallery-item, .pricing-card, .news-card, .feature-item'
    );

    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/**
 * Initialise les animations premium
 */
function initPremiumAnimations() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('header-scrolled');
            header.classList.remove('header-hidden');
            return;
        }

        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('header-hidden');
        } else if (currentScroll < lastScroll) {
            header.classList.remove('header-hidden');
        }

        if (currentScroll > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

        lastScroll = currentScroll;
    });

    // Observer pour les sections
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('animate-on-scroll');
        sectionObserver.observe(section);
    });

    // Délais d'animation pour les cartes
    document.querySelectorAll('.schedule-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    document.querySelectorAll('.teacher-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
}

/**
 * Anime un compteur
 */
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

export {
    initParallax,
    initScrollAnimations,
    initPremiumAnimations,
    animateCounter
};
