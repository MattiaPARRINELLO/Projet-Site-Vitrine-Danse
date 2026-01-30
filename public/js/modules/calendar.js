/* ============================================
   VUE CALENDRIER
   ============================================ */

import { AppState } from '../state.js';
import { extractHours } from '../utils.js';
import { showToast } from './toast.js';

/**
 * Initialise le toggle de vue grille/calendrier
 */
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-toggle-btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
            
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/**
 * Change de vue (grille ou calendrier)
 */
function switchView(view) {
    AppState.currentView = view;
    const scheduleGrid = document.getElementById('scheduleGrid');
    const scheduleCalendar = document.getElementById('scheduleCalendar');

    if (view === 'grid') {
        scheduleGrid.style.display = 'grid';
        scheduleCalendar.style.display = 'none';
        // Réappliquer les filtres
        if (typeof window.applyAdvancedFilters === 'function') {
            window.applyAdvancedFilters();
        }
    } else {
        scheduleGrid.style.display = 'none';
        scheduleCalendar.style.display = 'block';
        displayCalendarView();
    }
}

/**
 * Affiche la vue calendrier
 */
function displayCalendarView(filteredCourses = null) {
    const calendarHours = document.getElementById('calendarHours');
    const calendarGrid = document.getElementById('calendarGrid');
    
    if (!calendarHours || !calendarGrid || !AppState.scheduleData) return;

    const courses = filteredCourses || AppState.scheduleData.courses || [];
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    const startHour = 14;
    const endHour = 22.5;
    const slotHeight = 60;
    const slotStep = 0.5;
    const stepHeight = slotHeight * slotStep;

    calendarHours.innerHTML = '';
    calendarGrid.innerHTML = '';

    // Créer la colonne des heures
    for (let time = startHour; time < endHour; time += slotStep) {
        const hourElement = document.createElement('div');
        hourElement.className = 'calendar-hour';
        const hour = Math.floor(time);
        const minutes = time % 1 === 0 ? '00' : '30';
        hourElement.textContent = `${String(hour).padStart(2, '0')}:${minutes}`;
        hourElement.style.height = `${stepHeight}px`;
        calendarHours.appendChild(hourElement);
    }

    // Grouper les cours par jour
    const coursesByDay = {};
    days.forEach(day => coursesByDay[day] = []);

    courses.forEach(course => {
        if (!course.days || !Array.isArray(course.days)) return;
        course.days.forEach(day => {
            coursesByDay[day].push(course);
        });
    });

    // Créer les colonnes
    days.forEach(day => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'calendar-day-column';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayColumn.appendChild(dayHeader);

        const dayTimeline = document.createElement('div');
        dayTimeline.className = 'calendar-day-timeline';

        // Créer les slots horaires
        for (let time = startHour; time < endHour; time += slotStep) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'calendar-time-slot';
            timeSlot.style.height = `${stepHeight}px`;
            dayTimeline.appendChild(timeSlot);
        }

        const coursesContainer = document.createElement('div');
        coursesContainer.className = 'calendar-courses-container';

        const dayCoursesData = coursesByDay[day] || [];
        
        if (dayCoursesData.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'calendar-no-courses';
            emptyMsg.textContent = 'Aucun cours';
            dayTimeline.appendChild(emptyMsg);
        } else {
            const layoutItems = layoutCoursesForDay(dayCoursesData);

            layoutItems.forEach(item => {
                const courseCard = createCourseCard(item, startHour);
                coursesContainer.appendChild(courseCard);
            });

            dayTimeline.appendChild(coursesContainer);
        }

        dayColumn.appendChild(dayTimeline);
        calendarGrid.appendChild(dayColumn);
    });
    
    setTimeout(() => updateCalendarSelectionState(), 0);
}

/**
 * Crée une carte de cours pour le calendrier
 */
function createCourseCard(layoutItem, startHour) {
    const card = document.createElement('div');
    card.className = 'calendar-course-card';

    const course = layoutItem.course;
    const startMin = layoutItem.startMin;
    const endMin = layoutItem.endMin;
    const columnIndex = layoutItem.columnIndex;
    const columnsCount = layoutItem.columnsCount;

    if (course && course.id != null) {
        card.dataset.courseId = course.id;
    }

    const slotHeight = 60;
    const topPosition = ((startMin / 60) - startHour) * slotHeight;
    const safeEndMin = endMin > startMin ? endMin : startMin + 30;
    const durationHours = (safeEndMin - startMin) / 60;
    const cardHeight = durationHours * slotHeight;

    card.style.top = `${topPosition}px`;
    card.style.height = `${cardHeight}px`;

    if (columnsCount > 1) {
        const width = 100 / columnsCount;
        const left = width * columnIndex;
        card.style.width = `calc(${width}% - 4px)`;
        card.style.left = `calc(${left}% + 2px)`;
    }

    const type = course.type || 'Cours sans nom';
    const teacher = course.teacher || 'Professeur';
    const level = course.level || '';
    const time = course.time || '';

    card.innerHTML = `
        <div class="course-card-time">${time}</div>
        <div class="course-card-title">${type}</div>
        ${level ? `<div class="course-card-level">${level}</div>` : ''}
        <div class="course-card-teacher">${teacher}</div>
    `;

    card.addEventListener('click', () => openCourseModal(course));

    return card;
}

/**
 * Layout intelligent des cours qui se chevauchent
 */
function layoutCoursesForDay(dayCourses) {
    const items = dayCourses.map(course => {
        const hours = extractHours(course.time);
        const startMin = Math.round(hours.start * 60);
        const endMin = Math.round(hours.end * 60);
        return { course, startMin, endMin };
    }).sort((a, b) => {
        if (a.startMin === b.startMin) return a.endMin - b.endMin;
        return a.startMin - b.startMin;
    });

    const results = [];
    let columnsEnd = [];
    let groupItems = [];
    let groupMaxColumns = 0;

    const finalizeGroup = () => {
        if (groupItems.length === 0) return;
        groupItems.forEach(item => {
            item.columnsCount = groupMaxColumns;
        });
        groupItems = [];
        groupMaxColumns = 0;
        columnsEnd = [];
    };

    items.forEach(item => {
        const startMin = item.startMin;
        columnsEnd = columnsEnd.map(end => (end !== null && end <= startMin ? null : end));

        if (columnsEnd.length > 0 && columnsEnd.every(end => end === null)) {
            finalizeGroup();
        }

        let columnIndex = columnsEnd.findIndex(end => end === null);
        if (columnIndex === -1) {
            columnIndex = columnsEnd.length;
            columnsEnd.push(item.endMin);
        } else {
            columnsEnd[columnIndex] = item.endMin;
        }

        groupMaxColumns = Math.max(groupMaxColumns, columnsEnd.length);

        const layoutItem = {
            course: item.course,
            startMin: item.startMin,
            endMin: item.endMin,
            columnIndex,
            columnsCount: 1
        };

        groupItems.push(layoutItem);
        results.push(layoutItem);
    });

    finalizeGroup();
    return results;
}

/**
 * Met à jour l'état de sélection dans le calendrier
 */
function updateCalendarSelectionState() {
    const cards = document.querySelectorAll('.calendar-course-card');
    if (!cards.length) return;
    
    const selectedCourses = window.selectedCourses || [];
    
    cards.forEach(card => {
        const courseId = parseInt(card.dataset.courseId);
        if (isNaN(courseId)) return;
        
        const isSelected = selectedCourses.some(c => parseInt(c.id) === courseId);
        
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// ============================================
// MODAL DES COURS
// ============================================

/**
 * Initialise la modal
 */
function initCourseModal() {
    const modal = document.getElementById('courseModal');
    if (!modal) return;

    const overlay = modal.querySelector('.course-modal-overlay');
    const closeBtn = modal.querySelector('.course-modal-close');
    const selectBtn = document.getElementById('courseModalSelectBtn');

    if (overlay) overlay.addEventListener('click', closeCourseModal);
    if (closeBtn) closeBtn.addEventListener('click', closeCourseModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeCourseModal();
        }
    });

    if (selectBtn) {
        selectBtn.addEventListener('click', () => {
            const courseId = parseInt(selectBtn.dataset.courseId);
            if (isNaN(courseId) || typeof window.toggleCourseSelection !== 'function') return;
            
            window.toggleCourseSelection(courseId);
            updateCourseModalSelectionState(courseId);
            updateCalendarSelectionState();
            closeCourseModal();
        });
    }
}

/**
 * Ouvre la modal avec les détails d'un cours
 */
function openCourseModal(course) {
    const modal = document.getElementById('courseModal');
    if (!modal || !course) return;

    const title = document.getElementById('courseModalTitle');
    const subtitle = document.getElementById('courseModalSubtitle');
    const details = document.getElementById('courseModalDetails');
    const description = document.getElementById('courseModalDescription');
    const selectBtn = document.getElementById('courseModalSelectBtn');

    if (title) title.textContent = course.type || 'Cours';
    if (subtitle) subtitle.textContent = `${course.level || 'Tous niveaux'} • ${course.teacher || 'Professeur'}`;

    if (details) {
        details.innerHTML = `
            <div><i class="fas fa-calendar"></i> ${Array.isArray(course.days) ? course.days.join(', ') : ''}</div>
            <div><i class="fas fa-clock"></i> ${course.time || ''}</div>
            <div><i class="fas fa-hourglass-half"></i> ${course.duration || ''}</div>
            <div><i class="fas fa-map-marker-alt"></i> ${course.room || ''}</div>
            <div><i class="fas fa-users"></i> ${course.maxStudents ? `Max ${course.maxStudents} élèves` : ''}</div>
        `;
    }

    if (description) {
        description.textContent = course.description || 'Aucune description disponible.';
    }

    if (selectBtn) {
        selectBtn.dataset.courseId = course.id;
        updateCourseModalSelectionState(course.id);
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

/**
 * Ferme la modal
 */
function closeCourseModal() {
    const modal = document.getElementById('courseModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

/**
 * Met à jour l'état du bouton de sélection dans la modal
 */
function updateCourseModalSelectionState(courseId) {
    const selectBtn = document.getElementById('courseModalSelectBtn');
    if (!selectBtn) return;

    const isSelected = Array.isArray(window.selectedCourses)
        ? window.selectedCourses.some(c => c.id === courseId)
        : false;

    selectBtn.textContent = isSelected ? 'Retirer de la sélection' : 'Sélectionner ce cours';
    selectBtn.classList.toggle('selected', isSelected);
}

// Exposer globalement
window.updateCalendarSelectionState = updateCalendarSelectionState;
window.switchView = switchView;
window.displayCalendarView = displayCalendarView;

export {
    initViewToggle,
    switchView,
    displayCalendarView,
    updateCalendarSelectionState,
    initCourseModal,
    openCourseModal,
    closeCourseModal
};
