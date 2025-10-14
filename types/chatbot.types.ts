// Types pour le système de flows modulaires
export type FlowType = 
  | 'main_menu'
  | 'create_announcement'
  | 'view_announcements'
  | 'search_products'
  | 'contact_seller'
  | 'manage_profile'
  | 'view_orders'
  | 'help_support';

export interface ChatFlowSystem {
  currentFlow: FlowType;
  flows: Record<FlowType, ChatFlow>;
}

export interface ChatFlow {
  id: FlowType;
  name: string;
  icon: string;
  steps: Record<string, ChatStep>;
  entryPoint: string; // Première étape du flow
}

export interface ChatStep {
  id: string;
  audioUrl: string;
  audioDuration: string;
  transcript: string;
  options?: {
    number: number;
    label: string;
    next?: string;
    action?: string;
    flowChange?: FlowType; // Nouveau : permet de changer de flow
    value?: any;
  }[];
  dataKey?: string;
  inputType?: 'number' | 'text' | 'voice';
  next?: string;
}

export interface ChatBotProductData {
  // Données collectées par le ChatBot
  action: 'sell' | 'buy';              // Vendre ou acheter
  category: 'poultry' | 'equipment' | 'medicine';
  productType: string;                  // Type spécifique (ex: "Poulets de chair")
  quantity: string;                     // Quantité sélectionnée
  unit?: string;                        // Unité (kg, pièce, etc.)
  location: string;                     // Localisation
  price: string;                        // Fourchette de prix
  availability: string;                 // Disponibilité
  availabilityDate?: string;            // Date de disponibilité
  minOrder?: number;                    // Commande minimum
  deliveryRadius?: number;              // Rayon de livraison
  hasPhoto: boolean;                    // A une photo ou non
  photos?: string[];                    // Array de photos en base64
  photoCount?: number;                  // Nombre de photos
  
  // Métadonnées
  createdAt: string;
  userId?: string;
}

export interface ProductFromChat {
  // Format final pour créer le produit
  name: string;
  category: string;
  price: number;                        // Prix numérique
  stock: number;                        // Stock numérique
  location: string;
  availability: 'immediate' | 'week' | 'month';
  description: string;                  // Généré automatiquement
  images?: string[];
  status: 'pending' | 'active';         // Pending car créé via chat
}

export function transformChatDataToProduct(
  chatData: ChatBotProductData
): ProductFromChat {
  // Conversion de la quantité en nombre
  const getStockFromQuantity = (quantity: string): number => {
    switch (quantity) {
      case 'Moins de 10':
        return Math.floor(Math.random() * 9) + 1; // 1-9
      case '10 à 50':
        return Math.floor(Math.random() * 41) + 10; // 10-50
      case '50 à 100':
        return Math.floor(Math.random() * 51) + 50; // 50-100
      case 'Plus de 100':
        return Math.floor(Math.random() * 200) + 100; // 100-300
      default:
        return 1;
    }
  };

  // Conversion du prix en nombre
  const getPriceFromRange = (priceRange: string): number => {
    switch (priceRange) {
      case 'Moins de 1000 FCFA':
        return Math.floor(Math.random() * 1000) + 100; // 100-999
      case '1000 à 5000 FCFA':
        return Math.floor(Math.random() * 4000) + 1000; // 1000-4999
      case '5000 à 20000 FCFA':
        return Math.floor(Math.random() * 15000) + 5000; // 5000-19999
      case 'Plus de 20000 FCFA':
        return Math.floor(Math.random() * 50000) + 20000; // 20000-69999
      default:
        return 1000;
    }
  };

  // Conversion de la disponibilité
  const getAvailabilityFromText = (availability: string): 'immediate' | 'week' | 'month' => {
    if (availability.includes('Immédiatement')) return 'immediate';
    if (availability.includes('semaine')) return 'week';
    if (availability.includes('mois')) return 'month';
    return 'immediate';
  };

  // Génération du nom du produit
  const generateProductName = (data: ChatBotProductData): string => {
    const categoryMap = {
      'poultry': 'Volaille',
      'equipment': 'Équipement',
      'medicine': 'Produit vétérinaire'
    };
    
    return `${data.productType} - ${categoryMap[data.category]}`;
  };

  // Génération de la description
  const generateDescription = (data: ChatBotProductData): string => {
    const actionText = data.action === 'sell' ? 'Vente' : 'Achat';
    const categoryText = {
      'poultry': 'volaille de qualité',
      'equipment': 'équipement avicole professionnel',
      'medicine': 'produit vétérinaire certifié'
    }[data.category];

    return `${actionText} de ${data.productType.toLowerCase()} - ${categoryText}. 
    Quantité: ${data.quantity}. 
    Localisation: ${data.location}. 
    Disponibilité: ${data.availability}. 
    ${data.hasPhoto ? 'Photos disponibles sur demande.' : 'Photos à fournir.'}`;
  };

  // Conversion de la catégorie
  const getCategoryFromData = (data: ChatBotProductData): string => {
    const categoryMap = {
      'poultry': 'Volaille',
      'equipment': 'Équipement',
      'medicine': 'Médecine vétérinaire'
    };
    return categoryMap[data.category];
  };

  return {
    name: generateProductName(chatData),
    category: getCategoryFromData(chatData),
    price: getPriceFromRange(chatData.price),
    stock: getStockFromQuantity(chatData.quantity),
    location: chatData.location,
    availability: getAvailabilityFromText(chatData.availability),
    description: generateDescription(chatData),
    images: chatData.hasPhoto ? [] : undefined, // Sera rempli si l'utilisateur ajoute des photos
    status: 'pending' // Toujours pending car créé via chat
  };
}
