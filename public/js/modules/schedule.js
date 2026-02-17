/* ============================================
   PLANNING DES COURS
   ============================================ */

import { AppState } from '../state.js';
import { getLevelColor, getTeacherNameById } from '../utils.js';
import { showToast } from './toast.js';

/**
 * Affiche le skeleton de chargement
 */
function showScheduleLoading() {
    const loading = document.getElementById('scheduleLoading');
    if (loading) {
        loading.style.display = 'grid';
    }
}

/**
 * Cache le skeleton de chargement
 */
function hideScheduleLoading() {
    const loading = document.getElementById('scheduleLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

/**
 * Génère les filtres de jours
 */
function generateScheduleFilters() {
    const filtersContainer = document.getElementById('scheduleFilters');
    const mobileSelect = document.getElementById('scheduleFiltersMobile');
    if (!filtersContainer || !AppState.scheduleData) return;

    // Bouton "Tous"
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.filter = 'all';
    allBtn.textContent = 'Tous les jours';
    allBtn.addEventListener('click', () => handleFilterClick('all', allBtn, mobileSelect));
    filtersContainer.appendChild(allBtn);

    if (mobileSelect) {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Tous les jours';
        mobileSelect.appendChild(allOption);
    }

    // Boutons pour chaque jour
    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    daysOfWeek.forEach(day => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = day;
        btn.textContent = day;
        btn.addEventListener('click', () => handleFilterClick(day, btn, mobileSelect));
        filtersContainer.appendChild(btn);

        if (mobileSelect) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            mobileSelect.appendChild(option);
        }
    });

    // Écouteur pour le select mobile
    if (mobileSelect) {
        mobileSelect.addEventListener('change', (e) => {
            const selectedDay = e.target.value;
            updateFilterButtons(selectedDay);
            displaySchedule(selectedDay);
        });
    }
}

/**
 * Gère le clic sur un filtre
 */
function handleFilterClick(filter, btn, mobileSelect) {
    updateFilterButtons(filter);
    if (mobileSelect) mobileSelect.value = filter;
    displaySchedule(filter);
}

/**
 * Met à jour les boutons de filtre actifs
 */
function updateFilterButtons(activeFilter) {
    document.querySelectorAll('#scheduleFilters .filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === activeFilter);
    });
}

/**
 * Affiche les cours filtrés
 */
function displaySchedule(filter) {
    const scheduleGrid = document.getElementById('scheduleGrid');
    if (!scheduleGrid || !AppState.scheduleData) return;

    AppState.currentFilter = filter;
    scheduleGrid.innerHTML = '';

    const filteredCourses = filter === 'all'
        ? AppState.scheduleData.courses
        : AppState.scheduleData.courses.filter(course => course.days.includes(filter));

    AppState.allFilteredCourses = filteredCourses;
    AppState.currentDisplayCount = 0;

    displayMoreCourses();
}

/**
 * Affiche plus de cours (pagination)
 */
function displayMoreCourses() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    if (!scheduleGrid || !AppState.allFilteredCourses) return;

    const coursesPerPage = 3;
    const startIndex = AppState.currentDisplayCount;
    const endIndex = Math.min(startIndex + coursesPerPage, AppState.allFilteredCourses.length);
    const coursesToShow = AppState.allFilteredCourses.slice(startIndex, endIndex);

    // Supprimer le bouton existant
    const existingBtn = document.getElementById('loadMoreBtn');
    if (existingBtn) existingBtn.remove();

    // Afficher les cours
    coursesToShow.forEach((course, index) => {
        const courseCard = createScheduleCard(course);
        scheduleGrid.appendChild(courseCard);

        setTimeout(() => {
            courseCard.classList.add('visible');
        }, index * 100);
    });

    AppState.currentDisplayCount = endIndex;

    // Ajouter le bouton "Voir plus"
    if (AppState.currentDisplayCount < AppState.allFilteredCourses.length) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'loadMoreBtn';
        loadMoreBtn.className = 'btn btn-primary load-more-btn';
        loadMoreBtn.textContent = `Voir plus de cours (${AppState.allFilteredCourses.length - AppState.currentDisplayCount} restants)`;
        loadMoreBtn.onclick = displayMoreCourses;
        scheduleGrid.appendChild(loadMoreBtn);
    }
}

/**
 * Crée une carte de cours
 */
function createScheduleCard(course) {
    const card = document.createElement('div');
    card.className = 'schedule-card fade-in';
    card.dataset.courseId = course.id;

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
            </div>
            <div class="schedule-card-footer">
                <span class="teacher-name"><i class="fas fa-chalkboard-teacher"></i> ${getTeacherNameById(course.teacherId)}</span>
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

/**
 * Toggle l'expansion d'une carte
 */
function toggleScheduleCard(event) {
    event.preventDefault();
    const card = event.target.closest('.schedule-card');
    card.classList.toggle('expanded');
    const icon = event.target.closest('.schedule-card-toggle').querySelector('i');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

// Exposer globalement
window.toggleScheduleCard = toggleScheduleCard;
window.showScheduleLoading = showScheduleLoading;
window.hideScheduleLoading = hideScheduleLoading;

export {
    showScheduleLoading,
    hideScheduleLoading,
    generateScheduleFilters,
    displaySchedule,
    displayMoreCourses,
    createScheduleCard,
    toggleScheduleCard
};
