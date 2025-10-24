import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, Skull, Mic, Shirt, Video, Music, Sparkles, Crown, Gavel, RefreshCw, Settings, 
  BarChart3, Video as VideoIcon, MessageSquare, HeartCrack, Star, Scissors, Palette, 
  Clapperboard, Music2, Smile, Zap, HelpCircle, Users, CheckCircle, XCircle, Megaphone, Gem
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Types & Data ---

type StatCategory = 'acting' | 'improv' | 'comedy' | 'dance' | 'design' | 'singing' | 'rusical' | 'rumix' | 'makeover' | 'lipsync';
type Stats = Record<StatCategory, number>;

type Placement = 'WIN' | 'TOP2' | 'HIGH' | 'SAFE' | 'LOW' | 'BTM2' | 'ELIM' | 'RUNNER-UP' | 'WINNER' | 'N/A' | '';

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
  confessionals: string[];
  group?: 1 | 2; // For split premiere
}

const QUEEN_POOL: Omit<Queen, 'trackRecord' | 'status' | 'confessionals'>[] = [
  { id: 1, dexId: 10051, name: "Gardevoir O'Hara", originalName: 'Gardevoir', personality: "The Perfectionist", entranceLine: "I saw the future, and it looks like I'm holding the crown.", stats: { acting: 8, improv: 6, comedy: 5, dance: 9, design: 9, singing: 7, rusical: 8, rumix: 7, makeover: 10, lipsync: 8 } },
  { id: 2, dexId: 428, name: "Lopunny Bonina Brown", originalName: 'Lopunny', personality: "Lip Sync Assassin", entranceLine: "Hop on board, honey. This ride only goes to the top.", stats: { acting: 5, improv: 4, comedy: 6, dance: 10, design: 7, singing: 4, rusical: 9, rumix: 9, makeover: 6, lipsync: 10 } },
  { id: 3, dexId: 763, name: "Tsareena Versace", originalName: 'Tsareena', personality: "Fashion Queen", entranceLine: "Bow down. Royalty has arrived.", stats: { acting: 4, improv: 3, comedy: 4, dance: 8, design: 10, singing: 5, rusical: 7, rumix: 8, makeover: 9, lipsync: 7 } },
  { id: 4, dexId: 730, name: "Primarina Grande", originalName: 'Primarina', personality: "Broadway Diva", entranceLine: "Listen closely, that's the sound of a winner.", stats: { acting: 7, improv: 6, comedy: 5, dance: 6, design: 6, singing: 10, rusical: 10, rumix: 8, makeover: 7, lipsync: 8 } },
  { id: 5, dexId: 124, name: "Jynx Monsoon", originalName: 'Jynx', personality: "Camp Comedy Legend", entranceLine: "Did someone order a frosty treat with extra spice?", stats: { acting: 10, improv: 10, comedy: 10, dance: 5, design: 4, singing: 9, rusical: 9, rumix: 5, makeover: 3, lipsync: 9 } },
  { id: 6, dexId: 758, name: "Salazzle Visage", originalName: 'Salazzle', personality: "The Villain", entranceLine: "I didn't come here to make friends, I came to make headlines.", stats: { acting: 9, improv: 8, comedy: 7, dance: 7, design: 5, singing: 6, rusical: 7, rumix: 8, makeover: 5, lipsync: 9 } },
  { id: 7, dexId: 350, name: "Milotic Colby", originalName: 'Milotic', personality: "Pageant Queen", entranceLine: "Beauty fades, but dumb is forever. Luckily, I'm just beautiful.", stats: { acting: 5, improv: 4, comedy: 3, dance: 6, design: 10, singing: 6, rusical: 6, rumix: 6, makeover: 10, lipsync: 7 } },
  { id: 8, dexId: 576, name: "Gothitelle Delano", originalName: 'Gothitelle', personality: "Moody Alt-Girl", entranceLine: "It's not a phase, mom. It's a competition.", stats: { acting: 8, improv: 7, comedy: 8, dance: 4, design: 8, singing: 5, rusical: 6, rumix: 5, makeover: 7, lipsync: 7 } },
  { id: 9, dexId: 858, name: "Hatterene Oddly", originalName: 'Hatterene', personality: "Silent but Deadly", entranceLine: "...", stats: { acting: 6, improv: 5, comedy: 4, dance: 3, design: 10, singing: 4, rusical: 5, rumix: 4, makeover: 9, lipsync: 6 } },
  { id: 10, dexId: 478, name: "Froslass Davenport", originalName: 'Froslass', personality: "Ice Queen", entranceLine: "Hope you packed a coat, it's about to get chilly at the top.", stats: { acting: 7, improv: 6, comedy: 5, dance: 8, design: 9, singing: 6, rusical: 7, rumix: 7, makeover: 8, lipsync: 8 } },
  { id: 11, dexId: 655, name: "Delphox Mattel", originalName: 'Delphox', personality: "Comedy Witch", entranceLine: "Abracadabra, bitches!", stats: { acting: 9, improv: 9, comedy: 9, dance: 6, design: 7, singing: 7, rusical: 8, rumix: 6, makeover: 6, lipsync: 7 } },
  { id: 12, dexId: 31, name: "Nidoqueen Latifah", originalName: 'Nidoqueen', personality: "The Mother", entranceLine: "Mama's home, and she brought cookies... and whoop-ass.", stats: { acting: 8, improv: 8, comedy: 7, dance: 7, design: 6, singing: 8, rusical: 8, rumix: 9, makeover: 5, lipsync: 9 } },
  { id: 13, dexId: 549, name: "Lilligant Edwards", originalName: 'Lilligant', personality: "Southern Belle", entranceLine: "Well bless your heart, aren't you all just precious second places.", stats: { acting: 6, improv: 5, comedy: 4, dance: 9, design: 8, singing: 5, rusical: 7, rumix: 7, makeover: 8, lipsync: 8 } },
  { id: 14, dexId: 416, name: "Vespiquen Benet", originalName: 'Vespiquen', personality: "The Ruler", entranceLine: "The hive has spoken. I am the queen.", stats: { acting: 7, improv: 6, comedy: 5, dance: 6, design: 10, singing: 4, rusical: 6, rumix: 6, makeover: 9, lipsync: 6 } },
  // New Queens
  { id: 15, dexId: 671, name: "Florges Welch", originalName: 'Florges', personality: "Indie Vocalist", entranceLine: "I'm here to plant a seed and watch you all wither.", stats: { acting: 6, improv: 5, comedy: 4, dance: 5, design: 10, singing: 9, rusical: 8, rumix: 6, makeover: 9, lipsync: 7 } },
  { id: 16, dexId: 795, name: "Pheromosa Evangelista", originalName: 'Pheromosa', personality: "Supermodel", entranceLine: "Don't hate me because I'm beautiful. Hate me because I'm gonna win.", stats: { acting: 3, improv: 2, comedy: 2, dance: 10, design: 8, singing: 1, rusical: 5, rumix: 8, makeover: 7, lipsync: 9 } },
  { id: 17, dexId: 407, name: "Roserade Valentine", originalName: 'Roserade', personality: "Romantic Lead", entranceLine: "Every rose has its thorns, and mine are poisoned.", stats: { acting: 9, improv: 7, comedy: 6, dance: 8, design: 7, singing: 5, rusical: 8, rumix: 6, makeover: 6, lipsync: 8 } },
  { id: 18, dexId: 719, name: "Diancie Sparkles", originalName: 'Diancie', personality: "Spoiled Princess", entranceLine: "Daddy said if I don't win, he's buying the network.", stats: { acting: 5, improv: 4, comedy: 3, dance: 6, design: 10, singing: 8, rusical: 7, rumix: 5, makeover: 8, lipsync: 6 } },
  { id: 19, dexId: 801, name: "Magearna Del Rio", originalName: 'Magearna', personality: "Insult Comic", entranceLine: "Beep boop. You're all trash.", stats: { acting: 7, improv: 9, comedy: 10, dance: 4, design: 8, singing: 6, rusical: 7, rumix: 4, makeover: 5, lipsync: 5 } },
  { id: 20, dexId: 648, name: "Meloetta Armstrong", originalName: 'Meloetta', personality: "Theatre Kid", entranceLine: "*High note sustaining for 20 seconds*", stats: { acting: 8, improv: 7, comedy: 6, dance: 9, design: 5, singing: 10, rusical: 10, rumix: 8, makeover: 4, lipsync: 8 } },
  { id: 21, dexId: 182, name: "Bellossom DuPre", originalName: 'Bellossom', personality: "Dancing Diva", entranceLine: "Aloha, bitches!", stats: { acting: 4, improv: 5, comedy: 6, dance: 10, design: 6, singing: 4, rusical: 8, rumix: 9, makeover: 5, lipsync: 9 } },
  { id: 22, dexId: 368, name: "Gorebyss Andrews", originalName: 'Gorebyss', personality: "Fishy Queen", entranceLine: "I'm wet. Are you?", stats: { acting: 5, improv: 4, comedy: 3, dance: 6, design: 8, singing: 5, rusical: 6, rumix: 6, makeover: 9, lipsync: 7 } },
  { id: 23, dexId: 754, name: "Lurantis Michaels", originalName: 'Lurantis', personality: "Professional", entranceLine: "I didn't come to play, I came to slay.", stats: { acting: 7, improv: 6, comedy: 5, dance: 9, design: 8, singing: 5, rusical: 7, rumix: 8, makeover: 7, lipsync: 9 } },
  { id: 24, dexId: 542, name: "Leavanny Vuitton", originalName: 'Leavanny', personality: "Seamstress", entranceLine: "I hope you girls are ready to be schooled in fashion.", stats: { acting: 4, improv: 3, comedy: 3, dance: 5, design: 10, singing: 4, rusical: 5, rumix: 4, makeover: 10, lipsync: 5 } },
];

type Phase = 'SETUP' | 'CAST_SELECTION' | 'ENTRANCES' | 'PROMO' | 'CHALLENGE_SELECTION' | 'CHALLENGE_INTRO' | 'PERFORMANCE' | 'JUDGING' | 'UNTUCKED' | 'LIPSYNC' | 'ELIMINATION' | 'FINALE' | 'SEASON_OVER';

type ChallengeType = 'acting' | 'comedy' | 'dance' | 'design' | 'rusical' | 'makeover' | 'improv' | 'rumix' | 'snatch_game' | 'ball' | 'branding' | 'talent' | 'roast' | 'girl_groups';

interface Challenge {
  name: string;
  type: ChallengeType;
  description: string;
  primaryStats: StatCategory[];
  icon: React.ReactNode;
  isPremiereFriendly?: boolean;
}

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

const getConfessional = (queen: Queen, placement: Placement, phase: Phase, challengeType?: ChallengeType, activeQueens?: Queen[]): string => {
    let templates = {
        WIN: ["I won! Eat it, bitches!", "The crown is practically mine already.", "I proved today that I am THE Top Pokémon."],
        TOP2: ["Top 2! I need to win this lip sync to get that cash tip.", "I'm safe, but I want that win on my record."],
        HIGH: ["Always the bridesmaid, never the bride.", "I'm glad the judges saw my talent today.", "So close to winning, ugh!"],
        SAFE: ["Safe? Ugh, I hate being filler.", "I survived another week, that's what matters.", "I need to step it up if I want to win."],
        LOW: ["The judges completely missed the point of my look.", "I know I'm better than this.", "I am NOT going home yet."],
        BTM2: ["I have to lip sync? Fine. I'm going to murder it.", "I am devastated, but I will fight to stay.", "This is embarrassing. Time to turn it out."],
        ELIM: ["It's heartbreaking to leave so soon.", "I may be leaving, but I'm still a star.", "Vanjie... Vanjie... Vanjie..."],
        'RUNNER-UP': ["I gave it my all. Congrats to the winner, I guess."],
        'WINNER': ["I DID IT! I AM AMERICA'S NEXT DRAG SUPERMON!"],
        'N/A': [],
        '': []
    };

    // Contextual Confessionals
    if (phase === 'JUDGING' && activeQueens) {
        // Check for bottom streak
        const recentPlacements = queen.trackRecord.slice(-2);
        if (placement === 'BTM2' && recentPlacements.includes('BTM2')) {
             templates.BTM2.push("In the bottom AGAIN? I can't keep doing this.");
        }
        // Check for comeback
        if (placement === 'WIN' && recentPlacements.includes('BTM2')) {
             templates.WIN.push("From the bottom to the top! Redemption feels so good.");
        }
    }

    if (challengeType) {
        const challengeLines: Partial<Record<ChallengeType, Partial<Record<Placement, string[]>>>> = {
            design: {
                LOW: ["I don't know how to sew, okay?! Give me a break!", "Hot glue can only do so much when you have no taste."],
                WIN: ["This outfit is couture, honey. They had no choice but to crown me."],
                SAFE: ["Thank god I didn't have to lip sync in this mess of an outfit."]
            },
            snatch_game: {
                BTM2: ["I froze up. Snatch Game is harder than it looks!", "My celebrity impersonation fell flat. Dead flat."],
                WIN: ["I made Ru laugh! That's the golden ticket."],
                HIGH: ["I thought I was the funniest one up there, honestly."]
            },
            roast: {
                 LOW: ["Tough crowd tonight. They didn't get my intellectual humor.", "I think I was too mean... oops."],
                 WIN: ["I read them all to filth and they loved it!"]
            },
            dance: {
                 LOW: ["Two left feet? Try four left feet.", "Choreography is NOT my friend."],
                 BTM2: ["I missed one step and it all went downhill from there."]
            },
            rusical: {
                WIN: ["I was born to be a star on Broadway, baby!"],
                SAFE: ["I didn't get the lead role, so I just faded into the background."]
            }
        };
        
        if (challengeLines[challengeType]?.[placement as keyof typeof challengeLines[ChallengeType]]) {
             templates[placement as keyof typeof templates].push(...(challengeLines[challengeType]![placement as keyof typeof challengeLines[ChallengeType]]!));
        }
    }

    // Personality infusion
    if (queen.personality.includes("Villain")) {
        templates.WIN.push("Of course I won. Look at this competition... tragic.");
        templates.SAFE.push("These judges have no taste if they think I'm just 'safe'.");
        templates.ELIM.push("They're just intimidated by my greatness. Their loss.");
    }
    if (queen.personality.includes("Delusional")) {
        templates.LOW.push("Honestly? I should have won. The judges are blind.");
        templates.BTM2.push("They just want a show, that's why I'm in the bottom. I'm too perfect.");
        templates.SAFE.push("I was definitely the best one this week, weird.");
    }
    if (queen.personality.includes("Perfectionist")) {
        templates.HIGH.push("High isn't good enough. I need to WIN every single week.");
        templates.SAFE.push("I am failing. Safe is failing.");
    }

    const pool = templates[placement as keyof typeof templates] || ["I have nothing to say."];
    return pool[Math.floor(Math.random() * pool.length)];
}

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
  const [challengeHistory, setChallengeHistory] = useState<Challenge[]>([]);
  const [doubleShantayUsed, setDoubleShantayUsed] = useState(false);
  const [splitPremiere, setSplitPremiere] = useState(false);

  // --- Derived State ---
  const activeQueens = useMemo(() => cast.filter(q => q.status === 'active'), [cast]);
  // For split premiere, we only want queens in the current episode's group
  const currentEpisodeQueens = useMemo(() => {
      if (splitPremiere && episodeCount === 1) return activeQueens.filter(q => q.group === 1);
      if (splitPremiere && episodeCount === 2) return activeQueens.filter(q => q.group === 2);
      return activeQueens;
  }, [activeQueens, splitPremiere, episodeCount]);

  const eliminatedQueens = useMemo(() => cast.filter(q => q.status === 'eliminated'), [cast]);

  // --- Phase Handlers ---

  const enterSetup = () => {
      setPhase('CAST_SELECTION');
      setSelectedCastIds([]);
      setSplitPremiere(false);
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
      
      let newCast = QUEEN_POOL.filter(q => selectedCastIds.includes(q.id)).map(q => ({
        ...q,
        trackRecord: [],
        status: 'active' as const,
        confessionals: [],
      }));

      if (splitPremiere) {
          // Randomly assign groups 1 and 2
          const shuffled = [...newCast].sort(() => 0.5 - Math.random());
          const mid = Math.ceil(shuffled.length / 2);
          newCast = shuffled.map((q, idx) => ({
              ...q,
              group: idx < mid ? 1 : 2
          }));
      }

      setCast(newCast as Queen[]);
      setEpisodeCount(1);
      setPhase('ENTRANCES');
      setCurrentStoryline(splitPremiere ? "The first group of queens arrives..." : "The workroom is quiet... for now.");
      setChallengeHistory([]);
      setDoubleShantayUsed(false);
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
      case 'CHALLENGE_SELECTION': setPhase('CHALLENGE_INTRO'); break;
      case 'CHALLENGE_INTRO': setPhase('PERFORMANCE'); break;
      case 'PERFORMANCE': 
        generateInitialPlacements(); 
        setPhase('JUDGING'); 
        break;
      case 'JUDGING': 
        finalizePlacements(); 
        setPhase('UNTUCKED'); 
        generateUntuckedDrama();
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
        }
        break;
      case 'FINALE': setPhase('SEASON_OVER'); break;
    }
  };

  const generateChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setChallengeHistory(prev => [...prev, challenge]);
    setCurrentStoryline(`Episode ${episodeCount}: The queens prepare for the ${challenge.name}.`);
  };

  const generateInitialPlacements = () => {
    if (!currentChallenge) return;
    
    const modifiers: Record<number, number> = {};
    const isSplitNonElim = splitPremiere && episodeCount <= 2;

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

    setCast(prevCast => prevCast.map(q => {
      // If split premiere, queens NOT in current group get 'N/A' for this episode's track record
      if (splitPremiere && episodeCount <= 2 && q.group !== (episodeCount as 1|2)) {
           return { ...q, trackRecord: [...q.trackRecord, 'N/A'] };
      }

      if (!currentEpisodeQueens.find(cq => cq.id === q.id)) return q;

      let placement = unsavedPlacements[q.id] || 'SAFE';
      
      // In split premiere, the 'WIN' initially assigned is just one of the TOP2 before the lipsync. 
      // We'll formally mark both as TOP2 for now, and upgrade winner after lipsync.
      // Actually, easier to mark them TOP2 now and upgrade one to WIN after LS.
      if (isSplitNonElim && (placement === 'WIN' || placement === 'TOP2')) {
          placement = 'TOP2';
      }

      const newConfessional = getConfessional(q, placement, 'JUDGING', currentChallenge?.type, currentEpisodeQueens);
      return {
        ...q,
        trackRecord: [...q.trackRecord, placement],
        confessionals: [newConfessional, ...q.confessionals].slice(0, 10)
      };
    }));
    setProducersMode(false);
  };

  const generateUntuckedDrama = () => {
    const isSplitNonElim = splitPremiere && episodeCount <= 2;
    const safeQueens = currentEpisodeQueens.filter(q => ['SAFE', 'HIGH', 'WIN'].includes(unsavedPlacements[q.id]));
    const bottomQueens = currentEpisodeQueens.filter(q => ['LOW', 'BTM2'].includes(unsavedPlacements[q.id]));
    const top2Queens = currentEpisodeQueens.filter(q => unsavedPlacements[q.id] === 'TOP2' || unsavedPlacements[q.id] === 'WIN');

    if (isSplitNonElim && top2Queens.length >= 2) {
        setCurrentStoryline(`Untucked: ${top2Queens[0].name} and ${top2Queens[1].name} are sizing each other up for the lip sync win.`);
    } else if (safeQueens.length > 0 && bottomQueens.length > 0 && Math.random() > 0.4) {
        const instigator = safeQueens[Math.floor(Math.random() * safeQueens.length)];
        const victim = bottomQueens[Math.floor(Math.random() * bottomQueens.length)];
        const topics = [
            `said ${victim.name} should definitely go home tonight`,
            `called out ${victim.name} for having the same silhouette every runway`,
            `asked ${victim.name} why she even bothered showing up today`
        ];
        setCurrentStoryline(`Untucked: The drama! ${instigator.name} ${topics[Math.floor(Math.random() * topics.length)]}.`);
    } else {
        setCurrentStoryline("Untucked: Everyone is being fake nice. It's suspicious.");
    }
  };

  const setupLipsync = () => {
    const isSplitNonElim = splitPremiere && episodeCount <= 2;
    let pair: Queen[] = [];
    
    if (isSplitNonElim) {
        // Top 2 Lipsync
        pair = currentEpisodeQueens.filter(q => q.trackRecord[q.trackRecord.length - 1] === 'TOP2');
        setCurrentStoryline(`Top 2 Lip Sync for the Win: ${pair[0]?.name} vs ${pair[1]?.name}!`);
    } else {
        // Bottom 2 Lipsync
        pair = currentEpisodeQueens.filter(q => q.trackRecord[q.trackRecord.length - 1] === 'BTM2');
        setCurrentStoryline(`Lip Sync for your LIFE: ${pair[0]?.name} vs ${pair[1]?.name}!`);
    }
    setLipsyncPair(pair);
  };

  const handleLipsyncWinner = (winnerId: number, doubleShantay: boolean = false) => {
    const isSplitNonElim = splitPremiere && episodeCount <= 2;

    if (doubleShantay && !isSplitNonElim) {
        if (doubleShantayUsed) { alert("Already used!"); return; }
        setDoubleShantayUsed(true);
        setCurrentStoryline("Shantay you BOTH stay! (Double Shantay used)");
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
           return { ...q, trackRecord: tr, confessionals: ["I got that premiere win, baby! The others better watch out.", ...q.confessionals].slice(0,10) };
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

  const simulateFinale = () => {
      const finalists = activeQueens;
      // Simple score based winner for now
       let bestScore = -100;
      let winnerId = finalists[0].id;

      finalists.forEach(f => {
          let score = 0;
          f.trackRecord.forEach(p => {
              if (p === 'WIN') score += 10;
              if (p === 'TOP2') score += 8;
              if (p === 'HIGH') score += 5;
              if (p === 'SAFE') score += 2;
              if (p === 'LOW') score -= 1;
              if (p === 'BTM2') score -= 4;
          });
          // Add a little randomness
          score += Math.random() * 10;
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
                 'TOP2': { backgroundColor: 'deepskyblue' },
                 'HIGH': { backgroundColor: 'lightblue' },
                 'LOW': { backgroundColor: 'lightpink' },
                 'BTM2': { backgroundColor: 'tomato' },
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
      'TOP2': { backgroundColor: 'deepskyblue', borderColor: 'dodgerblue', color: 'white', fontWeight: 'bold' },
      'HIGH': { backgroundColor: 'lightblue', borderColor: 'deepskyblue', color: 'darkblue' },
      'LOW': { backgroundColor: 'lightpink', borderColor: 'pink', color: 'darkred' },
      'BTM2': { backgroundColor: 'tomato', borderColor: 'orangered', color: 'white' },
      'SAFE': { backgroundColor: '#e5e7eb', borderColor: '#9ca3af', color: '#374151' },
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

  const GameScreen = () => (
    <div className="flex flex-col h-full">
      {/* Phase Indicator */}
      <div className="bg-pink-800 text-white p-4 text-center font-bold text-2xl uppercase tracking-widest flex justify-between items-center shadow-md">
         <span className="text-pink-200">S1 | Ep {episodeCount}</span>
         <span className="bg-pink-600 px-4 py-1 rounded-full text-sm border border-pink-400">{phase.replace('_', ' ')}</span>
      </div>

      {/* Main Stage Area */}
      <div className="flex-grow bg-gradient-to-b from-pink-50 to-purple-100 p-6 overflow-y-auto">
        
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
                     <label className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow cursor-pointer">
                        <input type="checkbox" checked={splitPremiere} onChange={e => setSplitPremiere(e.target.checked)} className="w-5 h-5 text-pink-600" />
                        <span className="font-bold text-pink-800">Split Premiere (2 Non-Elim Episodes)</span>
                    </label>
                    <button onClick={finalizeCast} disabled={selectedCastIds.length < 4} className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold text-xl disabled:opacity-50 hover:bg-pink-700 transition-colors">
                        Start Season
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {QUEEN_POOL.map(q => (
                        <div key={q.id} onClick={() => toggleQueenSelection(q.id)} 
                             className={`cursor-pointer p-3 rounded-xl border-2 transition-all relative ${selectedCastIds.includes(q.id) ? 'border-pink-500 bg-pink-50 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-pink-300 opacity-70'}`}>
                             {selectedCastIds.includes(q.id) && <CheckCircle className="absolute top-2 right-2 text-pink-500" size={20}/>} 
                             <div className="flex flex-col items-center text-center">
                                 <img src={getQueenImg(q.dexId)} className="w-20 h-20" />
                                 <span className="font-bold text-sm mt-2">{q.name}</span>
                                 <span className="text-xs text-gray-500 italic">{q.personality}</span>
                             </div>
                        </div>
                    ))}
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
            <h2 className="text-4xl font-extrabold text-pink-900 text-center mb-8 flex items-center justify-center"><Star className="mr-3 text-yellow-400" fill="currentColor" /> Select Next Challenge</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CHALLENGES.filter(c => !splitPremiere || episodeCount > 2 || c.isPremiereFriendly).map((challenge, idx) => (
                <button 
                    key={idx} 
                    onClick={() => generateChallenge(challenge)} 
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-400 flex flex-col items-center text-center group"
                >
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
              ))}
            </div>
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
            
            {producersMode && (
                <div className="bg-gray-800 p-6 rounded-xl text-white mb-6 border-4 border-red-500 shadow-2xl">
                    <h3 className="font-bold text-xl flex items-center text-red-400 mb-4">Producer Override</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                        {currentEpisodeQueens.map(queen => (
                            <div key={queen.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <img src={getQueenImg(queen.dexId)} className="w-10 h-10" />
                                    <span className="font-bold">{queen.name}</span>
                                </div>
                                <select 
                                    className="bg-gray-900 text-white rounded px-2 py-1"
                                    value={unsavedPlacements[queen.id] || 'SAFE'}
                                    onChange={(e) => setUnsavedPlacements({...unsavedPlacements, [queen.id]: e.target.value as Placement})}
                                >
                                    {(splitPremiere && episodeCount <= 2) 
                                        ? ['WIN', 'TOP2', 'HIGH', 'SAFE', 'LOW'].map(p => <option key={p} value={p}>{p}</option>)
                                        : ['WIN', 'HIGH', 'SAFE', 'LOW', 'BTM2'].map(p => <option key={p} value={p}>{p}</option>)
                                    }
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-3">
              {currentEpisodeQueens.sort((a,b) => { 
                  const order = { 'WIN': 0, 'TOP2': 1, 'HIGH': 2, 'SAFE': 3, 'LOW': 4, 'BTM2': 5 };
                  return (order[unsavedPlacements[a.id] as keyof typeof order] || 3) - (order[unsavedPlacements[b.id] as keyof typeof order] || 3);
              }).map(queen => (
                <div key={queen.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border-l-4 border-pink-300">
                   <QueenCard queen={queen} />
                   <PlacementBadge placement={unsavedPlacements[queen.id] || 'SAFE'} />
                </div>
              ))}
            </div>
          </div>
        )}

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

        {phase === 'LIPSYNC' && lipsyncPair.length === 2 && (
          <div className="text-center space-y-12 mt-8">
            <div className="animate-pulse">
                <h2 className="text-5xl font-extrabold text-red-600 tracking-tighter">
                    {(splitPremiere && episodeCount <= 2) ? "LIP SYNC FOR THE WIN" : "LIP SYNC FOR YOUR LIFE"}
                </h2>
                <p className="text-red-400 font-bold text-xl mt-2">DON'T F*CK IT UP</p>
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
                           {(splitPremiere && episodeCount <= 2) ? "CLICK TO WIN" : "CLICK TO SAVE"}
                       </span>
                   </div>
               ))}
            </div>
            {!(splitPremiere && episodeCount <= 2) && (
                 <button onClick={() => handleLipsyncWinner(0, true)} disabled={doubleShantayUsed} className="bg-pink-100 text-pink-800 px-6 py-3 rounded-full font-bold hover:bg-pink-200 disabled:opacity-50">
                    {doubleShantayUsed ? "Double Shantay Used" : "Double Shantay (Both Stay)"}
                 </button>
            )}
          </div>
        )}

        {phase === 'ELIMINATION' && (
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
          {['PROMO','ENTRANCES','CHALLENGE_SELECTION','CHALLENGE_INTRO','PERFORMANCE','JUDGING','UNTUCKED','ELIMINATION'].includes(phase) && (
             <button onClick={nextPhase} className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-10 rounded-full text-lg flex items-center active:scale-95 transition-transform">
               PROCEED <Sparkles size={20} className="ml-2"/>
             </button>
          )}
        </div>
      )}
    </div>
  );

  const TrackRecordTab = () => {
    // Sort: Winner, Runner-ups, then by elimination order (latest elim first)
    const sortedCast = cast.slice().sort((a, b) => {
        if (a.status === 'winner') return -1;
        if (b.status === 'winner') return 1;
        if (a.status === 'runner-up') return -1;
        if (b.status === 'runner-up') return 1;
        // Both eliminated or active (mid-season)
        return b.trackRecord.length - a.trackRecord.length;
    });

    return (
      <div className="p-8 bg-pink-50 h-full overflow-auto">
        <h2 className="text-4xl font-extrabold text-pink-900 mb-8 flex items-center"><BarChart3 className="mr-4" size={36} /> Season Track Record</h2>
        <div className="overflow-x-auto bg-white rounded-3xl shadow-xl border border-pink-100">
          <table className="min-w-full text-sm">
            <thead className="bg-pink-600 text-white uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left">Queen</th>
                {Array.from({ length: Math.max(episodeCount - (phase === 'SEASON_OVER' ? 0 : 1), cast.reduce((max, q) => Math.max(max, q.trackRecord.length), 0)) }).map((_, i) => (
                  <th key={i} className="p-4 text-center">Ep {i + 1}</th>
                ))} 
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {sortedCast.map((queen) => (
                <tr key={queen.id} className="hover:bg-pink-50 transition-colors">
                  <td className="p-3 flex items-center space-x-3 font-bold text-pink-900">
                    <img src={getQueenImg(queen.dexId)} className="w-10 h-10 bg-gray-100 rounded-full" />
                    <span className="text-base">{queen.name}</span>
                    {queen.status === 'winner' && <Crown size={20} className="text-yellow-500 ml-2" />}
                  </td>
                  {queen.trackRecord.map((placement, i) => (
                    <td key={i} className="p-3 text-center">
                      <div className="flex justify-center"><PlacementBadge placement={placement} /></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const StatsTab = () => (
      <div className="p-8 bg-pink-50 h-full overflow-auto space-y-8">
          <h2 className="text-4xl font-extrabold text-pink-900 flex items-center mb-8"><VideoIcon className="mr-4" size={36}/> Season Insights & Tea</h2>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100">
              <h3 className="text-2xl font-bold text-pink-800 mb-6 flex items-center"><MessageSquare className="mr-3"/> Confessionals Cam</h3>
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  {cast.filter(c => c.confessionals.length > 0).flatMap(c => c.confessionals.map((conf, i) => ({ queen: c, text: conf, id: `${c.id}-${i}`, idx: i })))
                    .sort((a,b) => b.idx - a.idx).slice(0, 30).map((item) => (
                      <div key={item.id} className="flex items-start space-x-4 bg-pink-50 p-5 rounded-2xl border border-pink-100 shadow-sm">
                          <img src={getQueenImg(item.queen.dexId)} className="w-14 h-14 bg-white rounded-full border-2 border-pink-200 flex-shrink-0" />
                          <div>
                              <span className="font-bold text-pink-900 text-lg">{item.queen.name}</span>
                              <div className="text-gray-700 italic mt-1 text-lg leading-relaxed">"{item.text}"</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  return (
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
  );
}

const NavButton = ({ icon, label, active, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 ${active ? 'bg-pink-600 text-white shadow-lg font-bold' : 'hover:bg-white/10 text-pink-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}>
        <div className="mx-auto md:mx-0">{icon}</div><span className="ml-4 font-semibold hidden md:block text-lg">{label}</span>
    </button>
);