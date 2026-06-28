import { writable } from 'svelte/store';

export const MISSIONS = [
  {
    id: 1,
    name: 'Operation Tara B',
    subtitle: 'First Contact',
    description: 'Queen Al Falcone has been spotted somewhere in the Tara B galaxy. She has been in hiding since her exile by King Shan. This is your first lead — locate her before she moves again.',
    debrief: null,
    timeLimit: null,
    hiddenDistances: false,
    vehiclePenalty: [],
  },
  {
    id: 2,
    name: 'The Long Chase',
    subtitle: 'Against The Clock',
    description: 'She\'s on the move. You have 90 seconds to lock in your fleet before she jumps sectors.',
    debrief: 'We had her on {planet} — but the moment our ships appeared, her loyalists triggered a colony-wide blackout. In the darkness she boarded a decoy freighter and vanished. Scanners have picked up a fresh signal. She hasn\'t gone far, but she knows we\'re coming now.',
    timeLimit: 90,
    hiddenDistances: false,
    vehiclePenalty: [],
  },
  {
    id: 3,
    name: 'Damaged Fleet',
    subtitle: 'Limited Resources',
    description: 'One of our Space Rockets is out of commission. Resources are tight. You still have 90 seconds to deploy.',
    debrief: 'We cornered her near {planet}. This time her operatives were ready — they remotely killed one of our Space Rockets mid-flight. By the time the crew regained control, Al Falcone was already gone. She\'s getting desperate. And so are we.',
    timeLimit: 90,
    hiddenDistances: false,
    vehiclePenalty: ['Space rocket'],
  },
  {
    id: 4,
    name: 'Dark Space',
    subtitle: 'Navigation Blackout',
    description: 'Our navigation array has been jammed. Planet distances are unknown. Range still matters — choose blind.',
    debrief: 'She was hiding in the debris fields around {planet}. Before retreating, her engineers uploaded a jamming virus into our nav systems. We don\'t know how far any planet is anymore. We\'re flying dark.',
    timeLimit: 75,
    hiddenDistances: true,
    vehiclePenalty: ['Space rocket'],
  },
  {
    id: 5,
    name: 'Final Pursuit',
    subtitle: 'End Game',
    description: 'This is it. If she escapes this sector, she disappears into the void forever. End this now.',
    debrief: 'Our scouts nearly had her at {planet}. She detonated an EMP that took out two more ships — the Space Shuttle is gone. She has one sector left to run to. No more escapes. No more second chances.',
    timeLimit: 60,
    hiddenDistances: true,
    vehiclePenalty: ['Space rocket', 'Space shuttle'],
  },
];

function loadHighScore() {
  try { return Number(localStorage.getItem('ff_high') || 0); } catch { return 0; }
}

export const gameState = writable({
  mission: 0,
  lives: 3,
  totalScore: 0,
  streak: 0,
  highScore: loadHighScore(),
});

export const missionResult = writable(null);

export function calculateScore(found, travelTime, elapsedSeconds, timeLimit, streak) {
  if (!found) return { total: 0, stars: 0, breakdown: [] };
  const base        = 1000;
  const efficiency  = Math.max(0, Math.floor((300 - travelTime) * 4));
  const speed       = timeLimit ? Math.max(0, Math.floor((timeLimit - elapsedSeconds) * 15)) : 0;
  const streakBonus = streak > 0 ? streak * 200 : 0;
  const total       = base + efficiency + speed + streakBonus;
  const stars       = total >= 2500 ? 3 : total >= 1500 ? 2 : 1;
  const breakdown   = [
    { label: 'Queen Located',     value: base },
    { label: 'Travel Efficiency', value: efficiency },
    ...(timeLimit && speed > 0 ? [{ label: 'Speed Bonus', value: speed }] : []),
    ...(streak > 0 ? [{ label: `Streak x${streak + 1}`, value: streakBonus }] : []),
  ];
  return { total, stars, breakdown };
}
