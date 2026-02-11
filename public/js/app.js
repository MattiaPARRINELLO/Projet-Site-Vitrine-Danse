/* ============================================
   ARABESQUE - POINT D'ENTRÉE PRINCIPAL
   Application Site Vitrine Danse
   ============================================ */

// État global
import { AppState } from './state.js';

// API
import { loadScheduleData, loadTeachers, loadPricingData, loadNewsData } from './api.js';

// Modules
import { showToast } from './modules/toast.js';
import { initNavigation, initBackToTop } from './modules/navigation.js';
import { showScheduleLoading, hideScheduleLoading, generateScheduleFilters, displaySchedule } from './modules/schedule.js';
import { initViewToggle, initCourseModal } from './modules/calendar.js';
import { displayTeachers } from './modules/teachers.js';
import { initGallery } from './modules/gallery.js';
import { initPricingCalculator } from './modules/pricing.js';
import { renderNews, checkForNewContent, requestNotificationPermission } from './modules/news.js';
import { initContactForm, initNewsletter } from './modules/contact.js';
import { initParallax, initScrollAnimations, initPremiumAnimations } from './modules/animations.js';
import { initAdvancedFilters, populateTeacherFilter } from './modules/filters.js';
import './modules/selection.js';
import { initFormValidation } from './modules/validation.js';
import { initFAQAccordion } from './modules/faq.js';

// ============================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ============================================
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🎭 Chargement du site Arabesque...');

    try {
        // Initialisation des modules UI (synchrone)
        initNavigation();
        initBackToTop();
        initParallax();
        initScrollAnimations();
        initGallery();
        initPricingCalculator();
        initPremiumAnimations();
        initAdvancedFilters();
        initViewToggle();
        initFormValidation();
        initFAQAccordion();
        initCourseModal();
        initContactForm();
        initNewsletter();

        // Chargement des données (asynchrone)
        await loadAllData();

        // Vérification des nouvelles actualités
        checkForNewContent();

        // Demander la permission pour les notifications push
        requestNotificationPermission();

        console.log('✅ Site Arabesque initialisé avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showToast('Erreur', 'Une erreur est survenue lors du chargement', 'error');
    }
});

/**
 * Charge toutes les données depuis l'API
 */
async function loadAllData() {
    // Afficher le skeleton de chargement
    showScheduleLoading();

    // Charger en parallèle
    const [scheduleResult, pricingResult, teachersResult, newsResult] = await Promise.allSettled([
        loadScheduleData(),
        loadPricingData(),
        loadTeachers(),
        loadNewsData()
    ]);

    // Traiter le planning
    if (scheduleResult.status === 'fulfilled' && scheduleResult.value) {
        generateScheduleFilters();
        displaySchedule('all');
        hideScheduleLoading();
    } else {
        const scheduleGrid = document.getElementById('scheduleGrid');
        if (scheduleGrid) {
            scheduleGrid.innerHTML = '<p style="text-align: center; color: #FF1493;">Impossible de charger le planning. Veuillez réessayer plus tard.</p>';
        }
    }

    // Traiter les professeurs
    if (teachersResult.status === 'fulfilled' && teachersResult.value) {
        displayTeachers(teachersResult.value);
        populateTeacherFilter(teachersResult.value);
    }

    // Traiter les actualités
    if (newsResult.status === 'fulfilled') {
        renderNews(newsResult.value);
        initScrollAnimations(); // Réinitialiser pour les nouveaux éléments
    } else {
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            newsGrid.innerHTML = '<p style="text-align:center; color: #b0b0b0;">Impossible de charger les actualités.</p>';
        }
    }
}

// ============================================
// GESTION DES ERREURS GLOBALES
// ============================================
window.addEventListener('error', (e) => {
    console.error('❌ Erreur détectée:', e.error);
});

// ============================================
// LOG DE DÉMARRAGE
// ============================================
console.log('%c🎭 Arabesque Dance Studio', 'font-size: 20px; font-weight: bold; color: #FF1493;');
console.log('%cSite développé avec ❤️', 'font-size: 12px; color: #9D4EDD;');
