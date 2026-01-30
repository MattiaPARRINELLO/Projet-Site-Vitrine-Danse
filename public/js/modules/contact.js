/* ============================================
   FORMULAIRE DE CONTACT
   ============================================ */

import { simulateFormSubmission } from '../api.js';
import { showToast } from './toast.js';

/**
 * Initialise le formulaire de contact
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    initContactTriggers();
    initFormSubmission(form);
}

/**
 * Gère la soumission du formulaire
 */
function initFormSubmission(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('span:first-child');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showFormMessage('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }

        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            await simulateFormSubmission(formData);
            showFormMessage('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');
            form.reset();
        } catch (error) {
            showFormMessage("Une erreur est survenue lors de l'envoi. Veuillez réessayer.", 'error');
        } finally {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

/**
 * Affiche un message sous le formulaire
 */
function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';

    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

/**
 * Gère les boutons qui pré-remplissent le formulaire
 */
function initContactTriggers() {
    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('.contact-trigger');
        if (!trigger) return;

        e.preventDefault();

        const subject = trigger.dataset.subject || 'info';
        const course = trigger.dataset.course;
        const level = trigger.dataset.level;
        const teacher = trigger.dataset.teacher;
        const package_name = trigger.dataset.package;
        const courses = trigger.dataset.courses;
        const price = trigger.dataset.price;

        const subjectSelect = document.getElementById('subject');
        const messageTextarea = document.getElementById('message');

        if (subjectSelect) {
            subjectSelect.value = subject === 'Inscription' ? 'registration' : subject;
        }

        if (messageTextarea) {
            let message = '';

            if (course) {
                message = `Bonjour,\n\nJe souhaite m'inscrire au cours de ${course} (niveau ${level}).\n`;
                if (teacher) message += `Professeur : ${teacher}\n`;
                message += `\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription ?\n\nMerci.`;
            } else if (courses) {
                message = `Bonjour,\n\nJe souhaite m'inscrire à une formule de ${courses} cours par semaine à ${price}.\n\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription et de paiement ?\n\nMerci.`;
            } else if (package_name) {
                message = `Bonjour,\n\nJe suis intéressé(e) par le forfait "${package_name}" à ${price}.\n\nPouvez-vous me fournir plus d'informations sur les modalités d'inscription et de paiement ?\n\nMerci.`;
            } else {
                message = `Bonjour,\n\nJe souhaite obtenir des informations.\n\nMerci.`;
            }

            messageTextarea.value = message;
        }

        // Scroller vers le formulaire
        setTimeout(() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const offsetTop = contactSection.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });

                setTimeout(() => {
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.focus();
                }, 800);
            }
        }, 100);
    });
}

/**
 * Initialise la newsletter
 */
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (email) {
                showToast('Inscription réussie', `Vous êtes inscrit avec l'email : ${email}`, 'success');
                emailInput.value = '';
            }
        });
    }
}

export { initContactForm, initNewsletter, showFormMessage };
