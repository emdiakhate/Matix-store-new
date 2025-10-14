// services/shareService.ts

export interface ShareableAnnouncement {
  id: string;
  productType: string;
  category: string;
  quantity: number | string;
  unit: string;
  price: number | string;
  location: string;
  availabilityDate: string;
  photos?: string[];
}

/**
 * Partage une annonce sur WhatsApp avec message pré-rempli
 * @param announcement - Les données de l'annonce à partager
 * @returns true si WhatsApp s'est ouvert, false sinon
 */
export const shareToWhatsApp = (announcement: ShareableAnnouncement): boolean => {
  try {
    console.log('📱 Préparation du partage WhatsApp...', announcement);
    
    // ──────────────────────────────────────────────────
    // ÉTAPE 1 : Construire le message
    // ──────────────────────────────────────────────────
    const message = buildWhatsAppMessage(announcement);
    
    console.log('✅ Message construit :', message);
    
    // ──────────────────────────────────────────────────
    // ÉTAPE 2 : Encoder pour l'URL
    // ──────────────────────────────────────────────────
    const encodedMessage = encodeURIComponent(message);
    
    // ──────────────────────────────────────────────────
    // ÉTAPE 3 : Détecter mobile ou desktop
    // ──────────────────────────────────────────────────
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let whatsappUrl: string;
    
    if (isMobile) {
      // URL pour ouvrir l'app WhatsApp mobile
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
      console.log('📱 URL mobile générée');
    } else {
      // URL pour ouvrir WhatsApp Web
      whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      console.log('💻 URL desktop générée');
    }
    
    // ──────────────────────────────────────────────────
    // ÉTAPE 4 : Ouvrir WhatsApp
    // ──────────────────────────────────────────────────
    const opened = window.open(whatsappUrl, '_blank');
    
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      // Popup bloquée
      console.warn('⚠️ Popup bloquée par le navigateur');
      
      // Essayer avec window.location comme fallback (mobile)
      if (isMobile) {
        window.location.href = whatsappUrl;
        return true;
      }
      
      return false;
    }
    
    console.log('✅ WhatsApp ouvert avec succès');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du partage WhatsApp:', error);
    return false;
  }
};

/**
 * Construit le message WhatsApp formaté
 */
const buildWhatsAppMessage = (announcement: ShareableAnnouncement): string => {
  // Formater la date de disponibilité
  const availabilityText = formatAvailability(announcement.availabilityDate);
  
  // Construire l'URL de l'annonce
  const announcementUrl = `${window.location.origin}/annonces/${announcement.id}`;
  
  // Message avec emojis et formatage WhatsApp
  const message = `
🐔 *${announcement.productType}* 🐔

💰 Prix : *${formatPrice(announcement.price)} FCFA*/${announcement.unit}
📦 Disponible : ${announcement.quantity} ${announcement.unit}
📍 Localisation : ${announcement.location}
⏰ ${availabilityText}

👉 *Voir toutes les photos et détails :*
${announcementUrl}

───────────────────
✨ Trouvé sur *Matix* - Marketplace avicole 🇸🇳
  `.trim();
  
  return message;
};

/**
 * Formate le prix avec séparateurs de milliers
 */
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('fr-FR');
};

/**
 * Formate la date de disponibilité en texte lisible
 */
const formatAvailability = (date: string): string => {
  if (!date) return 'Disponibilité à confirmer';
  
  try {
    const dateObj = new Date(date);
    const today = new Date();
    
    // Calculer la différence en jours
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Disponible *aujourd\'hui*';
    } else if (diffDays === 1) {
      return 'Disponible *demain*';
    } else if (diffDays > 1 && diffDays <= 7) {
      return `Disponible dans *${diffDays} jours*`;
    } else {
      return `Disponible le *${dateObj.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}*`;
    }
  } catch (error) {
    return 'Disponibilité à confirmer';
  }
};

/**
 * Vérifie si WhatsApp est disponible sur l'appareil
 */
export const isWhatsAppAvailable = (): boolean => {
  // WhatsApp est toujours "disponible" via URL scheme
  // Sur mobile, ça ouvrira l'app ou proposera de l'installer
  // Sur desktop, ça ouvrira WhatsApp Web
  return true;
};

/**
 * Obtient le texte du bouton selon la plateforme
 */
export const getWhatsAppButtonText = (): string => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isMobile ? 'Partager sur WhatsApp' : 'Partager sur WhatsApp Web';
};

/**
 * Affiche un guide si la popup est bloquée
 */
export const showPopupBlockedGuide = () => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    return `
Pour partager sur WhatsApp :
1. Autorisez les redirections dans les paramètres de votre navigateur
2. Ou copiez le lien et ouvrez WhatsApp manuellement
    `.trim();
  } else {
    return `
Pour partager sur WhatsApp :
1. Autorisez les popups pour ce site dans votre navigateur
2. Cliquez sur l'icône 🔒 dans la barre d'adresse
3. Autorisez les fenêtres contextuelles
4. Réessayez le partage
    `.trim();
  }
};
