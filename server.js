/* ============================================
   ARABESQUE - SERVEUR BACKEND
   Node.js + Express
   ============================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session pour l'authentification admin
app.use(session({
    secret: 'arabesque-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Mettre à true en production avec HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// ============================================
// CONFIGURATION UPLOAD
// ============================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isImage = file.mimetype.startsWith('image/');
        const dest = isImage ? 'assets/images' : 'assets/videos';
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non autorisé'));
        }
    }
});

// ============================================
// MIDDLEWARE D'AUTHENTIFICATION
// ============================================
function requireAuth(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ error: 'Non autorisé' });
    }
}

// ============================================
// UTILITAIRES
// ============================================
async function readJSON(filename) {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erreur lecture ${filename}:`, error);
        return null;
    }
}

async function writeJSON(filename, data) {
    try {
        await fs.writeFile(
            path.join(__dirname, 'data', filename),
            JSON.stringify(data, null, 2),
            'utf8'
        );
        return true;
    } catch (error) {
        console.error(`Erreur écriture ${filename}:`, error);
        return false;
    }
}

// ============================================
// ROUTES PUBLIQUES - API
// ============================================

// Planning / Cours
app.get('/api/schedule', async (req, res) => {
    const data = await readJSON('schedule.json');
    res.json(data || { categories: [], courses: [] });
});

// Tarifs
app.get('/api/pricing', async (req, res) => {
    const data = await readJSON('pricing.json');
    res.json(data || {});
});

// Professeurs
app.get('/api/teachers', async (req, res) => {
    const data = await readJSON('teachers.json');
    res.json(data || { teachers: [] });
});

// Actualités / News
app.get('/api/news', async (req, res) => {
    const data = await readJSON('news.json');
    res.json(data || { news: [] });
});

// Ordre des sections
app.get('/api/sections-order', async (req, res) => {
    const data = await readJSON('sections-order.json');
    res.json(data || { sections: [] });
});

// Médias (liste)
app.get('/api/media', async (req, res) => {
    try {
        const images = await fs.readdir(path.join(__dirname, 'assets/images'));
        const videos = await fs.readdir(path.join(__dirname, 'assets/videos'));

        res.json({
            images: images.filter(f => !f.startsWith('.')),
            videos: videos.filter(f => !f.startsWith('.'))
        });
    } catch (error) {
        res.json({ images: [], videos: [] });
    }
});

// ============================================
// ROUTES ADMIN - AUTHENTIFICATION
// ============================================

// Login
app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;

    try {
        const adminData = await readJSON('admin.json');
        const isValid = await bcrypt.compare(password, adminData.passwordHash);

        if (isValid) {
            req.session.isAdmin = true;
            res.json({ success: true, message: 'Connexion réussie' });
        } else {
            res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        }
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Vérifier la session
app.get('/api/admin/check', (req, res) => {
    res.json({ isAuthenticated: req.session && req.session.isAdmin });
});

// ============================================
// ROUTES ADMIN - ACTUALITÉS
// ============================================

// Créer une actualité
app.post('/api/admin/news', requireAuth, async (req, res) => {
    const data = await readJSON('news.json') || { news: [] };
    const newItem = {
        id: Date.now(),
        ...req.body,
        date: new Date().toISOString()
    };
    data.news.unshift(newItem);

    const success = await writeJSON('news.json', data);
    res.json({ success, data: newItem });
});

// Modifier une actualité
app.put('/api/admin/news/:id', requireAuth, async (req, res) => {
    const data = await readJSON('news.json');
    const index = data.news.findIndex(n => n.id == req.params.id);

    if (index !== -1) {
        data.news[index] = { ...data.news[index], ...req.body };
        const success = await writeJSON('news.json', data);
        res.json({ success, data: data.news[index] });
    } else {
        res.status(404).json({ success: false, message: 'Actualité non trouvée' });
    }
});

// Supprimer une actualité
app.delete('/api/admin/news/:id', requireAuth, async (req, res) => {
    const data = await readJSON('news.json');
    data.news = data.news.filter(n => n.id != req.params.id);

    const success = await writeJSON('news.json', data);
    res.json({ success });
});

// ============================================
// ROUTES ADMIN - COURS
// ============================================

// Ajouter un cours
app.post('/api/admin/courses', requireAuth, async (req, res) => {
    const data = await readJSON('schedule.json');
    const newCourse = {
        id: Date.now(),
        ...req.body
    };
    data.courses.push(newCourse);

    const success = await writeJSON('schedule.json', data);
    res.json({ success, data: newCourse });
});

// Modifier un cours
app.put('/api/admin/courses/:id', requireAuth, async (req, res) => {
    const data = await readJSON('schedule.json');
    const index = data.courses.findIndex(c => c.id == req.params.id);

    if (index !== -1) {
        data.courses[index] = { ...data.courses[index], ...req.body };
        const success = await writeJSON('schedule.json', data);
        res.json({ success, data: data.courses[index] });
    } else {
        res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }
});

// Supprimer un cours
app.delete('/api/admin/courses/:id', requireAuth, async (req, res) => {
    const data = await readJSON('schedule.json');
    data.courses = data.courses.filter(c => c.id != req.params.id);

    const success = await writeJSON('schedule.json', data);
    res.json({ success });
});

// ============================================
// ROUTES ADMIN - TARIFS
// ============================================

// Mettre à jour les tarifs
app.put('/api/admin/pricing', requireAuth, async (req, res) => {
    const success = await writeJSON('pricing.json', req.body);
    res.json({ success, data: req.body });
});

// ============================================
// ROUTES ADMIN - PROFESSEURS
// ============================================

// Ajouter un professeur
app.post('/api/admin/teachers', requireAuth, async (req, res) => {
    const data = await readJSON('teachers.json') || { teachers: [] };
    const newTeacher = {
        id: Date.now(),
        ...req.body
    };
    data.teachers.push(newTeacher);

    const success = await writeJSON('teachers.json', data);
    res.json({ success, data: newTeacher });
});

// Modifier un professeur
app.put('/api/admin/teachers/:id', requireAuth, async (req, res) => {
    const data = await readJSON('teachers.json');
    const index = data.teachers.findIndex(t => t.id == req.params.id);

    if (index !== -1) {
        data.teachers[index] = { ...data.teachers[index], ...req.body };
        const success = await writeJSON('teachers.json', data);
        res.json({ success, data: data.teachers[index] });
    } else {
        res.status(404).json({ success: false, message: 'Professeur non trouvé' });
    }
});

// Supprimer un professeur
app.delete('/api/admin/teachers/:id', requireAuth, async (req, res) => {
    const data = await readJSON('teachers.json');
    data.teachers = data.teachers.filter(t => t.id != req.params.id);

    const success = await writeJSON('teachers.json', data);
    res.json({ success });
});

// ============================================
// ROUTES ADMIN - ORDRE DES SECTIONS
// ============================================

// Mettre à jour l'ordre des sections
app.put('/api/admin/sections-order', requireAuth, async (req, res) => {
    const success = await writeJSON('sections-order.json', req.body);
    res.json({ success, data: req.body });
});

// ============================================
// ROUTES ADMIN - UPLOAD MÉDIAS
// ============================================

// Upload fichier
app.post('/api/admin/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Aucun fichier' });
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    res.json({
        success: true,
        file: {
            name: req.file.filename,
            path: `/${filePath}`,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
        }
    });
});

// Supprimer un média
app.delete('/api/admin/media/:type/:filename', requireAuth, async (req, res) => {
    try {
        const { type, filename } = req.params;
        const folder = type === 'image' ? 'images' : 'videos';
        const filePath = path.join(__dirname, 'assets', folder, filename);

        await fs.unlink(filePath);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur suppression' });
    }
});

// ============================================
// ROUTES PAGES
// ============================================

// Page admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Page principale (public)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

// Codes couleurs ANSI
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    bgCyan: '\x1b[46m',
    bgGreen: '\x1b[42m'
};

function printBanner() {
    const banner = `
${colors.cyan}${colors.bright}
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║          🎭  ARABESQUE DANCE STUDIO  🎭                  ║
    ║                                                          ║
    ║              Backend initialized successfully           ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
${colors.reset}`;

    console.log(banner);
}

function printServerInfo() {
    const info = [
        { label: '🌐 Site Public', value: `http://localhost:${PORT}`, color: colors.green },
        { label: '🔐 Admin Panel', value: `http://localhost:${PORT}/admin`, color: colors.yellow },
        { label: '⚙️  API Base', value: `http://localhost:${PORT}/api`, color: colors.cyan },
        { label: '📦 Environment', value: process.env.NODE_ENV || 'development', color: colors.magenta }
    ];

    console.log(`${colors.bright}${colors.white}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    info.forEach(item => {
        console.log(`  ${colors.bright}${item.color}${item.label}${colors.reset}`);
        console.log(`  ${colors.dim}→ ${item.value}${colors.reset}\n`);
    });

    console.log(`${colors.bright}${colors.white}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

function printFooter() {
    console.log(`${colors.green}${colors.bright}✓ Server is running and ready to accept requests${colors.reset}`);
    console.log(`${colors.dim}Press ${colors.reset}${colors.bright}CTRL+C${colors.reset}${colors.dim} to stop the server${colors.reset}\n`);
}

app.listen(PORT, () => {
    printBanner();
    printServerInfo();
    printFooter();
});

