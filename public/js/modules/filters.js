/* ============================================
   FILTRES AVANCÉS
   ============================================ */

import { AppState } from '../state.js';
import { showToast } from './toast.js';
import { displayCalendarView } from './calendar.js';
import { createScheduleCard, hideScheduleLoading } from './schedule.js';

/**
 * Initialise les filtres avancés
 */
function initAdvancedFilters() {
    const filterLevel = document.getElementById('filterLevel');
    const filterDay = document.getElementById('filterDay');
    const filterTeacher = document.getElementById('filterTeacher');
    const resetBtn = document.getElementById('resetFilters');

    if (filterLevel) {
        filterLevel.addEventListener('change', (e) => {
            AppState.advancedFilters.level = e.target.value;
            applyAdvancedFilters();
        });
    }

    if (filterDay) {
        filterDay.addEventListener('change', (e) => {
            AppState.advancedFilters.day = e.target.value;
            applyAdvancedFilters();
        });
    }

    if (filterTeacher) {
        filterTeacher.addEventListener('change', (e) => {
            AppState.advancedFilters.teacher = e.target.value;
            applyAdvancedFilters();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            AppState.advancedFilters = { level: 'all', day: 'all', teacher: 'all' };
            if (filterLevel) filterLevel.value = 'all';
            if (filterDay) filterDay.value = 'all';
            if (filterTeacher) filterTeacher.value = 'all';
            applyAdvancedFilters();
            showToast('Filtres réinitialisés', 'Tous les cours sont maintenant affichés', 'info', 2000);
        });
    }
}

/**
 * Peuple le filtre des professeurs
 */
function populateTeacherFilter(teachers) {
    const filterTeacher = document.getElementById('filterTeacher');
    if (!filterTeacher || !teachers) return;

    AppState.allTeachers = teachers;

    filterTeacher.innerHTML = '<option value="all">Tous les professeurs</option>';

    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        filterTeacher.appendChild(option);
    });
}

/**
 * Applique les filtres avancés
 */
function applyAdvancedFilters() {
    if (!AppState.scheduleData) return;

    let filteredCourses = AppState.scheduleData.courses || [];

    // Filtre par niveau
    if (AppState.advancedFilters.level !== 'all') {
        filteredCourses = filteredCourses.filter(course =>
            course.level === AppState.advancedFilters.level
        );
    }

    // Filtre par jour
    if (AppState.advancedFilters.day !== 'all') {
        filteredCourses = filteredCourses.filter(course =>
            course.days && course.days.includes(AppState.advancedFilters.day)
        );
    }

    // Filtre par professeur
    if (AppState.advancedFilters.teacher !== 'all') {
        const teacherId = parseInt(AppState.advancedFilters.teacher);
        filteredCourses = filteredCourses.filter(course =>
            course.teacherId === teacherId
        );
    }

    // Afficher les résultats
    if (AppState.currentView === 'grid') {
        const scheduleGrid = document.getElementById('scheduleGrid');
        if (scheduleGrid) {
            scheduleGrid.innerHTML = '';
            hideScheduleLoading();
            filteredCourses.forEach(course => {
                const card = createScheduleCard(course);
                scheduleGrid.appendChild(card);
            });
        }
    } else {
        displayCalendarView(filteredCourses);
    }

    if (filteredCourses.length === 0) {
        showToast('Aucun cours trouvé', 'Essayez de modifier vos critères de recherche', 'info', 3000);
    }
}

// Exposer globalement
window.populateTeacherFilter = populateTeacherFilter;
window.applyAdvancedFilters = applyAdvancedFilters;

export { initAdvancedFilters, populateTeacherFilter, applyAdvancedFilters };
