/* ============================================
   APPELS API
   ============================================ */

import { AppState } from './state.js';

/**
 * Charge les données du planning
 */
async function loadScheduleData() {
    try {
        const response = await fetch('/api/schedule');
        AppState.scheduleData = await response.json();
        return AppState.scheduleData;
    } catch (error) {
        console.error('Erreur lors du chargement du planning:', error);
        throw error;
    }
}

/**
 * Charge les données des professeurs
 */
async function loadTeachers() {
    try {
        const response = await fetch('/api/teachers');
        const data = await response.json();
        
        if (data && data.teachers) {
            AppState.allTeachers = data.teachers;
            window.allTeachers = data.teachers;
            return data.teachers;
        }
        return [];
    } catch (error) {
        console.error('Erreur lors du chargement des professeurs:', error);
        throw error;
    }
}

/**
 * Charge les données des tarifs
 */
async function loadPricingData() {
    try {
        const response = await fetch('/api/pricing');
        AppState.pricingData = await response.json();
        return AppState.pricingData;
    } catch (error) {
        console.error('Erreur lors du chargement des tarifs:', error);
        throw error;
    }
}

/**
 * Charge les actualités
 */
async function loadNewsData() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        return data?.news || [];
    } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        throw error;
    }
}

/**
 * Simule l'envoi du formulaire de contact
 */
function simulateFormSubmission(data) {
    return new Promise((resolve) => {
        console.log('📧 Données du formulaire:', data);
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
}

export {
    loadScheduleData,
    loadTeachers,
    loadPricingData,
    loadNewsData,
    simulateFormSubmission
};
