export const audioFiles = {
  welcome: '/audio/wolof/welcome.mp3',
  sell_category: '/audio/wolof/sell_category.mp3',
  buy_category: '/audio/wolof/buy_category.mp3',
  poultry_type: '/audio/wolof/poultry_type.mp3',
  equipment_type: '/audio/wolof/equipment_type.mp3',
  medicine_type: '/audio/wolof/medicine_type.mp3',
  quantity: '/audio/wolof/quantity.mp3',
  location: '/audio/wolof/location.mp3',
  price: '/audio/wolof/price.mp3',
  availability: '/audio/wolof/availability.mp3',
  photo: '/audio/wolof/photo.mp3',
  end: '/audio/wolof/end.mp3',
};

export const getAudioForStep = (step: string): string => {
  return audioFiles[step as keyof typeof audioFiles] || audioFiles.welcome;
};

export const playStepAudio = (step: string) => {
  const audioUrl = getAudioForStep(step);
  const audio = new Audio(audioUrl);
  
  audio.play().catch(error => {
    console.error('Erreur lecture audio:', error);
    // Fallback: utiliser l'audio générique si le fichier Wolof n'existe pas
    const fallbackAudio = new Audio("https://raw.githubusercontent.com/iantrepreneur/bank_audio/main/AUDIO-2025-06-30-14-18-39.m4a");
    fallbackAudio.play().catch(fallbackError => {
      console.error('Erreur lecture audio fallback:', fallbackError);
    });
  });
};

export const stopAllAudio = () => {
  // Arrêter tous les éléments audio en cours
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    if (audio instanceof HTMLAudioElement) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
};

export const preloadAudioFiles = () => {
  // Précharger les fichiers audio pour une lecture plus fluide
  Object.values(audioFiles).forEach(audioUrl => {
    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
  });
};
