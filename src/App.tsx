import React, { useState } from 'react';
import { Mic2, MessageSquare, ListMusic, History, ChevronRight, Award, Zap, Shuffle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioRecorder } from './components/Recorder';
import { DICTION_EXERCISES, RHYTHM_EXERCISES, IMPROV_TOPICS, IMPROV_WORDS, Exercise } from './constants';

type Section = 'diction' | 'rhythm' | 'improv' | 'history';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('diction');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [improvMode, setImprovMode] = useState<'topic' | 'word'>('topic');
  const [currentImprov, setCurrentImprov] = useState<string>('');

  const generateImprov = () => {
    if (improvMode === 'topic') {
      const random = IMPROV_TOPICS[Math.floor(Math.random() * IMPROV_TOPICS.length)];
      setCurrentImprov(random);
    } else {
      const random = IMPROV_WORDS[Math.floor(Math.random() * IMPROV_WORDS.length)];
      setCurrentImprov(`Utilisez le mot : **${random}**`);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10';
      case 'medium': return 'text-amber-400 bg-amber-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#0F1115] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-1 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tight uppercase">VoxMaster</span>
        </div>

        <nav className="flex-1 px-4 space-y-8">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-4 block px-4">BIBLIOTHÈQUE</label>
            <ul className="space-y-1">
              <NavItem icon={<Mic2 />} active={activeSection === 'diction'} onClick={() => { setActiveSection('diction'); setSelectedExercise(null); }} label="Diction" />
              <NavItem icon={<ListMusic />} active={activeSection === 'rhythm'} onClick={() => { setActiveSection('rhythm'); setSelectedExercise(null); }} label="Rythme" />
              <NavItem icon={<MessageSquare />} active={activeSection === 'improv'} onClick={() => { setActiveSection('improv'); setSelectedExercise(null); }} label="Studio d'Impro" />
            </ul>
          </div>

          <div className="px-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-4 block">Virelangues Focus</label>
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 text-xs italic text-slate-400">
                "Seize chaises sèches..."
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 text-xs italic text-slate-500">
                "Un chasseur sachant..."
              </div>
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
            <div>
              <p className="text-sm font-semibold">Orateur Elan</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Niveau Avancé</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0A0C0F] h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 shrink-0">
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              MICRO DÉTECTÉ
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors uppercase tracking-wider">Aide</button>
            <button className="px-4 py-2 bg-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors uppercase tracking-wider">Paramètres</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-8 md:p-12 max-w-4xl mx-auto w-full">
            <header className="mb-12">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl md:text-7xl font-serif font-black tracking-tight mb-2 text-white"
              >
                {activeSection === 'diction' && 'Diction'}
                {activeSection === 'rhythm' && 'Rythme'}
                {activeSection === 'improv' && 'Improvisation'}
              </motion.h1>
              <p className="text-slate-500 max-w-md font-medium text-sm">
                {activeSection === 'diction' && 'Maîtrisez les sons et les articulations les plus complexes.'}
                {activeSection === 'rhythm' && 'Apprenez à varier votre débit pour captiver votre audience.'}
                {activeSection === 'improv' && 'Travaillez votre répartie sur des sujets inattendus.'}
              </p>
            </header>

            <section className="space-y-4">
              {activeSection === 'diction' && DICTION_EXERCISES.map((ex) => (
                <ExerciseCard 
                  key={ex.id} 
                  ex={ex} 
                  isSelected={selectedExercise?.id === ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  diffColor={getDifficultyColor(ex.difficulty)}
                />
              ))}

              {activeSection === 'rhythm' && RHYTHM_EXERCISES.map((ex) => (
                <ExerciseCard 
                  key={ex.id} 
                  ex={ex} 
                  isSelected={selectedExercise?.id === ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  diffColor={getDifficultyColor(ex.difficulty)}
                />
              ))}

              {activeSection === 'improv' && (
                <div className="space-y-8 flex flex-col items-center">
                  <div className="flex bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
                    <button 
                      onClick={() => setImprovMode('topic')}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${improvMode === 'topic' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Sujet
                    </button>
                    <button 
                      onClick={() => setImprovMode('word')}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${improvMode === 'word' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Mot-clé
                    </button>
                  </div>

                  <div 
                    className="w-full min-h-[280px] flex flex-col items-center justify-center p-12 bg-slate-900/20 rounded-[32px] border border-slate-800/50 text-center relative overflow-hidden"
                  >
                    <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">DÉFI ACTUEL</p>
                    <AnimatePresence mode="wait">
                      {currentImprov ? (
                        <motion.div
                          key={currentImprov}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <h2 className="text-4xl md:text-5xl font-serif text-white/90 leading-tight max-w-2xl">
                            "{currentImprov.replace(/\*\*(.*?)\*\*/g, '$1')}"
                          </h2>
                        </motion.div>
                      ) : (
                        <motion.div className="text-slate-600 uppercase font-mono text-xs tracking-widest">
                          Générez un sujet pour commencer l'exercice
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <button 
                      onClick={generateImprov}
                      className="mt-12 px-8 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    >
                      <Shuffle className="w-4 h-4" />
                      NOUVEAU SUJET
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Right Panel: Analysis & Recorder */}
      <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-[#101216] p-8 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center justify-between mb-6">
              Studio Pratique
              <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">V2.1</span>
            </h3>
            
            {selectedExercise || currentImprov ? (
              <div className="space-y-6">
                <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest mb-2">Cible</p>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {selectedExercise?.content || currentImprov}
                  </p>
                </div>
                <AudioRecorder context={selectedExercise?.content || currentImprov} />
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-slate-800 rounded-3xl p-8">
                <Award className="w-10 h-10 mb-4 text-slate-600" />
                <p className="text-xs font-medium text-slate-500">Sélectionnez une activité pour débuter l'enregistrement</p>
              </div>
            )}
          </div>
          
          <div className="pt-6 border-t border-slate-800">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Feedback Rapide</h3>
             <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-indigo-400 mb-0.5">Conseil VoxAI</p>
                    <p className="text-[11px] text-slate-400 leading-snug">Stabilisez votre débit sur les consonnes dures.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NavItem({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
          : 'text-slate-400 hover:bg-slate-800/50'
      }`}
    >
      <div className={`${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function ExerciseCard({ ex, isSelected, onClick, diffColor }: { key?: React.Key, ex: Exercise, isSelected: boolean, onClick: () => void, diffColor: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group ${
        isSelected 
          ? 'bg-slate-800 border-slate-600 shadow-xl shadow-black/20' 
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isSelected ? 'bg-indigo-500 text-white' : diffColor
          }`}>
            {ex.difficulty}
          </span>
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest font-bold">
            ID-{ex.id}
          </span>
        </div>
        <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
          {ex.title}
        </h3>
        <p className={`text-sm line-clamp-1 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
          "{ex.content}"
        </p>
      </div>
      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-indigo-400' : 'text-slate-700'}`} />
    </motion.button>
  );
}
