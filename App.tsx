import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Trophy, Skull, Mic, Shirt, Video, Music, Sparkles, Crown, Gavel, RefreshCw, Settings,
  BarChart3, Video as VideoIcon, MessageSquare, HeartCrack, Star, Scissors, Palette,
  Clapperboard, Music2, Smile, Zap, HelpCircle, Users, CheckCircle, XCircle, Megaphone, Gem
} from 'lucide-react';

// --- Types & Data ---

type StatCategory = 'acting' | 'improv' | 'comedy' | 'dance' | 'design' | 'singing' | 'rusical' | 'rumix' | 'makeover' | 'lipsync';
type Stats = Record<StatCategory, number>;

type ConfessionalContext =
  | 'judging'
  | 'werkroom'
  | 'untucked'
  | 'evolution'
  | 'legacy'
  | 'challenge'
  | 'lipSync';

type ConfessionalEntry = {
  text: string;
  episode: number;
  reason: string;
  context: ConfessionalContext;
};

type Placement =
  | 'WIN'
  | 'WIN+RTRN'
  | 'WIN+OUT'
  | 'TOP2'
  | 'HIGH'
  | 'SAFE'
  | 'LOW'
  | 'BTM2'
  | 'OUT'
  | 'ELIM'
  | 'RUNNER-UP'
  | 'WINNER'
  | 'N/A'
  | '';

type QueenForm = {
  name: string;
  dexId: number;
  originalName: string;
  stats: Stats;
  personality: string;
  entranceLine: string;
};

type QueenTemplate = {
  id: number;
  forms: QueenForm[];
};

type SeasonMode = 'final' | 'evolve';

interface Queen {
  id: number;
  dexId: number;
  name: string;
  originalName: string;
  stats: Stats;
  personality: string;
  entranceLine: string;
  trackRecord: Placement[];
  status: 'active' | 'eliminated' | 'winner' | 'runner-up';
  confessionals: ConfessionalEntry[];
  group?: 1 | 2; // For split premiere
  evolutionLine?: QueenForm[];
  evolutionStage?: number;
}

const QUEEN_BLUEPRINTS: QueenTemplate[] = [
  {
    id: 1,
    forms: [
      {
        name: "Ralts O'Hara",
        originalName: 'Ralts',
        dexId: 280,
        personality: 'Baby Clairvoyant',
        entranceLine: "I saw this glow-up coming before I hatched.",
        stats: { acting: 5, improv: 4, comedy: 4, dance: 5, design: 6, singing: 5, rusical: 5, rumix: 4, makeover: 6, lipsync: 5 }
      },
      {
        name: "Kirlia O'Hara",
        originalName: 'Kirlia',
        dexId: 281,
        personality: 'Telekinetic Tease',
        entranceLine: "Grace, glamour, and a little psychic side-eye.",
        stats: { acting: 6, improv: 5, comedy: 5, dance: 7, design: 7, singing: 6, rusical: 6, rumix: 6, makeover: 8, lipsync: 6 }
      },
      {
        name: "Gardevoir O'Hara",
        originalName: 'Gardevoir',
        dexId: 10051,
        personality: 'The Perfectionist',
        entranceLine: "I saw the future, and it looks like I'm holding the crown.",
        stats: { acting: 8, improv: 6, comedy: 5, dance: 9, design: 9, singing: 7, rusical: 8, rumix: 7, makeover: 10, lipsync: 8 }
      }
    ]
  },
  {
    id: 2,
    forms: [
      {
        name: 'Buneary Bonina Brown',
        originalName: 'Buneary',
        dexId: 427,
        personality: 'Jumpstart Diva',
        entranceLine: "Bun up, babe. This bunny is bouncing to the bank.",
        stats: { acting: 4, improv: 4, comedy: 5, dance: 7, design: 6, singing: 4, rusical: 6, rumix: 6, makeover: 5, lipsync: 7 }
      },
      {
        name: 'Lopunny Bonina Brown',
        originalName: 'Lopunny',
        dexId: 428,
        personality: 'Lip Sync Assassin',
        entranceLine: "Hop on board, honey. This ride only goes to the top.",
        stats: { acting: 5, improv: 4, comedy: 6, dance: 10, design: 7, singing: 4, rusical: 9, rumix: 9, makeover: 6, lipsync: 10 }
      }
    ]
  },
  {
    id: 3,
    forms: [
      {
        name: 'Bounsweet Versace',
        originalName: 'Bounsweet',
        dexId: 761,
        personality: 'Juicy Baby Doll',
        entranceLine: "Sweet? Yes. Innocent? Absolutely not.",
        stats: { acting: 3, improv: 3, comedy: 5, dance: 6, design: 7, singing: 4, rusical: 5, rumix: 5, makeover: 6, lipsync: 6 }
      },
      {
        name: 'Steenee Versace',
        originalName: 'Steenee',
        dexId: 762,
        personality: 'Sugar-Coated Schemer',
        entranceLine: "I'm cute, I'm sweet, and I'm plotting your demise.",
        stats: { acting: 5, improv: 5, comedy: 6, dance: 7, design: 8, singing: 5, rusical: 6, rumix: 7, makeover: 7, lipsync: 8 }
      },
      {
        name: 'Tsareena Versace',
        originalName: 'Tsareena',
        dexId: 763,
        personality: 'Fashion Queen',
        entranceLine: 'Bow down. Royalty has arrived.',
        stats: { acting: 4, improv: 3, comedy: 4, dance: 8, design: 10, singing: 5, rusical: 7, rumix: 8, makeover: 9, lipsync: 7 }
      }
    ]
  },
  {
    id: 4,
    forms: [
      {
        name: 'Popplio Grande',
        originalName: 'Popplio',
        dexId: 728,
        personality: 'Seafoam Starlet',
        entranceLine: "It's bubbles, it's glitter, it's Popplio perfection!",
        stats: { acting: 5, improv: 5, comedy: 5, dance: 5, design: 5, singing: 7, rusical: 7, rumix: 6, makeover: 5, lipsync: 6 }
      },
      {
        name: 'Brionne Grande',
        originalName: 'Brionne',
        dexId: 729,
        personality: 'Splashy Showgirl',
        entranceLine: "Cue the key change, darling. I'm evolving mid-chorus.",
        stats: { acting: 6, improv: 5, comedy: 5, dance: 6, design: 6, singing: 9, rusical: 9, rumix: 7, makeover: 6, lipsync: 7 }
      },
      {
        name: 'Primarina Grande',
        originalName: 'Primarina',
        dexId: 730,
        personality: 'Broadway Diva',
        entranceLine: "Listen closely, that's the sound of a winner.",
        stats: { acting: 7, improv: 6, comedy: 5, dance: 6, design: 6, singing: 10, rusical: 10, rumix: 8, makeover: 7, lipsync: 8 }
      }
    ]
  },
  {
    id: 5,
    forms: [
      {
        name: 'Smoochum Monsoon',
        originalName: 'Smoochum',
        dexId: 238,
        personality: 'Frosted Baby Brat',
        entranceLine: "Pucker up, losers. The baby just stole your spotlight.",
        stats: { acting: 6, improv: 6, comedy: 6, dance: 4, design: 3, singing: 7, rusical: 7, rumix: 4, makeover: 2, lipsync: 6 }
      },
      {
        name: 'Jynx Monsoon',
        originalName: 'Jynx',
        dexId: 124,
        personality: 'Camp Comedy Legend',
        entranceLine: "Did someone order a frosty treat with extra spice?",
        stats: { acting: 10, improv: 10, comedy: 10, dance: 5, design: 4, singing: 9, rusical: 9, rumix: 5, makeover: 3, lipsync: 9 }
      }
    ]
  },
  {
    id: 6,
    forms: [
      {
        name: 'Salandit Visage',
        originalName: 'Salandit',
        dexId: 757,
        personality: 'Toxic Tease',
        entranceLine: 'Poison kisses only, darling.',
        stats: { acting: 6, improv: 5, comedy: 5, dance: 6, design: 4, singing: 4, rusical: 5, rumix: 6, makeover: 4, lipsync: 7 }
      },
      {
        name: 'Salazzle Visage',
        originalName: 'Salazzle',
        dexId: 758,
        personality: 'The Villain',
        entranceLine: "I didn't come here to make friends, I came to make headlines.",
        stats: { acting: 9, improv: 8, comedy: 7, dance: 7, design: 5, singing: 6, rusical: 7, rumix: 8, makeover: 5, lipsync: 9 }
      }
    ]
  },
  {
    id: 7,
    forms: [
      {
        name: 'Feebas Colby',
        originalName: 'Feebas',
        dexId: 349,
        personality: 'Underdog Dreamer',
        entranceLine: "I'm the makeover episode waiting to happen.",
        stats: { acting: 4, improv: 4, comedy: 5, dance: 5, design: 5, singing: 5, rusical: 5, rumix: 5, makeover: 6, lipsync: 6 }
      },
      {
        name: 'Milotic Colby',
        originalName: 'Milotic',
        dexId: 350,
        personality: 'Pageant Queen',
        entranceLine: "Beauty fades, but dumb is forever. Luckily, I'm just beautiful.",
        stats: { acting: 5, improv: 4, comedy: 3, dance: 6, design: 10, singing: 6, rusical: 6, rumix: 6, makeover: 10, lipsync: 7 }
      }
    ]
  },
  {
    id: 8,
    forms: [
      {
        name: 'Gothita Delano',
        originalName: 'Gothita',
        dexId: 574,
        personality: 'Baby Goth Icon',
        entranceLine: "I'm baby, I'm emo, and I'm booked.",
        stats: { acting: 6, improv: 5, comedy: 6, dance: 3, design: 6, singing: 4, rusical: 5, rumix: 4, makeover: 5, lipsync: 5 }
      },
      {
        name: 'Gothorita Delano',
        originalName: 'Gothorita',
        dexId: 575,
        personality: 'Teenage Terror',
        entranceLine: "I don't brood, I book gigs.",
        stats: { acting: 7, improv: 6, comedy: 7, dance: 4, design: 7, singing: 4, rusical: 5, rumix: 5, makeover: 6, lipsync: 6 }
      },
      {
        name: 'Gothitelle Delano',
        originalName: 'Gothitelle',
        dexId: 576,
        personality: 'Moody Alt-Girl',
        entranceLine: "It's not a phase, mom. It's a competition.",
        stats: { acting: 8, improv: 7, comedy: 8, dance: 4, design: 8, singing: 5, rusical: 6, rumix: 5, makeover: 7, lipsync: 7 }
      }
    ]
  },
  {
    id: 9,
    forms: [
      {
        name: 'Hatenna Oddly',
        originalName: 'Hatenna',
        dexId: 856,
        personality: 'Quiet Storm',
        entranceLine: "Shh... the psychic slay is loading.",
        stats: { acting: 4, improv: 4, comedy: 3, dance: 2, design: 7, singing: 3, rusical: 4, rumix: 3, makeover: 6, lipsync: 4 }
      },
      {
        name: 'Hattrem Oddly',
        originalName: 'Hattrem',
        dexId: 857,
        personality: 'Pastel Menace',
        entranceLine: "Speak softly and carry a huge wig.",
        stats: { acting: 5, improv: 5, comedy: 4, dance: 3, design: 8, singing: 4, rusical: 4, rumix: 4, makeover: 7, lipsync: 5 }
      },
      {
        name: 'Hatterene Oddly',
        originalName: 'Hatterene',
        dexId: 858,
        personality: 'Silent but Deadly',
        entranceLine: '...',
        stats: { acting: 6, improv: 5, comedy: 4, dance: 3, design: 10, singing: 4, rusical: 5, rumix: 4, makeover: 9, lipsync: 6 }
      }
    ]
  },
  {
    id: 10,
    forms: [
      {
        name: 'Snorunt Davenport',
        originalName: 'Snorunt',
        dexId: 361,
        personality: 'Chilly Rascal',
        entranceLine: "Bundle up, I'm bringing a cold front of charisma.",
        stats: { acting: 5, improv: 5, comedy: 4, dance: 6, design: 6, singing: 4, rusical: 5, rumix: 5, makeover: 6, lipsync: 6 }
      },
      {
        name: 'Froslass Davenport',
        originalName: 'Froslass',
        dexId: 478,
        personality: 'Ice Queen',
        entranceLine: "Hope you packed a coat, it's about to get chilly at the top.",
        stats: { acting: 7, improv: 6, comedy: 5, dance: 8, design: 9, singing: 6, rusical: 7, rumix: 7, makeover: 8, lipsync: 8 }
      }
    ]
  },
  {
    id: 11,
    forms: [
      {
        name: 'Fennekin Mattel',
        originalName: 'Fennekin',
        dexId: 653,
        personality: 'Foxfire Freshman',
        entranceLine: 'Someone called for a tiny torch of talent?',
        stats: { acting: 6, improv: 6, comedy: 6, dance: 4, design: 5, singing: 5, rusical: 6, rumix: 4, makeover: 4, lipsync: 5 }
      },
      {
        name: 'Braixen Mattel',
        originalName: 'Braixen',
        dexId: 654,
        personality: 'Wand Waver',
        entranceLine: "Glitter? Check. Wand? Check. Your wigs? Gone.",
        stats: { acting: 7, improv: 7, comedy: 7, dance: 5, design: 6, singing: 6, rusical: 7, rumix: 5, makeover: 5, lipsync: 6 }
      },
      {
        name: 'Delphox Mattel',
        originalName: 'Delphox',
        dexId: 655,
        personality: 'Comedy Witch',
        entranceLine: "Abracadabra, bitches!",
        stats: { acting: 9, improv: 9, comedy: 9, dance: 6, design: 7, singing: 7, rusical: 8, rumix: 6, makeover: 6, lipsync: 7 }
      }
    ]
  },
  {
    id: 12,
    forms: [
      {
        name: 'Nidoran Momma',
        originalName: 'Nidoran♀',
        dexId: 29,
        personality: 'Spiky Sweetheart',
        entranceLine: "Mama's little needle is ready to prick egos.",
        stats: { acting: 5, improv: 5, comedy: 5, dance: 5, design: 4, singing: 6, rusical: 6, rumix: 7, makeover: 4, lipsync: 7 }
      },
      {
        name: 'Nidorina Momma',
        originalName: 'Nidorina',
        dexId: 30,
        personality: 'Protective Matriarch',
        entranceLine: "I'm half den mother, half demolition crew.",
        stats: { acting: 6, improv: 6, comedy: 6, dance: 6, design: 5, singing: 7, rusical: 7, rumix: 8, makeover: 4, lipsync: 8 }
      },
      {
        name: 'Nidoqueen Latifah',
        originalName: 'Nidoqueen',
        dexId: 31,
        personality: 'The Mother',
        entranceLine: "Mama's home, and she brought cookies... and whoop-ass.",
        stats: { acting: 8, improv: 8, comedy: 7, dance: 7, design: 6, singing: 8, rusical: 8, rumix: 9, makeover: 5, lipsync: 9 }
      }
    ]
  },
  {
    id: 13,
    forms: [
      {
        name: 'Petilil Edwards',
        originalName: 'Petilil',
        dexId: 548,
        personality: 'Tea Garden Pixie',
        entranceLine: "One sip of me and you'll spill all your secrets.",
        stats: { acting: 4, improv: 4, comedy: 3, dance: 7, design: 6, singing: 4, rusical: 5, rumix: 5, makeover: 6, lipsync: 6 }
      },
      {
        name: 'Lilligant Edwards',
        originalName: 'Lilligant',
        dexId: 549,
        personality: 'Southern Belle',
        entranceLine: "Well bless your heart, aren't you all just precious second places.",
        stats: { acting: 6, improv: 5, comedy: 4, dance: 9, design: 8, singing: 5, rusical: 7, rumix: 7, makeover: 8, lipsync: 8 }
      }
    ]
  },
  {
    id: 14,
    forms: [
      {
        name: 'Combee Benet',
        originalName: 'Combee',
        dexId: 415,
        personality: 'Hive Hype Girl',
        entranceLine: "Three faces, one crown, zero apologies.",
        stats: { acting: 5, improv: 4, comedy: 4, dance: 5, design: 7, singing: 3, rusical: 4, rumix: 4, makeover: 6, lipsync: 4 }
      },
      {
        name: 'Vespiquen Benet',
        originalName: 'Vespiquen',
        dexId: 416,
        personality: 'The Ruler',
        entranceLine: "The hive has spoken. I am the queen.",
        stats: { acting: 7, improv: 6, comedy: 5, dance: 6, design: 10, singing: 4, rusical: 6, rumix: 6, makeover: 9, lipsync: 6 }
      }
    ]
  },
  {
    id: 15,
    forms: [
      {
        name: 'Flabebe Welch',
        originalName: 'Flabebe',
        dexId: 669,
        personality: 'Tiny Tenor',
        entranceLine: 'Small package, massive vibrato.',
        stats: { acting: 4, improv: 4, comedy: 3, dance: 4, design: 7, singing: 7, rusical: 6, rumix: 4, makeover: 7, lipsync: 5 }
      },
      {
        name: 'Floette Welch',
        originalName: 'Floette',
        dexId: 670,
        personality: 'Garden Torch Singer',
        entranceLine: "I'm blooming and belting at the same time.",
        stats: { acting: 5, improv: 4, comedy: 4, dance: 4, design: 9, singing: 8, rusical: 7, rumix: 5, makeover: 8, lipsync: 6 }
      },
      {
        name: 'Florges Welch',
        originalName: 'Florges',
        dexId: 671,
        personality: 'Indie Vocalist',
        entranceLine: "I'm here to plant a seed and watch you all wither.",
        stats: { acting: 6, improv: 5, comedy: 4, dance: 5, design: 10, singing: 9, rusical: 8, rumix: 6, makeover: 9, lipsync: 7 }
      }
    ]
  },
  {
    id: 16,
    forms: [
      {
        name: 'Pheromosa Evangelista',
        originalName: 'Pheromosa',
        dexId: 795,
        personality: 'Supermodel',
        entranceLine: "Don't hate me because I'm beautiful. Hate me because I'm gonna win.",
        stats: { acting: 3, improv: 2, comedy: 2, dance: 10, design: 8, singing: 1, rusical: 5, rumix: 8, makeover: 7, lipsync: 9 }
      }
    ]
  },
  {
    id: 17,
    forms: [
      {
        name: 'Budew Valentine',
        originalName: 'Budew',
        dexId: 406,
        personality: 'Petal Prodigy',
        entranceLine: 'Prickly, precious, and ready to perform.',
        stats: { acting: 5, improv: 4, comedy: 4, dance: 5, design: 5, singing: 4, rusical: 5, rumix: 4, makeover: 5, lipsync: 5 }
      },
      {
        name: 'Roselia Valentine',
        originalName: 'Roselia',
        dexId: 315,
        personality: 'Dual-Wield Diva',
        entranceLine: 'Two roses, twice the read.',
        stats: { acting: 7, improv: 6, comedy: 5, dance: 6, design: 6, singing: 4, rusical: 6, rumix: 5, makeover: 6, lipsync: 7 }
      },
      {
        name: 'Roserade Valentine',
        originalName: 'Roserade',
        dexId: 407,
        personality: 'Romantic Lead',
        entranceLine: "Every rose has its thorns, and mine are poisoned.",
        stats: { acting: 9, improv: 7, comedy: 6, dance: 8, design: 7, singing: 5, rusical: 8, rumix: 6, makeover: 6, lipsync: 8 }
      }
    ]
  },
  {
    id: 18,
    forms: [
      {
        name: 'Diancie Sparkles',
        originalName: 'Diancie',
        dexId: 719,
        personality: 'Spoiled Princess',
        entranceLine: "Daddy said if I don't win, he's buying the network.",
        stats: { acting: 5, improv: 4, comedy: 3, dance: 6, design: 10, singing: 8, rusical: 7, rumix: 5, makeover: 8, lipsync: 6 }
      }
    ]
  },
  {
    id: 19,
    forms: [
      {
        name: 'Magearna Del Rio',
        originalName: 'Magearna',
        dexId: 801,
        personality: 'Insult Comic',
        entranceLine: "Beep boop. You're all trash.",
        stats: { acting: 7, improv: 9, comedy: 10, dance: 4, design: 8, singing: 6, rusical: 7, rumix: 4, makeover: 5, lipsync: 5 }
      }
    ]
  },
  {
    id: 20,
    forms: [
      {
        name: 'Meloetta Armstrong',
        originalName: 'Meloetta',
        dexId: 648,
        personality: 'Theatre Kid',
        entranceLine: '*High note sustaining for 20 seconds*',
        stats: { acting: 8, improv: 7, comedy: 6, dance: 9, design: 5, singing: 10, rusical: 10, rumix: 8, makeover: 4, lipsync: 8 }
      }
    ]
  },
  {
    id: 21,
    forms: [
      {
        name: 'Oddish DuPre',
        originalName: 'Oddish',
        dexId: 43,
        personality: 'Night Garden Gremlin',
        entranceLine: "I'm fertilizer for your flop era.",
        stats: { acting: 3, improv: 4, comedy: 5, dance: 6, design: 4, singing: 3, rusical: 5, rumix: 6, makeover: 4, lipsync: 6 }
      },
      {
        name: 'Gloom DuPre',
        originalName: 'Gloom',
        dexId: 44,
        personality: 'Funky Fresh',
        entranceLine: "I smell success... or maybe that's just me.",
        stats: { acting: 4, improv: 4, comedy: 6, dance: 7, design: 5, singing: 4, rusical: 6, rumix: 7, makeover: 4, lipsync: 7 }
      },
      {
        name: 'Bellossom DuPre',
        originalName: 'Bellossom',
        dexId: 182,
        personality: 'Dancing Diva',
        entranceLine: 'Aloha, bitches!',
        stats: { acting: 4, improv: 5, comedy: 6, dance: 10, design: 6, singing: 4, rusical: 8, rumix: 9, makeover: 5, lipsync: 9 }
      }
    ]
  },
  {
    id: 22,
    forms: [
      {
        name: 'Clamperl Andrews',
        originalName: 'Clamperl',
        dexId: 366,
        personality: 'Shellfish Siren',
        entranceLine: "I'm pearls, I'm petty, I'm here to pop off.",
        stats: { acting: 4, improv: 3, comedy: 3, dance: 5, design: 6, singing: 4, rusical: 4, rumix: 4, makeover: 7, lipsync: 5 }
      },
      {
        name: 'Gorebyss Andrews',
        originalName: 'Gorebyss',
        dexId: 368,
        personality: 'Fishy Queen',
        entranceLine: "I'm wet. Are you?",
        stats: { acting: 5, improv: 4, comedy: 3, dance: 6, design: 8, singing: 5, rusical: 6, rumix: 6, makeover: 9, lipsync: 7 }
      }
    ]
  },
  {
    id: 23,
    forms: [
      {
        name: 'Fomantis Michaels',
        originalName: 'Fomantis',
        dexId: 753,
        personality: 'Photosyntheslay',
        entranceLine: "Sun up or sun down, I'm booked and blessed.",
        stats: { acting: 5, improv: 4, comedy: 4, dance: 6, design: 6, singing: 4, rusical: 5, rumix: 5, makeover: 5, lipsync: 6 }
      },
      {
        name: 'Lurantis Michaels',
        originalName: 'Lurantis',
        dexId: 754,
        personality: 'Professional',
        entranceLine: "I didn't come to play, I came to slay.",
        stats: { acting: 7, improv: 6, comedy: 5, dance: 9, design: 8, singing: 5, rusical: 7, rumix: 8, makeover: 7, lipsync: 9 }
      }
    ]
  },
  {
    id: 24,
    forms: [
      {
        name: 'Sewaddle Vuitton',
        originalName: 'Sewaddle',
        dexId: 540,
        personality: 'Thread Count Terror',
        entranceLine: "I'm ready to hem up the competition.",
        stats: { acting: 3, improv: 3, comedy: 3, dance: 4, design: 7, singing: 3, rusical: 4, rumix: 3, makeover: 7, lipsync: 4 }
      },
      {
        name: 'Swadloon Vuitton',
        originalName: 'Swadloon',
        dexId: 541,
        personality: 'Cocooned Critic',
        entranceLine: "Wake me when it's time to win.",
        stats: { acting: 4, improv: 3, comedy: 3, dance: 4, design: 8, singing: 3, rusical: 4, rumix: 4, makeover: 8, lipsync: 4 }
      },
      {
        name: 'Leavanny Vuitton',
        originalName: 'Leavanny',
        dexId: 542,
        personality: 'Seamstress',
        entranceLine: "I hope you girls are ready to be schooled in fashion.",
        stats: { acting: 4, improv: 3, comedy: 3, dance: 5, design: 10, singing: 4, rusical: 5, rumix: 4, makeover: 10, lipsync: 5 }
      }
    ]
  },
  {
    id: 25,
    forms: [
      {
        name: 'Eevee Royale',
        originalName: 'Eevee',
        dexId: 133,
        personality: 'Ribbon Rookie',
        entranceLine: "I'm cute now, but wait till I unwrap.",
        stats: { acting: 5, improv: 4, comedy: 5, dance: 5, design: 7, singing: 4, rusical: 5, rumix: 5, makeover: 6, lipsync: 6 }
      },
      {
        name: 'Sylveon Royale',
        originalName: 'Sylveon',
        dexId: 700,
        personality: 'Pastel Princess',
        entranceLine: 'Sweet looks, sharper tongue.',
        stats: { acting: 7, improv: 6, comedy: 6, dance: 7, design: 9, singing: 6, rusical: 7, rumix: 8, makeover: 8, lipsync: 9 }
      }
    ]
  },
  {
    id: 26,
    forms: [
      {
        name: 'Ducklett Fontaine',
        originalName: 'Ducklett',
        dexId: 580,
        personality: 'Pond Pageant',
        entranceLine: "Quack the code and give me the crown.",
        stats: { acting: 4, improv: 4, comedy: 3, dance: 6, design: 5, singing: 5, rusical: 5, rumix: 5, makeover: 4, lipsync: 5 }
      },
      {
        name: 'Swanna Fontaine',
        originalName: 'Swanna',
        dexId: 581,
        personality: 'Glamazon',
        entranceLine: "From the runway to the runway, I never leave.",
        stats: { acting: 6, improv: 5, comedy: 4, dance: 9, design: 8, singing: 7, rusical: 8, rumix: 7, makeover: 6, lipsync: 8 }
      }
    ]
  },
  {
    id: 27,
    forms: [
      {
        name: 'Gossifleur Dior',
        originalName: 'Gossifleur',
        dexId: 829,
        personality: 'Breezy Muse',
        entranceLine: "Fresh air and fresher reads.",
        stats: { acting: 5, improv: 5, comedy: 4, dance: 4, design: 7, singing: 6, rusical: 5, rumix: 4, makeover: 7, lipsync: 4 }
      },
      {
        name: 'Eldegoss Dior',
        originalName: 'Eldegoss',
        dexId: 830,
        personality: 'Earthy Icon',
        entranceLine: "I'm eco-friendly and ego-unfriendly.",
        stats: { acting: 8, improv: 7, comedy: 6, dance: 5, design: 9, singing: 8, rusical: 7, rumix: 6, makeover: 9, lipsync: 6 }
      }
    ]
  },
  {
    id: 28,
    forms: [
      {
        name: 'Meditite Michaels',
        originalName: 'Meditite',
        dexId: 307,
        personality: 'Balanced Brat',
        entranceLine: "Inner peace? Never heard of her.",
        stats: { acting: 5, improv: 6, comedy: 4, dance: 8, design: 5, singing: 4, rusical: 6, rumix: 7, makeover: 5, lipsync: 7 }
      },
      {
        name: 'Medicham Michaels',
        originalName: 'Medicham',
        dexId: 308,
        personality: 'Zen Assassin',
        entranceLine: "Namaste? Nah, I'm here to slay.",
        stats: { acting: 6, improv: 7, comedy: 5, dance: 10, design: 6, singing: 5, rusical: 8, rumix: 9, makeover: 6, lipsync: 9 }
      }
    ]
  },
  {
    id: 29,
    forms: [
      {
        name: 'Milcery Ganache',
        originalName: 'Milcery',
        dexId: 868,
        personality: 'Whipped Wonder',
        entranceLine: "Stir me once and I'm already iconic.",
        stats: { acting: 4, improv: 4, comedy: 5, dance: 4, design: 7, singing: 6, rusical: 5, rumix: 4, makeover: 7, lipsync: 5 }
      },
      {
        name: 'Alcremie Ganache',
        originalName: 'Alcremie',
        dexId: 869,
        personality: 'Dessert Diva',
        entranceLine: "I'm the sugar rush that'll rot your chances.",
        stats: { acting: 6, improv: 6, comedy: 7, dance: 5, design: 9, singing: 8, rusical: 7, rumix: 6, makeover: 9, lipsync: 7 }
      }
    ]
  },
  {
    id: 30,
    forms: [
      {
        name: 'Spritzee Sauvage',
        originalName: 'Spritzee',
        dexId: 682,
        personality: 'Perfume Priestess',
        entranceLine: "My scent alone will send you spinning.",
        stats: { acting: 6, improv: 6, comedy: 5, dance: 5, design: 8, singing: 8, rusical: 7, rumix: 6, makeover: 7, lipsync: 6 }
      },
      {
        name: 'Aromatisse Sauvage',
        originalName: 'Aromatisse',
        dexId: 683,
        personality: 'Opulent High Priestess',
        entranceLine: "Consider yourselves blessed by the glamour gods.",
        stats: { acting: 8, improv: 7, comedy: 6, dance: 7, design: 9, singing: 9, rusical: 9, rumix: 7, makeover: 9, lipsync: 7 }
      }
    ]
  },
  {
    id: 31,
    forms: [
      {
        name: 'Snom Flurriosa',
        originalName: 'Snom',
        dexId: 872,
        personality: 'Icy Baby Doll',
        entranceLine: "Tiny, frosty, and ready to frost you out.",
        stats: { acting: 4, improv: 4, comedy: 6, dance: 5, design: 8, singing: 5, rusical: 5, rumix: 6, makeover: 8, lipsync: 6 }
      },
      {
        name: 'Frosmoth Flurriosa',
        originalName: 'Frosmoth',
        dexId: 873,
        personality: 'Crystal Couture',
        entranceLine: "Wings out, claws out. Blizzard chic has arrived.",
        stats: { acting: 6, improv: 6, comedy: 7, dance: 8, design: 10, singing: 7, rusical: 7, rumix: 7, makeover: 10, lipsync: 8 }
      }
    ]
  },
  {
    id: 32,
    forms: [
      {
        name: 'Mimikyu Mirage',
        originalName: 'Mimikyu',
        dexId: 778,
        personality: 'Glamour Ghoul',
        entranceLine: "Boo! You just got haunted by haute couture.",
        stats: { acting: 7, improv: 6, comedy: 8, dance: 6, design: 9, singing: 5, rusical: 6, rumix: 6, makeover: 8, lipsync: 8 }
      }
    ]
  },
  {
    id: 33,
    forms: [
      {
        name: 'Eevee Soleil',
        originalName: 'Eevee',
        dexId: 133,
        personality: 'Sunrise Seer',
        entranceLine: "Bright eyed, bushy tailed, and booking the gig.",
        stats: { acting: 5, improv: 5, comedy: 5, dance: 5, design: 6, singing: 5, rusical: 5, rumix: 5, makeover: 6, lipsync: 6 }
      },
      {
        name: 'Espeon Soleil',
        originalName: 'Espeon',
        dexId: 196,
        personality: 'Psychic It-Girl',
        entranceLine: "I already saw the finale. Spoiler: I'm in it.",
        stats: { acting: 8, improv: 8, comedy: 6, dance: 7, design: 8, singing: 7, rusical: 8, rumix: 8, makeover: 7, lipsync: 9 }
      }
    ]
  },
  {
    id: 34,
    forms: [
      {
        name: 'Tapu Lele Extravaganza',
        originalName: 'Tapu Lele',
        dexId: 786,
        personality: 'Mythic Muse',
        entranceLine: "Sacred glam energy? Yeah, I invented that.",
        stats: { acting: 9, improv: 7, comedy: 6, dance: 8, design: 10, singing: 9, rusical: 9, rumix: 8, makeover: 10, lipsync: 8 }
      }
    ]
  }
];

const getDisplayForm = (template: QueenTemplate, mode: SeasonMode): QueenForm =>
  mode === 'evolve' ? template.forms[0] : template.forms[template.forms.length - 1];

const instantiateQueenFromTemplate = (template: QueenTemplate, mode: SeasonMode): Queen => {
  const clonedForms = template.forms.map(form => ({
    ...form,
    stats: { ...form.stats }
  }));
  const startingStage = mode === 'evolve' ? 0 : clonedForms.length - 1;
  const startingForm = clonedForms[startingStage];

  return {
    id: template.id,
    dexId: startingForm.dexId,
    name: startingForm.name,
    originalName: startingForm.originalName,
    stats: { ...startingForm.stats },
    personality: startingForm.personality,
    entranceLine: startingForm.entranceLine,
    trackRecord: [],
    status: 'active',
    confessionals: [],
    evolutionLine: clonedForms,
    evolutionStage: startingStage,
  };
};

const evolutionStyles = `
  .evolution-celebration {
    position: relative;
    overflow: hidden;
  }
  .evolution-celebration .evolution-glow {
    position: absolute;
    inset: -40%;
    background: radial-gradient(circle at center, rgba(255,255,255,0.35), transparent 70%);
    filter: blur(18px);
    animation: shimmerPulse 2.8s infinite;
    opacity: 0.9;
  }
  .evolution-celebration .evolution-sparkle {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    background: rgba(255,255,255,0.85);
    box-shadow: 0 0 12px rgba(255,255,255,0.8);
    animation: floatSparkle 3s ease-in-out infinite;
  }
  .evolution-celebration .evolution-sparkle:nth-child(3) {
    left: 8%;
    top: 20%;
    animation-delay: 0.2s;
  }
  .evolution-celebration .evolution-sparkle:nth-child(4) {
    right: 12%;
    bottom: 18%;
    animation-delay: 0.8s;
  }
  .evolution-celebration .evolution-sparkle:nth-child(5) {
    left: 48%;
    top: -6%;
    animation-delay: 1.4s;
  }
  @keyframes shimmerPulse {
    0%, 100% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.9; }
  }
  @keyframes floatSparkle {
    0% { transform: translateY(0) scale(0.8); opacity: 0.7; }
    50% { transform: translateY(-14px) scale(1.1); opacity: 1; }
    100% { transform: translateY(0) scale(0.8); opacity: 0.7; }
  }
`;

type Phase = 'SETUP' | 'CAST_SELECTION' | 'ENTRANCES' | 'PROMO' | 'CHALLENGE_SELECTION' | 'CHALLENGE_INTRO' | 'PERFORMANCE' | 'JUDGING' | 'RESULTS' | 'UNTUCKED' | 'LIPSYNC' | 'ELIMINATION' | 'FINALE' | 'SEASON_OVER';

type ChallengeType = 'acting' | 'comedy' | 'dance' | 'design' | 'rusical' | 'makeover' | 'improv' | 'rumix' | 'snatch_game' | 'ball' | 'branding' | 'talent' | 'roast' | 'girl_groups';

interface Challenge {
  name: string;
  type: ChallengeType;
  description: string;
  primaryStats: StatCategory[];
  icon: React.ReactNode;
  isPremiereFriendly?: boolean;
}

type ChallengeRecap = {
  episode: number;
  challenge: Challenge;
  highlight: string;
};

const REVENGE_CHALLENGE: Challenge = {
  name: "Revenge of the Queens",
  type: 'comedy',
  description: "Returning legends storm the stage in a partnered stand-up smackdown for redemption.",
  primaryStats: ['comedy', 'improv'],
  icon: <Mic size={32} className="text-purple-500" />,
};

const CHALLENGES: Challenge[] = [
  { name: "PokéBall Ball", type: 'ball', description: "Bring 3 looks to the runway: Baby Mon Realness, Type Specialist, and a look made of Pokémon Cards.", primaryStats: ['design'], icon: <Scissors size={32} className="text-pink-500" /> },
  { name: "Snatch Game", type: 'snatch_game', description: "Impersonate celebrities while freezing your Pokéballs off at Seafoam Islands.", primaryStats: ['comedy', 'improv'], icon: <Smile size={32} className="text-yellow-500" /> },
  { name: "Rucoco's Rusical", type: 'rusical', description: "Live singing and dancing musical about the life of a Magikarp who dreamed big.", primaryStats: ['rusical', 'singing', 'dance'], icon: <Music2 size={32} className="text-purple-500" /> },
  { name: "'Honey, I Shrunk the Mons'", type: 'acting', description: "Cheesy sci-fi movie parody acting challenge.", primaryStats: ['acting'], icon: <Clapperboard size={32} className="text-blue-500" /> },
  { name: "Gym Leader Roast", type: 'roast', description: "Roast the legendary Gym Leaders in front of a live audience. Don't get burned!", primaryStats: ['comedy'], icon: <Mic size={32} className="text-red-500" /> },
  { name: "Evolution Dance-off", type: 'dance', description: "Choreographed group dance number showcasing evolution stages.", primaryStats: ['dance'], icon: <Zap size={32} className="text-orange-500" /> },
  { name: "Ditto Doppelgangers", type: 'makeover', description: "Transform a Ditto into your drag family sister. Family resemblance is key!", primaryStats: ['makeover'], icon: <Palette size={32} className="text-green-500" /> },
  { name: "Whose Mon Is It Anyway?", type: 'improv', description: "Sketch comedy improv show where everything is made up and the points don't matter.", primaryStats: ['improv', 'comedy'], icon: <HelpCircle size={32} className="text-indigo-500" /> },
  { name: "Read U Wrote U (Poké Ver.)", type: 'rumix', description: "Write your own verse and perform a complex choreographed number to the Top 4 remix.", primaryStats: ['rumix', 'dance', 'lipsync'], icon: <Music size={32} className="text-pink-600" /> },
  // New Challenges
  { name: "Talent Show Extravaganza", type: 'talent', description: "Showcase your best talent in a 60-second variety show performance.", primaryStats: ['dance', 'singing', 'comedy'], icon: <Star size={32} className="text-yellow-600" />, isPremiereFriendly: true },
  { name: "PokéBranding", type: 'branding', description: "Create and market your own signature potion or berry product.", primaryStats: ['improv', 'comedy'], icon: <Megaphone size={32} className="text-teal-500" /> },
  { name: "Pop Princess Girl Groups", type: 'girl_groups', description: "Write verses and perform choreography as competing girl groups.", primaryStats: ['rumix', 'dance', 'singing'], icon: <Users size={32} className="text-violet-500" />, isPremiereFriendly: true },
  { name: "Sewing: Apocalyptic Couture", type: 'design', description: "Create a high-fashion look using only materials found in the ruins of Cinnabar Island.", primaryStats: ['design'], icon: <Scissors size={32} className="text-gray-600" />, isPremiereFriendly: true },
  { name: "Commercial Queens", type: 'branding', description: "Film a hilarious commercial for 'Squirtle Wax'.", primaryStats: ['acting', 'comedy'], icon: <VideoIcon size={32} className="text-blue-400" /> },
];

// --- Helper Functions ---

const getQueenImg = (dexId: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexId}.png`;

const calculatePerformance = (queen: Queen, challenge: Challenge, modifiers: Record<number, number> = {}): number => {
  let score = 0;
  challenge.primaryStats.forEach(stat => score += queen.stats[stat]);
  score = (score / challenge.primaryStats.length); // Average base score
  score += (Math.random() * 4) - 2; // Add variance (-2 to +2)
  if (modifiers[queen.id]) score += modifiers[queen.id];
  return score;
};

const getConfessional = (
    queen: Queen,
    placement: Placement,
    phase: Phase,
    episode: number,
    challenge?: Challenge,
    activeQueens?: Queen[]
): ConfessionalEntry => {
    let templates = {
        WIN: [
            "I won! Eat it, bitches!",
            "The crown is practically mine already.",
            "I proved today that I am THE Top Pokémon.",
            "Did you see that? That's what domination looks like.",
            "Another badge on the sash, darling."
        ],
        TOP2: [
            "Top 2! I need to win this lip sync to get that cash tip.",
            "I'm safe, but I want that win on my record.",
            "If I don't snatch the win now, when will I?",
            "Top 2 again? They're obsessed with me."
        ],
        HIGH: [
            "Always the bridesmaid, never the bride.",
            "I'm glad the judges saw my talent today.",
            "So close to winning, ugh!",
            "High placement means they're watching me closely.",
            "Another critique, another chance to adjust the crown."
        ],
        SAFE: [
            "Safe? Ugh, I hate being filler.",
            "I survived another week, that's what matters.",
            "I need to step it up if I want to win.",
            "Safe is fine, but fine isn't legendary.",
            "Werkroom politics kept me distracted. Never again."
        ],
        LOW: [
            "The judges completely missed the point of my look.",
            "I know I'm better than this.",
            "I am NOT going home yet.",
            "That runway was a risk... and it almost sent me home.",
            "My sisters are circling like Sharpedos. I'm bleeding."
        ],
        BTM2: [
            "I have to lip sync? Fine. I'm going to murder it.",
            "I am devastated, but I will fight to stay.",
            "This is embarrassing. Time to turn it out.",
            "They want tears? They'll get a performance instead.",
            "The judges lit a fire under me—time to scorch the stage."
        ],
        ELIM: [
            "It's heartbreaking to leave so soon.",
            "I may be leaving, but I'm still a star.",
            "Vanjie... Vanjie... Vanjie...",
            "I packed fashion and memories. I'm leaving with both.",
            "You can eliminate me, but you can't erase me."
        ],
        'RUNNER-UP': [
            "I gave it my all. Congrats to the winner, I guess.",
            "Second place is still iconic, but I wanted that crown.",
            "I'll be back. You can't keep a legend down."
        ],
        'WINNER': [
            "I DID IT! I AM AMERICA'S NEXT DRAG SUPERMON!",
            "My legacy is cemented in glitter and glory.",
            "This crown was made for me, honey."
        ],
        'N/A': [],
        '': []
    } as Record<Placement | '', string[]>;

    // Contextual Confessionals
    if (phase === 'JUDGING' && activeQueens) {
        // Check for bottom streak
        const recentPlacements = queen.trackRecord.slice(-2);
        if (placement === 'BTM2' && recentPlacements.includes('BTM2')) {
             templates.BTM2.push("In the bottom AGAIN? I can't keep doing this.");
             templates.BTM2.push("Two weeks in a row? Someone's plotting against me.");
        }
        // Check for comeback
        if (placement === 'WIN' && recentPlacements.includes('BTM2')) {
             templates.WIN.push("From the bottom to the top! Redemption feels so good.");
             templates.WIN.push("They doubted me, but this phoenix keeps rising.");
        }
    }

    if (challenge?.type) {
        const challengeLines: Partial<Record<ChallengeType, Partial<Record<Placement, string[]>>>> = {
            design: {
                LOW: [
                    "I don't know how to sew, okay?! Give me a break!",
                    "Hot glue can only do so much when you have no taste.",
                    "That hemline betrayed me on national television."
                ],
                WIN: [
                    "This outfit is couture, honey. They had no choice but to crown me.",
                    "Needles, thread, and nerves of steel—that's how you win."
                ],
                SAFE: [
                    "Thank god I didn't have to lip sync in this mess of an outfit.",
                    "Next time I'm packing a portable sewing machine."
                ]
            },
            snatch_game: {
                BTM2: [
                    "I froze up. Snatch Game is harder than it looks!",
                    "My celebrity impersonation fell flat. Dead flat.",
                    "Why did I pick a celebrity no one even remembers?"
                ],
                WIN: [
                    "I made Ru laugh! That's the golden ticket.",
                    "They'll be quoting me for seasons to come."
                ],
                HIGH: [
                    "I thought I was the funniest one up there, honestly.",
                    "If I had one more punchline I would've snatched the win."
                ]
            },
            roast: {
                 LOW: [
                    "Tough crowd tonight. They didn't get my intellectual humor.",
                    "I think I was too mean... oops.",
                    "I roasted them, then got burned myself."
                 ],
                 WIN: [
                    "I read them all to filth and they loved it!",
                    "Comedy is a weapon and I wielded it like a sword."
                 ]
            },
            dance: {
                 LOW: [
                    "Two left feet? Try four left feet.",
                    "Choreography is NOT my friend.",
                    "My knees are suing me after that routine."
                 ],
                 BTM2: [
                    "I missed one step and it all went downhill from there.",
                    "Why does every eight-count end in humiliation for me?"
                 ]
            },
            rusical: {
                WIN: [
                    "I was born to be a star on Broadway, baby!",
                    "High notes, high kicks, higher praise."
                ],
                SAFE: [
                    "I didn't get the lead role, so I just faded into the background.",
                    "Ensemble life is cute but I'm craving the spotlight."
                ]
            },
            improv: {
                WIN: ["Quick wit, quicker pay-off. That's how you do improv."],
                LOW: ["My mind went blank and all that came out was static."]
            },
            makeover: {
                WIN: ["Family resemblance? Try cloned perfection."],
                LOW: ["My makeover partner betrayed me with that walk."]
            },
            talent: {
                WIN: ["Booked and blessed—my talent show stole the night."],
                LOW: ["Turns out juggling flaming Pokéballs is harder than it looks."]
            }
        };

        const challengeType = challenge.type;
        if (challengeLines[challengeType]?.[placement as keyof typeof challengeLines[ChallengeType]]) {
             templates[placement as keyof typeof templates].push(
                ...(challengeLines[challengeType]![placement as keyof typeof challengeLines[ChallengeType]]!)
             );
        }
    }

    // Personality infusion
    if (queen.personality.includes("Villain")) {
        templates.WIN.push("Of course I won. Look at this competition... tragic.");
        templates.SAFE.push("These judges have no taste if they think I'm just 'safe'.");
        templates.ELIM.push("They're just intimidated by my greatness. Their loss.");
        templates.BTM2.push("Let them think they've got me shook. Plot twist coming.");
    }
    if (queen.personality.includes("Delusional")) {
        templates.LOW.push("Honestly? I should have won. The judges are blind.");
        templates.BTM2.push("They just want a show, that's why I'm in the bottom. I'm too perfect.");
        templates.SAFE.push("I was definitely the best one this week, weird.");
        templates.HIGH.push("If this is 'high', then a win must be next episode. Duh.");
    }
    if (queen.personality.includes("Perfectionist")) {
        templates.HIGH.push("High isn't good enough. I need to WIN every single week.");
        templates.SAFE.push("I am failing. Safe is failing.");
        templates.LOW.push("One misstep and my entire legacy crumbles. Unacceptable.");
    }

    const pool = templates[placement as keyof typeof templates] || ["I have nothing to say."];
    const text = pool[Math.floor(Math.random() * pool.length)];
    const reasonParts: string[] = [];
    if (phase === 'JUDGING') {
        reasonParts.push('Judging debrief');
    }
    if (challenge?.name) {
        reasonParts.push(`${challenge.name} – ${placement}`);
    } else {
        reasonParts.push(`${placement} placement`);
    }

    const context: ConfessionalContext = phase === 'JUDGING' ? 'judging' : 'challenge';

    return {
        text,
        episode,
        context,
        reason: reasonParts.join(' • ')
    };
}

const PLACEMENT_POINTS: Record<Placement, number> = {
    WIN: 5,
    'WIN+RTRN': 5,
    'WIN+OUT': 5,
    TOP2: 4.5,
    HIGH: 4,
    SAFE: 3,
    LOW: 2,
    BTM2: 1,
    OUT: 0,
    ELIM: 0,
    'RUNNER-UP': 0,
    'WINNER': 0,
    'N/A': 0,
    '': 0
};

const STAT_CATEGORIES: StatCategory[] = ['acting', 'improv', 'comedy', 'dance', 'design', 'singing', 'rusical', 'rumix', 'makeover', 'lipsync'];

const MAX_CONFESSIONALS = 15;

const COMPETITIVE_PLACEMENTS: Placement[] = ['WIN', 'WIN+RTRN', 'WIN+OUT', 'TOP2', 'HIGH', 'SAFE', 'LOW', 'BTM2', 'OUT', 'ELIM'];

const getEliminationIndex = (queen: Queen): number => {
    const index = queen.trackRecord.findIndex(placement => placement === 'ELIM' || placement === 'OUT');
    return index === -1 ? Infinity : index;
};

const summarizePlacements = (trackRecord: Placement[]) => {
    const summary = {
        wins: 0,
        top2: 0,
        highs: 0,
        safes: 0,
        lows: 0,
        bottoms: 0,
        elims: 0,
        performanceScore: 0,
        competitiveEpisodes: 0
    };

    trackRecord.forEach((placement) => {
        if (COMPETITIVE_PLACEMENTS.includes(placement)) {
            summary.performanceScore += PLACEMENT_POINTS[placement] || 0;
            summary.competitiveEpisodes += 1;
        }

        switch (placement) {
            case 'WIN':
            case 'WIN+RTRN':
                summary.wins += 1;
                break;
            case 'WIN+OUT':
                summary.wins += 1;
                summary.elims += 1;
                break;
            case 'TOP2':
                summary.top2 += 1;
                break;
            case 'HIGH':
                summary.highs += 1;
                break;
            case 'SAFE':
                summary.safes += 1;
                break;
            case 'LOW':
                summary.lows += 1;
                break;
            case 'BTM2':
                summary.bottoms += 1;
                break;
            case 'OUT':
            case 'ELIM':
                summary.elims += 1;
                summary.bottoms += 1;
                break;
            default:
                break;
        }
    });

    return summary;
};

// --- Main Component ---

export default function PokeDragRaceSimulator() {
  // --- State ---
  const [phase, setPhase] = useState<Phase>('SETUP');
  const [cast, setCast] = useState<Queen[]>([]);
  const [selectedCastIds, setSelectedCastIds] = useState<number[]>([]);
  const [episodeCount, setEpisodeCount] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [unsavedPlacements, setUnsavedPlacements] = useState<Record<number, Placement>>({});
  const [currentStoryline, setCurrentStoryline] = useState<string>("");
  const [lipsyncPair, setLipsyncPair] = useState<Queen[]>([]);
  const [producersMode, setProducersMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'trackRecord' | 'stats'>('game');
  const [challengeHistory, setChallengeHistory] = useState<ChallengeRecap[]>([]);
  const [doubleShantayUsed, setDoubleShantayUsed] = useState(false);
  const [splitPremiere, setSplitPremiere] = useState(false);
  const [competitionFormat, setCompetitionFormat] = useState<'standard' | 'allStars'>('standard');
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('final');
  const [pendingLegacyElimination, setPendingLegacyElimination] = useState<{ winnerId: number; options: Queen[]; allies?: number[] } | null>(null);
  const [latestResults, setLatestResults] = useState<Record<number, Placement>>({});
  const [recentEvolution, setRecentEvolution] = useState<{
      queenId: number;
      fromName: string;
      toName: string;
      statBoosts: { stat: StatCategory; amount: number }[];
  } | null>(null);
  const [suggestedChallenge, setSuggestedChallenge] = useState<Challenge | null>(null);
  const [revengeEpisodeTriggered, setRevengeEpisodeTriggered] = useState(false);
  const [revengeEpisodeActive, setRevengeEpisodeActive] = useState(false);
  const [revengeReturneeIds, setRevengeReturneeIds] = useState<number[]>([]);
  const [revengeTopReturneeIds, setRevengeTopReturneeIds] = useState<number[]>([]);
  const [revengeBottomIds, setRevengeBottomIds] = useState<number[]>([]);
  const [revengePairings, setRevengePairings] = useState<{ returneeId: number; partnerId: number }[]>([]);
  const [autoSelectCount, setAutoSelectCount] = useState('8');

  const makeConfessional = useCallback((text: string, reason: string, context: ConfessionalContext): ConfessionalEntry => ({
      text,
      reason,
      context,
      episode: episodeCount
  }), [episodeCount]);

  const prependConfessional = useCallback((existing: ConfessionalEntry[], entry: ConfessionalEntry) => [entry, ...existing].slice(0, MAX_CONFESSIONALS), []);

  const autoSelectQueens = useCallback(() => {
      const parsed = parseInt(autoSelectCount, 10);
      if (Number.isNaN(parsed)) {
          alert('Enter how many queens you want auto-selected.');
          return;
      }
      const sanitized = Math.max(4, Math.min(parsed, 16, QUEEN_BLUEPRINTS.length));
      const randomized = [...QUEEN_BLUEPRINTS].sort(() => 0.5 - Math.random()).slice(0, sanitized).map(template => template.id);
      setSelectedCastIds(randomized);
      setAutoSelectCount(String(sanitized));
  }, [autoSelectCount]);

  const generateChallenge = useCallback((challenge: Challenge, options?: { isSuggested?: boolean }) => {
      setCurrentChallenge(challenge);
      setUnsavedPlacements({});
      setLatestResults({});
      if (options?.isSuggested) {
          setSuggestedChallenge(challenge);
      }
      const prepPrompts = [
          `Werkroom buzz: ${challenge.name} has the dolls scrambling to rehearse.`,
          `Episode ${episodeCount}: The queens whisper about strategies for ${challenge.name}.`,
          `${challenge.name} rehearsal chaos! Tempers are flaring and wigs are flying.`,
          `Producers gag: ${challenge.name} is forcing alliances to crack before judging.`,
          `${challenge.name} is announced and half the room is already plotting revenge.`,
      ];
      setCurrentStoryline(prepPrompts[Math.floor(Math.random() * prepPrompts.length)]);
  }, [episodeCount]);

  const buildChallengeHighlight = useCallback((challenge: Challenge) => {
      const contenders = [...activeQueens].sort(() => 0.5 - Math.random()).slice(0, 2);
      const [queenA, queenB] = contenders;
      const highlightTemplates: Partial<Record<ChallengeType, string[]>> = {
          acting: [
              `{queenA} swears her monologue will gag the judges, but {queenB} is rehearsing in secret corners.`,
              `Line memorization panic! ${challenge.name} is splitting alliances between ${'{queenA}'} and ${'{queenB}'}.`
          ],
          comedy: [
              `{queenA} keeps roasting {queenB} during rehearsal and it's getting personal.`,
              `{queenA} and {queenB} form a reluctant comedy duo—shenanigans guaranteed.`
          ],
          dance: [
              `{queenA} calls out {queenB} for missing choreography in ${challenge.name}.`,
              `{queenA}'s high kicks are sending {queenB} into a spiral before ${challenge.name}.`
          ],
          design: [
              `{queenA} hoards fabric while {queenB} is stuck with glitter glue before ${challenge.name}.`,
              `{queenB} accuses {queenA} of copying her silhouette for ${challenge.name}.`
          ],
          improv: [
              `{queenA} and {queenB} can't agree on a storyline for ${challenge.name}.`,
              `Improv chaos! {queenA} keeps breaking character while {queenB} fumes.`
          ],
          makeover: [
              `{queenA}'s makeover partner is flirting with {queenB}—werkroom tension rising.`,
              `Makeover mayhem: {queenB} won't share lashes with {queenA}.`
          ],
          rusical: [
              `{queenA} lands the lead in ${challenge.name} and {queenB} is plotting a sabotage.`,
              `Harmony or havoc? {queenA} and {queenB} argue over key changes for ${challenge.name}.`
          ],
          rumix: [
              `{queenA} refuses to share her verse with anyone before ${challenge.name}.`,
              `{queenB} thinks {queenA}'s verse is messy and says so in front of the choreographer.`
          ],
          snatch_game: [
              `{queenA} thinks {queenB}'s character choice is a flop and isn't hiding it.`,
              `Snatch Game smack talk! {queenA} and {queenB} trade reads during rehearsal.`
          ],
          roast: [
              `{queenA} writes savage jokes about {queenB} and she overhears every single one.`,
              `{queenB} is convinced {queenA} will bomb the roast and is stirring the pot.`
          ],
          talent: [
              `{queenA} unveils a pyrotechnic gag while {queenB} questions her life choices.`,
              `Talent show rivalries ignite between {queenA} and {queenB} backstage.`
          ],
          branding: [
              `{queenA} says {queenB}'s product smells like Muk sludge—shade before ${challenge.name}.`,
              `{queenB} and {queenA} accidentally pitch the same brand concept. Awkward!`
          ],
          girl_groups: [
              `{queenA} refuses to sing harmonies, leaving {queenB} to clean up the vocals.`,
              `Girl group drama erupts when {queenB} rewrites {queenA}'s verse.`
          ],
          ball: [
              `{queenA} steals the best fabric bolt and {queenB} is fuming before the ball.`,
              `Three looks, zero chill—{queenA} and {queenB} are racing to finish for ${challenge.name}.`
          ]
      };
      const defaults = [
          `{queenA} is plotting a power move while {queenB} confides in the cameras about the pressure of ${challenge.name}.`,
          `${challenge.name} is splitting the werkroom—{queenA} and {queenB} are on the brink of a feud.`
      ];
      const options = highlightTemplates[challenge.type] ?? defaults;
      const template = options[Math.floor(Math.random() * options.length)] ?? defaults[0];
      const queenAName = queenA?.name ?? 'One queen';
      const queenBName = queenB?.name ?? 'another queen';
      const filled = template
          .replace('{queenA}', queenAName)
          .replace('{queenB}', queenBName)
          .replace('{challenge}', challenge.name);
      return `Episode ${episodeCount}: ${filled}`;
  }, [activeQueens, episodeCount]);

  // --- Derived State ---
  const activeQueens = useMemo(() => cast.filter(q => q.status === 'active'), [cast]);
  const challengePreviewStory = useMemo(
      () => (currentChallenge ? buildChallengeHighlight(currentChallenge) : ''),
      [currentChallenge, buildChallengeHighlight]
  );
  useEffect(() => {
      if (competitionFormat === 'allStars' && splitPremiere) {
          setSplitPremiere(false);
      }
  }, [competitionFormat, splitPremiere]);
  useEffect(() => {
      if (
          competitionFormat === 'allStars' &&
          phase === 'CHALLENGE_SELECTION' &&
          episodeCount === 6 &&
          !revengeEpisodeTriggered
      ) {
          setRevengeEpisodeTriggered(true);

          const eliminated = cast.filter(q => q.status === 'eliminated');
          const activePool = [...activeQueens];
          const pairCount = Math.min(eliminated.length, activePool.length);

          if (pairCount < 2) {
              setRevengeEpisodeActive(false);
              setRevengeReturneeIds([]);
              setRevengePairings([]);
              return;
          }

          const returneePool = eliminated.slice(0, pairCount);
          const partnerPool = activePool.slice(0, pairCount);
          const pairings: { returneeId: number; partnerId: number }[] = returneePool.map((returnee, index) => ({
              returneeId: returnee.id,
              partnerId: partnerPool[index]?.id ?? activePool[index % activePool.length].id
          }));

          setRevengeEpisodeActive(true);
          setRevengeReturneeIds(returneePool.map(q => q.id));
          setRevengePairings(pairings);
          setCurrentStoryline('All the eliminated queens storm back into the werkroom for REVENGE OF THE QUEENS!');
      }
  }, [competitionFormat, phase, episodeCount, revengeEpisodeTriggered, cast, activeQueens]);

  // For split premiere, we only want queens in the current episode's group
  const revengeReturnees = useMemo(
      () => revengeEpisodeActive
          ? cast.filter(q => revengeReturneeIds.includes(q.id))
          : [],
      [cast, revengeEpisodeActive, revengeReturneeIds]
  );

  const currentEpisodeQueens = useMemo(() => {
      if (splitPremiere && episodeCount === 1) return activeQueens.filter(q => q.group === 1);
      if (splitPremiere && episodeCount === 2) return activeQueens.filter(q => q.group === 2);
      if (revengeEpisodeActive) {
          const combined: Queen[] = [...activeQueens];
          revengeReturnees.forEach(returnee => {
              if (!combined.some(q => q.id === returnee.id)) {
                  combined.push(returnee);
              }
          });
          return combined;
      }
      return activeQueens;
  }, [activeQueens, splitPremiere, episodeCount, revengeEpisodeActive, revengeReturnees]);

  const eliminatedQueens = useMemo(() => cast.filter(q => q.status === 'eliminated'), [cast]);
  const evolvableQueens = useMemo(
      () => currentEpisodeQueens.filter(q =>
          q.evolutionLine && (q.evolutionStage ?? 0) < q.evolutionLine.length - 1
      ),
      [currentEpisodeQueens]
  );
  const evolvableNames = useMemo(() => evolvableQueens.map(q => q.name), [evolvableQueens]);
  const formattedEvolvableNames = useMemo(() => {
      if (evolvableNames.length === 0) return '';
      if (evolvableNames.length === 1) return evolvableNames[0];
      if (evolvableNames.length === 2) return `${evolvableNames[0]} & ${evolvableNames[1]}`;
      return `${evolvableNames.slice(0, -1).join(', ')} & ${evolvableNames[evolvableNames.length - 1]}`;
  }, [evolvableNames]);

  // --- Phase Handlers ---

  const enterSetup = () => {
      setPhase('CAST_SELECTION');
      setSelectedCastIds([]);
      setSplitPremiere(false);
      setCompetitionFormat('standard');
      setSeasonMode('final');
      setPendingLegacyElimination(null);
      setUnsavedPlacements({});
      setLatestResults({});
      setRecentEvolution(null);
      setRevengeEpisodeTriggered(false);
      setRevengeEpisodeActive(false);
      setRevengeReturneeIds([]);
      setRevengeTopReturneeIds([]);
      setRevengeBottomIds([]);
      setRevengePairings([]);
  }

  const toggleQueenSelection = (id: number) => {
      if (selectedCastIds.includes(id)) {
          setSelectedCastIds(prev => prev.filter(qId => qId !== id));
      } else {
          if (selectedCastIds.length >= 16) return; // Hard limit for UI sanity
          setSelectedCastIds(prev => [...prev, id]);
      }
  };

  const finalizeCast = () => {
      if (selectedCastIds.length < 4) {
          alert("Please select at least 4 queens.");
          return;
      }
      
      const selectedBlueprints = QUEEN_BLUEPRINTS.filter(template => selectedCastIds.includes(template.id));
      let newCast = selectedBlueprints.map(template => instantiateQueenFromTemplate(template, seasonMode));

      if (splitPremiere) {
          // Randomly assign groups 1 and 2
          const shuffled = [...newCast].sort(() => 0.5 - Math.random());
          const mid = Math.ceil(shuffled.length / 2);
          newCast = shuffled.map((q, idx) => ({
              ...q,
              group: idx < mid ? 1 : 2
          }));
      }

      setCast(newCast);
      setEpisodeCount(1);
      setPhase('ENTRANCES');
      const setupLine = splitPremiere
          ? 'The first group of queens arrives...'
          : seasonMode === 'evolve'
              ? 'The workroom is buzzing—fresh forms are ready to evolve!'
              : 'The werkroom is quiet... for now.';
      setCurrentStoryline(setupLine);
      setCurrentChallenge(null);
      setSuggestedChallenge(null);
      setChallengeHistory([]);
      setDoubleShantayUsed(false);
      setPendingLegacyElimination(null);
      setActiveTab('game');
      setRevengeEpisodeTriggered(false);
      setRevengeEpisodeActive(false);
      setRevengeReturneeIds([]);
      setRevengeTopReturneeIds([]);
      setRevengeBottomIds([]);
      setRevengePairings([]);
  };

  const nextPhase = () => {
    switch (phase) {
      case 'ENTRANCES': 
          if (splitPremiere && episodeCount === 2) {
             setCurrentStoryline("The second group of queens arrives!");
          }
          setPhase('PROMO'); 
          break;
      case 'PROMO': setPhase('CHALLENGE_SELECTION'); break;
      case 'CHALLENGE_SELECTION':
        if (!currentChallenge) {
            setCurrentStoryline('Select a challenge before proceeding.');
            break;
        }
        const highlight = challengePreviewStory || buildChallengeHighlight(currentChallenge);
        setChallengeHistory(prev => {
            const filtered = prev.filter(entry => entry.episode !== episodeCount);
            return [...filtered, { episode: episodeCount, challenge: currentChallenge, highlight }];
        });
        setCurrentStoryline(highlight);
        setPhase('CHALLENGE_INTRO');
        break;
      case 'CHALLENGE_INTRO': setPhase('PERFORMANCE'); break;
      case 'PERFORMANCE':
        generateInitialPlacements();
        setPhase('JUDGING');
        break;
      case 'JUDGING':
        finalizePlacements();
        setPhase('RESULTS');
        break;
      case 'RESULTS':
        generateUntuckedDrama();
        setPhase('UNTUCKED');
        break;
      case 'UNTUCKED': setPhase('LIPSYNC'); setupLipsync(); break;
      case 'ELIMINATION': 
        if (activeQueens.length <= 4 && (!splitPremiere || episodeCount > 2)) {
          setPhase('FINALE');
        } else {
          setEpisodeCount(prev => prev + 1);
          if (splitPremiere && episodeCount === 1) {
              setPhase('ENTRANCES'); // Go to group 2 entrances
              setCurrentStoryline("Episode 2: The second group enters the competition.");
          } else if (splitPremiere && episodeCount === 2) {
               setPhase('CHALLENGE_SELECTION'); // Merge happens next ep
               setCurrentStoryline("Episode 3: The two groups finally merge! The shade is thick.");
          } else {
              setPhase('CHALLENGE_SELECTION');
          }
          if (episodeCount >= 5) {
              setRevengeEpisodeActive(false);
              setRevengeReturneeIds([]);
              setRevengeTopReturneeIds([]);
              setRevengeBottomIds([]);
              setRevengePairings([]);
          }
        }
        break;
      case 'FINALE': setPhase('SEASON_OVER'); break;
    }
  };

  useEffect(() => {
      if (revengeEpisodeActive && phase === 'CHALLENGE_SELECTION') {
          if (!currentChallenge || currentChallenge.name !== REVENGE_CHALLENGE.name) {
              generateChallenge(REVENGE_CHALLENGE);
          }
      }
  }, [revengeEpisodeActive, phase, currentChallenge, generateChallenge]);

  useEffect(() => {
      if (phase !== 'CHALLENGE_SELECTION' || revengeEpisodeActive) {
          return;
      }
      const available = CHALLENGES.filter(challenge => !splitPremiere || episodeCount > 2 || challenge.isPremiereFriendly);
      if (available.length === 0) {
          return;
      }
      const suggestion = available[Math.floor(Math.random() * available.length)];
      if (!currentChallenge || currentChallenge.name !== suggestion.name) {
          generateChallenge(suggestion, { isSuggested: true });
      } else if (!suggestedChallenge || suggestedChallenge.name !== suggestion.name) {
          setSuggestedChallenge(suggestion);
      }
  }, [phase, revengeEpisodeActive, splitPremiere, episodeCount, currentChallenge, suggestedChallenge, generateChallenge]);

  const generateInitialPlacements = () => {
    if (!currentChallenge) return;

    const modifiers: Record<number, number> = {};
    const isSplitNonElim = splitPremiere && episodeCount <= 2;
    const isAllStarsEpisode = competitionFormat === 'allStars' && !isSplitNonElim;

    if (revengeEpisodeActive) {
        const pairDetails = revengePairings
            .map(pairing => {
                const returnee = currentEpisodeQueens.find(q => q.id === pairing.returneeId);
                const partner = currentEpisodeQueens.find(q => q.id === pairing.partnerId);
                if (!returnee || !partner) return null;
                const returneeScore = calculatePerformance(returnee, currentChallenge, modifiers);
                const partnerScore = calculatePerformance(partner, currentChallenge, modifiers);
                return {
                    pairing,
                    returnee,
                    partner,
                    totalScore: returneeScore + partnerScore
                };
            })
            .filter((entry): entry is {
                pairing: { returneeId: number; partnerId: number };
                returnee: Queen;
                partner: Queen;
                totalScore: number;
            } => Boolean(entry))
            .sort((a, b) => b.totalScore - a.totalScore);

        const placements: Record<number, Placement> = {};

        if (pairDetails.length === 0) {
            setRevengeTopReturneeIds([]);
            setRevengeBottomIds([]);
            setUnsavedPlacements(placements);
            return;
        }

        const topPairs = pairDetails.slice(0, Math.min(2, pairDetails.length));
        const safePair = pairDetails.length > 2 ? pairDetails[2] : null;
        const bottomPairs = pairDetails.slice(-Math.min(2, Math.max(pairDetails.length - 2, 0)));

        const topReturneeIds = topPairs.map(entry => entry.returnee.id);
        setRevengeTopReturneeIds(topReturneeIds);

        const bottomActiveIds = bottomPairs.map(entry => entry.partner.id);
        setRevengeBottomIds(bottomActiveIds);

        pairDetails.forEach(entry => {
            placements[entry.returnee.id] = 'OUT';
            placements[entry.partner.id] = 'SAFE';
        });

        topPairs.forEach(entry => {
            placements[entry.returnee.id] = 'TOP2';
            placements[entry.partner.id] = 'TOP2';
        });

        if (safePair) {
            placements[safePair.partner.id] = 'SAFE';
        }

        bottomPairs.forEach(entry => {
            placements[entry.partner.id] = 'BTM2';
        });

        currentEpisodeQueens.forEach(q => {
            if (revengeReturneeIds.includes(q.id)) {
                placements[q.id] = placements[q.id] || 'OUT';
            } else if (!placements[q.id]) {
                placements[q.id] = 'SAFE';
            }
        });

        setUnsavedPlacements(placements);
        return;
    }

    // --- Untucked/Workroom Drama Generators that affect score ---
    currentEpisodeQueens.forEach(q => {
         // Random chance of a "bad day" or "breakthrough"
         if (Math.random() > 0.9) {
             modifiers[q.id] = -2;
             setCurrentStoryline(`Workroom: ${q.name} is having a meltdown and can't focus.`);
         }
    });
    // Challenge specific modifiers
    if (currentChallenge.type === 'snatch_game') {
        const bombs = currentEpisodeQueens.filter(q => q.stats.improv < 5);
        if (bombs.length > 0) {
             bombs.forEach(q => modifiers[q.id] = (modifiers[q.id] || 0) - 3);
             setCurrentStoryline("Snatch Game: It's looking like a trainwreck for several queens.");
        }
    }

    const scoredQueens = currentEpisodeQueens.map(q => ({
      id: q.id,
      score: calculatePerformance(q, currentChallenge, modifiers)
    })).sort((a, b) => b.score - a.score);

    const newPlacements: Record<number, Placement> = {};
    const count = currentEpisodeQueens.length;

    scoredQueens.forEach(sq => newPlacements[sq.id] = 'SAFE');

    if (isSplitNonElim) {
        // Top 2 format
        newPlacements[scoredQueens[0].id] = 'WIN'; // Placeholder, will be TOP2 until lipsync actually
        newPlacements[scoredQueens[1].id] = 'TOP2';
        if (count > 4) newPlacements[scoredQueens[2].id] = 'HIGH';
        if (count > 6) newPlacements[scoredQueens[3].id] = 'HIGH';
        // Others are safe, maybe a low if we want to scare them, but no BTM2
        if (count > 5) newPlacements[scoredQueens[count-1].id] = 'LOW';
    } else if (isAllStarsEpisode) {
        if (count >= 2) {
            newPlacements[scoredQueens[0].id] = 'TOP2';
            newPlacements[scoredQueens[1].id] = 'TOP2';
        }
        if (count > 4) {
            newPlacements[scoredQueens[2].id] = 'HIGH';
            if (count > 5) newPlacements[scoredQueens[3].id] = 'HIGH';
        }
        if (count > 3) newPlacements[scoredQueens[count - 3].id] = 'LOW';
        if (count > 1) {
            newPlacements[scoredQueens[count - 2].id] = 'BTM2';
            newPlacements[scoredQueens[count - 1].id] = 'BTM2';
        }
    } else {
        // Standard Format
        if (count <= 5) {
            newPlacements[scoredQueens[0].id] = 'WIN';
            newPlacements[scoredQueens[1].id] = 'HIGH';
            if(count > 3) newPlacements[scoredQueens[2].id] = 'HIGH';
            newPlacements[scoredQueens[count-2].id] = 'BTM2';
            newPlacements[scoredQueens[count-1].id] = 'BTM2';
         } else {
             newPlacements[scoredQueens[0].id] = 'WIN';
             newPlacements[scoredQueens[1].id] = 'HIGH';
             newPlacements[scoredQueens[2].id] = 'HIGH';
             newPlacements[scoredQueens[scoredQueens.length - 3].id] = 'LOW';
             newPlacements[scoredQueens[scoredQueens.length - 2].id] = 'BTM2';
             newPlacements[scoredQueens[scoredQueens.length - 1].id] = 'BTM2';
         }
    }

    setUnsavedPlacements(newPlacements);
  };

  const finalizePlacements = () => {
    const isSplitNonElim = splitPremiere && episodeCount <= 2;
    const placements: Record<number, Placement> = {};

    setCast(prevCast => prevCast.map(q => {
      // If split premiere, queens NOT in current group get 'N/A' for this episode's track record
      if (splitPremiere && episodeCount <= 2 && q.group !== (episodeCount as 1|2)) {
           placements[q.id] = 'N/A';
           return { ...q, trackRecord: [...q.trackRecord, 'N/A'] };
      }

      if (!currentEpisodeQueens.find(cq => cq.id === q.id)) return q;

      let placement = unsavedPlacements[q.id] || 'SAFE';

      // In split premiere, the 'WIN' initially assigned is just one of the TOP2 before the lipsync.
      // We'll formally mark both as TOP2 for now, and upgrade winner after lipsync.
      if (isSplitNonElim && (placement === 'WIN' || placement === 'TOP2')) {
          placement = 'TOP2';
      }

      placements[q.id] = placement;

      const confessionalPlacement: Placement =
          placement === 'WIN+OUT' || placement === 'WIN+RTRN'
              ? 'WIN'
              : placement === 'OUT'
                  ? 'ELIM'
                  : placement;
      const paddedRecord = [...q.trackRecord];
      while (paddedRecord.length < episodeCount - 1) {
          paddedRecord.push('N/A');
      }
      const updatedRecord = [...paddedRecord, placement];
      const newConfessional = getConfessional(
          q,
          confessionalPlacement,
          'JUDGING',
          episodeCount,
          currentChallenge ?? undefined,
          currentEpisodeQueens
      );
      return {
        ...q,
        trackRecord: updatedRecord,
        confessionals: prependConfessional(q.confessionals, newConfessional)
      };
    }));
    setProducersMode(false);
    setLatestResults(placements);
    setCurrentStoryline('The judges have made their decision. Let\'s hear the results!');
  };

  const generateUntuckedDrama = () => {
    const isSplitNonElim = splitPremiere && episodeCount <= 2;
    const safeQueens = currentEpisodeQueens.filter(q => ['SAFE', 'HIGH', 'WIN', 'WIN+RTRN', 'WIN+OUT'].includes(unsavedPlacements[q.id]));
    const bottomQueens = currentEpisodeQueens.filter(q => ['LOW', 'BTM2'].includes(unsavedPlacements[q.id]));
    const top2Queens = currentEpisodeQueens.filter(q => ['TOP2', 'WIN', 'WIN+RTRN', 'WIN+OUT'].includes(unsavedPlacements[q.id]));

    if (isSplitNonElim && top2Queens.length >= 2) {
        setCurrentStoryline(`Untucked: ${top2Queens[0].name} and ${top2Queens[1].name} are sizing each other up for the lip sync win.`);
    } else if (safeQueens.length > 0 && bottomQueens.length > 0 && Math.random() > 0.4) {
        const instigator = safeQueens[Math.floor(Math.random() * safeQueens.length)];
        const victim = bottomQueens[Math.floor(Math.random() * bottomQueens.length)];
        const topics = [
            `said ${victim.name} should definitely go home tonight`,
            `called out ${victim.name} for having the same silhouette every runway`,
            `asked ${victim.name} why she even bothered showing up today`,
            `exposed that ${victim.name} was trash-talking alliances with the producers`,
            `brought up that ${victim.name} borrowed a wig and returned it ruined`
        ];
        setCurrentStoryline(`Untucked: The drama! ${instigator.name} ${topics[Math.floor(Math.random() * topics.length)]}.`);
    } else if (safeQueens.length > 1 && Math.random() > 0.5) {
        const conspirators = [...safeQueens].sort(() => 0.5 - Math.random()).slice(0, 2);
        if (conspirators.length === 2) {
            setCurrentStoryline(`Untucked: ${conspirators[0].name} and ${conspirators[1].name} plot a secret alliance before the next challenge.`);
        } else {
            setCurrentStoryline(`Untucked: ${safeQueens[0].name} is gossiping with the producers about a surprise twist.`);
        }
    } else {
        setCurrentStoryline("Untucked: Everyone is being fake nice. It's suspicious.");
    }
  };

  const handleEvolution = (queenId: number) => {
    let evolutionDetails: {
        queenId: number;
        fromName: string;
        toName: string;
        statBoosts: { stat: StatCategory; amount: number }[];
    } | null = null;

    setCast(prev => prev.map(q => {
        if (q.id !== queenId || !q.evolutionLine) {
            return q;
        }

        const currentStage = q.evolutionStage ?? 0;
        const nextStage = currentStage + 1;
        if (nextStage >= q.evolutionLine.length) {
            return q;
        }

        const fromForm = q.evolutionLine[currentStage];
        const toForm = q.evolutionLine[nextStage];
        const statBoosts = STAT_CATEGORIES.map(stat => ({
            stat,
            amount: toForm.stats[stat] - q.stats[stat]
        })).filter(boost => boost.amount > 0);

        evolutionDetails = {
            queenId,
            fromName: fromForm.name,
            toName: toForm.name,
            statBoosts
        };

        return {
            ...q,
            dexId: toForm.dexId,
            name: toForm.name,
            originalName: toForm.originalName,
            stats: { ...toForm.stats },
            personality: toForm.personality,
            entranceLine: toForm.entranceLine,
            evolutionStage: nextStage,
            confessionals: prependConfessional(
                q.confessionals,
                makeConfessional(
                    `Did you clock that glow up? ${fromForm.name} just became ${toForm.name}.`,
                    'Evolution milestone celebration',
                    'evolution'
                )
            )
        };
    }));

    if (evolutionDetails) {
        setRecentEvolution(evolutionDetails);
        setCurrentStoryline(`${evolutionDetails.fromName} evolves into ${evolutionDetails.toName}! The werkroom is gagged.`);
    }
  };

  const setupLipsync = () => {
    const isSplitNonElim = splitPremiere && episodeCount <= 2;
    const isAllStarsEpisode = competitionFormat === 'allStars' && !isSplitNonElim;
    let pair: Queen[] = [];

    if (revengeEpisodeActive && revengeTopReturneeIds.length > 0) {
        pair = revengeTopReturneeIds
            .map(id => cast.find(q => q.id === id))
            .filter((q): q is Queen => Boolean(q));
        const faceOff = pair.map(q => q.name).join(' vs ');
        setCurrentStoryline(`Revenge Lip Sync: ${faceOff || '???'}! Winner${pair.length > 1 ? 's' : ''} return to the competition.`);
    } else if (isSplitNonElim || isAllStarsEpisode) {
        // Top 2 Lipsync
        pair = currentEpisodeQueens.filter(q => q.trackRecord[q.trackRecord.length - 1] === 'TOP2');
        setCurrentStoryline(
            isAllStarsEpisode
                ? `Lip Sync for Your Legacy: ${pair[0]?.name} vs ${pair[1]?.name}!`
                : `Top 2 Lip Sync for the Win: ${pair[0]?.name} vs ${pair[1]?.name}!`
        );
    } else {
        // Bottom 2 Lipsync
        pair = currentEpisodeQueens.filter(q => q.trackRecord[q.trackRecord.length - 1] === 'BTM2');
        setCurrentStoryline(`Lip Sync for your LIFE: ${pair[0]?.name} vs ${pair[1]?.name}!`);
    }
    setLipsyncPair(pair);
  };

  const handleLipsyncWinner = (winnerId: number, doubleShantay: boolean = false) => {
    const isSplitNonElim = splitPremiere && episodeCount <= 2;
    const isAllStarsEpisode = competitionFormat === 'allStars' && !isSplitNonElim;

    if (revengeEpisodeActive && revengeTopReturneeIds.length > 0) {
        const winningReturneeIds = doubleShantay
            ? [...revengeTopReturneeIds]
            : revengeTopReturneeIds.includes(winnerId)
                ? [winnerId]
                : [];

        if (winningReturneeIds.length === 0) {
            return;
        }

        const winningReturnees = winningReturneeIds
            .map(id => cast.find(q => q.id === id))
            .filter((q): q is Queen => Boolean(q));
        const losingReturneeIds = revengeTopReturneeIds.filter(id => !winningReturneeIds.includes(id));
        const losingReturnees = losingReturneeIds
            .map(id => cast.find(q => q.id === id))
            .filter((q): q is Queen => Boolean(q));

        const partnerIds = revengePairings
            .filter(pair => winningReturneeIds.includes(pair.returneeId))
            .map(pair => pair.partnerId);
        const nonReturningIds = revengeReturneeIds.filter(id =>
            !winningReturneeIds.includes(id) && !losingReturneeIds.includes(id)
        );

        setCast(prev => prev.map(q => {
            if (winningReturneeIds.includes(q.id)) {
                const tr = [...q.trackRecord];
                tr[tr.length - 1] = 'WIN+RTRN';
                return {
                    ...q,
                    status: 'active',
                    trackRecord: tr,
                    confessionals: prependConfessional(
                        q.confessionals,
                        makeConfessional(
                            "I'm back in the race and ready to slay!",
                            'Legacy challenge triumph',
                            'legacy'
                        )
                    )
                };
            }
            if (losingReturneeIds.includes(q.id)) {
                const tr = [...q.trackRecord];
                tr[tr.length - 1] = 'WIN+OUT';
                return {
                    ...q,
                    status: 'eliminated',
                    trackRecord: tr,
                    confessionals: prependConfessional(
                        q.confessionals,
                        makeConfessional(
                            "I won the challenge but still have to sashay away... again!",
                            'Return challenge heartbreak',
                            'legacy'
                        )
                    )
                };
            }
            if (partnerIds.includes(q.id)) {
                const tr = [...q.trackRecord];
                tr[tr.length - 1] = 'WIN';
                return {
                    ...q,
                    trackRecord: tr,
                    confessionals: prependConfessional(
                        q.confessionals,
                        makeConfessional(
                            "My returning sister and I just snatched that victory!",
                            'Paired victory celebration',
                            'challenge'
                        )
                    )
                };
            }
            if (nonReturningIds.includes(q.id)) {
                const tr = [...q.trackRecord];
                tr[tr.length - 1] = 'OUT';
                return {
                    ...q,
                    status: 'eliminated',
                    trackRecord: tr,
                    confessionals: prependConfessional(
                        q.confessionals,
                        makeConfessional(
                            "I gave it my all, but the comeback wasn't in the cards.",
                            'Eliminated after revenge twist',
                            'legacy'
                        )
                    )
                };
            }
            return q;
        }));

        setLatestResults(prev => {
            const updated = { ...prev };
            winningReturneeIds.forEach(id => { updated[id] = 'WIN+RTRN'; });
            partnerIds.forEach(id => { updated[id] = 'WIN'; });
            losingReturneeIds.forEach(id => { updated[id] = 'WIN+OUT'; });
            nonReturningIds.forEach(id => { updated[id] = 'OUT'; });
            return updated;
        });

        const bottomQueens = currentEpisodeQueens.filter(q => revengeBottomIds.includes(q.id));
        const winnerNames = winningReturnees.map(w => w.name).join(' & ');
        const allyIds = winningReturnees.slice(1).map(w => w.id);
        const loserNames = losingReturnees.map(l => l.name).join(' & ');

        if (bottomQueens.length > 0) {
            setPendingLegacyElimination({
                winnerId: winningReturnees[0]?.id ?? winningReturneeIds[0],
                options: bottomQueens,
                allies: allyIds
            });
            setCurrentStoryline(
                losingReturnees.length > 0
                    ? `${winnerNames} return to the competition while ${loserNames} must exit once more. The power now shifts to the returning legend${winningReturnees.length > 1 ? 's' : ''}.`
                    : `${winnerNames} return to the competition! Time to decide which bottom queen will sashay away.`
            );
        } else {
            setPendingLegacyElimination(null);
            setCurrentStoryline(
                losingReturnees.length > 0
                    ? `${winnerNames} return to the competition, but ${loserNames} have to say goodbye again. No eliminations this week.`
                    : `${winnerNames} return to the competition! No one is up for elimination this week.`
            );
        }

        setRevengeEpisodeActive(false);
        setRevengeReturneeIds([]);
        setRevengeTopReturneeIds([]);
        setRevengeBottomIds([]);
        setRevengePairings([]);
        setPhase('ELIMINATION');
        return;
    }

    if (doubleShantay && !isSplitNonElim && !isAllStarsEpisode) {
        if (doubleShantayUsed) { alert("Already used!"); return; }
        setDoubleShantayUsed(true);
        setCurrentStoryline("Shantay you BOTH stay! (Double Shantay used)");
        setPhase('ELIMINATION');
        return;
    }

    if (isAllStarsEpisode) {
        const winner = cast.find(c => c.id === winnerId);
        const bottomQueens = currentEpisodeQueens.filter(q => q.trackRecord[q.trackRecord.length - 1] === 'BTM2');

        setCast(prev => prev.map(q => {
            if (q.id === winnerId) {
                const tr = [...q.trackRecord];
                tr[tr.length - 1] = 'WIN';
                return {
                    ...q,
                    trackRecord: tr,
                    confessionals: prependConfessional(
                        q.confessionals,
                        makeConfessional(
                            'Legendary win! Time to make a power move.',
                            'Lip sync for your legacy victory',
                            'lipSync'
                        )
                    )
                };
            }
            return q;
        }));

        if (bottomQueens.length === 0) {
            setPendingLegacyElimination(null);
            setCurrentStoryline(`${winner?.name} wins the lip sync but no queens are eligible for elimination.`);
            setPhase('ELIMINATION');
            return;
        }

        setPendingLegacyElimination({ winnerId, options: bottomQueens });
        setCurrentStoryline(`${winner?.name} must choose a queen to eliminate.`);
        setPhase('ELIMINATION');
        return;
    }

    const loserId = lipsyncPair.find(q => q.id !== winnerId)?.id;
    if (!loserId) return;

    setCast(prev => prev.map(q => {
      if (q.id === winnerId && isSplitNonElim) {
          // Upgrade TOP2 to WIN
           const tr = [...q.trackRecord];
           tr[tr.length - 1] = 'WIN';
           return {
               ...q,
               trackRecord: tr,
               confessionals: prependConfessional(
                   q.confessionals,
                   makeConfessional(
                       'I got that premiere win, baby! The others better watch out.',
                       'Split premiere lip sync victory',
                       'lipSync'
                   )
               )
           };
      }
      if (q.id === loserId && !isSplitNonElim) {
        // Eliminate
        const tr = [...q.trackRecord];
        tr[tr.length - 1] = 'ELIM';
        return { ...q, status: 'eliminated', trackRecord: tr };
      }
      return q;
    }));
    
    setPhase('ELIMINATION');
    if (isSplitNonElim) {
         const winner = cast.find(c => c.id === winnerId);
         setCurrentStoryline(`Condragulations ${winner?.name}, you're the winner of this week's challenge!`);
    } else {
        const loser = cast.find(c => c.id === loserId);
        setCurrentStoryline(`${loser?.name}, sashay away...`);
    }
  };

  const handleLegacyElimination = (queenId: number) => {
    if (!pendingLegacyElimination) return;
    const eliminator = cast.find(c => c.id === pendingLegacyElimination.winnerId);
    const allyNames = (pendingLegacyElimination.allies || [])
        .map(id => cast.find(c => c.id === id)?.name)
        .filter(Boolean) as string[];
    const eliminatedQueen = cast.find(c => c.id === queenId);

    setCast(prev => prev.map(q => {
        if (q.id === queenId) {
            const tr = [...q.trackRecord];
            tr[tr.length - 1] = 'ELIM';
            return { ...q, status: 'eliminated', trackRecord: tr };
        }
        return q;
    }));

    setPendingLegacyElimination(null);
    const decidingNames = [eliminator?.name, ...allyNames].filter(Boolean).join(' & ');
    setCurrentStoryline(`${eliminatedQueen?.name}, ${decidingNames || 'the winner'} ${allyNames.length > 0 ? 'have' : 'has'} chosen for you to sashay away.`);
  };

  const simulateFinale = () => {
      const finalists = activeQueens;
      // Simple score based winner for now
       let bestScore = -100;
      let winnerId = finalists[0].id;

      finalists.forEach(f => {
          const summary = summarizePlacements(f.trackRecord);
          let score = summary.performanceScore;
          score += summary.wins * 3 + summary.top2 * 2 + summary.highs;
          score -= summary.bottoms;
          score += Math.random() * 6; // sprinkle of chaos
          if (score > bestScore) {
              bestScore = score;
              winnerId = f.id;
          }
      });

      setCast(prev => prev.map(q => {
         if (q.status === 'eliminated') return q;
         return { ...q, status: q.id === winnerId ? 'winner' : 'runner-up' };
      }));
      setPhase('SEASON_OVER');
  };

  // --- UI Components ---

  const QueenCard = ({ queen, minimal = false }: { queen: Queen, minimal?: boolean }) => (
    <div className={`bg-white border-2 border-pink-300 rounded-lg p-2 flex ${minimal ? 'flex-col items-center text-center w-28' : 'flex-row items-center space-x-4'} shadow-sm`}>
      <img src={getQueenImg(queen.dexId)} alt={queen.name} className={`${minimal ? 'w-16 h-16' : 'w-16 h-16'} bg-gray-100 rounded-full border border-pink-200`} />
      {!minimal && (
        <div className="overflow-hidden">
          <div className="font-bold text-pink-900 truncate">{queen.name}</div>
          <div className="text-xs text-pink-600 italic truncate">"{queen.personality}"</div>
        </div>
      )}
      {minimal && <div className="font-bold text-xs mt-1 truncate w-full px-1">{queen.name}</div>}
    </div>
  );

  const MiniTrackRecord = ({ trackRecord }: { trackRecord: Placement[] }) => (
      <div className="flex space-x-1 mt-1 flex-wrap">
          {trackRecord.map((placement, idx) => {
             const style = {
                 'WIN': { backgroundColor: 'royalblue' },
                 'WIN+RTRN': { backgroundColor: '#4f46e5' },
                 'WIN+OUT': { backgroundColor: 'mediumslateblue' },
                 'TOP2': { backgroundColor: 'deepskyblue' },
                 'HIGH': { backgroundColor: 'lightblue' },
                 'LOW': { backgroundColor: 'lightpink' },
                 'BTM2': { backgroundColor: 'tomato' },
                 'OUT': { backgroundColor: '#6b7280' },
                 'ELIM': { backgroundColor: 'darkred' },
                 'N/A': { backgroundColor: '#e5e7eb', opacity: 0.3 }
             }[placement] || { backgroundColor: '#e5e7eb' }; // SAFE is gray

             return (
                 <div key={idx} title={`Ep ${idx+1}: ${placement}`} className="w-3 h-3 rounded-full" style={style} />
             );
          })}
      </div>
  );

  const PlacementBadge = ({ placement }: { placement: Placement }) => {
    const styleColors: Record<string, React.CSSProperties> = {
      'WIN': { backgroundColor: 'royalblue', borderColor: 'darkblue', color: 'white' },
      'WIN+RTRN': { backgroundColor: '#4f46e5', borderColor: '#312e81', color: 'white', fontWeight: 'bold' },
      'WIN+OUT': { backgroundColor: 'mediumslateblue', borderColor: 'rebeccapurple', color: 'white', fontWeight: 'bold' },
      'TOP2': { backgroundColor: 'deepskyblue', borderColor: 'dodgerblue', color: 'white', fontWeight: 'bold' },
      'HIGH': { backgroundColor: 'lightblue', borderColor: 'deepskyblue', color: 'darkblue' },
      'LOW': { backgroundColor: 'lightpink', borderColor: 'pink', color: 'darkred' },
      'BTM2': { backgroundColor: 'tomato', borderColor: 'orangered', color: 'white' },
      'SAFE': { backgroundColor: '#e5e7eb', borderColor: '#9ca3af', color: '#374151' },
      'OUT': { backgroundColor: '#6b7280', borderColor: '#4b5563', color: '#f9fafb', fontWeight: 'bold' },
      'ELIM': { backgroundColor: '#374151', borderColor: '#1f2937', color: '#f87171', fontWeight: 'bold' },
      'RUNNER-UP': { backgroundColor: '#c0c0c0', borderColor: '#6b7280', color: '#111827' },
      'WINNER': { backgroundColor: 'gold', borderColor: 'darkgoldenrod', color: 'white', fontWeight: '800' },
      'N/A': { backgroundColor: 'transparent', color: '#9ca3af' },
      '': {}
    };
    return (
      <div style={styleColors[placement] || styleColors['SAFE']} className="text-xs font-bold px-2 py-1 rounded border text-center min-w-[50px]">
        {placement}
      </div>
    );
  };

  const GameScreen = () => {
    const proceedDisabled = (phase === 'ELIMINATION' && !!pendingLegacyElimination) || (phase === 'CHALLENGE_SELECTION' && !currentChallenge);
    return (
      <div className="flex flex-col h-full">
      {/* Phase Indicator */}
      <div className="bg-pink-800 text-white p-4 text-center font-bold text-2xl uppercase tracking-widest flex justify-between items-center shadow-md">
         <span className="text-pink-200">S1 | Ep {episodeCount}</span>
         <span className="bg-pink-600 px-4 py-1 rounded-full text-sm border border-pink-400">{phase.replace('_', ' ')}</span>
      </div>

      {/* Main Stage Area */}
      <div className="flex-grow bg-gradient-to-b from-pink-50 to-purple-100 p-6 overflow-y-auto">

        {recentEvolution && (() => {
            const evolvedQueen = cast.find(q => q.id === recentEvolution?.queenId);
            if (!evolvedQueen) return null;
            const remainingEvolutions = evolvedQueen.evolutionLine
                ? Math.max(0, evolvedQueen.evolutionLine.length - 1 - (evolvedQueen.evolutionStage ?? 0))
                : 0;
            return (
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white rounded-3xl p-6 shadow-2xl border border-white/40 relative overflow-hidden evolution-celebration">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff_0%,_transparent_70%)]"></div>
                        <div className="evolution-glow" />
                        <div className="evolution-sparkle" />
                        <div className="evolution-sparkle" />
                        <div className="evolution-sparkle" />
                        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 relative z-10">
                            <img src={getQueenImg(evolvedQueen.dexId)} className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/70 bg-white/30 shadow-lg" />
                            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                                <h3 className="text-sm uppercase tracking-[0.4em] text-white/80">Evolution Boost</h3>
                                <p className="text-2xl font-extrabold mt-2">{recentEvolution.fromName} ➜ {recentEvolution.toName}</p>
                                <p className="text-sm text-white/80 mt-2 max-w-xl">New glamour unlocked! These boosted stats will shake up the competition.</p>
                                <p className="text-xs text-white/70 mt-1">
                                    {remainingEvolutions > 0
                                        ? `${remainingEvolutions} evolution${remainingEvolutions > 1 ? 's' : ''} still on the table.`
                                        : 'Fully evolved and feeling legendary!'}
                                </p>
                                {recentEvolution.statBoosts.length > 0 && (
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                                        {recentEvolution.statBoosts.map(boost => (
                                            <span key={boost.stat} className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                                                {boost.stat.charAt(0).toUpperCase() + boost.stat.slice(1)} +{boost.amount}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setRecentEvolution(null)} className="mt-4 md:mt-0 md:ml-4 bg-white/20 hover:bg-white/30 text-xs uppercase tracking-widest px-4 py-2 rounded-full">Dismiss</button>
                        </div>
                    </div>
                </div>
            );
        })()}

        {phase === 'SETUP' && (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <Crown size={100} className="text-pink-600 animate-pulse" />
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 drop-shadow-sm">PokéDrag Race</h1>
            <button onClick={enterSetup} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-16 rounded-full text-2xl transition-all transform hover:scale-105 shadow-xl flex items-center">
              <Sparkles className="mr-2"/> New Game <Sparkles className="ml-2"/>
            </button>
          </div>
        )}

        {phase === 'CAST_SELECTION' && (
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-extrabold text-pink-900 text-center mb-4">Cast Your Queens</h2>
                <div className="text-center mb-8 flex flex-col items-center space-y-4">
                    <div className="text-xl text-pink-700 font-bold">{selectedCastIds.length} Queens Selected</div>
                    <div className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-inner">
                        <button
                            onClick={() => setCompetitionFormat('standard')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${competitionFormat === 'standard' ? 'bg-pink-600 text-white shadow-md' : 'text-pink-600 hover:bg-pink-100'}`}
                        >
                            Main Season
                        </button>
                        <button
                            onClick={() => setCompetitionFormat('allStars')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${competitionFormat === 'allStars' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 hover:bg-purple-100'}`}
                        >
                            All Stars Legacy
                        </button>
                    </div>
                    <div className="flex items-center space-x-3 bg-white p-2 rounded-full shadow-inner">
                        <button
                            onClick={() => setSeasonMode('final')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${seasonMode === 'final' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-500 hover:bg-rose-50'}`}
                        >
                            Final Form Season
                        </button>
                        <button
                            onClick={() => setSeasonMode('evolve')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${seasonMode === 'evolve' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        >
                            Evolution Journey
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-inner border border-pink-100">
                        <div className="flex items-center space-x-2">
                            <label className="text-xs uppercase tracking-widest font-semibold text-pink-600">Auto Cast</label>
                            <input
                                type="number"
                                min={4}
                                max={16}
                                value={autoSelectCount}
                                onChange={e => setAutoSelectCount(e.target.value)}
                                className="w-20 rounded-full border border-pink-200 px-3 py-1 text-sm text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                            />
                        </div>
                        <button
                            onClick={autoSelectQueens}
                            className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-4 py-2 rounded-full shadow-sm"
                        >
                            <Sparkles size={16} />
                            <span>Randomly pick {autoSelectCount}</span>
                        </button>
                    </div>
                    <div className="text-xs uppercase tracking-widest text-gray-500 space-y-1">
                        <p>{competitionFormat === 'allStars' ? 'Top two lip sync for their legacy each week.' : 'Bottom two lip sync for their lives.'}</p>
                        <p>{seasonMode === 'evolve' ? 'Queens debut in their first forms and can evolve up to their ultimate stage.' : 'Every queen enters at full power—no evolutions remaining.'}</p>
                    </div>
                     <label className={`flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow cursor-pointer ${competitionFormat === 'allStars' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                        <input type="checkbox" checked={splitPremiere} disabled={competitionFormat === 'allStars'} onChange={e => setSplitPremiere(e.target.checked)} className="w-5 h-5 text-pink-600" />
                        <span className="font-bold text-pink-800">Split Premiere (2 Non-Elim Episodes)</span>
                    </label>
                    {competitionFormat === 'allStars' && <div className="text-xs text-red-500 font-semibold">Split Premiere is unavailable in All Stars format.</div>}
                    <button onClick={finalizeCast} disabled={selectedCastIds.length < 4} className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold text-xl disabled:opacity-50 hover:bg-pink-700 transition-colors">
                        Start Season
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {QUEEN_BLUEPRINTS.map(template => {
                        const preview = getDisplayForm(template, seasonMode);
                        const evolutionsAvailable = template.forms.length - 1;
                        const badgeText = evolutionsAvailable > 0
                            ? `${evolutionsAvailable} evolution${evolutionsAvailable > 1 ? 's' : ''}`
                            : 'Final form';
                        return (
                            <div key={template.id} onClick={() => toggleQueenSelection(template.id)}
                                 className={`cursor-pointer p-3 rounded-xl border-2 transition-all relative ${selectedCastIds.includes(template.id) ? 'border-pink-500 bg-pink-50 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-pink-300 opacity-70'}`}>
                                 {selectedCastIds.includes(template.id) && <CheckCircle className="absolute top-2 right-2 text-pink-500" size={20}/>}
                                 <div className="flex flex-col items-center text-center space-y-1">
                                     <img src={getQueenImg(preview.dexId)} className="w-20 h-20" />
                                     <span className="font-bold text-sm mt-1">{preview.name}</span>
                                     <span className="text-xs text-gray-500 italic">{preview.personality}</span>
                                     <span className="text-[10px] uppercase tracking-widest text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">{badgeText}</span>
                                 </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {phase === 'ENTRANCES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentEpisodeQueens.map((queen, idx) => (
              <div key={queen.id} className="bg-white p-4 rounded-2xl border-2 border-pink-200 shadow-md flex items-center space-x-4 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}>
                 <img src={getQueenImg(queen.dexId)} className="w-24 h-24 bg-pink-50 rounded-full p-1" />
                 <div className="flex-grow">
                   <h3 className="font-bold text-2xl text-pink-800">{queen.name}</h3>
                   <div className="bg-pink-50 text-pink-900 italic p-3 rounded-lg mt-2 relative">
                       <span className="absolute top-0 left-2 text-2xl text-pink-300">"</span>
                       <p className="px-4">{queen.entranceLine}</p>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}

        {phase === 'PROMO' && (
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-pink-900 mb-12 tracking-tight">
                    {splitPremiere && episodeCount <= 2 ? `Meet Group ${episodeCount}` : "Meet Our Season 1 Queens"}
                </h2>
                <div className="flex flex-wrap justify-center gap-8">
                    {currentEpisodeQueens.map(q => (
                        <div key={q.id} className="flex flex-col items-center group">
                            <div className="relative transition-all duration-300 transform group-hover:scale-110">
                                <div className="absolute inset-0 bg-pink-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                <img src={getQueenImg(q.dexId)} className="w-32 h-32 relative z-10 drop-shadow-lg" />
                            </div>
                            <span className="font-bold text-lg text-pink-900 mt-4 bg-white px-4 py-1 rounded-full shadow-sm border border-pink-100">{q.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {(phase === 'CHALLENGE_SELECTION') && (
          <div className="max-w-5xl mx-auto">
            {revengeEpisodeActive ? (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-purple-900 tracking-tight flex items-center justify-center"><Sparkles className="mr-3 text-purple-400" /> Episode {episodeCount} • Revenge of the Queens</h2>
                        <p className="text-lg text-purple-600 mt-3 max-w-3xl mx-auto">The eliminated legends are back and teaming up with the remaining queens for a stand-up smackdown. Whoever shines on stage can reclaim their spot in the race.</p>
                    </div>
                    <div className="bg-white rounded-3xl border border-purple-200 shadow-xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm uppercase tracking-[0.4em] text-purple-500">Returning Icons</h3>
                                <p className="text-base text-purple-700">{revengeReturnees.length > 0 ? 'They are paired with a current queen for the comedy showdown.' : 'No one has left the competition yet—what a twist!'}</p>
                            </div>
                            <div className="bg-purple-50 text-purple-500 px-4 py-1 rounded-full text-xs font-semibold border border-purple-100">Stand-Up Challenge</div>
                        </div>
                        {revengeReturnees.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {revengePairings.map(pair => {
                                    const returnee = cast.find(q => q.id === pair.returneeId);
                                    const partner = cast.find(q => q.id === pair.partnerId);
                                    if (!returnee || !partner) return null;
                                    return (
                                        <div key={`${pair.returneeId}-${pair.partnerId}`} className="bg-gradient-to-br from-purple-50 via-pink-50 to-white border border-purple-100 rounded-2xl p-4 shadow-md">
                                            <div className="flex items-center space-x-3">
                                                <img src={getQueenImg(returnee.dexId)} className="w-14 h-14 rounded-full border-2 border-purple-200 bg-white" />
                                                <div>
                                                    <div className="text-xs uppercase tracking-widest text-purple-500">Returnee</div>
                                                    <div className="font-bold text-purple-900">{returnee.name}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 mt-4">
                                                <img src={getQueenImg(partner.dexId)} className="w-12 h-12 rounded-full border-2 border-pink-200 bg-white" />
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-[0.4em] text-pink-500">Partner</div>
                                                    <div className="font-semibold text-pink-700">{partner.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-sm text-purple-500 italic">No queens are returning... the legacy girls are shaking.</div>
                        )}
                        <div className="bg-purple-900 text-purple-100 rounded-2xl p-5 flex items-center space-x-4">
                            <Mic className="text-pink-200" />
                            <div className="text-left">
                                <div className="text-xs uppercase tracking-[0.4em] text-purple-300">This Week's Challenge</div>
                                <div className="text-lg font-semibold">{REVENGE_CHALLENGE.description}</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {REVENGE_CHALLENGE.primaryStats.map(stat => (
                                        <span key={stat} className="bg-purple-800/70 border border-purple-600 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest">{stat}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-pink-900 mb-4 flex items-center justify-center"><Star className="mr-3 text-yellow-400" fill="currentColor" /> Select Next Challenge</h2>
                        <p className="text-sm text-pink-700 max-w-2xl mx-auto">Pick the next blockbuster challenge. A suggestion is ready, but producers live for a gag—switch it up if you dare.</p>
                    </div>
                    {currentChallenge && (
                        <div className="bg-white rounded-3xl border border-pink-100 shadow-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-pink-50 p-4 rounded-2xl">
                                    {React.isValidElement(currentChallenge.icon)
                                        ? React.cloneElement(currentChallenge.icon as React.ReactElement, { size: 56 })
                                        : currentChallenge.icon}
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase tracking-[0.4em] text-pink-500 font-semibold">
                                        {suggestedChallenge && currentChallenge.name === suggestedChallenge.name ? 'Suggested Pick' : 'Selected Challenge'}
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-pink-900">{currentChallenge.name}</h3>
                                    <p className="text-sm text-gray-600 mt-2 max-w-xl">{currentChallenge.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {currentChallenge.primaryStats.map(stat => (
                                            <span key={stat} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{stat}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4 text-left text-sm text-pink-800 shadow-inner">
                                <p className="font-semibold uppercase tracking-widest text-[11px] text-pink-500 mb-1">Producer Notes</p>
                                <p>{challengePreviewStory || buildChallengeHighlight(currentChallenge)}</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CHALLENGES.filter(c => !splitPremiere || episodeCount > 2 || c.isPremiereFriendly).map(challenge => {
                            const isSelected = currentChallenge?.name === challenge.name;
                            const isSuggested = suggestedChallenge?.name === challenge.name;
                            return (
                                <button
                                    key={challenge.name}
                                    onClick={() => generateChallenge(challenge)}
                                    className={`relative bg-white rounded-2xl p-6 shadow-md transition-all flex flex-col items-center text-center group border-2 ${isSelected ? 'border-pink-500 shadow-xl scale-[1.02]' : 'border-transparent hover:border-pink-400 hover:shadow-lg'} ${isSuggested ? 'ring-2 ring-pink-200' : ''}`}
                                >
                                    {isSuggested && (
                                        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-pink-100 text-pink-600 px-2 py-1 rounded-full border border-pink-200">Suggested</span>
                                    )}
                                    {isSelected && (
                                        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest bg-pink-600 text-white px-2 py-1 rounded-full shadow">Selected</span>
                                    )}
                                    <div className="bg-pink-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                        {challenge.icon}
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-800 mb-2">{challenge.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{challenge.description}</p>
                                    <div className="flex flex-wrap justify-center gap-2 mt-auto">
                                        {challenge.primaryStats.map(stat => (
                                            <span key={stat} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{stat}</span>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="bg-white rounded-3xl border border-pink-100 shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-pink-900 flex items-center"><Clapperboard className="mr-3 text-pink-500" /> Season Story So Far</h3>
                            <span className="text-xs uppercase tracking-widest text-pink-500">Episodes {challengeHistory.length ? challengeHistory.length : 0}</span>
                        </div>
                        {challengeHistory.length === 0 ? (
                            <div className="text-sm text-gray-500">No challenges have aired yet. Producers are thirsty for drama.</div>
                        ) : (
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {[...challengeHistory].sort((a, b) => b.episode - a.episode).map(entry => (
                                    <div key={`${entry.episode}-${entry.challenge.name}`} className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4 text-left shadow-sm">
                                        <div className="text-xs uppercase tracking-widest text-pink-500 font-semibold">Episode {entry.episode} • {entry.challenge.name}</div>
                                        <p className="text-sm text-pink-800 mt-1">{entry.highlight}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        )}

        {(phase === 'CHALLENGE_INTRO' || phase === 'PERFORMANCE') && currentChallenge && (
          <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border-4 border-pink-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-400"></div>
                 <div className="mx-auto bg-pink-50 p-6 rounded-full inline-block mb-4">
                    {React.cloneElement(currentChallenge.icon as React.ReactElement, { size: 64 })}
                 </div>
                 <h2 className="text-4xl font-extrabold text-pink-900 uppercase tracking-tight">{currentChallenge.name}</h2>
                 <p className="text-2xl text-gray-700 font-light leading-relaxed">{currentChallenge.description}</p>
                 
                 {phase === 'PERFORMANCE' && (
                     <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 text-yellow-800 rounded-xl flex items-center justify-center space-x-4 animate-pulse">
                         <VideoIcon className="animate-bounce" />
                         <span className="font-bold text-lg">Queens are performing...</span>
                     </div>
                 )}
              </div>
          </div>
        )}

        {phase === 'JUDGING' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
               <h2 className="text-2xl font-bold text-pink-900 flex items-center"><Gavel className="mr-2"/> Judges Critiques</h2>
               <button onClick={() => setProducersMode(!producersMode)} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${producersMode ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>
                  <Settings size={16} /> <span>{producersMode ? 'Exit Producer Mode' : 'Producer Mode'}</span>
               </button>
            </div>

            {evolvableQueens.length > 0 && (
                <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border border-purple-200 rounded-2xl p-4 shadow-inner">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-start space-x-3">
                            <div className="bg-white/80 p-2 rounded-full shadow-sm">
                                <Sparkles className="text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.4em] text-purple-500">Evolution Alert</p>
                                <p className="text-sm text-purple-900 leading-relaxed">
                                    {formattedEvolvableNames} {evolvableNames.length > 1 ? 'are' : 'is'} primed for a glow-up. Toggle Producer Mode and press{' '}
                                    <span className="font-semibold">Evolve</span> to swap in their evolved stats for the rest of the season.
                                </p>
                            </div>
                        </div>
                        {!producersMode && (
                            <button
                                onClick={() => setProducersMode(true)}
                                className="self-start md:self-center bg-purple-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow hover:bg-purple-700"
                            >
                                Open Producer Mode
                            </button>
                        )}
                    </div>
                </div>
            )}

            {producersMode && (
                <div className="bg-gray-800 p-6 rounded-xl text-white mb-6 border-4 border-red-500 shadow-2xl">
                    <h3 className="font-bold text-xl flex items-center text-red-400 mb-4">Producer Override</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                        {currentEpisodeQueens.map(queen => {
                            const summary = summarizePlacements(queen.trackRecord);
                            return (
                                <div key={queen.id} className="bg-gray-700 p-4 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img src={getQueenImg(queen.dexId)} className="w-10 h-10 rounded-full border border-gray-600" />
                                            <div>
                                                <span className="font-bold text-sm">{queen.name}</span>
                                                <div className="text-[10px] uppercase tracking-widest text-gray-300">Wins {summary.wins} • High Placements {summary.highs + summary.top2} • Bottoms {summary.bottoms}</div>
                                            </div>
                                        </div>
                                        <select
                                            className="bg-gray-900 text-white rounded px-2 py-1 text-xs"
                                            value={unsavedPlacements[queen.id] || 'SAFE'}
                                            onChange={(e) => setUnsavedPlacements({...unsavedPlacements, [queen.id]: e.target.value as Placement})}
                                        >
                                            {(splitPremiere && episodeCount <= 2)
                                                ? ['WIN', 'TOP2', 'HIGH', 'SAFE', 'LOW'].map(p => <option key={p} value={p}>{p}</option>)
                                                : ['WIN', 'WIN+RTRN', 'WIN+OUT', 'TOP2', 'HIGH', 'SAFE', 'LOW', 'BTM2', 'OUT'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-300">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] uppercase tracking-widest text-gray-400">Track Record</span>
                                            <MiniTrackRecord trackRecord={queen.trackRecord} />
                                        </div>
                                        <span className="italic text-[11px]">Last placement: {queen.trackRecord[queen.trackRecord.length - 1] || 'N/A'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {evolvableQueens.length > 0 && (
                        <div className="mt-6 bg-purple-900/40 border border-purple-500/60 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-purple-200">Evolution Boost</p>
                                    <h4 className="text-lg font-bold">Trigger a Mid-Season Evolution</h4>
                                    <p className="text-[11px] text-purple-100/80 mt-1 leading-relaxed">Evolving instantly upgrades a queen to her next form, permanently replacing her stats and portrait. Queens can blossom through every stage in their line—some glow up once, others twice.</p>
                                </div>
                                <Sparkles size={20} className="text-yellow-300" />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {evolvableQueens.map(queen => {
                                    const nextStageIndex = (queen.evolutionStage ?? 0) + 1;
                                    const nextForm = queen.evolutionLine ? queen.evolutionLine[nextStageIndex] : undefined;
                                    const evolutionsLeft = queen.evolutionLine ? queen.evolutionLine.length - nextStageIndex - 1 : 0;
                                    return (
                                        <div key={queen.id} className="bg-purple-950/60 border border-purple-700 rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <img src={getQueenImg(queen.dexId)} className="w-12 h-12 rounded-full border border-purple-500" />
                                                <div>
                                                    <div className="font-semibold text-sm">{queen.name}</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-purple-300">Next stop: {nextForm?.name || 'Glow-up'}</div>
                                                    <div className="text-[10px] text-purple-200">{evolutionsLeft > 0 ? `${evolutionsLeft} more evolution${evolutionsLeft > 1 ? 's' : ''} after this` : 'Final form unlocked'}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleEvolution(queen.id)} className="bg-gradient-to-r from-purple-400 to-pink-400 text-gray-900 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full hover:from-purple-300 hover:to-pink-300">Evolve</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-3">
              {currentEpisodeQueens.sort((a,b) => {
                  const order = { 'WIN': 0, 'WIN+RTRN': 1, 'WIN+OUT': 2, 'TOP2': 3, 'HIGH': 4, 'SAFE': 5, 'LOW': 6, 'BTM2': 7, 'OUT': 8 } as Record<Placement, number>;
                  return (order[unsavedPlacements[a.id] as keyof typeof order] || 4) - (order[unsavedPlacements[b.id] as keyof typeof order] || 4);
              }).map(queen => (
                <div key={queen.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border-l-4 border-pink-300">
                   <QueenCard queen={queen} />
                   <PlacementBadge placement={unsavedPlacements[queen.id] || 'SAFE'} />
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'RESULTS' && (() => {
            const entries = (Object.entries(latestResults)
                .map(([id, placement]) => {
                    const queen = cast.find(q => q.id === Number(id));
                    if (!queen || placement === 'N/A' || placement === '') return null;
                    return { queen, placement };
                })
                .filter(Boolean) as { queen: Queen; placement: Placement }[])
                .sort((a, b) => {
                    const order: Record<Placement, number> = {
                        WIN: 0,
                        'WIN+RTRN': 1,
                        'WIN+OUT': 2,
                        TOP2: 3,
                        HIGH: 4,
                        SAFE: 5,
                        LOW: 6,
                        BTM2: 7,
                        OUT: 8,
                        ELIM: 9,
                        'RUNNER-UP': 10,
                        'WINNER': 11,
                        'N/A': 12,
                        '': 13
                    };
                    return order[a.placement] - order[b.placement];
                });

            const winners = entries.filter(e => ['WIN', 'WIN+RTRN', 'WIN+OUT'].includes(e.placement));
            const topTwo = entries.filter(e => e.placement === 'TOP2');
            const highs = entries.filter(e => e.placement === 'HIGH');
            const safes = entries.filter(e => e.placement === 'SAFE');
            const dangers = entries.filter(e => ['LOW', 'BTM2', 'OUT', 'ELIM'].includes(e.placement));

            const headline = winners.length
                ? `Condragulations ${winners.map(w => w.queen.name).join(' & ')}!`
                : topTwo.length
                    ? `${topTwo.map(t => t.queen.name).join(' & ')} top the week!`
                    : highs.length
                        ? `${highs[0].queen.name} leads the pack!`
                        : 'Results are in!';

            return (
                <div className="space-y-8 max-w-6xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl border border-pink-200 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-100 via-purple-100 to-pink-100 opacity-70"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-center">
                                <Megaphone size={48} className="text-pink-500" />
                            </div>
                            <p className="text-sm uppercase tracking-[0.5em] text-pink-500">Main Stage Verdict</p>
                            <h2 className="text-4xl font-extrabold text-pink-900">{headline}</h2>
                            <p className="text-gray-600 max-w-3xl mx-auto">Episode {episodeCount} • {currentChallenge?.name || 'Main Stage Extravaganza'} • Momentum report refreshed</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {winners.length > 0 && (
                            <div className="bg-gradient-to-br from-yellow-300 via-amber-200 to-yellow-100 rounded-3xl p-6 shadow-xl border border-yellow-400/60">
                                <h3 className="text-xs uppercase tracking-widest text-yellow-700">Episode Winner</h3>
                                {winners.map(({ queen }) => {
                                    const summary = summarizePlacements(queen.trackRecord);
                                    return (
                                        <div key={queen.id} className="flex items-center space-x-3 mt-3">
                                            <img src={getQueenImg(queen.dexId)} className="w-14 h-14 rounded-full border-2 border-yellow-500 bg-white" />
                                            <div>
                                                <div className="font-bold text-lg text-yellow-900">{queen.name}</div>
                                                <div className="text-xs uppercase tracking-widest text-yellow-700">Season tally: {summary.wins} win{summary.wins === 1 ? '' : 's'} • {summary.highs + summary.top2} high placements</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {topTwo.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-200 via-pink-200 to-purple-100 rounded-3xl p-6 shadow-xl border border-purple-300/60">
                                <h3 className="text-xs uppercase tracking-widest text-purple-700">Top Placement</h3>
                                {topTwo.map(({ queen }) => (
                                    <div key={queen.id} className="flex items-center space-x-3 mt-3">
                                        <img src={getQueenImg(queen.dexId)} className="w-14 h-14 rounded-full border-2 border-purple-400 bg-white" />
                                        <div>
                                            <div className="font-bold text-lg text-purple-900">{queen.name}</div>
                                            <div className="text-xs uppercase tracking-widest text-purple-600">Lip syncs survived {queen.trackRecord.filter(p => p === 'BTM2' || p === 'ELIM' || p === 'OUT').length}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {highs.length > 0 && (
                            <div className="bg-gradient-to-br from-pink-200 via-rose-200 to-pink-100 rounded-3xl p-6 shadow-xl border border-pink-300/60">
                                <h3 className="text-xs uppercase tracking-widest text-pink-700">High Notes</h3>
                                {highs.map(({ queen }) => (
                                    <div key={queen.id} className="flex items-center space-x-3 mt-3">
                                        <img src={getQueenImg(queen.dexId)} className="w-14 h-14 rounded-full border-2 border-pink-400 bg-white" />
                                        <div>
                                            <div className="font-bold text-lg text-pink-900">{queen.name}</div>
                                            <div className="text-xs uppercase tracking-widest text-pink-600">Wins {queen.trackRecord.filter(p => p === 'WIN' || p === 'WIN+RTRN' || p === 'WIN+OUT').length}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {safes.length > 0 && (
                        <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-md">
                            <h3 className="text-xs uppercase tracking-[0.5em] text-gray-400">Safe This Week</h3>
                            <div className="flex flex-wrap gap-3 mt-4">
                                {safes.map(({ queen }) => (
                                    <span key={queen.id} className="bg-pink-50 border border-pink-100 px-4 py-2 rounded-full text-sm font-semibold text-pink-600 shadow-sm">{queen.name}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border border-pink-200 shadow-xl">
                        <div className="px-6 py-4 border-b border-pink-100 flex items-center justify-between">
                            <h3 className="text-sm uppercase tracking-[0.4em] text-pink-600">Full Results Breakdown</h3>
                            <Sparkles className="text-pink-400" />
                        </div>
                        <div className="divide-y divide-pink-50">
                            {entries.map(({ queen, placement }) => {
                                const summary = summarizePlacements(queen.trackRecord);
                                return (
                                    <div key={queen.id} className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 gap-3">
                                        <div className="flex items-center space-x-3">
                                            <img src={getQueenImg(queen.dexId)} className="w-12 h-12 rounded-full border-2 border-pink-200" />
                                            <div>
                                                <div className="font-bold text-pink-900">{queen.name}</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-widest">Season recap: {summary.wins} wins • {summary.bottoms} bottom placements</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <MiniTrackRecord trackRecord={queen.trackRecord} />
                                            <PlacementBadge placement={placement} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {dangers.length > 0 && (
                        <div className="bg-gradient-to-br from-rose-100 via-red-100 to-rose-50 border border-rose-200 rounded-3xl p-6 shadow-lg">
                            <h3 className="text-xs uppercase tracking-[0.4em] text-rose-500">On the Edge</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {dangers.map(({ queen, placement }) => (
                                    <div key={queen.id} className="bg-white/80 rounded-2xl p-4 border border-rose-200 shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <img src={getQueenImg(queen.dexId)} className="w-12 h-12 rounded-full border border-rose-300" />
                                            <div>
                                                <div className="font-semibold text-rose-700">{queen.name}</div>
                                                <div className="text-[11px] uppercase tracking-widest text-rose-500">{placement === 'ELIM' ? 'Eliminated' : placement === 'BTM2' ? 'Lip Sync Survivor?' : 'Critiqued'}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-xs text-rose-600">Bottoms this season: {queen.trackRecord.filter(p => p === 'BTM2' || p === 'ELIM' || p === 'OUT').length}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        })()}

        {phase === 'UNTUCKED' && (
            <div className="h-full flex items-center justify-center">
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-12 rounded-[3rem] shadow-2xl max-w-4xl text-center space-y-8 relative overflow-hidden">
                     <MessageSquare size={80} className="mx-auto text-pink-400 relative z-10 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                     <h2 className="text-6xl font-extrabold tracking-widest relative z-10 font-bebas">UNTUCKED</h2>
                     <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-sm relative z-10">
                        <p className="text-3xl italic font-serif leading-relaxed">"{currentStoryline}"</p>
                     </div>
                </div>
            </div>
        )}

        {phase === 'LIPSYNC' && lipsyncPair.length >= 1 && (
          <div className="text-center space-y-12 mt-8">
            <div className="animate-pulse">
                <h2 className="text-5xl font-extrabold text-red-600 tracking-tighter">
                    {(splitPremiere && episodeCount <= 2)
                        ? "LIP SYNC FOR THE WIN"
                        : competitionFormat === 'allStars'
                            ? "LIP SYNC FOR YOUR LEGACY"
                            : "LIP SYNC FOR YOUR LIFE"}
                </h2>
                <p className="text-red-400 font-bold text-xl mt-2">
                    {(competitionFormat === 'allStars' && !(splitPremiere && episodeCount <= 2)) ? 'LEGACY IS ON THE LINE' : "DON'T F*CK IT UP"}
                </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                {lipsyncPair.map((queen, idx) => (
                   <div key={queen.id} className="group flex flex-col items-center cursor-pointer" onClick={() => handleLipsyncWinner(queen.id)}>
                       <div className="relative transition-transform duration-300 group-hover:-translate-y-4 group-hover:scale-105">
                           <img src={getQueenImg(queen.dexId)} className="w-48 h-48 mx-auto drop-shadow-2xl relative z-10" />
                       </div>
                       <h3 className="text-2xl font-bold mt-6 bg-white px-6 py-2 rounded-full shadow-md">{queen.name}</h3>
                       <div className="mt-3 bg-white/50 p-2 rounded-lg"><MiniTrackRecord trackRecord={queen.trackRecord} /></div>
                       <span className="mt-4 bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                           {(splitPremiere && episodeCount <= 2)
                               ? "CLICK TO WIN"
                               : revengeEpisodeActive
                                   ? "CLICK TO RETURN"
                                   : "CLICK TO SAVE"}
                       </span>
                   </div>
               ))}
           </div>
            {revengeEpisodeActive && revengeTopReturneeIds.length === 2 && (
                <button
                    onClick={() => handleLipsyncWinner(0, true)}
                    className="bg-purple-100 text-purple-700 px-6 py-3 rounded-full font-bold hover:bg-purple-200"
                >
                    Double Return (Both Come Back)
                </button>
            )}
            {!(splitPremiere && episodeCount <= 2) && competitionFormat !== 'allStars' && (
                 <button onClick={() => handleLipsyncWinner(0, true)} disabled={doubleShantayUsed} className="bg-pink-100 text-pink-800 px-6 py-3 rounded-full font-bold hover:bg-pink-200 disabled:opacity-50">
                    {doubleShantayUsed ? "Double Shantay Used" : "Double Shantay (Both Stay)"}
                 </button>
            )}
          </div>
        )}

        {phase === 'ELIMINATION' && pendingLegacyElimination && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-center animate-in fade-in duration-1000">
                <Megaphone size={120} className="text-purple-400 drop-shadow-lg" />
                <h2 className="text-4xl font-extrabold text-purple-900">Legacy Decision</h2>
                <p className="text-lg text-purple-700 max-w-2xl">
                    {(() => {
                        const primary = cast.find(c => c.id === pendingLegacyElimination.winnerId);
                        const allies = (pendingLegacyElimination.allies || [])
                            .map(id => cast.find(c => c.id === id)?.name)
                            .filter(Boolean) as string[];
                        const names = [primary?.name, ...allies].filter(Boolean).join(' & ');
                        return names.length > 0
                            ? `${names} ${allies.length > 0 ? 'have' : 'has'} the power this week. Choose which bottom queen will sashay away.`
                            : 'Choose which bottom queen will sashay away.';
                    })()}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingLegacyElimination.options.map(option => {
                        const summary = summarizePlacements(option.trackRecord);
                        return (
                            <button
                                key={option.id}
                                onClick={() => handleLegacyElimination(option.id)}
                                className="bg-white rounded-3xl px-6 py-5 shadow-xl border-4 border-purple-200 hover:border-purple-500 transition-all w-72 flex flex-col items-center space-y-3 group"
                            >
                                <img src={getQueenImg(option.dexId)} className="w-24 h-24 bg-purple-50 rounded-full border-2 border-purple-200" />
                                <h3 className="text-xl font-bold text-purple-800">{option.name}</h3>
                                <MiniTrackRecord trackRecord={option.trackRecord} />
                                <div className="text-sm font-semibold text-purple-600">Momentum: {summary.wins} win{summary.wins === 1 ? '' : 's'} • {summary.highs + summary.top2} high call-out{summary.highs + summary.top2 === 1 ? '' : 's'}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Wins {summary.wins} • Bottoms {summary.bottoms}</div>
                                <span className="text-xs font-bold text-white bg-purple-500 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Select to Eliminate</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {phase === 'ELIMINATION' && !pendingLegacyElimination && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-center animate-in fade-in duration-1000">
                {(splitPremiere && episodeCount <= 2) ? <Trophy size={120} className="text-yellow-400" /> : <HeartCrack size={120} className="text-gray-300" />}
                <h2 className="text-4xl font-bold text-gray-800 max-w-2xl leading-tight">{currentStoryline}</h2>
            </div>
        )}

        {phase === 'FINALE' && (
            <div className="flex flex-col items-center justify-center h-full space-y-12 text-center">
                <Trophy size={120} className="text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-bounce" />
                <h2 className="text-6xl font-extrabold text-pink-900">The Grand Finale</h2>
                <div className="flex flex-wrap justify-center gap-8">
                    {activeQueens.map(q => (
                        <div key={q.id} className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg">
                             <img src={getQueenImg(q.dexId)} className="w-32 h-32" />
                             <span className="font-bold text-xl mt-4">{q.name}</span>
                             <div className="mt-2"><MiniTrackRecord trackRecord={q.trackRecord}/></div>
                        </div>
                    ))}
                </div>
                <button onClick={simulateFinale} className="bg-yellow-500 hover:bg-yellow-600 text-white font-extrabold py-4 px-12 rounded-full text-2xl shadow-xl animate-pulse">Crown The Winner!</button>
            </div>
        )}

        {phase === 'SEASON_OVER' && (
            <div className="flex flex-col items-center justify-center h-full text-center relative">
                 <Crown size={150} className="text-yellow-500 mb-8 drop-shadow-2xl" />
                 <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-pink-600 to-purple-800 drop-shadow-xl mb-4">
                     {cast.find(q => q.status === 'winner')?.name}
                 </h1>
                 <h2 className="text-3xl text-pink-800 font-semibold mb-16 tracking-widest uppercase">America's Next Drag Supermon</h2>
                 <div className="flex space-x-6">
                    <button onClick={() => setActiveTab('trackRecord')} className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-700 shadow-lg">View Full Track Record</button>
                    <button onClick={enterSetup} className="bg-white text-purple-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 flex items-center shadow-lg"><RefreshCw className="mr-3"/> New Season</button>
                 </div>
            </div>
        )}
      </div>

      {/* Action Bar */}
      {['CAST_SELECTION', 'SETUP', 'SEASON_OVER'].every(p => p !== phase) && (
        <div className="bg-white/90 backdrop-blur-md p-4 border-t-4 border-pink-500 flex justify-between items-center shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] sticky bottom-0 z-20">
          <div className="text-pink-900 italic font-semibold truncate max-w-xl px-4 border-l-4 border-pink-300">{currentStoryline}</div>
          {['PROMO','ENTRANCES','CHALLENGE_SELECTION','CHALLENGE_INTRO','PERFORMANCE','JUDGING','RESULTS','UNTUCKED','ELIMINATION'].includes(phase) && (
             <button
               onClick={nextPhase}
               disabled={proceedDisabled}
               className={`bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-10 rounded-full text-lg flex items-center transition-transform ${proceedDisabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
             >
               PROCEED <Sparkles size={20} className="ml-2"/>
             </button>
          )}
        </div>
      )}
      </div>
    );
  };

  const TrackRecordTab = () => {
    const summaryMap = new Map<number, ReturnType<typeof summarizePlacements>>();
    cast.forEach(queen => {
        summaryMap.set(queen.id, summarizePlacements(queen.trackRecord));
    });

    const placementPriority = (queen: Queen) => {
        switch (queen.status) {
            case 'winner':
                return 0;
            case 'runner-up':
                return 1;
            case 'active':
                return 2;
            default:
                return 3;
        }
    };

    const sortedCast = cast.slice().sort((a, b) => {
        const priorityA = placementPriority(a);
        const priorityB = placementPriority(b);
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        if (priorityA === 2) {
            const summaryA = summaryMap.get(a.id)!;
            const summaryB = summaryMap.get(b.id)!;
            return (
                summaryB.performanceScore - summaryA.performanceScore ||
                summaryB.wins - summaryA.wins ||
                summaryB.highs + summaryB.top2 - (summaryA.highs + summaryA.top2) ||
                a.name.localeCompare(b.name)
            );
        }

        if (priorityA === 3) {
            const elimDiff = getEliminationIndex(b) - getEliminationIndex(a);
            if (elimDiff !== 0) {
                return elimDiff;
            }
            return a.name.localeCompare(b.name);
        }

        return a.name.localeCompare(b.name);
    });

    const maxEpisodes = Math.max(
        episodeCount - (phase === 'SEASON_OVER' ? 0 : 1),
        cast.reduce((max, q) => Math.max(max, q.trackRecord.length), 0)
    );

    const queenSummaries = sortedCast.map(queen => ({ queen, summary: summaryMap.get(queen.id)! }));

    const topWins = queenSummaries.slice().sort((a, b) =>
        (b.summary.wins - a.summary.wins) ||
        (b.summary.highs + b.summary.top2) - (a.summary.highs + a.summary.top2) ||
        (b.summary.performanceScore - a.summary.performanceScore)
    )[0];
    const judgesFavorite = queenSummaries.slice().sort((a, b) =>
        (b.summary.highs + b.summary.top2) - (a.summary.highs + a.summary.top2) ||
        (b.summary.wins - a.summary.wins) ||
        (b.summary.performanceScore - a.summary.performanceScore)
    )[0];
    const lipSyncHero = queenSummaries.slice().sort((a, b) =>
        (b.summary.bottoms - a.summary.bottoms) ||
        (b.summary.performanceScore - a.summary.performanceScore)
    )[0];

    return (
      <div className="p-8 bg-pink-50 h-full overflow-auto space-y-6">
        <h2 className="text-4xl font-extrabold text-pink-900 mb-4 flex items-center"><BarChart3 className="mr-4" size={36} /> Season Track Record</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SeasonHighlightCard
                title="Most Challenge Wins"
                accent="bg-gradient-to-r from-pink-500 to-rose-500"
                queen={topWins?.queen}
                value={topWins ? `${topWins.summary.wins} win${topWins.summary.wins === 1 ? '' : 's'}` : '—'}
                subtext={topWins ? `${topWins.summary.highs + topWins.summary.top2} high placements • ${topWins.summary.bottoms} bottom${topWins.summary.bottoms === 1 ? '' : 's'}` : 'Pending results'}
            />
            <SeasonHighlightCard
                title="Judges' Favorite"
                accent="bg-gradient-to-r from-purple-500 to-indigo-500"
                queen={judgesFavorite?.queen}
                value={judgesFavorite ? `${judgesFavorite.summary.highs + judgesFavorite.summary.top2} top call-out${judgesFavorite.summary.highs + judgesFavorite.summary.top2 === 1 ? '' : 's'}` : '—'}
                subtext={judgesFavorite ? `${judgesFavorite.summary.wins} wins • ${judgesFavorite.summary.safes} safes` : 'Keep watching!'}
            />
            <SeasonHighlightCard
                title="Lip Sync Assassin"
                accent="bg-gradient-to-r from-amber-500 to-orange-500"
                queen={lipSyncHero?.queen}
                value={lipSyncHero ? `${lipSyncHero.summary.bottoms} lip sync${lipSyncHero.summary.bottoms === 1 ? '' : 's'}` : '0'}
                subtext={lipSyncHero ? `${lipSyncHero.summary.wins} wins • ${lipSyncHero.summary.lows} low moment${lipSyncHero.summary.lows === 1 ? '' : 's'}` : 'No data yet'}
            />
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl shadow-xl border border-pink-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-pink-600 to-purple-600 text-white uppercase tracking-widest">
              <tr>
                <th className="p-4 text-left">Queen</th>
                {Array.from({ length: maxEpisodes }).map((_, i) => (
                  <th key={i} className="p-4 text-center">Ep {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {queenSummaries.map(({ queen, summary }, idx) => {
                const rowAccent = queen.status === 'winner'
                    ? 'bg-yellow-50'
                    : queen.status === 'runner-up'
                        ? 'bg-purple-50'
                        : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-pink-50/40';
                return (
                  <tr key={queen.id} className={`${rowAccent} transition-colors hover:bg-pink-100/70`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full border-2 border-pink-200 shadow-md overflow-hidden">
                          <img src={getQueenImg(queen.dexId)} className="w-full h-full object-cover transform scale-110" />
                        </div>
                        <div>
                          <div className="font-bold text-pink-900 flex items-center space-x-2">
                            <span>{queen.name}</span>
                            {queen.status === 'winner' && <Crown size={18} className="text-yellow-500" />}
                          </div>
                          <div className="text-xs uppercase tracking-widest text-pink-500">{summary.wins} wins • {summary.highs + summary.top2} highs • {summary.bottoms} bottoms</div>
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: maxEpisodes }).map((_, episodeIndex) => {
                        const placement = queen.trackRecord[episodeIndex] ?? '';
                        return (
                            <td key={episodeIndex} className="p-2 text-center">
                                {placement
                                    ? <div className="flex justify-center"><PlacementBadge placement={placement as Placement} /></div>
                                    : <span className="text-gray-300">—</span>}
                            </td>
                        );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const StatsTab = () => {
      const queenSummaries = useMemo(() => cast.map(queen => ({ queen, summary: summarizePlacements(queen.trackRecord) })), [cast]);
      const leaderboard = queenSummaries
          .filter(({ summary }) => summary.competitiveEpisodes > 0)
          .sort((a, b) => {
              const scoreA = (a.summary.wins * 5) + ((a.summary.highs + a.summary.top2) * 3) - (a.summary.bottoms * 2);
              const scoreB = (b.summary.wins * 5) + ((b.summary.highs + b.summary.top2) * 3) - (b.summary.bottoms * 2);
              if (scoreB !== scoreA) return scoreB - scoreA;
              return (b.summary.wins - a.summary.wins) || ((b.summary.highs + b.summary.top2) - (a.summary.highs + a.summary.top2)) || a.queen.name.localeCompare(b.queen.name);
          })
          .slice(0, 5);
      const eliminationOrder = cast
          .filter(q => q.status === 'eliminated')
          .sort((a, b) => getEliminationIndex(a) - getEliminationIndex(b));
      const recentStories = [...challengeHistory].sort((a, b) => b.episode - a.episode).slice(0, 3);
      const confessionalsFeed = cast
          .flatMap(queen => queen.confessionals.map((conf, index) => ({ queen, conf, index })))
          .sort((a, b) => {
              if (b.conf.episode !== a.conf.episode) {
                  return b.conf.episode - a.conf.episode;
              }
              return a.index - b.index;
          })
          .slice(0, 20);

      return (
        <div className="p-8 bg-pink-50 h-full overflow-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-4xl font-extrabold text-pink-900 flex items-center"><VideoIcon className="mr-4" size={36}/> Season Insights & Tea</h2>
              <div className="bg-white px-4 py-2 rounded-full shadow text-sm font-semibold text-pink-700 border border-pink-100 flex items-center space-x-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>{competitionFormat === 'allStars' ? 'All Stars: Top Two Lip Sync for Your Legacy' : 'Main Season: Bottom Two Lip Sync for Their Lives'}</span>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
                  <h3 className="text-2xl font-bold text-pink-800 mb-4 flex items-center"><Trophy className="mr-3"/> Performance Leaderboard</h3>
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                      {leaderboard.length === 0 && <div className="text-sm text-gray-500">No episodes have been judged yet.</div>}
                      {leaderboard.map(({ queen, summary }, index) => (
                          <div key={queen.id} className="bg-pink-50/80 border border-pink-100 rounded-2xl p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                  <span className="text-lg font-bold text-pink-500">#{index + 1}</span>
                                  <img src={getQueenImg(queen.dexId)} className="w-12 h-12 rounded-full border-2 border-pink-200" />
                                  <div>
                                      <div className="font-bold text-pink-900">{queen.name}</div>
                                      <div className="text-xs uppercase tracking-widest text-pink-500">Hot streak: {summary.wins} wins • {summary.highs + summary.top2} highs</div>
                                      <MiniTrackRecord trackRecord={queen.trackRecord} />
                                  </div>
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                  <div>Highs {summary.highs + summary.top2}</div>
                                  <div>Lows {summary.lows}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
                  <h3 className="text-2xl font-bold text-pink-800 mb-4 flex items-center"><Clapperboard className="mr-3"/> Producer Gossip</h3>
                  {recentStories.length === 0 ? (
                      <div className="text-sm text-gray-500">No episodes have aired yet—stay tuned for the drama drop.</div>
                  ) : (
                      <div className="space-y-4">
                          {recentStories.map(story => (
                              <div key={`${story.episode}-${story.challenge.name}`} className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4 shadow-sm">
                                  <div className="text-xs uppercase tracking-widest text-pink-500 font-semibold">Episode {story.episode} • {story.challenge.name}</div>
                                  <p className="text-sm text-pink-800 mt-1 leading-relaxed">{story.highlight}</p>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
                  <h3 className="text-2xl font-bold text-pink-800 mb-4 flex items-center"><XCircle className="mr-3"/> Elimination Order</h3>
                  {eliminationOrder.length === 0 ? (
                      <div className="text-sm text-gray-500">No queens have been eliminated yet.</div>
                  ) : (
                      <div className="space-y-3">
                          {eliminationOrder.map((queen, index) => {
                              const summary = summarizePlacements(queen.trackRecord);
                              return (
                                  <div key={queen.id} className="flex items-center justify-between bg-pink-50 rounded-2xl px-4 py-3 border border-pink-100">
                                      <div className="flex items-center space-x-3">
                                          <span className="text-xs font-bold text-pink-500 uppercase">#{index + 1}</span>
                                          <img src={getQueenImg(queen.dexId)} className="w-10 h-10 rounded-full border border-pink-200" />
                                          <div>
                                              <div className="font-bold text-pink-900 text-sm">{queen.name}</div>
                                              <div className="text-xs text-gray-500">Last placement: {queen.trackRecord[queen.trackRecord.length - 1]}</div>
                                          </div>
                                      </div>
                                      <div className="text-xs uppercase tracking-widest text-pink-500">Season stats: {summary.wins} wins • {summary.bottoms} bottoms</div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
                  <h3 className="text-2xl font-bold text-pink-800 mb-4 flex items-center"><MessageSquare className="mr-3"/> Confessionals Cam</h3>
                  <div className="space-y-6 max-h-[360px] overflow-y-auto pr-4 custom-scrollbar">
                      {confessionalsFeed.map(item => (
                          <div key={`${item.queen.id}-${item.index}-${item.conf.episode}`} className="flex items-start space-x-4 bg-pink-50 p-4 rounded-2xl border border-pink-100 shadow-sm">
                              <img src={getQueenImg(item.queen.dexId)} className="w-12 h-12 bg-white rounded-full border-2 border-pink-200 flex-shrink-0" />
                              <div>
                                  <span className="font-bold text-pink-900 text-sm">{item.queen.name}</span>
                                  <div className="text-[11px] uppercase tracking-widest text-pink-500 mt-1">Ep {item.conf.episode} • {item.conf.context.toUpperCase()} • {item.conf.reason}</div>
                                  <div className="text-gray-700 italic mt-1 text-sm leading-relaxed">"{item.conf.text}"</div>
                              </div>
                          </div>
                      ))}
                      {cast.every(c => c.confessionals.length === 0) && <div className="text-sm text-gray-500">No confessionals recorded yet.</div>}
                  </div>
              </div>
          </div>
        </div>
      );
  };

  return (
    <>
      <style>{evolutionStyles}</style>
      <div className="flex h-screen bg-gray-100 font-sans overflow-hidden text-gray-800">
        <div className="w-20 md:w-72 bg-gradient-to-b from-pink-900 to-purple-900 text-pink-100 flex flex-col shadow-2xl z-30">
          <div className="p-6 font-extrabold text-3xl tracking-tighter text-center border-b border-pink-800/30 text-white flex items-center justify-center">
            <Crown className="md:mr-3 text-pink-400" /><span className="hidden md:inline">POKÉDRAG</span>
          </div>
        <nav className="flex-grow py-8 space-y-3 px-4">
           <NavButton icon={<Star size={24} />} label="Game" active={activeTab === 'game'} onClick={() => setActiveTab('game')} />
           <NavButton icon={<BarChart3 size={24} />} label="Track Record" active={activeTab === 'trackRecord'} onClick={() => setActiveTab('trackRecord')} disabled={phase === 'SETUP' || phase === 'CAST_SELECTION'} />
           <NavButton icon={<VideoIcon size={24} />} label="Stats & Tea" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} disabled={phase === 'SETUP' || phase === 'CAST_SELECTION'} />
        </nav>
      </div>
      <div className="flex-grow overflow-hidden relative">
          {activeTab === 'game' && <GameScreen />}
          {activeTab === 'trackRecord' && <TrackRecordTab />}
          {activeTab === 'stats' && <StatsTab />}
      </div>
      </div>
    </>
  );
}

const SeasonHighlightCard = ({ title, accent, queen, value, subtext }: { title: string; accent: string; queen?: Queen; value: string; subtext: string }) => (
    <div className="bg-white rounded-3xl shadow-lg border border-pink-100 overflow-hidden">
        <div className={`h-1 w-full ${accent}`}></div>
        <div className="p-5 flex items-center space-x-4">
            {queen ? (
                <img src={getQueenImg(queen.dexId)} className="w-14 h-14 bg-pink-50 rounded-full border-2 border-pink-200" />
            ) : (
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center text-pink-400 font-bold">?</div>
            )}
            <div className="text-left">
                <p className="text-[11px] uppercase tracking-widest text-gray-400">{title}</p>
                <div className="text-lg font-bold text-pink-900">{queen ? queen.name : 'TBD'}</div>
                <div className="text-sm font-semibold text-pink-600">{value}</div>
                <div className="text-xs text-gray-500">{subtext}</div>
            </div>
        </div>
    </div>
);

const NavButton = ({ icon, label, active, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${active ? 'bg-pink-600 text-white shadow-lg font-bold' : 'hover:bg-white/10 text-pink-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}>
        <div className="mx-auto md:mx-0">{icon}</div><span className="ml-4 font-semibold hidden md:block text-lg">{label}</span>
    </button>
);
