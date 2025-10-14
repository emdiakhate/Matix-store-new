'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minus, Play, Pause, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatBotProductData, ProductFromChat, transformChatDataToProduct } from '@/types/chatbot.types';
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
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fonction pour scroll automatique
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const chatFlow: Record<string, ChatStep> = {
    welcome: {
      id: 'welcome',
      audioUrl: demoAudioUrls.welcome,
      audioDuration: '0:15',
      transcript: audioScripts.welcome,
      options: [
        { number: 1, label: 'Vendre', next: 'category', value: 'sell' },
        { number: 2, label: 'Acheter', next: 'category', value: 'buy' }
      ]
    },
    
    category: {
      id: 'category',
      audioUrl: demoAudioUrls.category,
      audioDuration: '0:18',
      transcript: audioScripts.category,
      options: [
        { number: 1, label: 'Poulets/Poussins', next: 'poultry_type', value: 'poultry' },
        { number: 2, label: 'Matériel', next: 'equipment_type', value: 'equipment' },
        { number: 3, label: 'Médicaments', next: 'medicine_type', value: 'medicine' }
      ]
    },
    
    poultry_type: {
      id: 'poultry_type',
      audioUrl: demoAudioUrls.poultry_type,
      audioDuration: '0:20',
      transcript: audioScripts.poultry_type,
      options: [
        { number: 1, label: 'Poussins 1 jour', next: 'quantity', value: 'Poussins 1 jour' },
        { number: 2, label: 'Poulets de chair', next: 'quantity', value: 'Poulets de chair' },
        { number: 3, label: 'Poules pondeuses', next: 'quantity', value: 'Poules pondeuses' },
        { number: 4, label: 'Poulets fermiers', next: 'quantity', value: 'Poulets fermiers' }
      ]
    },
    
    equipment_type: {
      id: 'equipment_type',
      audioUrl: demoAudioUrls.equipment_type,
      audioDuration: '0:22',
      transcript: audioScripts.equipment_type,
      options: [
        { number: 1, label: 'Cages & poulaillers', next: 'quantity', value: 'Cages & poulaillers' },
        { number: 2, label: 'Mangeoires & abreuvoirs', next: 'quantity', value: 'Mangeoires & abreuvoirs' },
        { number: 3, label: 'Couveuses', next: 'quantity', value: 'Couveuses' },
        { number: 4, label: 'Chauffage & éclairage', next: 'quantity', value: 'Chauffage & éclairage' }
      ]
    },
    
    medicine_type: {
      id: 'medicine_type',
      audioUrl: demoAudioUrls.medicine_type,
      audioDuration: '0:18',
      transcript: audioScripts.medicine_type,
      options: [
        { number: 1, label: 'Vaccins', next: 'quantity', value: 'Vaccins' },
        { number: 2, label: 'Antibiotiques', next: 'quantity', value: 'Antibiotiques' },
        { number: 3, label: 'Vitamines', next: 'quantity', value: 'Vitamines' },
        { number: 4, label: 'Désinfectants', next: 'quantity', value: 'Désinfectants' }
      ]
    },
    
    quantity: {
      id: 'quantity',
      audioUrl: demoAudioUrls.quantity,
      audioDuration: '0:16',
      transcript: audioScripts.quantity,
      options: [
        { number: 1, label: 'Moins de 10', next: 'location', value: '5' },
        { number: 2, label: '10 à 50', next: 'location', value: '30' },
        { number: 3, label: '50 à 100', next: 'location', value: '75' },
        { number: 4, label: 'Plus de 100', next: 'location', value: '150' }
      ]
    },
    
    location: {
      id: 'location',
      audioUrl: demoAudioUrls.location,
      audioDuration: '0:20',
      transcript: audioScripts.location,
      options: [
        { number: 1, label: 'Dakar', next: 'price', value: 'Dakar' },
        { number: 2, label: 'Thiès', next: 'price', value: 'Thiès' },
        { number: 3, label: 'Saint-Louis', next: 'price', value: 'Saint-Louis' },
        { number: 4, label: 'Kaolack', next: 'price', value: 'Kaolack' },
        { number: 5, label: 'Ziguinchor', next: 'price', value: 'Ziguinchor' },
        { number: 6, label: 'Autre région', next: 'price', value: 'Autre' }
      ]
    },
    
    price: {
      id: 'price',
      audioUrl: demoAudioUrls.price,
      audioDuration: '0:18',
      transcript: audioScripts.price,
      options: [
        { number: 1, label: 'Moins de 1000 F', next: 'availability', value: '800' },
        { number: 2, label: '1000 à 5000 F', next: 'availability', value: '3000' },
        { number: 3, label: '5000 à 20000 F', next: 'availability', value: '12000' },
        { number: 4, label: 'Plus de 20000 F', next: 'availability', value: '25000' }
      ]
    },
    
    availability: {
      id: 'availability',
      audioUrl: demoAudioUrls.availability,
      audioDuration: '0:14',
      transcript: audioScripts.availability,
      options: [
        { number: 1, label: 'Immédiatement', next: 'photo', value: 'immediate' },
        { number: 2, label: 'Cette semaine', next: 'photo', value: 'week' },
        { number: 3, label: 'Ce mois', next: 'photo', value: 'month' }
      ]
    },
    
    photo: {
      id: 'photo',
      audioUrl: demoAudioUrls.photo,
      audioDuration: '0:12',
      transcript: audioScripts.photo,
      options: [] // Pas d'options numériques pour cette étape
    },
    
    end: {
      id: 'end',
      audioUrl: demoAudioUrls.end,
      audioDuration: '0:10',
      transcript: audioScripts.end,
      options: [
        { number: 1, label: 'Afficher mon annonce', next: null, value: 'show' },
        { number: 2, label: 'Recommencer', next: 'welcome', value: 'restart' }
      ]
    }
  };

  // Calculer la progression
  const totalSteps = 10;
  const currentStepNumber = Object.keys(chatFlow).indexOf(currentStep) + 1;

  // Fonctions helper pour la création de produit
  const extractPriceFromRange = (priceRange: string): number => {
    if (priceRange.includes('Moins de 1000')) return 800;
    if (priceRange.includes('1000 à 5000')) return 3000;
    if (priceRange.includes('5000 à 20000')) return 12000;
    return 25000; // Plus de 20000
  };

  const extractQuantityFromRange = (quantityRange: string): number => {
    if (quantityRange.includes('Moins de 10')) return 5;
    if (quantityRange.includes('10 à 50')) return 30;
    if (quantityRange.includes('50 à 100')) return 75;
    return 150; // Plus de 100
  };

  const mapAvailability = (availability: string): 'immediate' | 'week' | 'month' => {
    if (availability.includes('Immédiatement')) return 'immediate';
    if (availability.includes('semaine')) return 'week';
    return 'month';
  };

  const generateDescription = (data: Partial<ChatBotProductData>): string => {
    return `${data.productType} disponible à ${data.location}. Quantité: ${data.quantity}. Prix: ${data.price}. Disponibilité: ${data.availability}.`;
  };

  // Fonction de validation des données
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

  // Fonction de calcul de progression
  const calculateProgress = (): number => {
    const totalSteps = 8; // Nombre d'étapes pour créer une annonce
    const completedSteps = Object.keys(collectedData).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Fonction principale de création de produit
  const createProductFromChat = () => {
    console.log('🚀 Création du produit depuis le ChatBot...');
    console.log('📦 Données collectées:', collectedData);
    
    // Valider les données avant de créer le produit
    if (!validateCollectedData(collectedData)) {
      addMessage(
        "❌ Désolé, certaines informations sont manquantes. Recommençons.",
        'bot'
      );
      // Recommencer le flow
      setTimeout(() => {
        setCollectedData({});
        setCurrentStep('welcome');
        addMessage("Bonjour ! Bienvenue sur MataMart, votre marketplace avicole. Que voulez-vous faire ?", 'bot');
        setTimeout(() => setShowOptions(true), 1000);
      }, 2000);
      return null;
    }
    
    // Transformer les données
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
    
    // Sauvegarder dans localStorage (mode démo)
    const existingProducts = JSON.parse(
      localStorage.getItem('my_products') || '[]'
    );
    
    const newProduct = {
      id: `chat-${Date.now()}`,
      ...product,
      createdAt: new Date().toISOString(),
      source: 'chatbot' // Pour identifier l'origine
    };
    
    existingProducts.push(newProduct);
    localStorage.setItem('my_products', JSON.stringify(existingProducts));
    
    console.log('💾 Produit sauvegardé dans localStorage');
    
    // Dispatcher un événement pour notifier la page "Mes Produits"
    window.dispatchEvent(new CustomEvent('productCreated', { 
      detail: { product: newProduct } 
    }));
    
    return newProduct;
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
    
    // Si c'est un message bot et que l'audio auto est activé, jouer l'audio Wolof
    if (type === 'bot' && autoPlayAudio && currentStep) {
      setTimeout(() => {
        playStepAudio(currentStep);
      }, 500); // Petit délai pour que le message s'affiche d'abord
    }
  };

  const simulateTyping = async (callback: () => void) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);
    callback();
  };

  // Mapper les étapes aux clés de données
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

  // Valider que le nombre est dans la plage autorisée
  const isValidNumber = (num: number): boolean => {
    const currentStepData = chatFlow[currentStep];
    const validNumbers = currentStepData.options.map(opt => opt.number);
    return validNumbers.includes(num);
  };

  // Gérer l'envoi de numéro
  const handleSendNumber = () => {
    const number = parseInt(userInput);
    
    // Valider le numéro
    if (!isValidNumber(number)) {
      // Numéro invalide
      addMessage('❌ Numéro invalide', 'bot');
      setUserInput('');
      return;
    }

    const currentStepData = chatFlow[currentStep];
    const selectedOption = currentStepData.options.find(opt => opt.number === number);
    
    if (!selectedOption) {
      addMessage('❌ Numéro invalide', 'bot');
      setUserInput('');
      return;
    }
    
    console.log('✅ Option sélectionnée:', selectedOption);
    
    // Ajouter le message utilisateur (juste le chiffre)
    addMessage(number.toString(), 'user');
    
    // Sauvegarder la valeur collectée
    const dataKey = getDataKeyForStep(currentStep);
    if (dataKey && selectedOption.value) {
      setCollectedData(prev => ({
        ...prev,
        [dataKey]: selectedOption.value
      }));
    }
    
    // Passer à l'étape suivante
    if (selectedOption.next) {
        simulateTyping(() => {
        setCurrentStep(selectedOption.next!);
        const nextStepData = chatFlow[selectedOption.next!];
        addAudioMessage(nextStepData);
      });
    } else {
      // Fin du parcours
      if (selectedOption.value === 'show') {
        showProductModal();
      } else if (selectedOption.value === 'restart') {
        restartChat();
      }
    }
    
    // Réinitialiser l'input
    setUserInput('');
  };

  // Ajouter un message audio (bot)
  const addAudioMessage = (stepData: ChatStep) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text: stepData.transcript || '', // Pour debug
      type: 'bot',
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      audioUrl: stepData.audioUrl,
      audioDuration: stepData.audioDuration
    };
    
    setMessages(prev => [...prev, message]);
    
    // Auto-play l'audio
    setTimeout(() => {
      handlePlayAudio(message.id, stepData.audioUrl);
    }, 500);
  };

  // Gestion audio style WhatsApp
  const handlePlayAudio = (messageId: string, audioUrl: string) => {
    // Si on clique sur le même audio en cours de lecture
    if (playingMessageId === messageId && currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    // Arrêter l'audio précédent s'il existe
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Créer et jouer le nouvel audio
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

  // Upload de photo fonctionnel
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log('❌ Aucun fichier sélectionné');
      return;
    }

    console.log('📸 Fichier sélectionné:', file.name, file.type, file.size);
    
    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La photo est trop grande (max 5MB)');
      return;
    }

    setIsUploadingPhoto(true);

    // Convertir en base64
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      console.log('📤 Début de la lecture...');
    };
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        console.log(`📊 Progression: ${percent.toFixed(0)}%`);
      }
    };
    
    reader.onloadend = () => {
      const base64 = reader.result as string;
      console.log('✅ Photo convertie, taille:', base64.length, 'caractères');
      
      setUploadedPhoto(base64);
      setIsUploadingPhoto(false);
      
      // Sauvegarder dans les données collectées
      setCollectedData(prev => ({
        ...prev,
        photo: base64,
        hasPhoto: true
      }));
      
      console.log('💾 Photo sauvegardée dans collectedData');
    };
    
    reader.onerror = (error) => {
      console.error('❌ Erreur lecture fichier:', error);
      alert('Erreur lors du chargement de la photo');
      setIsUploadingPhoto(false);
    };

    // Démarrer la lecture
    reader.readAsDataURL(file);
  };

  const handleContinueAfterPhoto = () => {
    if (!uploadedPhoto) {
      alert('Veuillez d\'abord ajouter une photo');
      return;
    }

    console.log('➡️ Passage à l\'étape finale avec photo');
    
    // Ajouter un message utilisateur
    const photoMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: 'user',
      text: '📸 Photo ajoutée',
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    setMessages(prev => [...prev, photoMessage]);

    // Passer à l'étape finale
    setIsTyping(true);
    
    setTimeout(() => {
      setCurrentStep('end');
      const endStepData = chatFlow['end'];
      
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

      // Afficher le modal récapitulatif
      setTimeout(() => {
        setShowRecapModal(true);
      }, 2000);
    }, 1500);
  };

  const getAvailabilityText = (availability: string) => {
    switch(availability) {
      case 'immediate': return 'Immédiatement';
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      default: return 'N/A';
    }
  };

  // Fonctions helper pour l'interface
  const getCurrentStepNumber = (): number => {
    const stepOrder = ['welcome', 'category', 'poultry_type', 'equipment_type', 'medicine_type', 'quantity', 'location', 'price', 'availability', 'photo', 'end'];
    return stepOrder.indexOf(currentStep) + 1;
  };

  const getTotalSteps = (): number => {
    return 10; // Nombre total d'étapes
  };

  const isNumberStep = (): boolean => {
    const numberSteps = ['welcome', 'category', 'poultry_type', 'equipment_type', 'medicine_type', 'quantity', 'location', 'price', 'availability'];
    return numberSteps.includes(currentStep);
  };

  const getInputPlaceholder = (): string => {
    if (currentStep === 'welcome') return 'Tapez le numéro...';
    if (currentStep === 'category') return 'Tapez le numéro...';
    if (currentStep === 'poultry_type' || currentStep === 'equipment_type' || currentStep === 'medicine_type') return 'Tapez le numéro...';
    if (currentStep === 'quantity') return 'Tapez le numéro...';
    if (currentStep === 'location') return 'Tapez le numéro...';
    if (currentStep === 'price') return 'Tapez le numéro...';
    if (currentStep === 'availability') return 'Tapez le numéro...';
    return 'Tapez votre réponse...';
  };

  // Afficher le modal du produit créé
  const showProductModal = () => {
    const createdProduct = createProductFromChat();
    if (createdProduct) {
      addMessage('✅ Votre annonce a été créée !', 'bot');
      // Ici on pourrait ouvrir un modal avec les détails du produit
    }
  };


  const playAudio = (audioId: string) => {
    const audioUrl = "https://raw.githubusercontent.com/iantrepreneur/bank_audio/main/AUDIO-2025-06-30-14-18-39.m4a";
    
    if (playingAudio === audioId) {
      // Pause audio
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      setPlayingAudio(null);
    } else {
      // Stop current audio if playing
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      
      // Play new audio
      const newAudio = new Audio(audioUrl);
      newAudio.play().catch(err => {
        if (err.name === 'AbortError') {
          console.log('Audio playback interrupted:', err.message);
        } else {
          console.error('Error playing audio:', err);
        }
        // Fallback: simulate audio playing
        setPlayingAudio(audioId);
        setTimeout(() => setPlayingAudio(null), 3000);
      });
      
      newAudio.onended = () => {
        setPlayingAudio(null);
        setAudio(null);
      };
      
      setAudio(newAudio);
      setPlayingAudio(audioId);
    }
  };

  const restartChat = () => {
    setMessages([]);
    setCurrentStep('welcome');
    setUserInput('');
    setIsTyping(false);
    setIsPlaying(null);
    setCollectedData({}); // Réinitialiser les données collectées
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    
    // Start fresh conversation
    setTimeout(() => {
        const welcomeStep = chatFlow.welcome;
      addAudioMessage(welcomeStep);
    }, 500);
  };

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
          const welcomeStep = chatFlow.welcome;
        addAudioMessage(welcomeStep);
      }, 500);
    }
  }, [isOpen, messages.length]);

  // Logger les données collectées
  useEffect(() => {
    console.log('📊 Données collectées:', collectedData);
  }, [collectedData]);

  // Scroll automatique vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Précharger les fichiers audio au montage du composant
  useEffect(() => {
    preloadAudioFiles();
  }, []);

  // Auto-play du premier message
  useEffect(() => {
    if (messages.length === 1 && messages[0].type === 'bot') {
      // Auto-play le message de bienvenue
      setTimeout(() => {
        if (messages[0].audioUrl) {
          toggleAudio(messages[0].audioUrl);
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);
  const currentStepData = chatFlow[currentStep];

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="bg-matix-yellow hover:bg-yellow-400 text-black rounded-full px-6 py-3 shadow-lg transition-all flex items-center gap-2 font-medium"
          onClick={() => setIsOpen(true)}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Demander à Adja
        </Button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`bg-white rounded-2xl relative shadow-matix-lg flex flex-col border border-gray-200 transition-all duration-300 ${
            isExpanded 
              ? 'w-[95vw] h-[95vh] max-w-6xl' 
              : 'w-80 h-96'
          }`}>
            {/* Header - Style WhatsApp */}
            <div className="bg-[#075e54] text-white p-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#075e54">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">MataMart Bot</p>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    En ligne
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Bouton agrandir/réduire */}
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

                {/* Bouton minimiser */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5"/>
                  </svg>
                </button>

                {/* Bouton fermer */}
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

            {/* Chat Content - Only show if not minimized */}
            {!isMinimized && (
              <>
                {/* Indicateur de progression des étapes */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
                  <span className="text-sm font-medium text-gray-700">
                    Étape {currentStepNumber}/{totalSteps}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(totalSteps)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-6 h-1 rounded-full ${
                          i < currentStepNumber ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Indicateur de progression des données */}
                {Object.keys(collectedData).length > 0 && (
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Progression</span>
                      <span className="text-xs font-medium text-green-600">
                        {calculateProgress()}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Zone des messages - Style WhatsApp exact */}
                <div className="flex-1 overflow-y-auto bg-[#e5ddd5] p-4 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {/* MESSAGE BOT - Audio vocal style WhatsApp */}
                      {message.type === 'bot' && (
                        <div className="flex items-end gap-2 max-w-[80%]">
                          {/* Bulle verte claire comme WhatsApp */}
                          <div className="bg-white rounded-lg rounded-bl-none shadow-sm p-2 min-w-[200px]">
                            {/* Lecteur audio */}
                            <div className="flex items-center gap-2">
                              {/* Bouton Play/Pause circulaire vert */}
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

                              {/* Visualiseur d'ondes audio */}
                              <div className="flex-1 flex items-center gap-[2px] h-8">
                                {Array.from({ length: 30 }).map((_, i) => {
                                  const heights = [12, 24, 18, 30, 16, 28, 14, 26, 20, 32, 18, 24, 16, 28, 22, 26, 14, 30, 18, 24, 20, 28, 16, 26, 22, 30, 18, 24, 20, 26];
                                  return (
                                    <div
                                      key={i}
                                      className="w-[2px] rounded-full transition-all duration-100"
                                      style={{
                                        height: `${heights[i]}px`,
                                        backgroundColor: playingMessageId === message.id && isPlaying 
                                          ? '#25d366' 
                                          : '#d1d7db'
                                      }}
                                    />
                                  );
                                })}
                              </div>

                              {/* Durée */}
                              <span className="text-xs text-gray-500 font-medium shrink-0">
                                {message.audioDuration || '0:15'}
                              </span>
                            </div>

                            {/* Timestamp en bas à droite */}
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[10px] text-gray-400">
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MESSAGE USER - Chiffre dans bulle verte foncée */}
                      {message.type === 'user' && (
                        <div className="flex justify-end">
                          <div className="bg-[#d9fdd3] rounded-lg rounded-br-none shadow-sm px-4 py-2 max-w-[80%]">
                            {/* Le chiffre en grand */}
                            <p className="text-4xl font-bold text-gray-800 text-center">
                              {message.text}
                            </p>

                            {/* Timestamp en bas à droite */}
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-[10px] text-gray-400">
                                {message.timestamp}
                              </span>
                              {/* Double check vert WhatsApp */}
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

                  {/* Indicateur "En train d'écrire..." */}
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

                  {/* Ref pour scroll automatique */}
                  <div ref={messagesEndRef} />

                  {/* Zone d'input - Exactement comme WhatsApp */}
                  <div className="bg-[#f0f0f0] border-t border-gray-200">
                    {/* Input normal (pour les chiffres) */}
                    {currentStep !== 'photo' && (
                      <div className="flex items-center gap-2 p-3">
                        {/* Emoji button */}
                        <button className="text-gray-500 hover:text-gray-700 p-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
                            <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
                            <path d="M9 14s1 2 3 2 3-2 3-2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                        </button>

                        {/* Input */}
                        <input
                          type="number"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && userInput && handleSendNumber()}
                          placeholder="Tapez le numéro..."
                          disabled={isTyping}
                          className="flex-1 bg-white rounded-full px-4 py-2 text-lg focus:outline-none disabled:opacity-50"
                          min="1"
                          max="9"
                        />

                        {/* Bouton d'envoi circulaire vert */}
                        <button
                          onClick={handleSendNumber}
                          disabled={!userInput || isTyping}
                          className="w-12 h-12 rounded-full bg-[#25d366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-all"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Zone d'upload photo */}
                    {currentStep === 'photo' && (
                      <div className="p-4">
                        {!uploadedPhoto ? (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">
                              📸 Ajoutez une photo de votre produit (obligatoire)
                            </p>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="photo-upload"
                              />
                              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#25d366] text-white rounded-full hover:bg-[#20bd5a] transition-all shadow-lg">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <span className="font-medium">Choisir une photo</span>
                              </div>
                            </label>
                          </div>
                        ) : (
                          <div className="text-center">
                            {/* Afficher la photo uploadée */}
                            <div className="mb-4 relative inline-block">
                              <img 
                                src={uploadedPhoto} 
                                alt="Produit" 
                                className="w-48 h-48 object-cover rounded-xl shadow-lg"
                              />
                              {/* Bouton pour changer la photo */}
                              <button
                                onClick={() => {
                                  setUploadedPhoto(null);
                                  setCollectedData(prev => ({ ...prev, photo: null, hasPhoto: false }));
                                }}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                              >
                                ✕
                              </button>
                            </div>
                            
                            <p className="text-sm text-green-600 font-medium mb-3">
                              ✓ Photo ajoutée avec succès
                            </p>
                            
                            {/* Bouton Continuer */}
                            <button
                              onClick={handleContinueAfterPhoto}
                              className="px-8 py-3 bg-[#25d366] text-white rounded-full hover:bg-[#20bd5a] transition-all shadow-lg font-medium"
                            >
                              Continuer →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer amélioré */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (confirm('Voulez-vous vraiment recommencer ?')) {
                          restartChat();
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Recommencer"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <span className="text-xs text-gray-500">
                      Powered by Matix AI
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal récapitulatif - Affiché à la fin */}
      {showRecapModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            {/* Header vert */}
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
              {/* Photo en grand */}
              {collectedData.photo && (
                <div className="mb-6">
                  <img 
                    src={collectedData.photo} 
                    alt="Produit" 
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* Informations */}
              <div className="space-y-4">
                {/* Type d'annonce */}
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

                {/* Produit */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Produit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collectedData.productType || 'N/A'}
                  </p>
                </div>

                {/* Grille d'infos */}
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

                {/* Prix */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Prix par unité</p>
                  <p className="text-4xl font-bold text-green-700">
                    {collectedData.price || '0'} <span className="text-2xl">FCFA</span>
                  </p>
                </div>

                {/* Localisation et disponibilité */}
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
                      {getAvailabilityText(collectedData.availability)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
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

      <style jsx>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #9ca3af;
          animation: typing 1.4s infinite ease-in-out;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}