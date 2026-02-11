/* ============================================
   ACTUALITÉS
   ============================================ */

import { getMonthShort, estimateReadTime, isRecent } from '../utils.js';
import { showToast } from './toast.js';

// Stockage des IDs d'actualités déjà vues
const SEEN_NEWS_KEY = 'arabesque_seen_news';

/**
 * Récupère les IDs des actualités déjà vues
 */
function getSeenNewsIds() {
    try {
        const stored = localStorage.getItem(SEEN_NEWS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Sauvegarde les IDs des actualités vues
 */
function saveSeenNewsIds(ids) {
    localStorage.setItem(SEEN_NEWS_KEY, JSON.stringify(ids));
}

/**
 * Affiche les actualités
 */
function renderNews(news) {
    const newsGrid = document.getElementById('newsGrid');
    const newsSection = document.getElementById('news');
    if (!newsGrid) return;

    // Cacher la section et le lien nav si pas d'actualités
    const navNews = document.getElementById('nav-news');
    if (!news || !news.length) {
        if (newsSection) newsSection.style.display = 'none';
        if (navNews) navNews.style.display = 'none';
        return;
    }

    // Afficher la section et le lien nav si elle contient des actualités
    if (newsSection) newsSection.style.display = '';
    if (navNews) navNews.style.display = '';

    // Vérifier les nouvelles actualités non vues
    checkNewNews(news);

    newsGrid.innerHTML = news.map(item => {
        const image = item.image && item.image.trim()
            ? item.image
            : 'https://images.unsplash.com/photo-1515165562835-c4c89f819bcd?auto=format&fit=crop&w=1200&q=80';
        const text = item.text || '';

        return `
            <article class="news-card" data-news-id="${item.id || item.title}">
                <div class="news-image">
                    <img src="${image}" alt="${item.title || 'Actualité'}" />
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="category">Actualité</span>
                        <span class="read-time">${estimateReadTime(text)}</span>
                    </div>
                    <h3 class="news-title">${item.title || ''}</h3>
                    <p class="news-excerpt">${text}</p>
                </div>
            </article>
        `;
    }).join('');

    // Ajouter les badges "Nouveau"
    addNewBadgesToNews(news);
}

/**
 * Vérifie et notifie les nouvelles actualités
 */
function checkNewNews(news) {
    const seenIds = getSeenNewsIds();
    const currentIds = news.map(item => item.id || item.title);

    // Trouver les nouvelles actualités non vues
    const newItems = news.filter(item => {
        const itemId = item.id || item.title;
        return !seenIds.includes(itemId) && isRecent(item.date);
    });

    // Notifier pour chaque nouvelle actualité
    if (newItems.length > 0) {
        // Notification groupée
        if (newItems.length === 1) {
            showToast(
                '🆕 Nouvelle actualité !',
                newItems[0].title || 'Une nouvelle actualité est disponible',
                'info',
                6000
            );
        } else {
            showToast(
                '🆕 Nouvelles actualités !',
                `${newItems.length} nouvelles actualités sont disponibles`,
                'info',
                6000
            );
        }

        // Demander la permission pour les notifications push
        requestNotificationPermission().then(permission => {
            if (permission === 'granted') {
                newItems.forEach(item => {
                    showPushNotification(item);
                });
            }
        });
    }

    // Sauvegarder tous les IDs actuels comme vus
    saveSeenNewsIds(currentIds);
}

/**
 * Demande la permission pour les notifications push
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Ce navigateur ne supporte pas les notifications');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return Notification.permission;
}

/**
 * Affiche une notification push
 */
function showPushNotification(newsItem) {
    if (Notification.permission !== 'granted') return;

    const notification = new Notification('🎭 Arabesque - Nouvelle actualité', {
        body: newsItem.title || 'Une nouvelle actualité est disponible',
        icon: '/assets/images/logo.svg',
        badge: '/assets/images/logo.svg',
        tag: `news-${newsItem.id || newsItem.title}`,
        requireInteraction: false
    });

    notification.onclick = () => {
        window.focus();
        const newsSection = document.getElementById('news');
        if (newsSection) {
            newsSection.scrollIntoView({ behavior: 'smooth' });
        }
        notification.close();
    };

    // Fermer automatiquement après 8 secondes
    setTimeout(() => notification.close(), 8000);
}

/**
 * Ajoute les badges "Nouveau" aux actualités récentes
 */
function addNewBadgesToNews(news) {
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach((card, index) => {
        if (news[index] && news[index].date && isRecent(news[index].date)) {
            const badge = document.createElement('div');
            badge.className = 'news-badge';
            badge.innerHTML = '<i class="fas fa-star"></i> Nouveau';
            card.appendChild(badge);
        }
    });
}

/**
 * Vérifie périodiquement les nouvelles actualités
 */
function checkForNewContent() {
    // Vérifier toutes les 60 secondes
    setInterval(async () => {
        try {
            const response = await fetch('/api/news');
            const data = await response.json();
            const news = data?.news || [];

            const seenIds = getSeenNewsIds();
            const newItems = news.filter(item => {
                const itemId = item.id || item.title;
                return !seenIds.includes(itemId) && isRecent(item.date);
            });

            if (newItems.length > 0) {
                // Notification toast
                showToast(
                    '🆕 Nouvelle actualité !',
                    newItems[0].title || 'Une nouvelle actualité est disponible',
                    'info',
                    6000
                );

                // Notification push
                if (Notification.permission === 'granted') {
                    newItems.forEach(item => showPushNotification(item));
                }

                // Mettre à jour les IDs vus
                const currentIds = news.map(item => item.id || item.title);
                saveSeenNewsIds(currentIds);

                // Recharger les actualités
                renderNews(news);
            }
        } catch (error) {
            console.error('Erreur vérification actualités:', error);
        }
    }, 60000);
}

// Exposer globalement
window.renderNews = renderNews;

export { renderNews, checkForNewContent, requestNotificationPermission };
