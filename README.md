# 🎭 Arabesque - Site Vitrine Association de Danse

Site web moderne et dynamique pour l'association de danse Arabesque, avec backend Node.js/Express et interface d'administration complète.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Fonctionnalités

- 🎨 **Design moderne** - Thème dark élégant avec animations fluides
- 📱 **Responsive** - Adapté mobile, tablette et desktop
- 📅 **Planning interactif** - Vue grille et calendrier avec sélection de cours
- 👩‍🏫 **Professeurs** - Fiches professeurs dynamiques
- 📰 **Actualités** - Système de news avec badges "Nouveau"
- 🖼️ **Galerie** - Lightbox pour photos et vidéos
- 💬 **Témoignages** - Avis des élèves
- ❓ **FAQ** - Questions fréquentes en accordéon
- 📧 **Contact** - Formulaire avec validation en temps réel
- 🔐 **Administration** - Interface admin sécurisée

## 📁 Structure du Projet

```
arabesque/
├── server.js                 # Serveur Express
├── package.json              # Dépendances
├── admin/                    # Interface administration
│   ├── index.html
│   ├── admin-styles.css
│   └── admin-script.js
├── public/                   # Site public
│   ├── index.html
│   ├── css/                  # Styles modulaires
│   │   ├── styles.css        # Point d'entrée (imports)
│   │   ├── base/             # Variables, reset
│   │   ├── layout/           # Header, footer, container
│   │   ├── components/       # Boutons, formulaires, modals
│   │   ├── sections/         # Hero, about, schedule...
│   │   └── utilities/        # Animations, responsive
│   ├── js/                   # Scripts modulaires (ES6)
│   │   ├── app.js            # Point d'entrée
│   │   ├── state.js          # État global
│   │   ├── api.js            # Appels API
│   │   ├── utils.js          # Utilitaires
│   │   └── modules/          # Modules fonctionnels
│   └── assets/
│       ├── images/
│       └── videos/
├── data/                     # Données JSON
│   ├── schedule.json         # Planning des cours
│   ├── teachers.json         # Professeurs
│   ├── news.json             # Actualités
│   ├── pricing.json          # Tarifs
│   ├── sections-order.json   # Ordre sections
│   └── admin.example.json    # Template config admin
└── scripts/
    └── setup-admin.js        # Configuration admin
```

## 🚀 Installation

### Prérequis

- Node.js 18+ ([télécharger](https://nodejs.org/))
- npm (inclus avec Node.js)

### Étapes

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Music-Music/arabesque.git
   cd arabesque
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l'admin**
   ```bash
   npm run setup-admin
   ```
   Entrez un mot de passe sécurisé (min. 6 caractères).

4. **Ajouter les médias** (optionnel)
   - Placez vos images dans `public/assets/images/`
   - Placez vos vidéos dans `public/assets/videos/`

## ▶️ Lancement

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

🌐 **Site** : http://localhost:3000  
🔐 **Admin** : http://localhost:3000/admin

## 🔐 Interface Admin

L'interface d'administration permet de gérer :

| Section | Actions |
|---------|---------|
| 📰 Actualités | Ajouter, modifier, supprimer |
| 📅 Cours | Gérer le planning complet |
| 👩‍🏫 Professeurs | Fiches et photos |
| 💰 Tarifs | Grille tarifaire |

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3 (variables, grid, flexbox), JavaScript ES6+
- **Backend** : Node.js, Express.js
- **Données** : JSON (fichiers locaux)
- **Architecture** : Modules ES6, composants réutilisables

## 📦 Scripts npm

| Commande | Description |
|----------|-------------|
| `npm start` | Lance le serveur en production |
| `npm run dev` | Lance avec nodemon (auto-reload) |
| `npm run setup-admin` | Configure le mot de passe admin |

## 🎨 Personnalisation

### Couleurs

Modifiez les variables dans `public/css/base/variables.css` :

```css
:root {
    --primary-color: #e63946;    /* Rouge principal */
    --secondary-color: #457b9d;  /* Bleu secondaire */
    --accent-color: #f4a261;     /* Orange accent */
    --dark-color: #0a0e27;       /* Fond sombre */
}
```

### Contenu

Éditez les fichiers JSON dans `/data/` ou utilisez l'interface admin.

## 📄 License

MIT © [Mattia PARRINELLO](https://github.com/Music-Music)

---

<p align="center">
  Codé avec ❤️ par <a href="https://github.com/Music-Music">Mattia PARRINELLO</a>
</p>
