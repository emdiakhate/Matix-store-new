#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Liste des fichiers à migrer
const filesToMigrate = [
  'app/dashboard/page.tsx',
  'app/dashboard/products/page.tsx',
  'app/dashboard/geolocation/page.tsx',
  'app/dashboard/reviews/page.tsx',
  'app/dashboard/received-offers/page.tsx',
  'app/dashboard/announcements/page.tsx',
  'app/dashboard/sent-propositions/page.tsx',
  'app/dashboard/opportunities/page.tsx',
  'app/dashboard/stats/page.tsx',
  'app/dashboard/profile/page.tsx',
  'app/dashboard/orders/page.tsx',
  'app/dashboard/distributor/page.tsx',
  'app/dashboard/distributor/search/page.tsx',
  'app/dashboard/distributor/requests/page.tsx',
  'app/dashboard/distributor/propositions/page.tsx',
  'app/dashboard/distributor/achats/page.tsx',
  'app/dashboard/distributor/alerts/page.tsx',
  'app/dashboard/distributor/my-reviews/page.tsx',
  'app/dashboard/distributor/profile/page.tsx'
];

function migrateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remplacer ProducerLayout par AdaptiveLayout
    if (content.includes('ProducerLayout')) {
      content = content.replace(
        /import ProducerLayout from ['"]@\/components\/layouts\/ProducerLayout['"];?/g,
        'import AdaptiveLayout from \'@/components/layouts/AdaptiveLayout\';'
      );
      content = content.replace(
        /<ProducerLayout([^>]*)>/g,
        '<AdaptiveLayout$1>'
      );
      content = content.replace(
        /<\/ProducerLayout>/g,
        '</AdaptiveLayout>'
      );
      modified = true;
    }

    // Remplacer DistributorLayout par AdaptiveLayout
    if (content.includes('DistributorLayout')) {
      content = content.replace(
        /import DistributorLayout from ['"]@\/components\/layouts\/DistributorLayout['"];?/g,
        'import AdaptiveLayout from \'@/components/layouts/AdaptiveLayout\';'
      );
      content = content.replace(
        /<DistributorLayout([^>]*)>/g,
        '<AdaptiveLayout$1>'
      );
      content = content.replace(
        /<\/DistributorLayout>/g,
        '</AdaptiveLayout>'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migré: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Aucune migration nécessaire: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Erreur lors de la migration de ${filePath}:`, error.message);
    return false;
  }
}

// Exécuter la migration
console.log('🚀 Début de la migration des layouts...\n');

let migratedCount = 0;
let totalCount = filesToMigrate.length;

filesToMigrate.forEach(filePath => {
  if (migrateFile(filePath)) {
    migratedCount++;
  }
});

console.log(`\n📊 Résumé de la migration:`);
console.log(`✅ Fichiers migrés: ${migratedCount}/${totalCount}`);
console.log(`🎯 Migration terminée !`);

if (migratedCount > 0) {
  console.log(`\n💡 Redémarrez le serveur de développement pour appliquer les changements.`);
}
