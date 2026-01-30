/* ============================================
   CALCULATEUR DE TARIFS
   ============================================ */

import { AppState } from '../state.js';

/**
 * Initialise le calculateur de tarifs
 */
function initPricingCalculator() {
    const courseCountInput = document.getElementById('courseCount');

    if (courseCountInput) {
        updatePrice();
    }
}

/**
 * Change le nombre de cours
 */
function changeCourseCount(delta) {
    const input = document.getElementById('courseCount');
    if (!input) return;

    let value = parseInt(input.value) + delta;
    value = Math.max(1, Math.min(10, value));
    input.value = value;

    updatePrice();
}

/**
 * Met à jour l'affichage du prix
 */
function updatePrice() {
    if (!AppState.pricingData) return;

    const courseCount = parseInt(document.getElementById('courseCount').value);
    const finalPrice = AppState.pricingData.coursePrices[courseCount.toString()] || 0;

    // Mettre à jour l'affichage
    const basePrice = document.getElementById('basePrice');
    const coursesDisplay = document.getElementById('coursesDisplay');
    const discount = document.getElementById('discount');
    const totalPrice = document.getElementById('totalPrice');

    if (basePrice) basePrice.textContent = `${finalPrice}€`;
    if (coursesDisplay) coursesDisplay.textContent = courseCount;
    if (discount) discount.textContent = `0%`;
    if (totalPrice) totalPrice.textContent = `${finalPrice}€`;

    // Mettre à jour le bouton d'inscription
    const subscribeBtn = document.getElementById('pricingSubscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.dataset.courses = courseCount;
        subscribeBtn.dataset.price = `${Math.round(finalPrice)}€/an`;
    }
}

// Exposer globalement
window.changeCourseCount = changeCourseCount;
window.updatePrice = updatePrice;

export { initPricingCalculator, changeCourseCount, updatePrice };
