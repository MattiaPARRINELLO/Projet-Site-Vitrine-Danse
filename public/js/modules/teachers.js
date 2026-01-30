/* ============================================
   PROFESSEURS
   ============================================ */

/**
 * Affiche les professeurs
 */
function displayTeachers(teachers) {
    const teachersGrid = document.querySelector('.teachers-grid');
    if (!teachersGrid) return;

    teachersGrid.innerHTML = '';

    teachers.forEach(teacher => {
        const teacherCard = createTeacherCard(teacher);
        teachersGrid.appendChild(teacherCard);
    });
}

/**
 * Crée une carte de professeur
 */
function createTeacherCard(teacher) {
    const card = document.createElement('div');
    card.className = 'teacher-card';

    card.innerHTML = `
        <div class="teacher-image">
            <img src="${teacher.photo}" alt="${teacher.name}" />
            <div class="teacher-overlay">
                <div class="teacher-social">
                    <a href="mailto:contact@arabesque-danse.fr" class="social-link" aria-label="Email">
                        <i class="fas fa-envelope"></i>
                    </a>
                    <a href="tel:0123456789" class="social-link" aria-label="Téléphone">
                        <i class="fas fa-phone"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="teacher-info">
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-specialty">${teacher.discipline}</p>
            <p class="teacher-bio">${teacher.description}</p>
            ${teacher.experience ? `<div class="teacher-experience"><i class="fas fa-award"></i> ${teacher.experience} d'expérience</div>` : ''}
        </div>
    `;

    return card;
}

export { displayTeachers, createTeacherCard };
