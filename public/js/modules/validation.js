/* ============================================
   VALIDATION DES FORMULAIRES
   ============================================ */

import { showToast } from './toast.js';

/**
 * Initialise la validation en temps réel
 */
function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    if (nameInput) {
        nameInput.addEventListener('input', () => validateName(nameInput));
        nameInput.addEventListener('blur', () => validateName(nameInput));
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => validateEmail(emailInput));
        emailInput.addEventListener('blur', () => validateEmail(emailInput));
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', () => validatePhone(phoneInput));
        phoneInput.addEventListener('blur', () => validatePhone(phoneInput));
    }

    if (messageInput) {
        messageInput.addEventListener('input', () => validateMessage(messageInput));
        messageInput.addEventListener('blur', () => validateMessage(messageInput));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = validateName(nameInput);
        const isEmailValid = validateEmail(emailInput);
        const isPhoneValid = phoneInput.value === '' || validatePhone(phoneInput);
        const isMessageValid = validateMessage(messageInput);

        if (isNameValid && isEmailValid && isPhoneValid && isMessageValid) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                form.reset();

                form.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('success', 'error');
                });

                showToast('Message envoyé !', 'Nous vous répondrons dans les plus brefs délais.', 'success', 5000);
            }, 2000);
        } else {
            showToast('Formulaire incomplet', "Veuillez corriger les erreurs avant d'envoyer.", 'error', 4000);
        }
    });
}

/**
 * Valide le champ nom
 */
function validateName(input) {
    const value = input.value.trim();
    const formGroup = input.closest('.form-group');
    const errorSpan = formGroup.querySelector('.form-error');

    if (value.length < 2) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        errorSpan.textContent = 'Le nom doit contenir au moins 2 caractères';
        return false;
    } else {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        errorSpan.textContent = '';
        return true;
    }
}

/**
 * Valide le champ email
 */
function validateEmail(input) {
    const value = input.value.trim();
    const formGroup = input.closest('.form-group');
    const errorSpan = formGroup.querySelector('.form-error');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        errorSpan.textContent = 'Veuillez entrer une adresse email valide';
        return false;
    } else {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        errorSpan.textContent = '';
        return true;
    }
}

/**
 * Valide le champ téléphone
 */
function validatePhone(input) {
    const value = input.value.trim();
    const formGroup = input.closest('.form-group');
    const errorSpan = formGroup.querySelector('.form-error');
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

    if (value === '') {
        formGroup.classList.remove('error', 'success');
        errorSpan.textContent = '';
        return true;
    }

    if (!phoneRegex.test(value)) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        errorSpan.textContent = 'Veuillez entrer un numéro de téléphone valide';
        return false;
    } else {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        errorSpan.textContent = '';
        return true;
    }
}

/**
 * Valide le champ message
 */
function validateMessage(input) {
    const value = input.value.trim();
    const formGroup = input.closest('.form-group');
    const errorSpan = formGroup.querySelector('.form-error');

    if (value.length < 10) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        errorSpan.textContent = 'Le message doit contenir au moins 10 caractères';
        return false;
    } else {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        errorSpan.textContent = '';
        return true;
    }
}

export { initFormValidation, validateName, validateEmail, validatePhone, validateMessage };
