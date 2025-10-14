export const audioScripts = {
  welcome: "Bienvenue sur MataMart. Appuyez 1 pour vendre, ou 2 pour acheter.",
  category: "Quelle catégorie ? Appuyez 1 pour poulets et poussins, 2 pour matériel et équipements, ou 3 pour vaccins et médicaments.",
  poultry_type: "Quel type de volaille ? 1 pour poussins d'un jour, 2 pour poulets de chair, 3 pour poules pondeuses, ou 4 pour poulets fermiers.",
  equipment_type: "Quel type de matériel ? 1 pour cages et poulaillers, 2 pour mangeoires et abreuvoirs, 3 pour couveuses, ou 4 pour chauffage et éclairage.",
  medicine_type: "Quels produits vétérinaires ? 1 pour vaccins, 2 pour antibiotiques, 3 pour vitamines, ou 4 pour désinfectants.",
  quantity: "Quelle quantité ? 1 pour moins de 10 unités, 2 pour 10 à 50, 3 pour 50 à 100, ou 4 pour plus de 100.",
  location: "Où êtes-vous situé ? 1 pour Dakar, 2 pour Thiès, 3 pour Saint-Louis, 4 pour Kaolack, 5 pour Ziguinchor, ou 6 pour une autre région.",
  price: "Quel est le prix par unité en francs CFA ? 1 pour moins de mille, 2 pour mille à cinq mille, 3 pour cinq mille à vingt mille, ou 4 pour plus de vingt mille.",
  availability: "Quand est-ce disponible ? 1 pour immédiatement, 2 pour cette semaine, ou 3 pour ce mois.",
  photo: "Appuyez 1 pour ajouter une photo de votre produit. La photo est obligatoire.",
  end: "Merci ! Votre annonce est prête. Appuyez 1 pour l'afficher, ou 2 pour créer une nouvelle annonce."
};

// Fonction pour générer un audio avec Web Speech API (pour démo)
export const generateDemoAudio = (text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject('Speech synthesis not supported');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Légèrement plus lent
    utterance.pitch = 1;
    
    speechSynthesis.speak(utterance);
    
    // Pour la démo, on retourne juste un placeholder
    resolve('/audio/placeholder.mp3');
  });
};

// URLs des audios (à remplacer par vrais audios Wolof)
export const demoAudioUrls: Record<string, string> = {
  welcome: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
  category: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  poultry_type: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  equipment_type: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  medicine_type: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  quantity: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  location: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  price: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  availability: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  photo: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  end: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
};
