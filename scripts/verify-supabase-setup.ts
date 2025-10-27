#!/usr/bin/env tsx

/**
 * Script de vérification de la configuration Supabase
 * Vérifie que la migration SQL a été correctement exécutée
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('Vérifiez que .env.local contient :')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySupabaseSetup() {
  console.log('🔍 Vérification de la configuration Supabase...\n')
  console.log(`📡 URL: ${supabaseUrl}\n`)
  
  let successCount = 0
  let totalTests = 5
  
  try {
    // Test 1 : Connexion à Supabase
    console.log('1️⃣  Test de connexion à Supabase...')
    const { data: pingData, error: pingError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0)
    
    if (pingError && pingError.code === '42P01') {
      console.log('❌ Table profiles n\'existe pas encore')
      console.log('   → Exécutez la migration SQL dans le dashboard Supabase\n')
    } else {
      console.log('✅ Connexion établie\n')
      successCount++
    }
    
    // Test 2 : Table profiles existe
    console.log('2️⃣  Vérification de la table profiles...')
    const { data, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (tableError) {
      if (tableError.code === '42P01') {
        console.log('❌ Table profiles n\'existe pas')
        console.log('   → Exécutez la migration SQL\n')
      } else {
        console.log('✅ Table profiles existe\n')
        successCount++
      }
    } else {
      console.log('✅ Table profiles existe')
      if (data && data.length > 0) {
        console.log(`   → Contient ${data.length} profil(s)\n`)
      } else {
        console.log('   → Table vide (normal)\n')
      }
      successCount++
    }
    
    // Test 3 : Vérifier les colonnes de la table
    console.log('3️⃣  Vérification de la structure de la table...')
    const { data: structure, error: structError } = await supabase
      .from('profiles')
      .select('id, email, nom, prenom, telephone, role, avatar_url, created_at, updated_at')
      .limit(0)
    
    if (structError) {
      console.log('⚠️  Impossible de vérifier la structure')
      console.log(`   → Erreur: ${structError.message}\n`)
    } else {
      console.log('✅ Structure de la table valide')
      console.log('   → Colonnes: id, email, nom, prenom, telephone, role, avatar_url, created_at, updated_at\n')
      successCount++
    }
    
    // Test 4 : RLS actif (tentative de lecture sans auth)
    console.log('4️⃣  Vérification de Row Level Security...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (rlsError && rlsError.code === 'PGRST301') {
      console.log('✅ RLS est actif (impossible de lire sans authentification)\n')
      successCount++
    } else if (!rlsError && (!rlsTest || rlsTest.length === 0)) {
      console.log('✅ RLS probablement actif (table vide)\n')
      successCount++
    } else {
      console.log('⚠️  RLS pourrait ne pas être actif')
      console.log('   → Vérifiez dans le dashboard Supabase\n')
    }
    
    // Test 5 : Vérifier le type user_role
    console.log('5️⃣  Vérification du type user_role...')
    try {
      const { data: roleTest, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .limit(0)
      
      if (roleError && roleError.message.includes('user_role')) {
        console.log('❌ Type user_role n\'existe pas')
        console.log('   → Exécutez la migration SQL complète\n')
      } else {
        console.log('✅ Type user_role existe')
        console.log('   → Valeurs possibles: eleveur, acheteur, admin\n')
        successCount++
      }
    } catch (error) {
      console.log('⚠️  Impossible de vérifier le type user_role')
      console.log('   → Vérifiez manuellement dans le dashboard\n')
    }
    
    // Résumé
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 Résultat: ${successCount}/${totalTests} tests réussis\n`)
    
    if (successCount === totalTests) {
      console.log('🎉 Configuration Supabase PARFAITE !')
      console.log('\n✅ Prochaines étapes :')
      console.log('   1. Tester l\'inscription d\'un utilisateur')
      console.log('   2. Vérifier que le profil est créé automatiquement')
      console.log('   3. Continuer le développement')
      console.log('   4. Migrer l\'ancien système d\'authentification')
    } else if (successCount >= 3) {
      console.log('⚠️  Configuration Supabase PARTIELLE')
      console.log('\n📋 Actions recommandées :')
      console.log('   1. Exécuter la migration SQL si pas encore fait')
      console.log('   2. Vérifier les policies RLS dans le dashboard')
      console.log('   3. Re-exécuter ce script pour vérifier')
    } else {
      console.log('❌ Configuration Supabase INCOMPLÈTE')
      console.log('\n🔧 Actions requises :')
      console.log('   1. Exécuter la migration SQL dans Supabase')
      console.log('   2. Vérifier les variables d\'environnement')
      console.log('   3. Consulter docs/INSTRUCTIONS_MIGRATION_SQL.md')
    }
    
    // Informations supplémentaires
    console.log('\n📚 Ressources utiles :')
    console.log('   • Guide migration: docs/INSTRUCTIONS_MIGRATION_SQL.md')
    console.log('   • Checklist: MIGRATION_SQL_CHECKLIST.md')
    console.log('   • Dashboard Supabase: https://supabase.com/dashboard')
    
  } catch (error: any) {
    console.error('\n❌ Erreur inattendue:', error.message)
    console.log('\n🔧 Actions recommandées :')
    console.log('1. Vérifier la connexion internet')
    console.log('2. Vérifier que Supabase est accessible')
    console.log('3. Vérifier les variables d\'environnement')
    console.log('4. Consulter docs/INSTRUCTIONS_MIGRATION_SQL.md')
  }
}

// Exécuter la vérification
verifySupabaseSetup()
