/* ============================================
   ACCORDÉON FAQ
   ============================================ */

/**
 * Initialise l'accordéon FAQ
 */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Fermer tous les autres items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });

                // Toggle l'item actuel
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

export { initFAQAccordion };
