/* ============================================
   FONCTIONS UTILITAIRES
   ============================================ */

/**
 * Formate un prix en euros
 */
function formatPrice(price) {
    return `${price}€`;
}

/**
 * Retourne le nom court du mois
 */
function getMonthShort(index) {
    const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
    return months[index] || '';
}

/**
 * Estime le temps de lecture d'un texte
 */
function estimateReadTime(text) {
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min`;
}

/**
 * Retourne la couleur associée à un niveau
 */
function getLevelColor(level) {
    const levelColors = {
        'Débutant': '#FF6B6B',
        'Initiation': '#FF8C8C',
        'Intermédiaire': '#E63946',
        'Avancé': '#C1121F',
        'Tous niveaux': '#FFA07A'
    };
    return levelColors[level] || '#E63946';
}

/**
 * Extrait les heures d'une chaîne de type "18h00 - 19h30"
 */
function extractHours(timeString) {
    if (!timeString || typeof timeString !== 'string') {
        return { start: 9, end: 10 };
    }

    const match = timeString.match(/(\d{1,2})[h:](\d{2})\s*-\s*(\d{1,2})[h:](\d{2})/);
    if (!match) return { start: 9, end: 10 };

    const startHour = parseInt(match[1]);
    const startMin = parseInt(match[2]);
    const endHour = parseInt(match[3]);
    const endMin = parseInt(match[4]);

    return {
        start: startHour + startMin / 60,
        end: endHour + endMin / 60
    };
}

/**
 * Parse une durée en minutes
 */
function parseDuration(durationString) {
    if (!durationString || typeof durationString !== 'string') {
        return 60;
    }

    const hourMatch = durationString.match(/(\d+)h/);
    const minMatch = durationString.match(/(\d+)\s*min/);

    let totalMinutes = 0;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minMatch) totalMinutes += parseInt(minMatch[1]);

    return totalMinutes || 60;
}

/**
 * Vérifie si une date est récente (moins de 7 jours)
 */
function isRecent(dateString) {
    if (!dateString) return false;

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 7;
}

/**
 * Log de débogage stylé
 */
function debug(message, data = null) {
    console.log(`🎭 [Arabesque] ${message}`, data || '');
}

/**
 * Récupère le nom du professeur par son ID
 * @param {number|null} teacherId - L'ID du professeur
 * @param {Array} teachers - Liste des professeurs (utilise AppState par défaut)
 * @returns {string} Le nom du professeur ou "Professeur" par défaut
 */
function getTeacherNameById(teacherId, teachers = null) {
    if (!teacherId) return 'Professeur';

    const teacherList = teachers || (typeof AppState !== 'undefined' ? AppState.allTeachers : window.allTeachers) || [];
    const teacher = teacherList.find(t => t.id === teacherId);

    return teacher ? teacher.name : 'Professeur';
}

/**
 * Récupère l'objet professeur complet par son ID
 * @param {number|null} teacherId - L'ID du professeur
 * @param {Array} teachers - Liste des professeurs (utilise AppState par défaut)
 * @returns {Object|null} L'objet professeur ou null
 */
function getTeacherById(teacherId, teachers = null) {
    if (!teacherId) return null;

    const teacherList = teachers || (typeof AppState !== 'undefined' ? AppState.allTeachers : window.allTeachers) || [];
    return teacherList.find(t => t.id === teacherId) || null;
}

export {
    formatPrice,
    getMonthShort,
    estimateReadTime,
    getLevelColor,
    extractHours,
    parseDuration,
    isRecent,
    debug,
    getTeacherNameById,
    getTeacherById
};
