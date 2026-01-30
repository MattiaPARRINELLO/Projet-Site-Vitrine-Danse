/* ============================================
   SCRIPT DE CONFIGURATION ADMIN
   Génère le hash du mot de passe admin
   ============================================ */

const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function setupAdmin() {
    console.log('🎭 Configuration de l\'administrateur Arabesque\n');

    rl.question('Entrez le mot de passe admin: ', async (password) => {
        if (!password || password.length < 6) {
            console.log('❌ Le mot de passe doit contenir au moins 6 caractères');
            rl.close();
            return;
        }

        try {
            const passwordHash = await bcrypt.hash(password, 10);

            const adminData = {
                passwordHash: passwordHash,
                createdAt: new Date().toISOString()
            };

            const filePath = path.join(__dirname, '..', 'data', 'admin.json');
            await fs.writeFile(filePath, JSON.stringify(adminData, null, 2));

            console.log('\n✅ Mot de passe admin configuré avec succès!');
            console.log('📝 Fichier: data/admin.json');
            console.log('\nVous pouvez maintenant vous connecter à /admin avec ce mot de passe.');

        } catch (error) {
            console.error('❌ Erreur:', error);
        }

        rl.close();
    });
}

setupAdmin();
