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
 * Partage une annonce sur WhatsApp avec message pré-rempli et photos (si supporté)
 * @param announcement - Les données de l'annonce à partager
 * @param withPhotos - Tenter d'inclure les photos (mobile uniquement)
 * @returns true si WhatsApp s'est ouvert, false sinon
 */
export const shareToWhatsApp = async (
  announcement: ShareableAnnouncement,
  withPhotos: boolean = true
): Promise<boolean> => {
  try {
    console.log('📱 Tentative de partage WhatsApp...');
    
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // ──────────────────────────────────────────────────
    // MÉTHODE 1 : Web Share API avec photos (Mobile)
    // ──────────────────────────────────────────────────
    if (isMobile && withPhotos && announcement.photos && announcement.photos.length > 0) {
      console.log('📸 Tentative de partage avec photos via Web Share API...');
      
      const shareSuccess = await shareWithWebShareAPI(announcement);
      
      if (shareSuccess) {
        console.log('✅ Partage réussi avec photos');
        return true;
      }
      
      console.log('⚠️ Web Share API non disponible, fallback vers texte seul');
    }
    
    // ──────────────────────────────────────────────────
    // MÉTHODE 2 : URL Scheme classique (Texte seul)
    // ──────────────────────────────────────────────────
    console.log('📝 Partage texte seul via URL scheme');
    
    const message = buildWhatsAppMessage(announcement);
    const encodedMessage = encodeURIComponent(message);
    
    let whatsappUrl: string;
    
    if (isMobile) {
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    } else {
      whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    }
    
    const opened = window.open(whatsappUrl, '_blank');
    
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      if (isMobile) {
        window.location.href = whatsappUrl;
        return true;
      }
      return false;
    }
    
    console.log('✅ WhatsApp ouvert');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur partage WhatsApp:', error);
    return false;
  }
};

/**
 * Partage avec Web Share API (photos incluses)
 */
const shareWithWebShareAPI = async (
  announcement: ShareableAnnouncement
): Promise<boolean> => {
  try {
    // Vérifier si Web Share API est disponible
    if (!navigator.share || !navigator.canShare) {
      console.log('❌ Web Share API non disponible');
      return false;
    }
    
    // Préparer le texte
    const text = buildWhatsAppMessage(announcement);
    
    // Convertir les photos base64 en Blob puis File
    const photoFiles: File[] = [];
    
    if (announcement.photos && announcement.photos.length > 0) {
      console.log(`📸 Conversion de ${announcement.photos.length} photo(s)...`);
      
      for (let i = 0; i < announcement.photos.length; i++) {
        const photoBase64 = announcement.photos[i];
        
        try {
          // Convertir base64 en Blob
          const response = await fetch(photoBase64);
          const blob = await response.blob();
          
          // Créer un File
          const file = new File([blob], `photo_${i + 1}.jpg`, { type: 'image/jpeg' });
          photoFiles.push(file);
          
          console.log(`✅ Photo ${i + 1} convertie (${(blob.size / 1024).toFixed(2)} KB)`);
        } catch (error) {
          console.error(`❌ Erreur conversion photo ${i + 1}:`, error);
        }
      }
    }
    
    // Vérifier si on peut partager des fichiers
    const shareData: ShareData = {
      text,
      files: photoFiles.length > 0 ? photoFiles : undefined
    };
    
    if (photoFiles.length > 0) {
      if (!navigator.canShare(shareData)) {
        console.log('❌ Impossible de partager des fichiers sur cet appareil');
        return false;
      }
    }
    
    // Partager
    console.log('🚀 Ouverture du sélecteur de partage...');
    await navigator.share(shareData);
    
    console.log('✅ Partage effectué');
    return true;
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('ℹ️ Partage annulé par l\'utilisateur');
    } else {
      console.error('❌ Erreur Web Share API:', error);
    }
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
 * Partage sur Facebook
 */
export const shareToFacebook = (announcement: ShareableAnnouncement): boolean => {
  try {
    const shareUrl = `${window.location.origin}/annonces/${announcement.id}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    
    const opened = window.open(facebookUrl, 'facebook-share', 'width=600,height=400');
    return !!opened;
  } catch (error) {
    console.error('Erreur partage Facebook:', error);
    return false;
  }
};

/**
 * Partage sur Twitter/X
 */
export const shareToTwitter = (announcement: ShareableAnnouncement): boolean => {
  try {
    const text = `🐔 ${announcement.productType} - ${formatPrice(announcement.price)} FCFA
📍 ${announcement.location}`;
    const url = `${window.location.origin}/annonces/${announcement.id}`;
    const hashtags = 'MatixSN,Aviculture,Senegal';
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    
    const opened = window.open(twitterUrl, 'twitter-share', 'width=550,height=420');
    return !!opened;
  } catch (error) {
    console.error('Erreur partage Twitter:', error);
    return false;
  }
};

/**
 * Partage par Email
 */
export const shareByEmail = (announcement: ShareableAnnouncement): boolean => {
  try {
    const subject = `${announcement.productType} à vendre - ${formatPrice(announcement.price)} FCFA`;
    const body = buildWhatsAppMessage(announcement); // Réutiliser le même message
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    return true;
  } catch (error) {
    console.error('Erreur partage Email:', error);
    return false;
  }
};

/**
 * Partage par SMS
 */
export const shareBySMS = (announcement: ShareableAnnouncement): boolean => {
  try {
    const message = `${announcement.productType} à ${formatPrice(announcement.price)} FCFA. Voir : ${window.location.origin}/annonces/${announcement.id}`;
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS 
      ? `sms:&body=${encodeURIComponent(message)}`
      : `sms:?body=${encodeURIComponent(message)}`;
    
    window.location.href = smsUrl;
    return true;
  } catch (error) {
    console.error('Erreur partage SMS:', error);
    return false;
  }
};

/**
 * Copier le lien
 */
export const copyAnnouncementLink = async (announcement: ShareableAnnouncement): Promise<boolean> => {
  try {
    const url = `${window.location.origin}/annonces/${announcement.id}`;
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Erreur copie lien:', error);
    return false;
  }
};

/**
 * Partage natif (si disponible)
 */
export const shareNative = async (announcement: ShareableAnnouncement): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }
  
  try {
    await navigator.share({
      title: `${announcement.productType} - Matix`,
      text: `${announcement.productType} à ${formatPrice(announcement.price)} FCFA`,
      url: `${window.location.origin}/annonces/${announcement.id}`
    });
    return true;
  } catch (error) {
    console.error('Erreur partage natif:', error);
    return false;
  }
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
