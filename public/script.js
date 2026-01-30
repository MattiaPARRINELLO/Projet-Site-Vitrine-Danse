/* ============================================
   ARABESQUE - SITE VITRINE DANSE
   JavaScript principal
   ============================================ */

// ============================================
// VARIABLES GLOBALES
// ============================================
let scheduleData = null;
let pricingData = null;
let currentFilter = 'all';
let currentGalleryFilter = 'all';
let currentLightboxIndex = 0;
const galleryItems = [];
let selectedCourses = [];
// Exposer selectedCourses globalement pour le calendrier
window.selectedCourses = selectedCourses;

// ============================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎭 Chargement du site Arabesque...');

    // Chargement des données JSON
    loadScheduleData();
    loadPricingData();
    loadTeachers();
    loadNewsData();

    // Initialisation des fonctionnalités
    initNavigation();
    initParallax();
    initScrollAnimations();
    initBackToTop();
    initContactForm();
    initGallery();
    initPricingCalculator();
    initPremiumAnimations();

    // Initialiser les améliorations UX (quand disponibles)
    setTimeout(() => {
        if (typeof populateTeacherFilter === 'function' && window.allTeachers && window.allTeachers.length > 0) {
            populateTeacherFilter(window.allTeachers);
        }
    }, 100);

    console.log('✅ Site Arabesque initialisé avec succès !');
});

// ============================================
// EFFET PARALLAXE
// ============================================
function initParallax() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const heroHeight = window.innerHeight;

                // Appliquer l'effet seulement quand le hero est visible
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

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Menu mobile toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Fermer le menu au clic sur un lien
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Fermer le menu mobile
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');

            // Smooth scroll
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }

            // Mettre à jour le lien actif
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Header au scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Mise à jour du lien actif en fonction de la section visible
        updateActiveNavLink();
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// ============================================
// ANIMATIONS AU SCROLL
// ============================================
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

    // Observer tous les éléments à animer
    const animatedElements = document.querySelectorAll(
        '.schedule-card, .teacher-card, .gallery-item, .pricing-card, .news-card, .feature-item'
    );

    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ============================================
// BOUTON RETOUR EN HAUT
// ============================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// CHARGEMENT DU PLANNING (JSON)
// ============================================
async function loadScheduleData() {
    try {
        // Afficher le skeleton loading
        if (typeof showScheduleLoading === 'function') {
            showScheduleLoading();
        }

        const response = await fetch('/api/schedule');
        scheduleData = await response.json();

        if (scheduleData) {
            generateScheduleFilters();
            displaySchedule('all');

            // Masquer le loading
            if (typeof hideScheduleLoading === 'function') {
                hideScheduleLoading();
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement du planning:', error);
        // Afficher un message d'erreur à l'utilisateur
        const scheduleGrid = document.getElementById('scheduleGrid');
        if (scheduleGrid) {
            scheduleGrid.innerHTML = '<p style="text-align: center; color: #FF1493;">Impossible de charger le planning. Veuillez réessayer plus tard.</p>';
        }
    }
}

// ============================================
// CHARGEMENT DES PROFESSEURS (JSON)
// ============================================
async function loadTeachers() {
    try {
        const response = await fetch('/api/teachers');
        const data = await response.json();

        if (data && data.teachers) {
            // Stocker les professeurs pour les filtres
            window.allTeachers = data.teachers;

            // Populer le filtre des professeurs si disponible
            if (typeof populateTeacherFilter === 'function') {
                populateTeacherFilter(data.teachers);
            }

            displayTeachers(data.teachers);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des professeurs:', error);
    }
}

// ============================================
// CHARGEMENT DES ACTUALITÉS (JSON)
// ============================================
async function loadNewsData() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        const news = data?.news || [];
        renderNews(news);
    } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            newsGrid.innerHTML = '<p style="text-align:center; color: #b0b0b0;">Impossible de charger les actualités.</p>';
        }
    }
}

function renderNews(news) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    if (!news.length) {
        newsGrid.innerHTML = '<p style="text-align:center; color: #b0b0b0;">Aucune actualité pour le moment.</p>';
        return;
    }

    newsGrid.innerHTML = news.map(item => {
        const hasDate = item.date && item.date.trim();
        const image = item.image && item.image.trim() ? item.image : 'assets/images/danse1.jpg';
        const text = item.text || '';

        let dateHtml = '';
        if (hasDate) {
            const date = new Date(item.date);
            const day = String(date.getDate()).padStart(2, '0');
            const month = getMonthShort(date.getMonth());
            dateHtml = `
                        <div class="news-date">
                            <span class="day">${day}</span>
                            <span class="month">${month}</span>
                        </div>
                    `;
        }

        return `
                    <article class="news-card">
                        <div class="news-image">
                            <img src="${image}" alt="${item.title || 'Actualité'}" />
                            ${dateHtml}
                        </div>
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="category">Actualité</span>
                                <span class="read-time">${estimateReadTime(text)}</span>
                            </div>
                            <h3 class="news-title">${item.title || ''}</h3>
                            <p class="news-excerpt">${text}</p>
                        </div>
                    </article>
                `;
    }).join('');

    initScrollAnimations();
}

function getMonthShort(index) {
    const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
    return months[index] || '';
}

function estimateReadTime(text) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min`;
}

function displayTeachers(teachers) {
    const teachersGrid = document.querySelector('.teachers-grid');
    if (!teachersGrid) return;

    teachersGrid.innerHTML = '';

    teachers.forEach(teacher => {
        const teacherCard = createTeacherCard(teacher);
        teachersGrid.appendChild(teacherCard);
    });
}

function createTeacherCard(teacher) {
    const card = document.createElement('div');
    card.className = 'teacher-card';

    card.innerHTML = `
        <div class="teacher-image">
            <img src="${teacher.photo}" alt="${teacher.name}" />
            <div class="teacher-overlay">
                <div class="teacher-social">
                    <a href="mailto:contact@arabesque-danse.fr" class="social-link" aria-label="Email"><i class="fas fa-envelope"></i></a>
                    <a href="tel:0123456789" class="social-link" aria-label="Téléphone"><i class="fas fa-phone"></i></a>
                </div>
            </div>
        </div>
        <div class="teacher-info">
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-specialty">${teacher.discipline}</p>
            <p class="teacher-bio">${teacher.description}</p>
            ${teacher.experience ? `<div class="teacher-experience"><i class="fas fa-award"></i> ${teacher.experience} d'expérience</div>` : ''}
        </div>
    `;

    return card;
}

function generateScheduleFilters() {
    const filtersContainer = document.getElementById('scheduleFilters');
    const mobileSelect = document.getElementById('scheduleFiltersMobile');
    if (!filtersContainer || !scheduleData) return;

    // Bouton "Tous" pour version desktop
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.filter = 'all';
    allBtn.textContent = 'Tous les jours';
    allBtn.addEventListener('click', () => {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('#scheduleFilters .filter-btn').forEach(b =>
            b.classList.remove('active')
        );
        allBtn.classList.add('active');

        // Mettre à jour le select mobile
        if (mobileSelect) mobileSelect.value = 'all';

        // Filtrer les cours
        displaySchedule('all');
    });
    filtersContainer.appendChild(allBtn);

    // Ajouter option "Tous" au select mobile
    if (mobileSelect) {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Tous les jours';
        mobileSelect.appendChild(allOption);
    }

    // Boutons pour chaque jour de la semaine
    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    daysOfWeek.forEach(day => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = day;
        btn.textContent = day;
        btn.addEventListener('click', () => {
            // Mettre à jour les boutons actifs
            document.querySelectorAll('#scheduleFilters .filter-btn').forEach(b =>
                b.classList.remove('active')
            );
            btn.classList.add('active');

            // Mettre à jour le select mobile
            if (mobileSelect) mobileSelect.value = day;

            // Filtrer les cours
            displaySchedule(day);
        });
        filtersContainer.appendChild(btn);

        // Ajouter option au select mobile
        if (mobileSelect) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            mobileSelect.appendChild(option);
        }
    });

    // Ajouter l'écouteur d'événement au select mobile
    if (mobileSelect) {
        mobileSelect.addEventListener('change', (e) => {
            const selectedDay = e.target.value;

            // Mettre à jour les boutons actifs
            document.querySelectorAll('#scheduleFilters .filter-btn').forEach(b =>
                b.classList.remove('active')
            );
            document.querySelectorAll('#scheduleFilters .filter-btn').forEach(b => {
                if (b.dataset.filter === selectedDay) {
                    b.classList.add('active');
                }
            });

            // Filtrer les cours
            displaySchedule(selectedDay);
        });
    }
}

function displaySchedule(filter) {
    const scheduleGrid = document.getElementById('scheduleGrid');
    if (!scheduleGrid || !scheduleData) return;

    currentFilter = filter;
    scheduleGrid.innerHTML = '';

    // Filtrer les cours par jour
    const filteredCourses = filter === 'all'
        ? scheduleData.courses
        : scheduleData.courses.filter(course => course.days.includes(filter));

    // Stocker tous les cours filtrés
    window.allFilteredCourses = filteredCourses;
    window.currentDisplayCount = 0;

    // Afficher les 3 premiers cours
    displayMoreCourses();
}

function displayMoreCourses() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    if (!scheduleGrid || !window.allFilteredCourses) return;

    const coursesPerPage = 3;
    const startIndex = window.currentDisplayCount;
    const endIndex = Math.min(startIndex + coursesPerPage, window.allFilteredCourses.length);
    const coursesToShow = window.allFilteredCourses.slice(startIndex, endIndex);

    // Supprimer le bouton "Voir plus" s'il existe
    const existingBtn = document.getElementById('loadMoreBtn');
    if (existingBtn) existingBtn.remove();

    // Afficher les cours
    coursesToShow.forEach((course, index) => {
        const courseCard = createScheduleCard(course);
        scheduleGrid.appendChild(courseCard);

        // Ajouter l'animation avec un délai progressif
        setTimeout(() => {
            courseCard.classList.add('visible');
        }, index * 100);
    });

    window.currentDisplayCount = endIndex;

    // Ajouter le bouton "Voir plus" si nécessaire
    if (window.currentDisplayCount < window.allFilteredCourses.length) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'loadMoreBtn';
        loadMoreBtn.className = 'btn btn-primary load-more-btn';
        loadMoreBtn.textContent = `Voir plus de cours (${window.allFilteredCourses.length - window.currentDisplayCount} restants)`;
        loadMoreBtn.onclick = displayMoreCourses;
        scheduleGrid.appendChild(loadMoreBtn);
    }
}

function getLevelColor(level) {
    const levelColors = {
        'Débutant': '#FF6B6B',      // Rouge clair
        'Initiation': '#FF8C8C',    // Rouge moyen-clair
        'Intermédiaire': '#E63946', // Rouge primaire (corail)
        'Avancé': '#C1121F',        // Rouge foncé
        'Tous niveaux': '#FFA07A'   // Saumon
    };
    return levelColors[level] || '#E63946';
}

function createScheduleCard(course) {
    const card = document.createElement('div');
    card.className = 'schedule-card fade-in';
    card.dataset.courseId = course.id;

    // Obtenir la couleur selon le niveau
    const levelColor = getLevelColor(course.level);

    card.innerHTML = `
        <div class="schedule-card-header">
            <h3 class="dance-type">${course.type}</h3>
            <span class="dance-level" style="background: ${levelColor}; color: white;">${course.level}</span>
        </div>
        <div class="schedule-card-collapsed">
            <div class="schedule-item">
                <i class="fas fa-calendar schedule-item-icon"></i>
                <span>${course.days.join(', ')}</span>
            </div>
        </div>
        <div class="schedule-card-content">
            <p style="color: var(--text-light); margin: 1rem 0;">${course.description}</p>
            <div class="schedule-details">
                <div class="schedule-item">
                    <i class="fas fa-calendar schedule-item-icon"></i>
                    <span>${course.days.join(', ')}</span>
                </div>
                <div class="schedule-item">
                    <i class="fas fa-clock schedule-item-icon"></i>
                    <span>${course.time}</span>
                </div>
                <div class="schedule-item">
                    <i class="fas fa-hourglass-half schedule-item-icon"></i>
                    <span>${course.duration}</span>
                </div>
                <div class="schedule-item">
                    <i class="fas fa-map-marker-alt schedule-item-icon"></i>
                    <span>${course.room}</span>
                </div>
                <div class="schedule-item">
                    <i class="fas fa-users schedule-item-icon"></i>
                    <span>Max ${course.maxStudents} élèves</span>
                </div>
            </div>
            <div class="schedule-card-footer">
                <span class="teacher-name"><i class="fas fa-chalkboard-teacher"></i> ${course.teacher}</span>
                <button class="btn btn-outline course-select-btn" style="padding: 0.5rem 1.5rem; font-size: 0.9rem;" 
                        data-course-id="${course.id}" 
                        onclick="toggleCourseSelection(${course.id})">
                    <span class="btn-text">Sélectionner</span>
                </button>
            </div>
        </div>
        <button class="schedule-card-toggle" onclick="toggleScheduleCard(event)">
            <i class="fas fa-chevron-down"></i>
        </button>
    `;

    return card;
}

function toggleScheduleCard(event) {
    event.preventDefault();
    const card = event.target.closest('.schedule-card');
    card.classList.toggle('expanded');
    const icon = event.target.closest('.schedule-card-toggle').querySelector('i');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

// ============================================
// GESTION DE LA SÉLECTION DES COURS
// ============================================
function toggleCourseSelection(courseId) {
    const course = scheduleData.courses.find(c => c.id === courseId);
    if (!course) return;

    const index = selectedCourses.findIndex(c => c.id === courseId);
    const btn = document.querySelector(`[data-course-id="${courseId}"]`);
    const card = btn ? btn.closest('.schedule-card') : null;

    if (index > -1) {
        // Désélectionner
        selectedCourses.splice(index, 1);
        window.selectedCourses = selectedCourses; // Sync global
        if (btn) {
            btn.classList.remove('selected');
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Sélectionner';
        }
        if (card) card.classList.remove('selected');
    } else {
        // Sélectionner
        selectedCourses.push(course);
        window.selectedCourses = selectedCourses; // Sync global
        if (btn) {
            btn.classList.add('selected');
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = '✓ Sélectionné';
        }
        if (card) card.classList.add('selected');
    }

    updateSelectionDisplay();
    if (typeof window.updateCalendarSelectionState === 'function') {
        window.updateCalendarSelectionState();
    }
}

function updateSelectionDisplay() {
    const selectionDiv = document.getElementById('courseSelection');
    const selectedList = document.getElementById('selectedCoursesList');
    const countSpan = document.getElementById('selectedCount');
    const totalPrice = document.getElementById('selectionTotalPrice');

    if (selectedCourses.length === 0) {
        selectionDiv.style.display = 'none';
        return;
    }

    selectionDiv.style.display = 'block';
    countSpan.textContent = selectedCourses.length;

    // Générer la liste des cours sélectionnés
    selectedList.innerHTML = selectedCourses.map(course => `
        <div class="selected-course-item">
            <div class="selected-course-info">
                <strong>${course.type}</strong> - ${course.level}
                <span class="course-time">${course.days.join(', ')} • ${course.time}</span>
            </div>
            <button onclick="toggleCourseSelection(${course.id})" class="btn-remove">×</button>
        </div>
    `).join('');

    // Calculer le prix total
    const price = calculatePrice(selectedCourses.length);
    totalPrice.textContent = `${price}€`;

    // Synchroniser l'état des boutons avec selectedCourses
    document.querySelectorAll('.course-select-btn').forEach(btn => {
        const courseId = parseInt(btn.dataset.courseId);
        const isSelected = selectedCourses.some(c => c.id === courseId);
        const card = btn.closest('.schedule-card');

        if (isSelected) {
            btn.classList.add('selected');
            btn.querySelector('.btn-text').textContent = '✓ Sélectionné';
            card.classList.add('selected');
        } else {
            btn.classList.remove('selected');
            btn.querySelector('.btn-text').textContent = 'Sélectionner';
            card.classList.remove('selected');
        }
    });
}

function clearSelection() {
    selectedCourses = [];

    // Retirer la classe selected de tous les boutons et cartes
    document.querySelectorAll('.course-select-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
        btn.querySelector('.btn-text').textContent = 'Sélectionner';
    });

    document.querySelectorAll('.schedule-card.selected').forEach(card => {
        card.classList.remove('selected');
    });

    updateSelectionDisplay();
}

function calculatePrice(courseCount) {
    if (!pricingData || courseCount === 0) return 0;

    // Utiliser le prix fixe pour le nombre de cours
    return pricingData.coursePrices[courseCount.toString()] || 0;
}

function proceedToSubscribe() {
    if (selectedCourses.length === 0) return;

    // Créer le message avec la liste des cours
    const courseList = selectedCourses.map(c => `- ${c.type} (${c.level}) - ${c.days.join(', ')} ${c.time}`).join('\\n');
    const price = calculatePrice(selectedCourses.length);

    // Pré-remplir le formulaire
    const subjectSelect = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');

    if (subjectSelect) {
        subjectSelect.value = 'registration';
    }

    if (messageTextarea) {
        messageTextarea.value = `Bonjour,\n\nJe souhaite m'inscrire aux cours suivants :\n\n${courseList}\n\nPrix annuel total : ${price}€\n\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription et de paiement ?\n\nMerci.`;
    }

    // Scroller vers le formulaire
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        const offsetTop = contactSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });

        setTimeout(() => {
            const nameInput = document.getElementById('name');
            if (nameInput) {
                nameInput.focus();
            }
        }, 800);
    }
}

// ============================================
// CALCULATEUR DE TARIFS (JSON)
// ============================================
async function loadPricingData() {
    try {
        const response = await fetch('/api/pricing');
        pricingData = await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement des tarifs:', error);
    }
}

function initPricingCalculator() {
    const courseCountInput = document.getElementById('courseCount');

    if (courseCountInput) {
        // Initialiser le prix
        updatePrice();
    }
}

function changeCourseCount(delta) {
    const input = document.getElementById('courseCount');
    if (!input) return;

    let value = parseInt(input.value) + delta;
    value = Math.max(1, Math.min(10, value)); // Entre 1 et 10
    input.value = value;

    updatePrice();
}

function updatePrice() {
    if (!pricingData) return;

    const courseCount = parseInt(document.getElementById('courseCount').value);

    // Obtenir le prix pour ce nombre de cours
    const finalPrice = pricingData.coursePrices[courseCount.toString()] || 0;

    // Mettre à jour l'affichage
    document.getElementById('basePrice').textContent = `${finalPrice}€`;
    document.getElementById('coursesDisplay').textContent = courseCount;
    document.getElementById('discount').textContent = `0%`;
    document.getElementById('totalPrice').textContent = `${finalPrice}€`;

    // Mettre à jour le bouton d'inscription avec les bonnes données
    const subscribeBtn = document.getElementById('pricingSubscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.dataset.courses = courseCount;
        subscribeBtn.dataset.price = `${Math.round(finalPrice)}€/mois`;
    }
}

// ============================================
// GALERIE INTERACTIVE
// ============================================
function initGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    // Collecter tous les items de la galerie
    const items = galleryGrid.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
        galleryItems.push({
            element: item,
            type: item.dataset.type,
            index: index
        });

        // Ajouter un événement de clic sur l'image pour ouvrir la lightbox
        item.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    // Filtres de la galerie
    const filterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Mettre à jour les boutons actifs
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filtrer
            const filter = btn.dataset.filter;
            filterGallery(filter);
        });
    });
}

function filterGallery(filter) {
    currentGalleryFilter = filter;

    galleryItems.forEach(item => {
        if (filter === 'all' || item.type === filter) {
            item.element.style.display = 'block';
            setTimeout(() => {
                item.element.style.opacity = '1';
                item.element.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.element.style.opacity = '0';
            item.element.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.element.style.display = 'none';
            }, 300);
        }
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');

    if (!lightbox || !lightboxContent) return;

    currentLightboxIndex = index;
    const item = galleryItems[index];

    // Déterminer le type de média
    const mediaElement = item.element.querySelector('img, video');

    if (mediaElement.tagName === 'IMG') {
        lightboxContent.innerHTML = `<img src="${mediaElement.src}" alt="Image">`;
    } else if (mediaElement.tagName === 'VIDEO') {
        const videoSrc = mediaElement.querySelector('source').src;
        lightboxContent.innerHTML = `
            <video controls autoplay style="max-width: 100%; max-height: 90vh;">
                <source src="${videoSrc}" type="video/mp4">
            </video>
        `;
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Arrêter les vidéos
    const video = lightbox.querySelector('video');
    if (video) {
        video.pause();
    }
}

function navigateLightbox(direction) {
    let newIndex = currentLightboxIndex + direction;

    // Gérer les limites
    if (newIndex < 0) newIndex = galleryItems.length - 1;
    if (newIndex >= galleryItems.length) newIndex = 0;

    openLightbox(newIndex);
}

// Fermer la lightbox avec Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// ============================================
// FORMULAIRE DE CONTACT
// ============================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Gérer le pré-remplissage du formulaire via les boutons
    initContactTriggers();

    // Gérer la soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('span:first-child');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const formMessage = document.getElementById('formMessage');

        // Récupérer les données du formulaire
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Validation basique
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showFormMessage('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }

        // Afficher le loader
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;

        // Simuler l'envoi (à remplacer par un vrai backend)
        try {
            // IMPORTANT: Remplacer cette simulation par un vrai appel à votre backend
            await simulateFormSubmission(formData);

            // Succès
            showFormMessage('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');
            form.reset();

        } catch (error) {
            // Erreur
            showFormMessage('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.', 'error');
        } finally {
            // Restaurer le bouton
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// Fonction de simulation d'envoi (à remplacer)
function simulateFormSubmission(data) {
    return new Promise((resolve) => {
        console.log('📧 Données du formulaire:', data);

        // Simuler un délai réseau
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
}

function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';

    // Masquer après 5 secondes
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Fonction pour pré-remplir le formulaire de contact
function initContactTriggers() {
    // Écouter tous les clics sur les boutons avec la classe contact-trigger
    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('.contact-trigger');
        if (!trigger) return;

        e.preventDefault();

        // Récupérer les données du bouton
        const subject = trigger.dataset.subject || 'info';
        const course = trigger.dataset.course;
        const level = trigger.dataset.level;
        const teacher = trigger.dataset.teacher;
        const package_name = trigger.dataset.package;
        const courses = trigger.dataset.courses;
        const price = trigger.dataset.price;

        // Pré-remplir le formulaire
        const subjectSelect = document.getElementById('subject');
        const messageTextarea = document.getElementById('message');

        if (subjectSelect) {
            // Sélectionner le bon sujet
            if (subject === 'Inscription') {
                subjectSelect.value = 'registration';
            } else {
                subjectSelect.value = subject;
            }
        }

        if (messageTextarea) {
            let message = '';

            if (course) {
                // Inscription à un cours spécifique
                message = `Bonjour,\n\nJe souhaite m'inscrire au cours de ${course} (niveau ${level}).\n`;
                if (teacher) {
                    message += `Professeur : ${teacher}\n`;
                }
                message += `\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription ?\n\nMerci.`;
            } else if (courses) {
                // Inscription via le calculateur de prix
                message = `Bonjour,\n\nJe souhaite m'inscrire à une formule de ${courses} cours par semaine à ${price}.\n\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription et de paiement ?\n\nMerci.`;
            } else if (package_name) {
                // Inscription à un forfait (ancien système, au cas où)
                message = `Bonjour,\n\nJe suis intéressé(e) par le forfait "${package_name}" à ${price}.\n\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription et de paiement ?\n\nMerci.`;
            } else {
                message = `Bonjour,\n\nJe souhaite obtenir des informations.\n\nMerci.`;
            }

            messageTextarea.value = message;
        }

        // Scroller jusqu'au formulaire avec un léger délai
        setTimeout(() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const offsetTop = contactSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Focus sur le champ nom après le scroll
                setTimeout(() => {
                    const nameInput = document.getElementById('name');
                    if (nameInput) {
                        nameInput.focus();
                    }
                }, 800);
            }
        }, 100);
    });
}

// ============================================
// NEWSLETTER (FOOTER)
// ============================================
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;

        if (email) {
            // TODO: Intégrer avec votre système de newsletter
            alert(`✅ Merci ! Vous êtes inscrit avec l'email : ${email}`);
            emailInput.value = '';
        }
    });
}

// ============================================
// EFFETS VISUELS SUPPLÉMENTAIRES
// ============================================

// Effet parallaxe sur le hero
window.addEventListener('scroll', () => {
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        const scrolled = window.scrollY;
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Animation des compteurs (si vous ajoutez des statistiques)
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

// ============================================
// ANIMATIONS PREMIUM
// ============================================
function initPremiumAnimations() {
    // Header rétractable au scroll
    let lastScroll = 0;
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('header-scrolled');
            header.classList.remove('header-hidden');
            return;
        }

        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scroll vers le bas - cacher
            header.classList.add('header-hidden');
        } else if (currentScroll < lastScroll) {
            // Scroll vers le haut - montrer
            header.classList.remove('header-hidden');
        }

        if (currentScroll > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

        lastScroll = currentScroll;
    });

    // Animations au scroll pour les éléments
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Ajouter la classe animate-on-scroll aux sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });

    // Animer les cartes de cours
    document.querySelectorAll('.schedule-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Animer les cartes de professeurs
    document.querySelectorAll('.teacher-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
}

// ============================================
// UTILITAIRES
// ============================================

// Fonction pour formater les prix
function formatPrice(price) {
    return `${price}€`;
}

// Fonction pour déboguer
function debug(message, data = null) {
    console.log(`🎭 [Arabesque Debug] ${message}`, data || '');
}

// ============================================
// GESTION DES ERREURS GLOBALES
// ============================================
window.addEventListener('error', (e) => {
    console.error('❌ Erreur détectée:', e.error);
});

// Log pour confirmer que le script est chargé
console.log('%c🎭 Arabesque Dance Studio', 'font-size: 20px; font-weight: bold; color: #FF1493;');
console.log('%cSite développé avec ❤️', 'font-size: 12px; color: #9D4EDD;');
