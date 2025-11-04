import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables');
}

/**
 * Client Supabase côté serveur pour les API routes et Server Components
 * - Utilise la SERVICE_ROLE_KEY pour les opérations admin
 * - Pas de persistence de session (géré côté client)
 * - Accès complet à la base de données
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Pas de persistence côté serveur
    persistSession: false,

    // Auto-refresh désactivé côté serveur
    autoRefreshToken: false,

    // Détection de session désactivée
    detectSessionInUrl: false,
  },
});

/**
 * Client Supabase pour les requêtes avec session utilisateur
 * - Utilise les cookies pour récupérer la session
 * - Respecte les Row Level Security (RLS)
 * - Sécurisé pour les opérations utilisateur
 */
export const createServerClient = () => {
  const cookieStore = cookies();

  return createSSRServerClient<Database>(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
};

/**
 * Fonction pour vérifier si les variables d'environnement serveur sont configurées
 */
export const isServerConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey);
};

/**
 * Fonction pour obtenir la session utilisateur côté serveur
 */
export const getServerSession = async () => {
  const supabase = createServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }

  return session;
};

/**
 * Fonction pour obtenir l'utilisateur actuel côté serveur
 */
export const getServerUser = async () => {
  const supabase = createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }

  return user;
};

export default supabaseAdmin;
