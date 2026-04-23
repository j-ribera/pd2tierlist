/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import buildsData from './builds.json';
import { Search } from 'lucide-react';

interface Build {
  className: string;
  buildName: string;
  tier: string;
  fortify: string;
  budget: string;
  hc: string;
  t1t2: string;
}

const CLASS_INFO = [
  { name: 'All', icon: '🌍' },
  { name: 'Amazon', icon: '🏹' },
  { name: 'Assassin', icon: '🥷' },
  { name: 'Barbarian', icon: '⚔️' },
  { name: 'Druid', icon: '🐺' },
  { name: 'Necromancer', icon: '💀' },
  { name: 'Paladin', icon: '🛡️' },
  { name: 'Sorceress', icon: '⚡' }
];

const TIER_ORDER: Record<string, number> = {
  'S+': 100, 'S': 90, 'S-': 85,
  'A+': 80, 'A': 70, 'A-': 65,
  'B+': 60, 'B': 50, 'B-': 45,
  'C+': 40, 'C': 30, 'C-': 25,
  'D+': 20, 'D': 10, 'D-': 5,
  'F+': 4, 'F': 2, 'F-': 1,
};

const STARTER_DATA: Record<string, {rank: number, keywords: string[]}[]> = {
  Sorceress: [
    {rank: 1, keywords: ['meteor']},
    {rank: 2, keywords: ['inferno', 'fire wall']},
    {rank: 3, keywords: ['hydra']},
    {rank: 4, keywords: ['chain lightning']},
    {rank: 5, keywords: ['blizzard']},
    {rank: 6, keywords: ['frozen orb']},
    {rank: 7, keywords: ['ice barrage']},
    {rank: 8, keywords: ['combustion', 'fire ball']},
    {rank: 9, keywords: ['charged bolt']}
  ],
  Druid: [
    {rank: 1, keywords: ['summon']},
    {rank: 2, keywords: ['wind', 'tornado', 'twister']},
    {rank: 3, keywords: ['fire', 'fissure', 'volcano', 'molten boulder', 'armageddon']},
    {rank: 4, keywords: ['arctic blast']},
    {rank: 5, keywords: ['poison creeper', 'rabies']},
    {rank: 6, keywords: ['shockwave']}
  ],
  Assassin: [
    {rank: 1, keywords: ['mind blast', 'psychic hammer']},
    {rank: 2, keywords: ['wake of fire']},
    {rank: 3, keywords: ['lightning sentry']},
    {rank: 4, keywords: ['blade sentinel', 'blade fury']},
    {rank: 5, keywords: ['claws of thunder']},
    {rank: 6, keywords: ['phoenix strike']},
    {rank: 7, keywords: ['cobra strike']},
    {rank: 8, keywords: ['blades of ice']}
  ],
  Barbarian: [
    {rank: 1, keywords: ['war cry']},
    {rank: 2, keywords: ['double throw']},
    {rank: 3, keywords: ['whirlwind']},
    {rank: 4, keywords: ['split throw']},
    {rank: 5, keywords: ['frenzy']},
    {rank: 6, keywords: ['leap attack']}
  ],
  Amazon: [
    {rank: 1, keywords: ['decoy', 'valk', 'strafe']},
    {rank: 2, keywords: ['fire arrow', 'exploding arrow']},
    {rank: 3, keywords: ['magic arrow']},
    {rank: 4, keywords: ['lightning strike']},
    {rank: 5, keywords: ['poison', 'plague javelin']},
    {rank: 6, keywords: ['cold arrow']},
    {rank: 7, keywords: ['power strike']}
  ],
  Necromancer: [
    {rank: 1, keywords: ['clay golem']},
    {rank: 2, keywords: ['blood golem']},
    {rank: 3, keywords: ['skeletal mage', 'revive']},
    {rank: 4, keywords: ['teeth', 'bone spear']},
    {rank: 5, keywords: ['fire golem']},
    {rank: 6, keywords: ['corpse explosion']},
    {rank: 7, keywords: ['poison strike', 'desecrate']},
    {rank: 8, keywords: ['skeletal warrior']},
    {rank: 9, keywords: ['dark pact']}
  ],
  Paladin: [
    {rank: 1, keywords: ['fist of the heavens', 'holy bolt', 'foh']},
    {rank: 2, keywords: ['vengeance']},
    {rank: 3, keywords: ['sanctuary', 'sacrifice']},
    {rank: 4, keywords: ['blessed hammer']},
    {rank: 5, keywords: ['zeal']},
    {rank: 6, keywords: ['strafe']},
    {rank: 7, keywords: ['smite']}
  ]
};

const OVERALL_STARTERS = [
  {rank: 1, class: 'Sorceress', keywords: ['meteor']},
  {rank: 2, class: 'Necromancer', keywords: ['golem']}, 
  {rank: 3, class: 'Paladin', keywords: ['fist of the heavens', 'holy bolt', 'foh']},
  {rank: 4, class: 'Barbarian', keywords: ['war cry']},
  {rank: 5, class: 'Sorceress', keywords: ['inferno', 'fire wall']},
  {rank: 6, class: 'Sorceress', keywords: ['hydra']},
  {rank: 7, class: 'Paladin', keywords: ['vengeance']},
  {rank: 8, class: 'Necromancer', keywords: ['skeletal mage']},
  {rank: 9, class: 'Sorceress', keywords: ['chain lightning']},
  {rank: 10, class: 'Druid', keywords: ['summon']}
];

function getStarterInfo(buildName: string, className: string): { classRank: number | null, overallRank: number | null } {
  const bn = buildName.toLowerCase();
  let classRank = null;
  let overallRank = null;
  
  const classData = STARTER_DATA[className];
  if (classData) {
    for (const item of classData) {
      if (item.keywords.some((kw: string) => bn.includes(kw))) {
        classRank = item.rank;
        break;
      }
    }
  }
  
  for (const item of OVERALL_STARTERS) {
    if (className === item.class && item.keywords.some(kw => bn.includes(kw))) {
      overallRank = item.rank;
      break;
    }
  }
  
  return { classRank, overallRank };
}

// Help map Budget string to a simplified category
function getBudgetCategory(budgetStr: string) {
  if (budgetStr.includes('✔✔')) return 'LOW'; // ✔✔✔ or ✔✔ is Low Budget (Good)
  if (budgetStr.includes('✔')) return 'MID';
  return 'HIGH'; // ❌
}

function getFarmType(buildName: string, className: string) {
  const name = buildName.toLowerCase();
  
  // Highly Granular Farm Types
  if (name.includes('summon') || name.includes('golem') || name.includes('skele') || name.includes('revive') || name.includes('decoy')) return 'Summoner';
  if (name.includes('bow') || name.includes('arrow') || name.includes('strafe') || name.includes('multiple shot')) return 'Bow/Crossbow';
  if (name.includes('javelin') || name.includes('strike') && className === 'Amazon') return 'Javazon';
  if (name.includes('trap') || name.includes('sentry') || name.includes('wake') || name.includes('web')) return 'Trapper';
  if (name.includes('martial') || name.includes('kick') || name.includes('talon') || name.includes('tiger') || name.includes('cobra') || name.includes('phoenix strike')) return 'Martial Arts';
  
  // Spell Casters
  if (name.includes('nova') || name.includes('blizzard') || name.includes('orb') || name.includes('spike') || name.includes('barrage') || className === 'Sorceress') return 'Caster';
  if (name.includes('hammer') || name.includes('fist of the heavens') || name.includes('foh') || name.includes('holy bolt')) return 'Holy Caster';
  if (name.includes('bone') || name.includes('teeth') || name.includes('poison nova') || name.includes('desecrate') || name.includes('poison strike')) return 'Dark Caster';
  if (name.includes('fissure') || name.includes('volcano') || name.includes('tornado') || name.includes('hurricane') || name.includes('boulder') || name.includes('twister')) return 'Elemental Caster';

  // Melee variants
  if (name.includes('whirlwind') || name.includes('frenzy') || name.includes('berserk') || name.includes('concentrate') || name.includes('leap') || name.includes('bash')) return 'Melee (Physical)';
  if (name.includes('zeal') || name.includes('smite') || name.includes('sacrifice') || name.includes('vengeance') || name.includes('charge')) return 'Melee (Paladin)';
  if (name.includes('wolf') || name.includes('bear') || name.includes('fury') || name.includes('rabies') || name.includes('claws')) return 'Shape Shifter';

  if (name.includes('throw') || name.includes('blade')) return 'Throwing/Blades';

  return 'Hybrid/Other';
}

export default function App() {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [budgetLevel, setBudgetLevel] = useState<string>('ALL'); // ALL, LOW, MID, HIGH
  const [starterFilter, setStarterFilter] = useState<string>('ALL'); // ALL, RECOMMENDED, TOP 10 OVERALL
  const [tierRange, setTierRange] = useState<string>('ALL'); // ALL, S, A, B, C, D, F
  const [farmType, setFarmType] = useState<string>('ALL'); // Dynamically populated
  
  const [hcSafe, setHcSafe] = useState(false);
  const [fortifyViable, setFortifyViable] = useState(false);
  const [t1t2Specialist, setT1t2Specialist] = useState(false);

  const filteredBuilds = useMemo(() => {
    return (buildsData as Build[]).filter(b => {
      if (selectedClass !== 'All' && b.className !== selectedClass) return false;
      if (search && !b.buildName.toLowerCase().includes(search.toLowerCase())) return false;
      
      if (budgetLevel !== 'ALL') {
        const cat = getBudgetCategory(b.budget);
        if (cat !== budgetLevel) return false;
      }

      if (starterFilter !== 'ALL') {
        const { classRank, overallRank } = getStarterInfo(b.buildName, b.className);
        if (starterFilter === 'RECOMMENDED' && classRank === null) return false;
        if (starterFilter === 'TOP 10 OVERALL' && overallRank === null) return false;
      }
      
      if (tierRange !== 'ALL') {
        if (!b.tier.startsWith(tierRange)) return false;
      }
      
      if (farmType !== 'ALL') {
        if (getFarmType(b.buildName, b.className) !== farmType) return false;
      }
      
      if (hcSafe && (!b.hc || (!b.hc.includes('✔') && !b.hc.includes('✔✔')))) return false;
      if (fortifyViable && (!b.fortify || (!b.fortify.includes('✔')))) return false;
      if (t1t2Specialist && (!b.t1t2 || (!b.t1t2.includes('✔✔✔') && !b.t1t2.includes('✔✔')))) return false;
      
      return true;
    }).sort((a, b) => {
      const scoreA = TIER_ORDER[a.tier] || 0;
      const scoreB = TIER_ORDER[b.tier] || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.buildName.localeCompare(b.buildName);
    });
  }, [selectedClass, search, budgetLevel, starterFilter, tierRange, hcSafe, fortifyViable, t1t2Specialist, farmType]);

  const uniqueTiers = Array.from(new Set((buildsData as Build[]).map(b => b.tier[0]))).filter(Boolean).sort();
  const uniqueFarmTypes = Array.from(new Set((buildsData as Build[]).map(b => getFarmType(b.buildName, b.className)))).sort();


  return (
    <div className="min-h-screen w-full bg-black text-[#d8c8b8] font-serif select-none flex flex-col border-[12px] border-[#2a1a10] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
      
      <header className="relative h-24 sm:h-28 shrink-0 flex items-center justify-center border-b-4 border-[#5a4a3a] bg-[#1a0f0a] shadow-lg">
        <div className="absolute left-4 sm:left-6 flex gap-2 items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-900 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
          <div className="hidden sm:block text-xs uppercase tracking-tighter text-[#c2a373] opacity-60">Life: 1542</div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl uppercase tracking-[0.2em] text-[#c2a373] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">Arreat Summit II</h1>
          <p className="text-[10px] sm:text-xs text-[#a5927d] uppercase tracking-widest mt-1 italic font-sans flex items-center justify-center gap-2">
            The Ultimate Diablo II Resurrected Compendium
          </p>
        </div>
        <div className="absolute right-4 sm:right-6 flex gap-2 items-center text-right">
          <div className="hidden sm:block text-xs uppercase tracking-tighter text-[#c2a373] opacity-60">Mana: 890</div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-900 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-4 sm:p-6 gap-4 sm:gap-6 flex-col md:flex-row">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          <section className="border-2 border-[#5a4a3a] bg-[#0f0a07] p-4 relative mt-2 md:mt-0">
            <div className="absolute -top-3 left-3 px-2 bg-[#0f0a07] text-[#c2a373] text-[10px] uppercase font-bold tracking-widest">Class Filter</div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
              {CLASS_INFO.map(c => (
                <button 
                  key={c.name}
                  onClick={() => setSelectedClass(c.name)}
                  className={`text-left px-2 py-1.5 border text-xs uppercase flex justify-between group transition-colors ${selectedClass === c.name ? 'bg-[#3a2a1a] border-[#c2a373]' : 'hover:bg-[#3a2a1a] border-transparent hover:border-[#c2a373]'}`}
                >
                  <span className={selectedClass === c.name ? 'text-[#ffcc00]' : 'group-hover:text-white transition-colors'}>{c.name}</span>
                  <span className={selectedClass === c.name ? 'text-[#ffcc00]' : 'text-[#5a4a3a]'}>{c.icon}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="border-2 border-[#5a4a3a] bg-[#0f0a07] p-4 relative">
            <div className="absolute -top-3 left-3 px-2 bg-[#0f0a07] text-[#c2a373] text-[10px] uppercase font-bold tracking-widest">Build Parameters</div>
            <div className="flex flex-col gap-4 mt-2">
              
              {/* Search Box - Retained from original logic */}
              <div>
                <label className="text-[10px] text-[#a5927d] uppercase mb-1 block">Search Build</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#5a4a3a]" size={14} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="e.g. Nova"
                    className="w-full bg-[#2a1a10] border border-[#5a4a3a] hover:border-[#c2a373] focus:border-[#ffcc00] text-[#c2a373] text-xs pl-8 pr-2 py-1.5 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#a5927d] uppercase mb-1 block">Budget Mode</label>
                <div className="flex gap-1">
                  {['ALL', 'LOW', 'MID', 'HIGH'].map(lvl => (
                    <button 
                      key={lvl}
                      onClick={() => setBudgetLevel(lvl)}
                      className={`flex-1 py-1 px-1 text-[8px] sm:text-[9px] border transition-colors ${budgetLevel === lvl ? 'bg-[#3a2a1a] border-[#c2a373] text-[#ffcc00]' : 'bg-[#2a1a10] border-[#5a4a3a] hover:text-[#c2a373]'}`}
                    >
                      {lvl === 'LOW' ? 'Low' : lvl === 'MID' ? 'Mid' : lvl === 'HIGH' ? 'High' : 'ALL'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#a5927d] uppercase mb-1 block">Starter Ratings</label>
                <div className="flex gap-1">
                  {['ALL', 'RECOMMENDED', 'TOP 10 OVERALL'].map(lvl => (
                    <button 
                      key={lvl}
                      onClick={() => setStarterFilter(lvl)}
                      className={`flex-1 py-1 px-1 text-[7px] sm:text-[8px] sm:font-bold border transition-colors ${starterFilter === lvl ? 'bg-[#3a2a1a] border-[#c2a373] text-[#ffcc00]' : 'bg-[#2a1a10] border-[#5a4a3a] hover:text-[#c2a373]'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#a5927d] uppercase mb-1 block">Tier Range</label>
                <div className="flex gap-1 flex-wrap">
                  <button 
                    onClick={() => setTierRange('ALL')}
                    className={`px-2 py-1 text-[9px] border ${tierRange === 'ALL' ? 'bg-[#3a2a1a] border-[#c2a373] text-[#ffcc00]' : 'bg-[#2a1a10] border-[#5a4a3a] hover:text-[#c2a373]'}`}
                  >ALL</button>
                  {uniqueTiers.map(t => (
                    <button 
                      key={t}
                      onClick={() => setTierRange(t)}
                      className={`flex-1 min-w-[20px] py-1 text-[9px] border transition-colors ${tierRange === t ? 'bg-[#3a2a1a] border-[#c2a373] text-[#ffcc00]' : 'bg-[#2a1a10] border-[#5a4a3a] hover:text-[#c2a373]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#a5927d] uppercase mb-1 block">Farm Type</label>
                <div className="flex gap-1 flex-wrap">
                  <button 
                    onClick={() => setFarmType('ALL')}
                    className={`px-2 py-1 text-[9px] border ${farmType === 'ALL' ? 'bg-[#3a2a1a] border-[#c2a373] text-[#ffcc00]' : 'bg-[#2a1a10] border-[#5a4a3a] hover:text-[#c2a373]'}`}
                  >ALL</button>
                  {uniqueFarmTypes.map(ft => (
                    <button 
                      key={ft}
                      onClick={() => setFarmType(ft)}
                      className={`flex-1 min-w-[50px] px-1 py-1 text-[9px] border transition-colors ${farmType === ft ? 'bg-[#3a2a1a] border-[#c2a373] text-[#ffcc00]' : 'bg-[#2a1a10] border-[#5a4a3a] hover:text-[#c2a373]'}`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="mt-1 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#a5927d] hover:text-[#c2a373] transition-colors group" onClick={() => setHcSafe(p => !p)}>
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${hcSafe ? 'bg-[#3a2a1a] border-[#ffcc00]' : 'bg-[#1a0f0a] border-[#5a4a3a] group-hover:border-[#c2a373]'}`}>
                    {hcSafe && <span className="text-[#ffcc00] text-[10px]">✔</span>}
                  </div>
                  Hardcore Safe Only
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#a5927d] hover:text-[#c2a373] transition-colors group" onClick={() => setFortifyViable(p => !p)}>
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${fortifyViable ? 'bg-[#3a2a1a] border-[#ffcc00]' : 'bg-[#1a0f0a] border-[#5a4a3a] group-hover:border-[#c2a373]'}`}>
                    {fortifyViable && <span className="text-[#ffcc00] text-[10px]">✔</span>}
                  </div>
                  Fortified Maps Viable
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#a5927d] hover:text-[#c2a373] transition-colors group" onClick={() => setT1t2Specialist(p => !p)}>
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${t1t2Specialist ? 'bg-[#3a2a1a] border-[#ffcc00]' : 'bg-[#1a0f0a] border-[#5a4a3a] group-hover:border-[#c2a373]'}`}>
                    {t1t2Specialist && <span className="text-[#ffcc00] text-[10px]">✔</span>}
                  </div>
                  T1-T2 Specialists (Extremely Fast)
                </label>
              </div>

            </div>
          </section>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 border-2 border-[#5a4a3a] bg-[#150d09] flex flex-col overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="bg-[#2a1a10] px-3 sm:px-4 py-2 flex items-center justify-between border-b-2 border-[#5a4a3a] shrink-0 sticky top-0 z-10 shadow-md">
            <div className="flex gap-2 sm:gap-4 text-[9px] sm:text-[11px] uppercase tracking-wider font-bold text-[#c2a373] w-full items-center">
              <span className="w-6 sm:w-8 text-center shrink-0">TR</span>
              <span className="w-16 sm:w-24 shrink-0">Class</span>
              <span className="flex-1 min-w-0">Build Spec (Farm)</span>
              <span className="w-16 sm:w-20 text-right shrink-0 hidden md:block">HC Safe</span>
              <span className="w-16 sm:w-24 text-right shrink-0">Starter/Budget</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="flex flex-col min-h-full">
              {filteredBuilds.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center p-8 text-[#5a4a3a] text-sm uppercase tracking-widest font-sans italic opacity-70">
                  Not even death can save you from finding no builds...
                </div>
              ) : (
                filteredBuilds.map((b, i) => {
                  // Color mappings to match theme
                  const trColor = b.tier.startsWith('S') ? 'text-orange-500 bg-orange-500/10' : 
                                  b.tier.startsWith('A') ? 'text-yellow-500 bg-yellow-500/10' : 
                                  b.tier.startsWith('B') ? 'text-gray-300 bg-gray-500/10' : 
                                  'text-gray-500';
                  
                  const bdgtCat = getBudgetCategory(b.budget);
                  const bdgtColor = bdgtCat === 'LOW' ? 'text-green-500' : bdgtCat === 'MID' ? 'text-blue-300' : 'text-red-500';
                  const farmCat = getFarmType(b.buildName, b.className);
                  const { classRank, overallRank } = getStarterInfo(b.buildName, b.className);

                  return (
                    <div key={i} className={`px-3 sm:px-4 py-2 sm:py-3 border-b border-[#3a2a1a] flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs transition-colors hover:bg-[#1f130c] ${i % 2 === 0 ? 'bg-[#22150d]' : 'bg-transparent'}`}>
                      <span className={`w-6 sm:w-8 text-center font-bold font-sans text-[11px] sm:text-sm px-1 py-0.5 rounded shadow-[inset_0_0_5px_rgba(0,0,0,0.5)] border border-[#3a2a1a] ${trColor}`}>
                        {b.tier}
                      </span>
                      <span className="w-16 sm:w-24 text-white font-semibold tracking-wide shrink-0 truncate">{b.className}</span>
                      <span className="flex-1 italic text-[#c2a373] min-w-0 pr-2 truncate flex flex-wrap items-center gap-2">
                        <span className="truncate">{b.buildName}</span>
                        <span className="text-[9px] text-[#5a4a3a] not-italic uppercase bg-[#0f0a07] px-1.5 py-0.5 rounded-[2px] border border-[#2a1a10] hidden lg:inline-block">{farmCat}</span>
                        {overallRank && <span className="text-[9px] text-[#ffcc00] not-italic font-bold uppercase hidden md:inline-block border border-[#ffcc00]/50 bg-[#ffcc00]/10 px-1 rounded" title="Top 10 Overall Starter">⭐ #{overallRank} OVR</span>}
                        {!overallRank && classRank && <span className="text-[9px] text-zinc-400 not-italic font-bold uppercase hidden md:inline-block border border-zinc-600 bg-zinc-800 px-1 rounded" title="Class Recommended Starter">⭐ #{classRank}</span>}
                        {b.fortify.includes('✔') && <span className="text-[9px] text-green-700 not-italic font-bold uppercase hidden md:inline-block border border-green-900 bg-green-900/10 px-1 rounded" title="Fortified Maps Viable">M+</span>}
                        {b.t1t2.includes('✔✔') && <span className="text-[9px] text-blue-700 not-italic font-bold uppercase hidden md:inline-block border border-blue-900 bg-blue-900/10 px-1 rounded" title="T1/T2 Specialist">T1/T2</span>}
                      </span>
                      <span className="w-16 sm:w-20 text-right shrink-0 hidden md:flex items-center justify-end">
                        {b.hc.includes('✔') ? <span className="text-[#a5927d]">Safe</span> : <span className="text-[#5a4a3a]">Risky</span>}
                      </span>
                      <span className={`w-16 sm:w-24 text-right shrink-0 uppercase tracking-tighter ${bdgtColor}`}>
                        {bdgtCat === 'LOW' ? 'Budget' : bdgtCat === 'MID' ? 'Mid-Tier' : 'Wealthy'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <footer className="bg-[#0f0a07] p-2 sm:p-3 text-[9px] uppercase tracking-widest text-[#5a4a3a] text-center border-t-2 border-[#5a4a3a] shrink-0">
            Showing {filteredBuilds.length > 0 ? 1 : 0}-{filteredBuilds.length} of {buildsData.length} Builds • All builds vetted for Latest Patch • © 2024 Arreat Compendium
          </footer>
        </main>

      </div>

      <div className="h-10 sm:h-12 shrink-0 bg-[#1a0f0a] border-t-4 border-[#5a4a3a] flex items-center justify-around px-2 sm:px-8 overflow-x-auto">
        <div className="text-[9px] sm:text-[10px] text-[#c2a373] uppercase whitespace-nowrap px-2 cursor-pointer hover:text-white transition-colors">F1: Help</div>
        <div className="text-[9px] sm:text-[10px] text-[#c2a373] uppercase whitespace-nowrap px-2 cursor-pointer hover:text-white transition-colors">F2: Skill Tree</div>
        <div className="text-[9px] sm:text-[10px] text-[#c2a373] uppercase whitespace-nowrap px-2 cursor-pointer hover:text-white transition-colors">F3: Runewords</div>
        <div className="text-[9px] sm:text-[10px] text-[#c2a373] uppercase whitespace-nowrap px-2 cursor-pointer hover:text-white transition-colors">F4: Breakpoints</div>
        <div className="text-[9px] sm:text-[10px] text-[#ffcc00] uppercase font-bold underline underline-offset-4 whitespace-nowrap px-2 shadow-[0_2px_10px_rgba(255,204,0,0.2)]">F5: Tier List</div>
      </div>
    </div>
  );
}
