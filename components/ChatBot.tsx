'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minus, Play, Pause, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatBotProductData, ProductFromChat, transformChatDataToProduct, FlowType, ChatFlow } from '@/types/chatbot.types';
import { playStepAudio, stopAllAudio, preloadAudioFiles } from '@/lib/services/audioService';
import { demoAudioUrls, audioScripts } from '@/lib/services/audioGenerator';

interface Message {
  id: string;
  text?: string;
  type: 'user' | 'bot';
  timestamp: string;
  audioUrl?: string;
  audioDuration?: string;
  isPlaying?: boolean;
}

interface ChatOption {
  number: number;
  label: string;
  next: string | null;
  value?: any;
}

interface ChatStep {
  id: string;
  audioUrl: string;
  audioDuration: string;
  transcript?: string;
  options: ChatOption[];
  dataKey?: string;
  inputType?: 'number' | 'text';
  next?: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [collectedData, setCollectedData] = useState<Partial<ChatBotProductData>>({});
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  // États pour le système multi-images
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]); // Array de base64
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showPhotoZoom, setShowPhotoZoom] = useState(false);
  const [zoomedPhotoIndex, setZoomedPhotoIndex] = useState(0);
  const [uploadingPreview, setUploadingPreview] = useState<string | null>(null);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  
  const MAX_PHOTOS = 4;
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // États pour le système multifonction
  const [currentFlow, setCurrentFlow] = useState<FlowType>('main_menu');
  const [flowHistory, setFlowHistory] = useState<FlowType[]>([]);

  // Fonction helper pour dates
  const getDateInDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // === SYSTÈME MULTIFONCTION - FLOWS MODULAIRES ===

  // Flow du menu principal
  const mainMenuFlow: ChatFlow = {
    id: 'main_menu',
    name: 'Menu Principal',
    icon: '🏠',
    entryPoint: 'welcome',
    steps: {
    welcome: {
        id: 'welcome',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:25',
        transcript: `Bonjour ! Bienvenue sur Matix. Que voulez-vous faire ?
          1 - Créer une annonce
          2 - Voir mes annonces
          3 - Rechercher un produit
          4 - Mes commandes
          5 - Mon profil
          6 - Aide`,
      options: [
          { 
            number: 1, 
            label: '📝 Créer une annonce', 
            flowChange: 'create_announcement',
            action: 'change_flow'
          },
          { 
            number: 2, 
            label: '📋 Voir mes annonces', 
            flowChange: 'view_announcements',
            action: 'change_flow'
          },
          { 
            number: 3, 
            label: '🔍 Rechercher', 
            flowChange: 'search_products',
            action: 'change_flow'
          },
          { 
            number: 4, 
            label: '🛒 Mes commandes', 
            flowChange: 'view_orders',
            action: 'change_flow'
          },
          { 
            number: 5, 
            label: '👤 Mon profil', 
            flowChange: 'manage_profile',
            action: 'change_flow'
          },
          { 
            number: 6, 
            label: '❓ Aide', 
            flowChange: 'help_support',
            action: 'change_flow'
          }
        ]
      }
    }
  };

  // Flow pour créer une annonce (existant, adapté)
  const createAnnouncementFlow: ChatFlow = {
    id: 'create_announcement',
    name: 'Créer une annonce',
    icon: '📝',
    entryPoint: 'action_type',
    steps: {
      action_type: {
        id: 'action_type',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:12',
        transcript: 'Voulez-vous vendre ou acheter ? 1 pour vendre, 2 pour acheter',
        options: [
          { number: 1, label: 'Vendre', next: 'category', value: 'sell' },
          { number: 2, label: 'Acheter', next: 'category', value: 'buy' }
        ],
        dataKey: 'action'
      },
      category: {
        id: 'category',
        audioUrl: demoAudioUrls.category,
        audioDuration: '0:18',
        transcript: 'Quelle catégorie ? 1-Poulets, 2-Matériel, 3-Médicaments',
      options: [
          { number: 1, label: 'Poulets/Poussins', next: 'type', value: 'poultry' },
          { number: 2, label: 'Matériel', next: 'type', value: 'equipment' },
          { number: 3, label: 'Médicaments', next: 'type', value: 'medicine' }
        ],
        dataKey: 'category'
      },
      type: {
        id: 'type',
        audioUrl: demoAudioUrls.poultry_type,
        audioDuration: '0:20',
        transcript: 'Quel type de produit ? 1-Type A, 2-Type B, 3-Type C',
      options: [
          { number: 1, label: 'Poussins 1 jour', next: 'quantity', value: 'Poussins 1 jour' },
          { number: 2, label: 'Poulets de chair', next: 'quantity', value: 'Poulets de chair' },
          { number: 3, label: 'Poules pondeuses', next: 'quantity', value: 'Poules pondeuses' },
          { number: 4, label: 'Autre', next: 'quantity', value: 'Autre' }
        ],
        dataKey: 'productType'
    },
    quantity: {
        id: 'quantity',
        audioUrl: demoAudioUrls.quantity,
        audioDuration: '0:10',
        transcript: 'Quelle quantité avez-vous ?',
        options: [],
        dataKey: 'quantity',
        inputType: 'number',
        next: 'unit'
      },
      unit: {
        id: 'unit',
        audioUrl: demoAudioUrls.quantity,
        audioDuration: '0:08',
        transcript: 'Quelle est l\'unité ? Par exemple kg, pièce, carton',
        options: [],
        dataKey: 'unit',
        inputType: 'text',
        next: 'price'
      },
      price: {
        id: 'price',
        audioUrl: demoAudioUrls.price,
        audioDuration: '0:10',
        transcript: 'Quel est le prix en francs CFA ?',
        options: [],
        dataKey: 'price',
        inputType: 'number',
        next: 'availability_date'
      },
      availability_date: {
        id: 'availability_date',
        audioUrl: demoAudioUrls.availability,
        audioDuration: '0:14',
        transcript: 'Quand sera disponible ? 1-Aujourd\'hui, 2-Cette semaine, 3-Ce mois',
      options: [
          { number: 1, label: 'Aujourd\'hui', next: 'min_order', value: new Date().toISOString().split('T')[0] },
          { number: 2, label: 'Cette semaine', next: 'min_order', value: getDateInDays(7) },
          { number: 3, label: 'Ce mois', next: 'min_order', value: getDateInDays(30) }
        ],
        dataKey: 'availabilityDate'
      },
      min_order: {
        id: 'min_order',
        audioUrl: demoAudioUrls.quantity,
        audioDuration: '0:10',
        transcript: 'Quelle est la commande minimum ?',
        options: [],
        dataKey: 'minOrder',
        inputType: 'number',
        next: 'location'
    },
    location: {
        id: 'location',
        audioUrl: demoAudioUrls.location,
        audioDuration: '0:08',
        transcript: 'Où êtes-vous situé ? Tapez votre ville.',
        options: [],
        dataKey: 'location',
        inputType: 'text',
        next: 'delivery_radius'
      },
      delivery_radius: {
        id: 'delivery_radius',
        audioUrl: demoAudioUrls.location,
        audioDuration: '0:10',
        transcript: 'Quel est votre rayon de livraison en kilomètres ?',
        options: [],
        dataKey: 'deliveryRadius',
        inputType: 'number',
        next: 'photo'
      },
      photo: {
        id: 'photo',
        audioUrl: demoAudioUrls.photo,
        audioDuration: '0:08',
        transcript: 'Ajoutez une photo de votre produit',
        options: [],
        dataKey: 'photo'
      },
      end: {
        id: 'end',
        audioUrl: demoAudioUrls.end,
        audioDuration: '0:08',
        transcript: 'Merci ! Votre annonce est prête.',
        options: []
      }
    }
  };

  // Flow pour voir les annonces
  const viewAnnouncementsFlow: ChatFlow = {
    id: 'view_announcements',
    name: 'Mes Annonces',
    icon: '📋',
    entryPoint: 'list_announcements',
    steps: {
      list_announcements: {
        id: 'list_announcements',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:15',
        transcript: 'Voici vos annonces. Tapez le numéro d\'une annonce pour voir les détails, ou 0 pour retourner au menu.',
        options: [], // Les options seront générées dynamiquement depuis les données
        inputType: 'number'
      },
      announcement_details: {
        id: 'announcement_details',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:12',
        transcript: 'Que voulez-vous faire ? 1-Modifier, 2-Supprimer, 3-Partager, 0-Retour',
      options: [
          { number: 1, label: 'Modifier', action: 'edit_announcement' },
          { number: 2, label: 'Supprimer', action: 'delete_announcement' },
          { number: 3, label: 'Partager', action: 'share_announcement' },
          { number: 0, label: 'Retour', next: 'list_announcements' }
        ]
      }
    }
  };

  // Flow pour rechercher des produits
  const searchProductsFlow: ChatFlow = {
    id: 'search_products',
    name: 'Rechercher',
    icon: '🔍',
    entryPoint: 'search_category',
    steps: {
      search_category: {
        id: 'search_category',
        audioUrl: demoAudioUrls.category,
        audioDuration: '0:18',
        transcript: 'Que cherchez-vous ? 1-Poulets, 2-Matériel, 3-Médicaments',
        options: [
          { number: 1, label: 'Poulets', next: 'search_location', value: 'poultry' },
          { number: 2, label: 'Matériel', next: 'search_location', value: 'equipment' },
          { number: 3, label: 'Médicaments', next: 'search_location', value: 'medicine' }
        ],
        dataKey: 'searchCategory'
      },
      search_location: {
        id: 'search_location',
        audioUrl: demoAudioUrls.location,
        audioDuration: '0:10',
        transcript: 'Dans quelle ville cherchez-vous ?',
        options: [],
        inputType: 'text',
        next: 'search_results',
        dataKey: 'searchLocation'
      },
      search_results: {
        id: 'search_results',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:15',
        transcript: 'Voici les résultats. Tapez le numéro pour voir les détails.',
        options: [], // Généré dynamiquement
        inputType: 'number'
      }
    }
  };

  // Flow pour les commandes (placeholder)
  const viewOrdersFlow: ChatFlow = {
    id: 'view_orders',
    name: 'Mes Commandes',
    icon: '🛒',
    entryPoint: 'list_orders',
    steps: {
      list_orders: {
        id: 'list_orders',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:15',
        transcript: 'Voici vos commandes récentes. Fonctionnalité en développement.',
      options: [
          { number: 0, label: 'Retour au menu', flowChange: 'main_menu', action: 'change_flow' }
        ]
      }
    }
  };

  // Flow pour le profil (placeholder)
  const manageProfileFlow: ChatFlow = {
    id: 'manage_profile',
    name: 'Mon Profil',
    icon: '👤',
    entryPoint: 'profile_menu',
    steps: {
      profile_menu: {
        id: 'profile_menu',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:15',
        transcript: 'Gestion du profil. Fonctionnalité en développement.',
      options: [
          { number: 0, label: 'Retour au menu', flowChange: 'main_menu', action: 'change_flow' }
        ]
      }
    }
  };

  // Flow pour l'aide (placeholder)
  const helpSupportFlow: ChatFlow = {
    id: 'help_support',
    name: 'Aide & Support',
    icon: '❓',
    entryPoint: 'help_menu',
    steps: {
      help_menu: {
        id: 'help_menu',
        audioUrl: demoAudioUrls.welcome,
        audioDuration: '0:15',
        transcript: 'Centre d\'aide. Fonctionnalité en développement.',
      options: [
          { number: 0, label: 'Retour au menu', flowChange: 'main_menu', action: 'change_flow' }
        ]
      }
    }
  };

  // Tous les flows
  const allFlows: Record<FlowType, ChatFlow> = {
    main_menu: mainMenuFlow,
    create_announcement: createAnnouncementFlow,
    view_announcements: viewAnnouncementsFlow,
    search_products: searchProductsFlow,
    contact_seller: viewOrdersFlow, // Placeholder
    manage_profile: manageProfileFlow,
    view_orders: viewOrdersFlow,
    help_support: helpSupportFlow
  };

  // === FONCTIONS DE NAVIGATION ENTRE FLOWS ===

  // Fonction pour changer de flow
  const changeFlow = (newFlow: FlowType) => {
    console.log(`🔄 Changement de flow: ${currentFlow} → ${newFlow}`);
    
    // Sauvegarder l'historique
    setFlowHistory(prev => [...prev, currentFlow]);
    
    // Changer le flow
    setCurrentFlow(newFlow);
    
    // Réinitialiser l'étape au point d'entrée du nouveau flow
    const newFlowData = allFlows[newFlow];
    setCurrentStep(newFlowData.entryPoint);
    
    // Ajouter le message de bienvenue du nouveau flow
    const entryStepData = newFlowData.steps[newFlowData.entryPoint];
    
    setTimeout(() => {
      const botMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        type: 'bot',
        audioUrl: entryStepData.audioUrl,
        audioDuration: entryStepData.audioDuration,
        text: entryStepData.transcript,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-play
      setTimeout(() => {
        handlePlayAudio(botMessage.id, entryStepData.audioUrl);
      }, 500);
    }, 300);
  };

  // Fonction pour retourner au menu principal
  const returnToMainMenu = () => {
    changeFlow('main_menu');
    setCollectedData({});
    setUploadedPhotos([]);
    setSelectedPhotoIndex(0);
    setShowPhotoZoom(false);
    setZoomedPhotoIndex(0);
    setUploadingPreview(null);
    setDraggedPhotoIndex(null);
  };

  // Fonction pour revenir en arrière dans l'historique
  const goBackFlow = () => {
    if (flowHistory.length > 0) {
      const previousFlow = flowHistory[flowHistory.length - 1];
      setFlowHistory(prev => prev.slice(0, -1));
      changeFlow(previousFlow);
    } else {
      returnToMainMenu();
    }
  };

  // Fonction pour gérer les actions spéciales
  const handleSpecialAction = (action: string, value?: any) => {
    switch(action) {
      case 'edit_announcement':
        console.log('Édition de l\'annonce', value);
        break;
        
      case 'delete_announcement':
        console.log('Suppression de l\'annonce', value);
        break;
        
      case 'share_announcement':
        if (navigator.share) {
          navigator.share({
            title: 'Mon annonce Matix',
            text: 'Découvrez mon annonce sur Matix',
            url: window.location.href
          });
        }
        break;
        
      case 'view_details':
        console.log('Affichage des détails du produit', value);
        break;
        
      default:
        console.warn('Action non reconnue:', action);
    }
  };

  // === FONCTIONS DE GESTION DES PHOTOS MULTIPLES ===

  // Fonction de compression d'image
  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Redimensionner si trop grand (max 1200px)
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compresser en JPEG qualité 0.8
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          
          console.log('✅ Image compressée:', {
            original: (file.size / 1024).toFixed(0) + ' KB',
            compressed: (compressed.length * 0.75 / 1024).toFixed(0) + ' KB'
          });
          
          resolve(compressed);
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  };

  // Fonction d'upload (ajout à la liste)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log('❌ Aucun fichier sélectionné');
      return;
    }

    // Vérifier si on a déjà atteint le maximum
    if (uploadedPhotos.length >= MAX_PHOTOS) {
      alert(`Vous avez déjà ajouté le maximum de ${MAX_PHOTOS} photos.`);
      return;
    }

    console.log('📸 Fichier sélectionné:', file.name, file.type, file.size);
    
    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB par image)
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo est trop grande (max 5MB)');
      return;
    }

    // Créer une prévisualisation immédiate
    const previewUrl = URL.createObjectURL(file);
    setUploadingPreview(previewUrl);
    setIsUploadingPhoto(true);

    try {
      // Compresser l'image
      const compressedBase64 = await compressImage(file);
      
      // Ajouter à la liste
      setUploadedPhotos(prev => [...prev, compressedBase64]);
      
      // Nettoyer
      URL.revokeObjectURL(previewUrl);
      setUploadingPreview(null);
      setIsUploadingPhoto(false);
      
      console.log(`💾 Photo ${uploadedPhotos.length + 1}/${MAX_PHOTOS} ajoutée`);
      
      // Reset l'input pour pouvoir ajouter la même image si nécessaire
      e.target.value = '';
    } catch (error) {
      console.error('❌ Erreur compression:', error);
      URL.revokeObjectURL(previewUrl);
      setUploadingPreview(null);
      setIsUploadingPhoto(false);
      alert('Erreur lors du traitement de la photo');
    }
  };

  // Supprimer une photo spécifique
  const removePhoto = (index: number) => {
    console.log(`🗑️ Suppression de la photo ${index + 1}`);
    
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    
    console.log(`✅ Photo supprimée. Reste: ${uploadedPhotos.length - 1} photo(s)`);
  };

  // Supprimer toutes les photos
  const clearAllPhotos = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les ${uploadedPhotos.length} photos ?`)) {
      console.log('🗑️ Suppression de toutes les photos');
      setUploadedPhotos([]);
      console.log('✅ Toutes les photos supprimées');
    }
  };

  // Validation des photos
  const validatePhotos = (): boolean => {
    if (uploadedPhotos.length === 0) {
      alert('⚠️ Veuillez ajouter au moins une photo');
      return false;
    }
    
    // Vérifier que toutes les photos sont valides
    const invalidPhotos = uploadedPhotos.filter(photo => !photo || photo.length < 100);
    
    if (invalidPhotos.length > 0) {
      alert('⚠️ Certaines photos semblent corrompues. Veuillez les supprimer et réessayer.');
      return false;
    }
    
    // Vérifier la taille totale (max 15MB pour toutes les photos)
    const totalSize = uploadedPhotos.reduce((sum, photo) => sum + photo.length, 0);
    const totalSizeMB = (totalSize * 0.75) / (1024 * 1024); // Approximation base64 → bytes
    
    if (totalSizeMB > 15) {
      alert(`⚠️ La taille totale des photos est trop grande (${totalSizeMB.toFixed(1)} MB). Maximum: 15 MB`);
      return false;
    }
    
    return true;
  };

  // Continuer après ajout des photos
  const handleContinueAfterPhoto = () => {
    if (!validatePhotos()) {
      return;
    }

    console.log(`➡️ Passage à l'étape finale avec ${uploadedPhotos.length} photo(s)`);
    
    // Sauvegarder dans les données collectées
    setCollectedData(prev => ({
      ...prev,
      photos: uploadedPhotos, // Array au lieu d'une seule photo
      hasPhoto: true,
      photoCount: uploadedPhotos.length
    }));
    
    // Ajouter un message utilisateur
    const photoMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: 'user',
      text: `📸 ${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? 's' : ''} ajoutée${uploadedPhotos.length > 1 ? 's' : ''}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    setMessages(prev => [...prev, photoMessage]);
    setIsTyping(true);

    // Passer à l'étape finale
    setTimeout(() => {
      setCurrentStep('end');
      const currentFlowData = allFlows[currentFlow];
      const endStepData = currentFlowData.steps['end'];
      
      const botMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        type: 'bot',
        audioUrl: endStepData.audioUrl,
        audioDuration: endStepData.audioDuration,
        text: endStepData.transcript,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Auto-play l'audio final
      setTimeout(() => {
        handlePlayAudio(botMessage.id, endStepData.audioUrl);
      }, 500);
      
      // Afficher le récapitulatif après 3 secondes
      setTimeout(() => {
        if (validateBeforeRecap()) {
          setShowRecapModal(true);
        }
      }, 3000);
      
    }, 1500);
  };

  // Handlers pour drag & drop
  const handleDragStart = (index: number) => {
    setDraggedPhotoIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedPhotoIndex === null) return;
    
    const newPhotos = [...uploadedPhotos];
    const draggedPhoto = newPhotos[draggedPhotoIndex];
    
    // Retirer de l'ancienne position
    newPhotos.splice(draggedPhotoIndex, 1);
    
    // Insérer à la nouvelle position
    newPhotos.splice(index, 0, draggedPhoto);
    
    setUploadedPhotos(newPhotos);
    setDraggedPhotoIndex(null);
    
    console.log('📦 Photos réorganisées');
  };

  const [currentStep, setCurrentStep] = useState('welcome');
  const [messages, setMessages] = useState<Message[]>([]);

  // Fonction pour scroll automatique
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Preload audio files
  useEffect(() => {
    preloadAudioFiles();
  }, []);

  // Auto-play first message
  useEffect(() => {
    if (messages.length === 1 && messages[0].type === 'bot') {
      setTimeout(() => {
        if (messages[0].audioUrl) {
          handlePlayAudio(messages[0].id, messages[0].audioUrl);
        }
      }, 500);
    }
  }, [messages]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  // Fonctions helper pour l'interface
  const isNumberStep = (): boolean => {
    // Étapes qui acceptent seulement des chiffres (1-9)
    const numberSteps = ['welcome', 'category', 'type', 'availability_date'];
    return numberSteps.includes(currentStep);
  };

  const getInputPlaceholder = (): string => {
    if (isNumberStep()) {
      return 'Tapez le numéro...';
    }
    
    switch(currentStep) {
      case 'quantity': return 'Ex: 50';
      case 'unit': return 'Ex: kg';
      case 'price': return 'Ex: 5000';
      case 'min_order': return 'Ex: 10';
      case 'location': return 'Ex: Dakar';
      case 'delivery_radius': return 'Ex: 20';
      default: return 'Votre réponse...';
    }
  };

  const getCurrentStepNumber = (): number => {
    const currentFlowData = allFlows[currentFlow];
    const steps = Object.keys(currentFlowData.steps);
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = (): number => {
    const currentFlowData = allFlows[currentFlow];
    return Object.keys(currentFlowData.steps).length;
  };

  const getStepLabel = (step: string): string => {
    const labels: Record<string, string> = {
      'welcome': '👋 Bienvenue',
      'category': '📦 Catégorie',
      'type': '🏷️ Type de produit',
      'quantity': '📊 Quantité',
      'unit': '📏 Unité',
      'price': '💰 Prix',
      'availability_date': '📅 Disponibilité',
      'min_order': '📋 Commande min',
      'location': '📍 Localisation',
      'delivery_radius': '🚚 Rayon livraison',
      'photo': '📸 Photo',
      'end': '✅ Terminé'
    };
    
    return labels[step] || step;
  };


  // Gestion audio style WhatsApp
  const handlePlayAudio = (messageId: string, audioUrl: string) => {
    if (playingMessageId === messageId && currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
    });

    audio.play()
      .then(() => {
        setCurrentAudio(audio);
        setPlayingMessageId(messageId);
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error('Erreur lecture audio:', error);
      });
  };


  const validateBeforeRecap = (): boolean => {
    const required = [
      'action',
      'category', 
      'productType',
      'quantity',
      'unit',
      'price',
      'availabilityDate',
      'minOrder',
      'location',
      'deliveryRadius',
      'photos'
    ];
    
    const missing = required.filter(key => !(collectedData as any)[key]);
    
    if (missing.length > 0) {
      console.error('❌ Données manquantes:', missing);
      alert(`Informations manquantes : ${missing.join(', ')}`);
      return false;
    }
    
    // Vérifier spécifiquement les photos
    if (!collectedData.photos || collectedData.photos.length === 0) {
      console.error('❌ Aucune photo ajoutée');
      alert('⚠️ Veuillez ajouter au moins une photo');
      return false;
    }
    
    return true;
  };


  const getAvailabilityText = (availability: string) => {
    switch(availability) {
      case 'immediate': return 'Immédiatement';
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      default: return 'N/A';
    }
  };

  const addMessage = (text: string, type: 'user' | 'bot') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text,
      type,
      timestamp: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addAudioMessage = (stepData: ChatStep) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text: stepData.transcript || '',
      type: 'bot',
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      audioUrl: stepData.audioUrl,
      audioDuration: stepData.audioDuration
    };
    
    setMessages(prev => [...prev, message]);
    
    setTimeout(() => {
      handlePlayAudio(message.id, stepData.audioUrl);
    }, 500);
  };

  const getDataKeyForStep = (step: string): string | null => {
    const mapping: Record<string, string> = {
      'welcome': 'action',
      'category': 'category',
      'poultry_type': 'productType',
      'equipment_type': 'productType',
      'medicine_type': 'productType',
      'quantity': 'quantity',
      'location': 'location',
      'price': 'price',
      'availability': 'availability',
      'photo': 'hasPhoto'
    };
    return mapping[step] || null;
  };

  const isValidNumber = (num: number): boolean => {
    const currentFlowData = allFlows[currentFlow];
    const currentStepData = currentFlowData.steps[currentStep];
    if (!currentStepData.options) return false;
    const validNumbers = currentStepData.options.map((opt: any) => opt.number);
    return validNumbers.includes(num);
  };

  const handleSendNumber = () => {
    const currentFlowData = allFlows[currentFlow];
    const currentStepData = currentFlowData.steps[currentStep];
    
    // CAS 1 : Étape avec options (choix numérique)
    if (currentStepData.options && currentStepData.options.length > 0) {
      const number = parseInt(userInput);
      const selectedOption = currentStepData.options.find(opt => opt.number === number);
      
      if (!selectedOption) {
        // Afficher erreur
        addMessage('❌ Numéro invalide', 'bot');
        setUserInput('');
        return;
      }
      
      // Vérifier si l'option demande un changement de flow
      if (selectedOption.action === 'change_flow' && selectedOption.flowChange) {
        addMessage(number.toString(), 'user');
        changeFlow(selectedOption.flowChange);
        setUserInput('');
        return;
      }
      
      // Vérifier si c'est une action spéciale
      if (selectedOption.action) {
        addMessage(number.toString(), 'user');
        handleSpecialAction(selectedOption.action, selectedOption.value);
        setUserInput('');
        return;
      }
      
      // Sauvegarder la valeur
      if (currentStepData.dataKey) {
        setCollectedData(prev => ({
          ...prev,
          [currentStepData.dataKey!]: selectedOption.value
        }));
      }
      
      // Ajouter le message utilisateur
      addMessage(number.toString(), 'user');
      
      // Passer à l'étape suivante
      if (selectedOption.next) {
        goToNextStep(selectedOption.next);
      }
      
    } else {
      // CAS 2 : Saisie libre
      if (!userInput.trim()) {
        return;
      }
      
      // Valider selon le type
      if (currentStepData.inputType === 'number') {
        const numValue = parseFloat(userInput);
        if (isNaN(numValue) || numValue <= 0) {
          addMessage('❌ Veuillez entrer un nombre valide', 'bot');
          setUserInput('');
          return;
        }
        
        // Sauvegarder
        if (currentStepData.dataKey) {
          setCollectedData(prev => ({
            ...prev,
            [currentStepData.dataKey!]: numValue
          }));
        }
        } else {
        // Texte
        if (currentStepData.dataKey) {
          setCollectedData(prev => ({
            ...prev,
            [currentStepData.dataKey!]: userInput.trim()
          }));
        }
      }
      
      // Ajouter le message utilisateur
      addMessage(userInput, 'user');
      
      // Passer à l'étape suivante
      if (currentStepData.next) {
        goToNextStep(currentStepData.next);
      }
    }
    
    setUserInput('');
  };

  const goToNextStep = (nextStep: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setCurrentStep(nextStep);
      const currentFlowData = allFlows[currentFlow];
      const nextStepData = currentFlowData.steps[nextStep];
      
      const botMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        type: 'bot',
        audioUrl: nextStepData.audioUrl,
        audioDuration: nextStepData.audioDuration,
        text: nextStepData.transcript,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Auto-play
      setTimeout(() => {
        handlePlayAudio(botMessage.id, nextStepData.audioUrl);
      }, 500);
    }, 1500);
  };

  const simulateTyping = (callback: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1500);
  };

  const showProductModal = () => {
    const createdProduct = createProductFromChat();
    if (createdProduct) {
      addMessage('✅ Votre annonce a été créée !', 'bot');
    }
  };

  const createProductFromChat = () => {
    console.log('🚀 Création du produit depuis le ChatBot...');
    console.log('📦 Données collectées:', collectedData);
    
    if (!validateCollectedData(collectedData)) {
      addMessage(
        "❌ Désolé, certaines informations sont manquantes. Recommençons.",
        'bot'
      );
      setTimeout(() => {
        setCollectedData({});
        setCurrentStep('welcome');
        addMessage("Bonjour ! Bienvenue sur MataMart, votre marketplace avicole. Que voulez-vous faire ?", 'bot');
        setTimeout(() => setShowOptions(true), 1000);
      }, 2000);
      return null;
    }
    
    const product: ProductFromChat = {
      name: collectedData.productType || 'Produit',
      category: collectedData.category || 'poultry',
      price: extractPriceFromRange(collectedData.price || ''),
      stock: extractQuantityFromRange(collectedData.quantity || ''),
      location: collectedData.location || 'Dakar',
      availability: mapAvailability(collectedData.availability || ''),
      description: generateDescription(collectedData),
      status: 'pending',
      images: collectedData.hasPhoto ? [] : undefined
    };
    
    console.log('✅ Produit transformé:', product);
    
    const existingProducts = JSON.parse(
      localStorage.getItem('my_products') || '[]'
    );
    
    const newProduct = {
      id: `chat-${Date.now()}`,
      ...product,
      createdAt: new Date().toISOString(),
      source: 'chatbot'
    };
    
    existingProducts.push(newProduct);
    localStorage.setItem('my_products', JSON.stringify(existingProducts));
    
    console.log('💾 Produit sauvegardé dans localStorage');
    
    window.dispatchEvent(new CustomEvent('productCreated', { 
      detail: { product: newProduct } 
    }));
    
    return newProduct;
  };

  const validateCollectedData = (data: Partial<ChatBotProductData>): boolean => {
    const required: (keyof ChatBotProductData)[] = [
      'action',
      'category',
      'productType',
      'quantity',
      'location',
      'price',
      'availability'
    ];
    
    const missing = required.filter(key => !data[key]);
    
    if (missing.length > 0) {
      console.warn('⚠️ Données manquantes:', missing);
      return false;
    }
    
    return true;
  };

  const extractPriceFromRange = (priceRange: string): number => {
    if (priceRange.includes('Moins de 1000')) return 800;
    if (priceRange.includes('1000 à 5000')) return 3000;
    if (priceRange.includes('5000 à 20000')) return 12000;
    return 25000;
  };

  const extractQuantityFromRange = (quantityRange: string): number => {
    if (quantityRange.includes('Moins de 10')) return 5;
    if (quantityRange.includes('10 à 50')) return 30;
    if (quantityRange.includes('50 à 100')) return 75;
    return 150;
  };

  const mapAvailability = (availability: string): 'immediate' | 'week' | 'month' => {
    if (availability.includes('Immédiatement')) return 'immediate';
    if (availability.includes('semaine')) return 'week';
    return 'month';
  };

  const generateDescription = (data: Partial<ChatBotProductData>): string => {
    return `${data.productType} disponible à ${data.location}. Quantité: ${data.quantity}. Prix: ${data.price}. Disponibilité: ${data.availability}.`;
  };

  const restartChat = () => {
    console.log('🔄 Redémarrage du chat...');
    
    // Confirmer si des données existent
    if (Object.keys(collectedData).length > 0) {
      const confirm = window.confirm('Êtes-vous sûr de vouloir recommencer ? Toutes les données seront perdues.');
      if (!confirm) return;
    }
    
    // Réinitialiser tout
    setCollectedData({});
    setUploadedPhotos([]);
    setSelectedPhotoIndex(0);
    setShowPhotoZoom(false);
    setZoomedPhotoIndex(0);
    setUploadingPreview(null);
    setDraggedPhotoIndex(null);
    setMessages([]);
    setCurrentFlow('main_menu');
    setFlowHistory([]);
    setCurrentStep('welcome');
    setUserInput('');
    setShowRecapModal(false);
    setIsTyping(false);
    
    // Arrêter l'audio en cours
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayingMessageId(null);
    
    // Démarrer avec le message de bienvenue du menu principal
    setTimeout(() => {
      const mainMenuData = allFlows['main_menu'];
      const welcomeStep = mainMenuData.steps['welcome'];
      
      const welcomeMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        type: 'bot',
        audioUrl: welcomeStep.audioUrl,
        audioDuration: welcomeStep.audioDuration,
        text: welcomeStep.transcript,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setMessages([welcomeMessage]);
      
      // Auto-play
      setTimeout(() => {
        handlePlayAudio(welcomeMessage.id, welcomeStep.audioUrl);
    }, 500);
    }, 300);
    
    console.log('✅ Chat redémarré - Menu principal');
  };

  // Initialize chat
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        const mainMenuData = allFlows['main_menu'];
        const welcomeStep = mainMenuData.steps['welcome'];
        
        const welcomeMessage: Message = {
          id: `msg-${Date.now()}-${Math.random()}`,
          type: 'bot',
          audioUrl: welcomeStep.audioUrl,
          audioDuration: welcomeStep.audioDuration,
          text: welcomeStep.transcript,
          timestamp: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };
        
        setMessages([welcomeMessage]);
        
        // Auto-play
        setTimeout(() => {
          handlePlayAudio(welcomeMessage.id, welcomeStep.audioUrl);
        }, 500);
      }, 500);
    }
  }, []);

  // Réinitialiser la photo sélectionnée quand on ferme/ouvre le modal
  useEffect(() => {
    if (showRecapModal) {
      setSelectedPhotoIndex(0);
    }
  }, [showRecapModal]);

  // Sauvegarder automatiquement les photos dans le cache
  useEffect(() => {
    if (uploadedPhotos.length > 0) {
      try {
        // Ne sauvegarder que les métadonnées pour économiser l'espace
        const photosMeta = uploadedPhotos.map((photo, index) => ({
          index,
          size: photo.length,
          preview: photo.substring(0, 100) // Juste le début pour identifier
        }));
        
        localStorage.setItem('draft_photos_meta', JSON.stringify(photosMeta));
        console.log('💾 Métadonnées photos sauvegardées');
      } catch (error) {
        console.warn('⚠️ Impossible de sauvegarder dans localStorage:', error);
      }
    }
  }, [uploadedPhotos]);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="bg-matix-yellow hover:bg-yellow-400 text-black rounded-full px-6 py-3 shadow-lg transition-all flex items-center gap-2 font-medium"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
          ChatBot
        </Button>
      </div>

      {/* Chat Modal - Structure corrigée avec input fixe */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`
            fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300
            ${isExpanded 
              ? 'w-[95vw] h-[95vh] max-w-6xl' 
              : 'w-96 h-[600px]'
            }
          `}>
            {/* Header */}
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#075e54">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Matix Bot</p>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    En ligne
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title={isExpanded ? 'Réduire' : 'Agrandir'}
                >
                  {isExpanded ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 14h6v6M20 10h-6V4"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5"/>
                  </svg>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

        {/* Breadcrumb de navigation entre flows */}
        <div className="bg-gray-50 border-b px-4 py-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <button 
              onClick={returnToMainMenu}
              className="hover:text-[#25d366] transition-colors"
            >
              🏠 Menu
            </button>
            
            {flowHistory.length > 0 && (
              <>
                <span>›</span>
                <button 
                  onClick={goBackFlow}
                  className="hover:text-[#25d366] transition-colors"
                >
                  {allFlows[flowHistory[flowHistory.length - 1]].icon}{' '}
                  {allFlows[flowHistory[flowHistory.length - 1]].name}
                </button>
              </>
            )}
            
            {currentFlow !== 'main_menu' && (
              <>
                <span>›</span>
                <span className="font-semibold text-[#25d366]">
                  {allFlows[currentFlow].icon} {allFlows[currentFlow].name}
                            </span>
              </>
            )}
                          </div>
        </div>

        {/* Indicateur d'étape amélioré */}
        <div className="bg-white border-b px-4 py-3 shrink-0 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Étape {getCurrentStepNumber()}/{getTotalSteps()}
            </span>
            <span className="text-xs text-gray-500">
              {Math.round((getCurrentStepNumber() / getTotalSteps()) * 100)}% complété
            </span>
          </div>
          
          {/* Barre de progression */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#25d366] to-[#20bd5a] transition-all duration-500 rounded-full"
              style={{ width: `${(getCurrentStepNumber() / getTotalSteps()) * 100}%` }}
            />
          </div>
          
          {/* Nom de l'étape actuelle */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            {getStepLabel(currentStep)}
          </p>
        </div>

            {/* Bouton flottant pour retour rapide */}
            {currentFlow !== 'main_menu' && (
                          <button 
                onClick={returnToMainMenu}
                className="absolute top-20 right-4 bg-white text-gray-700 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium border-2 border-gray-200 hover:border-[#25d366] z-10"
                          >
                🏠 Menu
                          </button>
            )}

            {/* Zone des messages - AVEC PADDING BOTTOM pour laisser place à l'input */}
            <div 
              className="flex-1 overflow-y-auto bg-[#e5ddd5] p-4 space-y-3"
              style={{ paddingBottom: '80px' }}
            >
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'bot' && (
                    <div className="flex items-end gap-2 max-w-[80%]">
                      <div className="bg-white rounded-lg rounded-bl-none shadow-sm p-2 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePlayAudio(message.id, message.audioUrl!)}
                            className="w-12 h-12 rounded-full bg-[#25d366] hover:bg-[#20bd5a] text-white flex items-center justify-center shrink-0 transition-all shadow-md"
                          >
                            {playingMessageId === message.id && isPlaying ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 flex items-center gap-[2px] h-8">
                            {Array.from({ length: 30 }).map((_, i) => {
                              const heights = [12, 24, 18, 30, 16, 28, 14, 26, 20, 32, 18, 24, 16, 28, 22, 26, 14, 30, 18, 24, 20, 28, 16, 26, 22, 30, 18, 24, 20, 26];
                              return (
                                <div
                                  key={i}
                                  className="w-[2px] rounded-full transition-all duration-100"
                                  style={{
                                    height: `${heights[i]}px`,
                                    backgroundColor: playingMessageId === message.id && isPlaying ? '#25d366' : '#d1d7db'
                                  }}
                                />
                              );
                            })}
                          </div>

                          <span className="text-xs text-gray-500 font-medium shrink-0">
                            {message.audioDuration || '0:15'}
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-400">{message.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="bg-[#d9fdd3] rounded-lg rounded-br-none shadow-sm px-4 py-2 max-w-[80%]">
                        <p className="text-4xl font-bold text-gray-800 text-center">
                          {message.text}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-400">{message.timestamp}</span>
                          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                            <path d="M5.5 7L2 3.5L0.5 5L5.5 10L15.5 0L14 -1.5L5.5 7Z" fill="#53bdeb"/>
                            <path d="M10.5 7L7 3.5L5.5 5L10.5 10L20.5 0L19 -1.5L10.5 7Z" fill="#53bdeb"/>
                          </svg>
                        </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div className="bg-white rounded-lg rounded-bl-none shadow-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

              <div ref={messagesEndRef} />
            </div>

            {/* ZONE INPUT FIXÉE EN BAS - Position absolute */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#f0f0f0] border-t border-gray-200 shrink-0">
              {currentStep !== 'photo' && (
                <div className="flex items-center gap-2 p-3">
                  <button 
                    onClick={restartChat}
                    className="text-gray-500 hover:text-gray-700 p-2 transition-colors"
                    title="Recommencer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </button>

                              <input
                    type={isNumberStep() ? 'number' : 'text'}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && userInput && handleSendNumber()}
                    placeholder={getInputPlaceholder()}
                    disabled={isTyping}
                    className="flex-1 bg-white rounded-full px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#25d366] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    min={isNumberStep() ? "1" : undefined}
                    max={isNumberStep() ? "9" : undefined}
                  />

                            <button
                    onClick={handleSendNumber}
                    disabled={!userInput || isTyping}
                    className="w-12 h-12 rounded-full bg-[#25d366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-all"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                            </button>
                          </div>
              )}

              {currentStep === 'photo' && (
                <div className="p-4">
                  {/* Titre et instructions */}
                  <div className="text-center mb-4">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      📸 Photos du produit
                    </p>
                    <p className="text-sm text-gray-600">
                      Ajoutez jusqu'à {MAX_PHOTOS} photos (obligatoire)
                    </p>
                  </div>

                  {/* Grille des photos */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Photos déjà uploadées */}
                    {uploadedPhotos.map((photo, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md group cursor-move"
                      >
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Badge numéro */}
                        <div className="absolute top-2 left-2 w-6 h-6 bg-[#25d366] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>

                        {/* Bouton supprimer */}
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>

                        {/* Badge "Photo principale" pour la première */}
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/70 text-white text-xs py-1 px-2 rounded-full text-center font-medium">
                              ⭐ Photo principale
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Prévisualisation pendant upload */}
                    {uploadingPreview && (
                      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={uploadingPreview}
                          alt="Chargement..."
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full"></div>
                        </div>
                      </div>
                    )}

                    {/* Boutons d'ajout (si moins de 4 photos) */}
                    {uploadedPhotos.length < MAX_PHOTOS && !uploadingPreview && (
                      <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#25d366] hover:bg-green-50 transition-all group">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={isUploadingPhoto}
                        />

                        {isUploadingPhoto ? (
                          <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-3 border-[#25d366] border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-xs text-gray-500">Chargement...</p>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-[#25d366] group-hover:text-white transition-all">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700 group-hover:text-[#25d366]">
                              Ajouter une photo
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {uploadedPhotos.length + 1}/{MAX_PHOTOS}
                            </p>
                          </div>
                        )}
                      </label>
                    )}

                    {/* Slots vides (pour montrer visuellement combien on peut ajouter) */}
                    {Array.from({ length: MAX_PHOTOS - uploadedPhotos.length - (uploadingPreview ? 1 : 0) }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center"
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                          <p className="text-xs text-gray-400">
                            {uploadedPhotos.length + i + 2}/{MAX_PHOTOS}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info et conseils */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" className="shrink-0">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold mb-1">💡 Conseils pour de bonnes photos :</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Prenez des photos claires et nettes</li>
                          <li>Éclairage naturel si possible</li>
                          <li>Montrez différents angles du produit</li>
                          <li>La première photo sera la photo principale</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-3">
                    {/* Bouton Continuer (actif seulement si au moins 1 photo) */}
                    <button
                      onClick={handleContinueAfterPhoto}
                      disabled={uploadedPhotos.length === 0}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-lg ${
                        uploadedPhotos.length > 0
                          ? 'bg-[#25d366] text-white hover:bg-[#20bd5a]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {uploadedPhotos.length === 0 ? (
                        <>❌ Ajoutez au moins 1 photo</>
                      ) : (
                        <>✓ Continuer ({uploadedPhotos.length} photo{uploadedPhotos.length > 1 ? 's' : ''})</>
                      )}
                    </button>

                    {/* Bouton Tout supprimer (si au moins 1 photo) */}
                    {uploadedPhotos.length > 0 && (
                      <button
                        onClick={clearAllPhotos}
                        className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all"
                      >
                        🗑️ Tout supprimer
                      </button>
                    )}
                  </div>

                  {/* Compteur */}
                  {uploadedPhotos.length > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-3">
                      {uploadedPhotos.length === MAX_PHOTOS ? (
                        <span className="text-green-600 font-semibold">
                          ✓ Maximum atteint ({MAX_PHOTOS}/{MAX_PHOTOS} photos)
                        </span>
                      ) : (
                        <span>
                          Vous pouvez encore ajouter {MAX_PHOTOS - uploadedPhotos.length} photo{MAX_PHOTOS - uploadedPhotos.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              <div className="px-4 py-2 text-center bg-gray-100 border-t">
                <p className="text-xs text-gray-500">
                  Powered by <span className="font-semibold text-[#25d366]">Matix AI</span>
                </p>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal récapitulatif */}
      {showRecapModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            <div className="bg-gradient-to-r from-[#25d366] to-[#20bd5a] text-white p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">🎉 Annonce Créée !</h3>
                  <p className="text-sm text-white/90">Voici le récapitulatif</p>
                </div>
                <button 
                  onClick={() => setShowRecapModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
                  </div>
                </div>

            <div className="p-6">
              {/* GALERIE DE PHOTOS */}
              {collectedData.photos && collectedData.photos.length > 0 && (
                <div className="mb-6">
                  {/* Photo principale (grande) */}
                  <div className="relative mb-3">
                    <img 
                      src={collectedData.photos[selectedPhotoIndex || 0]} 
                      alt="Photo principale" 
                      className="w-full h-80 object-cover rounded-xl shadow-lg cursor-zoom-in"
                      onClick={() => {
                        setZoomedPhotoIndex(selectedPhotoIndex || 0);
                        setShowPhotoZoom(true);
                      }}
                    />
                    
                    {/* Badge compteur */}
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {(selectedPhotoIndex || 0) + 1} / {collectedData.photos.length}
                    </div>

                    {/* Badge "Photo principale" */}
                    {(selectedPhotoIndex || 0) === 0 && (
                      <div className="absolute top-4 left-4 bg-[#25d366] text-white px-3 py-1 rounded-full text-sm font-semibold">
                        ⭐ Photo principale
                      </div>
                    )}

                    {/* Boutons navigation (si plusieurs photos) */}
                    {collectedData.photos.length > 1 && (
                      <>
                        {/* Bouton précédent */}
                        <button
                          onClick={() => setSelectedPhotoIndex(prev => 
                            prev === 0 ? collectedData.photos!.length - 1 : prev - 1
                          )}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"/>
                          </svg>
                        </button>

                        {/* Bouton suivant */}
                        <button
                          onClick={() => setSelectedPhotoIndex(prev => 
                            prev === collectedData.photos!.length - 1 ? 0 : prev + 1
                          )}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Miniatures (si plusieurs photos) */}
                  {collectedData.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {collectedData.photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPhotoIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                            (selectedPhotoIndex || 0) === index
                              ? 'ring-4 ring-[#25d366] scale-105'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={photo} 
                            alt={`Miniature ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Badge numéro */}
                          <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>

                          {/* Indicateur photo active */}
                          {(selectedPhotoIndex || 0) === index && (
                            <div className="absolute inset-0 border-2 border-[#25d366] rounded-lg"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Indicateurs points (style carousel) */}
                  {collectedData.photos.length > 1 && (
                    <div className="flex justify-center gap-2 mt-3">
                      {collectedData.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPhotoIndex(index)}
                          className={`transition-all ${
                            (selectedPhotoIndex || 0) === index
                              ? 'w-8 h-2 bg-[#25d366]'
                              : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                          } rounded-full`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type d'annonce</p>
                    <p className="text-xl font-bold text-gray-900">
                      {collectedData.action === 'sell' ? '🏷️ Vente' : '🛒 Achat'}
                    </p>
          </div>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Actif
                  </span>
        </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Produit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collectedData.productType || 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Catégorie</p>
                    <p className="font-bold text-gray-900 capitalize">
                      {collectedData.category || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Quantité</p>
                    <p className="font-bold text-gray-900">
                      {collectedData.quantity || 'N/A'} unités
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Prix par unité</p>
                  <p className="text-4xl font-bold text-green-700">
                    {collectedData.price || '0'} <span className="text-2xl">FCFA</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">📍 Localisation</p>
                    <p className="font-semibold text-gray-900">
                      {collectedData.location || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">⏰ Disponibilité</p>
                    <p className="font-semibold text-gray-900">
                      {getAvailabilityText(collectedData.availability || '')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowRecapModal(false);
                    restartChat();
                  }}
                  className="flex-1 px-5 py-3 border-2 border-[#25d366] text-[#25d366] rounded-xl font-bold hover:bg-green-50 transition-all"
                >
                  ➕ Nouvelle Annonce
                </button>
                <button
                  onClick={() => setShowRecapModal(false)}
                  className="flex-1 px-5 py-3 bg-[#25d366] text-white rounded-xl font-bold hover:bg-[#20bd5a] transition-all shadow-lg"
                >
                  ✓ Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de zoom plein écran */}
      {showPhotoZoom && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowPhotoZoom(false)}
        >
          <button
            onClick={() => setShowPhotoZoom(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <img 
            src={collectedData.photos![zoomedPhotoIndex]}
            alt="Photo agrandie"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navigation */}
          {collectedData.photos!.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedPhotoIndex(prev => 
                    prev === 0 ? collectedData.photos!.length - 1 : prev - 1
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedPhotoIndex(prev => 
                    prev === collectedData.photos!.length - 1 ? 0 : prev + 1
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </>
          )}

          {/* Compteur */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {zoomedPhotoIndex + 1} / {collectedData.photos!.length}
          </div>
        </div>
      )}
    </>
  );
}
