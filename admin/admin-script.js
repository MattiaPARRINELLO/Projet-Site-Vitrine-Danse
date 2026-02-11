/* ============================================
   ARABESQUE - ADMIN PANEL SCRIPT (REFONTE)
   ============================================ */

const state = {
    news: [],
    courses: [],
    teachers: [],
    pricing: {},
    sections: [],
    media: { images: [], videos: [] }
};

const ui = {
    loginPage: document.getElementById('loginPage'),
    adminDashboard: document.getElementById('adminDashboard'),
    loginForm: document.getElementById('loginForm'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),
    toast: document.getElementById('toast'),
    navItems: document.querySelectorAll('.nav-item'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    newsList: document.getElementById('newsList'),
    coursesList: document.getElementById('coursesList'),
    teachersList: document.getElementById('teachersList'),
    sectionsList: document.getElementById('sectionsList'),
    imagesList: document.getElementById('imagesList'),
    videosList: document.getElementById('videosList'),
    addNewsBtn: document.getElementById('addNewsBtn'),
    addCourseBtn: document.getElementById('addCourseBtn'),
    addTeacherBtn: document.getElementById('addTeacherBtn'),
    uploadMediaBtn: document.getElementById('uploadMediaBtn'),
    mediaUpload: document.getElementById('mediaUpload'),
    savePricingBtn: document.getElementById('savePricingBtn'),
    addPricingOptionBtn: document.getElementById('addPricingOptionBtn'),
    saveSectionsBtn: document.getElementById('saveSectionsBtn'),
    courseTeacher: document.getElementById('courseTeacher'),
    courseStartTime: document.getElementById('courseStartTime'),
    courseEndTime: document.getElementById('courseEndTime'),
    courseDuration: document.getElementById('courseDuration'),
    newsImageFile: document.getElementById('newsImageFile')
};

const modals = {
    news: document.getElementById('newsModal'),
    course: document.getElementById('courseModal'),
    teacher: document.getElementById('teacherModal')
};

const forms = {
    news: document.getElementById('newsForm'),
    course: document.getElementById('courseForm'),
    teacher: document.getElementById('teacherForm')
};

function showToast(message, type = 'success') {
    if (!ui.toast) return;
    ui.toast.textContent = message;
    ui.toast.style.borderColor = type === 'error' ? 'rgba(230,57,70,0.6)' : 'rgba(42,157,143,0.6)';
    ui.toast.classList.add('show');
    clearTimeout(ui.toast._timer);
    ui.toast._timer = setTimeout(() => ui.toast.classList.remove('show'), 3000);
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });

    if (response.status === 401) {
        showToast('Session expirée. Merci de vous reconnecter.', 'error');
        ui.loginPage.style.display = 'flex';
        ui.adminDashboard.style.display = 'none';
        return null;
    }

    if (!response.ok) {
        throw new Error('Erreur serveur');
    }

    return response.json();
}

function activateTab(tabName) {
    ui.navItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
    ui.tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === `tab-${tabName}`));
}

function initTabs() {
    ui.navItems.forEach(item => {
        item.addEventListener('click', () => activateTab(item.dataset.tab));
    });
}

function openModal(modal) {
    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal?.classList.remove('active');
    document.body.style.overflow = '';
}

function initModalHandlers() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    Object.values(modals).forEach(modal => {
        modal?.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });
}

function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleDateString('fr-FR');
}

function formatTimeDisplay(value) {
    if (!value) return '';
    const [hours, minutes] = value.split(':');
    if (!hours || !minutes) return value;
    return `${hours}h${minutes}`;
}

function parseTimeDisplay(value) {
    if (!value) return '';
    const normalized = value.replace('h', ':').replace('H', ':');
    const match = normalized.match(/(\d{1,2}):(\d{2})/);
    if (!match) return '';
    const hours = match[1].padStart(2, '0');
    const minutes = match[2];
    return `${hours}:${minutes}`;
}

function extractTimeRange(value) {
    if (!value) return { start: '', end: '' };
    const [start, end] = value.split('-').map(part => part.trim());
    return {
        start: parseTimeDisplay(start),
        end: parseTimeDisplay(end)
    };
}

function computeDuration(start, end) {
    if (!start || !end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return '';
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) return '';
    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    if (hours && minutes) return `${hours}h${String(minutes).padStart(2, '0')}`;
    if (hours) return `${hours}h`;
    return `${minutes}min`;
}

function updateCourseDuration() {
    if (!ui.courseStartTime || !ui.courseEndTime || !ui.courseDuration) return;
    const duration = computeDuration(ui.courseStartTime.value, ui.courseEndTime.value);
    ui.courseDuration.value = duration;
}

function buildTimeRange(start, end) {
    if (!start || !end) return '';
    return `${formatTimeDisplay(start)} - ${formatTimeDisplay(end)}`;
}

function renderEmpty(container, message) {
    if (!container) return;
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

// ============================================
// AUTH
// ============================================
ui.loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('password').value;

    try {
        const data = await apiRequest('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });

        if (data?.success) {
            ui.loginPage.style.display = 'none';
            ui.adminDashboard.style.display = 'grid';
            showToast('Connexion réussie');
            await loadAllData();
        } else {
            ui.loginError.textContent = data?.message || 'Mot de passe incorrect';
        }
    } catch (error) {
        ui.loginError.textContent = 'Erreur de connexion';
    }
});

async function checkAdminSession() {
    try {
        const data = await apiRequest('/api/admin/check');
        if (data?.isAuthenticated) {
            ui.loginPage.style.display = 'none';
            ui.adminDashboard.style.display = 'grid';
            await loadAllData();
        }
    } catch (error) {
        console.error('Erreur vérification session:', error);
    }
}

ui.logoutBtn?.addEventListener('click', async () => {
    try {
        await apiRequest('/api/admin/logout', { method: 'POST' });
        location.reload();
    } catch (error) {
        showToast('Erreur lors de la déconnexion', 'error');
    }
});

// ============================================
// LOADERS
// ============================================
async function loadAllData() {
    await Promise.all([
        loadNews(),
        loadCourses(),
        loadTeachers(),
        loadPricing(),
        loadSections(),
        loadMedia()
    ]);
}

async function loadNews() {
    try {
        const data = await apiRequest('/api/news');
        state.news = data?.news || [];
        renderNews();
    } catch (error) {
        console.error('Erreur chargement actualités:', error);
    }
}

async function loadCourses() {
    try {
        const data = await apiRequest('/api/schedule');
        state.courses = data?.courses || [];
        renderCourses();
    } catch (error) {
        console.error('Erreur chargement cours:', error);
    }
}

async function loadTeachers() {
    try {
        const data = await apiRequest('/api/teachers');
        state.teachers = data?.teachers || [];
        renderTeachers();
    } catch (error) {
        console.error('Erreur chargement professeurs:', error);
    }
}

async function loadPricing() {
    try {
        const data = await apiRequest('/api/pricing');
        state.pricing = data || {};
        renderPricing();
    } catch (error) {
        console.error('Erreur chargement tarifs:', error);
    }
}

async function loadSections() {
    try {
        const data = await apiRequest('/api/sections-order');
        state.sections = data?.sections || [];
        renderSections();
    } catch (error) {
        console.error('Erreur chargement sections:', error);
    }
}

async function loadMedia() {
    try {
        const data = await apiRequest('/api/media');
        state.media = data || { images: [], videos: [] };
        renderMedia();
    } catch (error) {
        console.error('Erreur chargement médias:', error);
    }
}

// ============================================
// RENDERERS
// ============================================
function renderNews() {
    if (!state.news.length) {
        return renderEmpty(ui.newsList, 'Aucune actualité pour le moment.');
    }

    ui.newsList.innerHTML = state.news.map(item => `
        <article class="card">
            <div class="card-header">
                <div class="card-title">${item.title}</div>
                <span class="badge">${formatDate(item.date)}</span>
            </div>
            <p class="card-text">${item.text || ''}</p>
            <div class="card-actions">
                <button class="btn btn-secondary" data-action="edit-news" data-id="${item.id}">Modifier</button>
                <button class="btn btn-danger" data-action="delete-news" data-id="${item.id}">Supprimer</button>
            </div>
        </article>
    `).join('');
}

function renderCourses() {
    if (!state.courses.length) {
        return renderEmpty(ui.coursesList, 'Aucun cours pour le moment.');
    }

    ui.coursesList.innerHTML = state.courses.map(course => `
        <article class="card">
            <div class="card-header">
                <div class="card-title">${course.type || course.danceType || 'Cours'}</div>
                <span class="badge">${course.level || 'Niveau'}</span>
            </div>
            <p class="card-text">${course.days?.join(', ') || ''} · ${course.time || ''}</p>
            <p class="card-text">${course.teacher || ''} · ${course.room || ''}</p>
            <div class="card-actions">
                <button class="btn btn-secondary" data-action="edit-course" data-id="${course.id}">Modifier</button>
                <button class="btn btn-danger" data-action="delete-course" data-id="${course.id}">Supprimer</button>
            </div>
        </article>
    `).join('');
}

function renderTeachers() {
    if (!state.teachers.length) {
        renderEmpty(ui.teachersList, 'Aucun professeur pour le moment.');
        renderTeacherOptions();
        return;
    }

    ui.teachersList.innerHTML = state.teachers.map(teacher => `
        <article class="card">
            <div class="card-header">
                <div class="card-title">${teacher.name}</div>
                <span class="badge">${teacher.discipline || 'Discipline'}</span>
            </div>
            <p class="card-text">${teacher.description || ''}</p>
            <div class="card-actions">
                <button class="btn btn-secondary" data-action="edit-teacher" data-id="${teacher.id}">Modifier</button>
                <button class="btn btn-danger" data-action="delete-teacher" data-id="${teacher.id}">Supprimer</button>
            </div>
        </article>
    `).join('');

    renderTeacherOptions();
}

function renderTeacherOptions() {
    if (!ui.courseTeacher) return;
    const options = state.teachers.map(teacher => `
        <option value="${teacher.name}">${teacher.name}</option>
    `).join('');
    ui.courseTeacher.innerHTML = `<option value="">Sélectionner</option>${options}`;
}

function renderPricing() {
    document.getElementById('pricingEngagement').value = state.pricing.engagement || '';
    document.getElementById('pricingPayment').value = state.pricing.payment || '';

    const coursePrices = state.pricing.coursePrices || {};
    document.getElementById('priceCourse1').value = coursePrices['1'] || '';
    document.getElementById('priceCourse2').value = coursePrices['2'] || '';
    document.getElementById('priceCourse3').value = coursePrices['3'] || '';
    document.getElementById('priceCourse4').value = coursePrices['4'] || '';
    document.getElementById('priceCourse5').value = coursePrices['5'] || '';

    const notes = Array.isArray(state.pricing.notes) ? state.pricing.notes : [];
    document.getElementById('pricingNotes').value = notes.join('\n');

    renderPricingOptions(state.pricing.additionalOptions || []);
}

function renderPricingOptions(options) {
    const container = document.getElementById('pricingOptionsList');
    if (!container) return;
    if (!options.length) {
        container.innerHTML = '<div class="empty-state">Aucune option. Ajoutez-en une.</div>';
        return;
    }

    container.innerHTML = options.map(option => `
        <div class="option-item" data-option-id="${option.id}">
            <div class="form-grid">
                <div class="form-group">
                    <label>Nom</label>
                    <input type="text" value="${option.name || ''}" data-field="name" />
                </div>
                <div class="form-group">
                    <label>Prix (€)</label>
                    <input type="number" min="0" value="${option.price || ''}" data-field="price" />
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea rows="3" data-field="description">${option.description || ''}</textarea>
            </div>
            <div class="card-actions">
                <button class="btn btn-ghost" data-action="remove-option" data-id="${option.id}">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function renderSections() {
    if (!state.sections.length) {
        return renderEmpty(ui.sectionsList, 'Aucune section disponible.');
    }

    ui.sectionsList.innerHTML = state.sections
        .sort((a, b) => a.order - b.order)
        .map(section => `
            <div class="sortable-item" draggable="true" data-id="${section.id}">
                <div>
                    <strong>${section.name}</strong>
                    <span class="muted">· ${section.id}</span>
                </div>
                <div class="card-actions">
                    <label class="muted">
                        <input type="checkbox" class="section-toggle" ${section.enabled ? 'checked' : ''} />
                        Visible
                    </label>
                    <span class="sortable-handle">☰</span>
                </div>
            </div>
        `).join('');

    initDragAndDrop();
}

function renderMedia() {
    ui.imagesList.innerHTML = state.media.images?.length
        ? state.media.images.map(name => mediaCard('image', name)).join('')
        : '<div class="empty-state">Aucune image.</div>';

    ui.videosList.innerHTML = state.media.videos?.length
        ? state.media.videos.map(name => mediaCard('video', name)).join('')
        : '<div class="empty-state">Aucune vidéo.</div>';
}

function mediaCard(type, filename) {
    const src = `/assets/${type === 'image' ? 'images' : 'videos'}/${filename}`;
    const preview = type === 'image'
        ? `<img src="${src}" alt="${filename}" />`
        : `<video src="${src}" muted></video>`;

    return `
        <div class="media-card">
            ${preview}
            <div class="media-actions">
                <span class="muted">${filename}</span>
                <button class="btn btn-danger" data-action="delete-media" data-type="${type}" data-name="${filename}">Supprimer</button>
            </div>
        </div>
    `;
}

// ============================================
// MODALS & FORMS
// ============================================
ui.addNewsBtn?.addEventListener('click', () => openNewsModal());
ui.addCourseBtn?.addEventListener('click', () => openCourseModal());
ui.addTeacherBtn?.addEventListener('click', () => openTeacherModal());

function openNewsModal(item = null) {
    document.getElementById('newsModalTitle').textContent = item ? 'Modifier actualité' : 'Nouvelle actualité';
    document.getElementById('newsId').value = item?.id || '';
    document.getElementById('newsTitle').value = item?.title || '';
    document.getElementById('newsText').value = item?.text || '';
    document.getElementById('newsImage').value = item?.image || '';
    document.getElementById('newsDate').value = item?.date ? new Date(item.date).toISOString().split('T')[0] : '';
    if (ui.newsImageFile) {
        ui.newsImageFile.value = '';
    }
    openModal(modals.news);
}

function openCourseModal(item = null) {
    document.getElementById('courseModalTitle').textContent = item ? 'Modifier cours' : 'Nouveau cours';
    document.getElementById('courseId').value = item?.id || '';
    document.getElementById('courseType').value = item?.type || '';
    document.getElementById('courseLevel').value = item?.level || '';
    document.getElementById('courseCategory').value = item?.category || '';
    document.getElementById('courseDays').value = item?.days?.join(', ') || '';
    const timeRange = extractTimeRange(item?.time || '');
    if (ui.courseStartTime) ui.courseStartTime.value = timeRange.start;
    if (ui.courseEndTime) ui.courseEndTime.value = timeRange.end;
    if (ui.courseDuration) ui.courseDuration.value = item?.duration || computeDuration(timeRange.start, timeRange.end);
    document.getElementById('courseRoom').value = item?.room || '';
    document.getElementById('courseTeacher').value = item?.teacher || '';
    document.getElementById('courseDescription').value = item?.description || '';
    openModal(modals.course);
}

function openTeacherModal(item = null) {
    document.getElementById('teacherModalTitle').textContent = item ? 'Modifier professeur' : 'Nouveau professeur';
    document.getElementById('teacherId').value = item?.id || '';
    document.getElementById('teacherName').value = item?.name || '';
    document.getElementById('teacherDescription').value = item?.description || '';
    document.getElementById('teacherPhoto').value = item?.photo || '';
    document.getElementById('teacherDiscipline').value = item?.discipline || '';
    document.getElementById('teacherExperience').value = item?.experience || '';
    const fileInput = document.getElementById('teacherPhotoFile');
    if (fileInput) fileInput.value = '';
    openModal(modals.teacher);
}

forms.news?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('newsId').value;
    let imagePath = document.getElementById('newsImage').value.trim();

    if (ui.newsImageFile?.files?.length) {
        try {
            imagePath = await uploadFile(ui.newsImageFile.files[0]);
        } catch (error) {
            showToast('Upload image impossible', 'error');
            return;
        }
    }

    const payload = {
        title: document.getElementById('newsTitle').value.trim(),
        text: document.getElementById('newsText').value.trim(),
        image: imagePath,
        date: document.getElementById('newsDate').value
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/news/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Actualité mise à jour');
        } else {
            await apiRequest('/api/admin/news', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('Actualité créée');
        }
        closeModal(modals.news);
        loadNews();
    } catch (error) {
        showToast('Impossible d’enregistrer l’actualité', 'error');
    }
});

forms.course?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('courseId').value;
    const startTime = ui.courseStartTime?.value || '';
    const endTime = ui.courseEndTime?.value || '';
    const payload = {
        type: document.getElementById('courseType').value.trim(),
        level: document.getElementById('courseLevel').value.trim(),
        category: document.getElementById('courseCategory').value.trim(),
        days: document.getElementById('courseDays').value.split(',').map(day => day.trim()).filter(Boolean),
        time: buildTimeRange(startTime, endTime),
        duration: computeDuration(startTime, endTime),
        room: document.getElementById('courseRoom').value.trim(),
        teacher: document.getElementById('courseTeacher').value.trim(),
        description: document.getElementById('courseDescription').value.trim()
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/courses/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Cours mis à jour');
        } else {
            await apiRequest('/api/admin/courses', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('Cours créé');
        }
        closeModal(modals.course);
        loadCourses();
    } catch (error) {
        showToast('Impossible d’enregistrer le cours', 'error');
    }
});

forms.teacher?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('teacherId').value;
    let photoPath = document.getElementById('teacherPhoto').value.trim();

    const fileInput = document.getElementById('teacherPhotoFile');
    if (fileInput?.files?.length) {
        try {
            photoPath = await uploadFile(fileInput.files[0]);
        } catch (error) {
            showToast('Upload photo impossible', 'error');
            return;
        }
    }

    const payload = {
        name: document.getElementById('teacherName').value.trim(),
        description: document.getElementById('teacherDescription').value.trim(),
        photo: photoPath,
        discipline: document.getElementById('teacherDiscipline').value.trim(),
        experience: document.getElementById('teacherExperience').value.trim()
    };

    try {
        if (id) {
            await apiRequest(`/api/admin/teachers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Professeur mis à jour');
        } else {
            await apiRequest('/api/admin/teachers', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast('Professeur créé');
        }
        closeModal(modals.teacher);
        loadTeachers();
    } catch (error) {
        showToast('Impossible d’enregistrer le professeur', 'error');
    }
});

// ============================================
// ACTIONS LIST
// ============================================
document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    try {
        if (action === 'edit-news') {
            const item = state.news.find(n => String(n.id) === id);
            openNewsModal(item);
        }

        if (action === 'delete-news' && confirm('Supprimer cette actualité ?')) {
            await apiRequest(`/api/admin/news/${id}`, { method: 'DELETE' });
            showToast('Actualité supprimée');
            loadNews();
        }

        if (action === 'edit-course') {
            const item = state.courses.find(c => String(c.id) === id);
            openCourseModal(item);
        }

        if (action === 'delete-course' && confirm('Supprimer ce cours ?')) {
            await apiRequest(`/api/admin/courses/${id}`, { method: 'DELETE' });
            showToast('Cours supprimé');
            loadCourses();
        }

        if (action === 'edit-teacher') {
            const item = state.teachers.find(t => String(t.id) === id);
            openTeacherModal(item);
        }

        if (action === 'delete-teacher' && confirm('Supprimer ce professeur ?')) {
            await apiRequest(`/api/admin/teachers/${id}`, { method: 'DELETE' });
            showToast('Professeur supprimé');
            loadTeachers();
        }

        if (action === 'remove-option') {
            button.closest('.option-item')?.remove();
        }

        if (action === 'delete-media' && confirm('Supprimer ce média ?')) {
            await apiRequest(`/api/admin/media/${button.dataset.type}/${button.dataset.name}`, { method: 'DELETE' });
            showToast('Média supprimé');
            loadMedia();
        }
    } catch (error) {
        showToast('Action impossible', 'error');
    }
});

// ============================================
// PRICING
// ============================================
ui.addPricingOptionBtn?.addEventListener('click', () => {
    const container = document.getElementById('pricingOptionsList');
    const newOption = {
        id: `opt-${Date.now()}`,
        name: '',
        price: '',
        description: ''
    };

    state.pricing.additionalOptions = state.pricing.additionalOptions || [];
    state.pricing.additionalOptions.push(newOption);
    renderPricingOptions(state.pricing.additionalOptions);
});

ui.savePricingBtn?.addEventListener('click', async () => {
    const options = Array.from(document.querySelectorAll('.option-item')).map(item => {
        const getField = (field) => item.querySelector(`[data-field="${field}"]`)?.value || '';
        return {
            id: item.dataset.optionId,
            name: getField('name'),
            price: Number(getField('price')) || 0,
            description: getField('description')
        };
    });

    const payload = {
        engagement: document.getElementById('pricingEngagement').value.trim(),
        payment: document.getElementById('pricingPayment').value.trim(),
        coursePrices: {
            1: Number(document.getElementById('priceCourse1').value) || 0,
            2: Number(document.getElementById('priceCourse2').value) || 0,
            3: Number(document.getElementById('priceCourse3').value) || 0,
            4: Number(document.getElementById('priceCourse4').value) || 0,
            5: Number(document.getElementById('priceCourse5').value) || 0
        },
        additionalOptions: options,
        notes: document.getElementById('pricingNotes').value
            .split('\n')
            .map(note => note.trim())
            .filter(Boolean)
    };

    try {
        await apiRequest('/api/admin/pricing', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        showToast('Tarifs enregistrés');
    } catch (error) {
        showToast('Impossible d’enregistrer les tarifs', 'error');
    }
});

// ============================================
// SECTIONS
// ============================================
function initDragAndDrop() {
    const container = ui.sectionsList;
    if (!container) return;

    let draggedItem = null;

    container.querySelectorAll('.sortable-item').forEach(item => {
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            draggedItem = null;
            item.classList.remove('dragging');
        });
    });

    container.addEventListener('dragover', (event) => {
        event.preventDefault();
        const afterElement = getDragAfterElement(container, event.clientY);
        if (!draggedItem) return;
        if (afterElement == null) {
            container.appendChild(draggedItem);
        } else {
            container.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

ui.saveSectionsBtn?.addEventListener('click', async () => {
    const items = Array.from(ui.sectionsList.querySelectorAll('.sortable-item'));
    const payload = {
        sections: items.map((item, index) => {
            const toggle = item.querySelector('.section-toggle');
            const original = state.sections.find(section => section.id === item.dataset.id);
            return {
                ...original,
                enabled: toggle?.checked ?? true,
                order: index + 1
            };
        })
    };

    try {
        await apiRequest('/api/admin/sections-order', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        showToast('Ordre des sections enregistré');
    } catch (error) {
        showToast('Impossible d’enregistrer', 'error');
    }
});

// ============================================
// MEDIA
// ============================================
ui.uploadMediaBtn?.addEventListener('click', async () => {
    const file = ui.mediaUpload?.files?.[0];
    if (!file) {
        showToast('Sélectionnez un fichier', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        showToast('Fichier uploadé');
        ui.mediaUpload.value = '';
        loadMedia();
    } catch (error) {
        showToast('Upload impossible', 'error');
    }
});

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const data = await response.json();
    if (!data?.file?.path) {
        throw new Error('Upload failed');
    }

    return data.file.path;
}

// ============================================
// INIT
// ============================================
initTabs();
initModalHandlers();
checkAdminSession();

ui.courseStartTime?.addEventListener('input', updateCourseDuration);
ui.courseEndTime?.addEventListener('input', updateCourseDuration);

console.log('🎭 Admin panel chargé');
