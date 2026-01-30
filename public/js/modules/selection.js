/* ============================================
   GESTION DE LA SÉLECTION DES COURS
   ============================================ */

import { AppState, syncSelectedCourses } from '../state.js';
import { scrollToSection } from './navigation.js';

/**
 * Toggle la sélection d'un cours
 */
function toggleCourseSelection(courseId) {
    if (!AppState.scheduleData) return;
    
    const course = AppState.scheduleData.courses.find(c => c.id === courseId);
    if (!course) return;

    const index = AppState.selectedCourses.findIndex(c => c.id === courseId);
    const btn = document.querySelector(`[data-course-id="${courseId}"]`);
    const card = btn ? btn.closest('.schedule-card') : null;

    if (index > -1) {
        // Désélectionner
        AppState.selectedCourses.splice(index, 1);
        syncSelectedCourses();
        
        if (btn) {
            btn.classList.remove('selected');
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Sélectionner';
        }
        if (card) card.classList.remove('selected');
    } else {
        // Sélectionner
        AppState.selectedCourses.push(course);
        syncSelectedCourses();
        
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

/**
 * Met à jour l'affichage de la sélection
 */
function updateSelectionDisplay() {
    const selectionDiv = document.getElementById('courseSelection');
    const selectedList = document.getElementById('selectedCoursesList');
    const countSpan = document.getElementById('selectedCount');
    const totalPrice = document.getElementById('selectionTotalPrice');

    if (AppState.selectedCourses.length === 0) {
        selectionDiv.style.display = 'none';
        return;
    }

    selectionDiv.style.display = 'block';
    countSpan.textContent = AppState.selectedCourses.length;

    // Générer la liste des cours sélectionnés
    selectedList.innerHTML = AppState.selectedCourses.map(course => `
        <div class="selected-course-item">
            <div class="selected-course-info">
                <strong>${course.type}</strong> - ${course.level}
                <span class="course-time">${course.days.join(', ')} • ${course.time}</span>
            </div>
            <button onclick="toggleCourseSelection(${course.id})" class="btn-remove">×</button>
        </div>
    `).join('');

    // Calculer le prix total
    const price = calculatePrice(AppState.selectedCourses.length);
    totalPrice.textContent = `${price}€`;

    // Synchroniser l'état des boutons
    syncSelectionButtons();
}

/**
 * Synchronise l'état des boutons de sélection
 */
function syncSelectionButtons() {
    document.querySelectorAll('.course-select-btn').forEach(btn => {
        const courseId = parseInt(btn.dataset.courseId);
        const isSelected = AppState.selectedCourses.some(c => c.id === courseId);
        const card = btn.closest('.schedule-card');
        const btnText = btn.querySelector('.btn-text');

        if (isSelected) {
            btn.classList.add('selected');
            if (btnText) btnText.textContent = '✓ Sélectionné';
            if (card) card.classList.add('selected');
        } else {
            btn.classList.remove('selected');
            if (btnText) btnText.textContent = 'Sélectionner';
            if (card) card.classList.remove('selected');
        }
    });
}

/**
 * Vide la sélection
 */
function clearSelection() {
    AppState.selectedCourses = [];
    syncSelectedCourses();

    document.querySelectorAll('.course-select-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
        const btnText = btn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Sélectionner';
    });

    document.querySelectorAll('.schedule-card.selected').forEach(card => {
        card.classList.remove('selected');
    });

    updateSelectionDisplay();
}

/**
 * Calcule le prix en fonction du nombre de cours
 */
function calculatePrice(courseCount) {
    if (!AppState.pricingData || courseCount === 0) return 0;
    return AppState.pricingData.coursePrices[courseCount.toString()] || 0;
}

/**
 * Procède à l'inscription
 */
function proceedToSubscribe() {
    if (AppState.selectedCourses.length === 0) return;

    const courseList = AppState.selectedCourses
        .map(c => `- ${c.type} (${c.level}) - ${c.days.join(', ')} ${c.time}`)
        .join('\n');
    const price = calculatePrice(AppState.selectedCourses.length);

    const subjectSelect = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');

    if (subjectSelect) {
        subjectSelect.value = 'registration';
    }

    if (messageTextarea) {
        messageTextarea.value = `Bonjour,\n\nJe souhaite m'inscrire aux cours suivants :\n\n${courseList}\n\nPrix annuel total : ${price}€\n\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription et de paiement ?\n\nMerci.`;
    }

    scrollToSection('contact');

    setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
    }, 800);
}

// Exposer globalement
window.toggleCourseSelection = toggleCourseSelection;
window.clearSelection = clearSelection;
window.proceedToSubscribe = proceedToSubscribe;

export {
    toggleCourseSelection,
    updateSelectionDisplay,
    clearSelection,
    calculatePrice,
    proceedToSubscribe
};
