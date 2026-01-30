/* ============================================
   GALERIE ET LIGHTBOX
   ============================================ */

import { AppState } from '../state.js';

/**
 * Initialise la galerie
 */
function initGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const gallerySection = document.getElementById('gallery');
    if (!galleryGrid) return;

    // Collecter tous les items
    const items = galleryGrid.querySelectorAll('.gallery-item');

    // Cacher la section et le lien nav si pas d'items dans la galerie
    const navGallery = document.getElementById('nav-gallery');
    if (!items || items.length === 0) {
        if (gallerySection) gallerySection.style.display = 'none';
        if (navGallery) navGallery.style.display = 'none';
        return;
    }
    // Afficher le lien nav si la galerie a du contenu
    if (navGallery) navGallery.style.display = '';

    items.forEach((item, index) => {
        AppState.galleryItems.push({
            element: item,
            type: item.dataset.type,
            index: index
        });

        item.addEventListener('click', () => openLightbox(index));
    });

    // Filtres de la galerie
    const filterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterGallery(btn.dataset.filter);
        });
    });
}

/**
 * Filtre la galerie
 */
function filterGallery(filter) {
    AppState.currentGalleryFilter = filter;

    AppState.galleryItems.forEach(item => {
        if (filter === 'all' || item.type === filter) {
            item.element.style.display = 'block';
            setTimeout(() => {
                item.element.style.opacity = '1';
                item.element.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.element.style.opacity = '0';
            item.element.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.element.style.display = 'none';
            }, 300);
        }
    });
}

/**
 * Ouvre la lightbox
 */
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');

    if (!lightbox || !lightboxContent) return;

    AppState.currentLightboxIndex = index;
    const item = AppState.galleryItems[index];

    const mediaElement = item.element.querySelector('img, video');

    if (mediaElement.tagName === 'IMG') {
        lightboxContent.innerHTML = `<img src="${mediaElement.src}" alt="Image">`;
    } else if (mediaElement.tagName === 'VIDEO') {
        const videoSrc = mediaElement.querySelector('source').src;
        lightboxContent.innerHTML = `
            <video controls autoplay style="max-width: 100%; max-height: 90vh;">
                <source src="${videoSrc}" type="video/mp4">
            </video>
        `;
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Ferme la lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';

    const video = lightbox.querySelector('video');
    if (video) video.pause();
}

/**
 * Navigue dans la lightbox
 */
function navigateLightbox(direction) {
    let newIndex = AppState.currentLightboxIndex + direction;

    if (newIndex < 0) newIndex = AppState.galleryItems.length - 1;
    if (newIndex >= AppState.galleryItems.length) newIndex = 0;

    openLightbox(newIndex);
}

// Fermer avec Echap
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

// Exposer globalement
window.closeLightbox = closeLightbox;
window.navigateLightbox = navigateLightbox;

export { initGallery, filterGallery, openLightbox, closeLightbox, navigateLightbox };
