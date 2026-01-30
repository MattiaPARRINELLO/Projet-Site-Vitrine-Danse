/* ============================================
   ÉTAT GLOBAL DE L'APPLICATION
   ============================================ */

const AppState = {
    // Données chargées depuis l'API
    scheduleData: null,
    pricingData: null,
    
    // Filtres
    currentFilter: 'all',
    currentGalleryFilter: 'all',
    currentView: 'grid',
    advancedFilters: {
        level: 'all',
        day: 'all',
        teacher: 'all'
    },
    
    // Sélection des cours
    selectedCourses: [],
    
    // Galerie
    galleryItems: [],
    currentLightboxIndex: 0,
    
    // Professeurs
    allTeachers: [],
    
    // Pagination
    allFilteredCourses: [],
    currentDisplayCount: 0
};

// Exposer l'état globalement pour la compatibilité
window.selectedCourses = AppState.selectedCourses;
window.allTeachers = AppState.allTeachers;

// Fonction pour synchroniser selectedCourses avec window
function syncSelectedCourses() {
    window.selectedCourses = AppState.selectedCourses;
}

export { AppState, syncSelectedCourses };
