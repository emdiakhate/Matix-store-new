import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';

// Utilisation d'une police système pour éviter les dépendances réseau
// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MATIX - Hub Numérique Avicole du Sénégal',
  description:
    "La première plateforme digitale connectant producteurs, vétérinaires et acheteurs dans l'écosystème avicole sénégalais",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
