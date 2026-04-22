export interface Exercise {
  id: string;
  title: string;
  content: string;
  type: 'diction' | 'rhythm';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const DICTION_EXERCISES: Exercise[] = [
  {
    id: 'd1',
    title: 'Les Chaussettes',
    content: 'Les chaussettes de l’archiduchesse sont-elles sèches, archi-sèches ?',
    type: 'diction',
    difficulty: 'easy'
  },
  {
    id: 'd2',
    title: 'Le Chasseur',
    content: 'Un chasseur sachant chasser doit savoir chasser sans son chien.',
    type: 'diction',
    difficulty: 'medium'
  },
  {
    id: 'd3',
    title: ' Fruits Frais',
    content: 'Fruits frais, fruits frits, fruits cuits, fruits crus.',
    type: 'diction',
    difficulty: 'hard'
  },
  {
    id: 'd4',
    title: 'Le Pruneau',
    content: 'Un plein plat de blé pilé. Si tu piles ton blé pilé, quand pileras-tu ton plat de blé pilé ?',
    type: 'diction',
    difficulty: 'hard'
  }
];

export const RHYTHM_EXERCISES: Exercise[] = [
  {
    id: 'r1',
    title: 'Débit Staccato',
    content: 'Prononcez chaque syllabe de manière isolée et percutante.',
    type: 'rhythm',
    difficulty: 'medium'
  },
  {
    id: 'r2',
    title: 'Accélération Progressive',
    content: 'Commencez très lentement, puis accélérez jusqu’au maximum de votre débit sans perdre en clarté.',
    type: 'rhythm',
    difficulty: 'hard'
  }
];

export const IMPROV_TOPICS = [
  "Pourquoi le café est-il le moteur de la civilisation ?",
  "Vendre un parapluie troué à un désert.",
  "Le futur sera-t-il géré par les chats ?",
  "L'importance de l'ennui dans la créativité.",
  "Discours de remise de prix pour avoir retrouvé une chaussette perdue.",
  "Est-ce que l'espace-temps est une illusion ?",
  "Comment convaincre quelqu'un que la Terre est plate alors qu'il est sur l'ISS ?"
];

export const IMPROV_WORDS = [
  "Cacophonie", "Éphémère", "Inexorable", "Sédentaire", "Utopie", 
  "Subversif", "Paradoxe", "Éloquence", "Chimère", "Zéphyr",
  "Pétricor", "Nébuleux", "Sémantique", "Zèle", "Ubiquité"
];
