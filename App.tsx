
import React, { useState, useEffect, useRef } from 'react';
import { Level, GameState, PhonicsItem } from './types';
import { LEVELS } from './constants';
import { getNextPhonicsItem, generateTestQuestion, getSpeech, generateRewardImage } from './services/geminiService';
import { decodeBase64, decodeAudioData } from './utils/audioUtils';
import LetterCard from './components/LetterCard';
import ParentPanel from './components/ParentPanel';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    currentLevel: Level.LEVEL_1,
    currentStep: 'intro',
    history: [],
    currentItem: null,
    loading: false,
    rewardLoading: false,
    rewardImageUrl: null,
    testPhase: 0,
  });

  const [activePhonemeIndex, setActivePhonemeIndex] = useState<number>(-1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isParentPanelOpen, setIsParentPanelOpen] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
  };

  const playText = async (text: string, voice: string = 'Zephyr') => {
    initAudio();
    setIsSpeaking(true);
    try {
      const base64 = await getSpeech(text, voice);
      const bytes = decodeBase64(base64);
      const buffer = await decodeAudioData(bytes, audioContextRef.current!);
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current!.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (error) {
      console.error("Speech error:", error);
      setIsSpeaking(false);
    }
  };

  const startLevel = async (level: Level) => {
    setState(prev => ({ ...prev, loading: true, currentLevel: level, currentStep: 'decoding' }));
    try {
      const item = await getNextPhonicsItem(level, state.history.map(h => h.word));
      setState(prev => ({ ...prev, currentItem: item, loading: false }));
      setActivePhonemeIndex(-1);
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const nextItem = async () => {
    if (!state.currentLevel) return;
    setState(prev => ({ ...prev, loading: true, currentStep: 'decoding', rewardImageUrl: null }));
    try {
      const item = await getNextPhonicsItem(state.currentLevel, state.history.map(h => h.word));
      setState(prev => ({
        ...prev,
        currentItem: item,
        loading: false,
        history: state.currentItem ? [...prev.history, state.currentItem] : prev.history
      }));
      setActivePhonemeIndex(-1);
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const showReward = async () => {
    setState(prev => ({ ...prev, currentStep: 'reward', rewardLoading: true }));
    if (state.currentItem) {
        playText(`Great job! Look! ${state.currentItem.visualReward}`, 'Puck');
        try {
          const imageUrl = await generateRewardImage(state.currentItem.visualReward);
          setState(prev => ({ ...prev, rewardImageUrl: imageUrl, rewardLoading: false }));
        } catch (error) {
          console.error("Image generation error:", error);
          setState(prev => ({ ...prev, rewardLoading: false }));
        }
    }
  };

  const showMenu = () => {
    setState(prev => ({ ...prev, currentStep: 'menu', rewardImageUrl: null }));
    setIsParentPanelOpen(false);
  };

  const runQuickTest = async () => {
      setState(prev => ({ ...prev, currentStep: 'test', testPhase: 0, loading: true }));
      try {
          const test = await generateTestQuestion(0);
          setState(prev => ({ 
              ...prev, 
              loading: false, 
              currentItem: { 
                  word: test.word, 
                  readingGuide: test.guide, 
                  phonemes: test.word.split(''), 
                  phonemeGuides: test.word.split('').map(p => `Sound: ${p}`),
                  audioCue: "Say it clearly and slowly.", 
                  visualReward: "", 
                  congratulation: "Good test!" 
              } 
          }));
      } catch (e) {
          setState(prev => ({ ...prev, loading: false }));
      }
  };

  const playPhoneme = (idx: number) => {
      if (!state.currentItem) return;
      const phoneme = state.currentItem.phonemes[idx];
      playText(phoneme, 'Kore');
      setActivePhonemeIndex(idx);
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-4 flex flex-col relative" onClick={initAudio}>
      {/* Header */}
      <header className="flex justify-between items-center mb-6 bg-white p-3 rounded-2xl shadow-sm border-b-4 border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={showMenu}>
          <div className="bg-yellow-400 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md">
            <i className="fas fa-rocket"></i>
          </div>
          <h1 className="text-xl text-slate-800">Phonics</h1>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={showMenu}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
            >
                MENU
            </button>
            {state.currentStep === 'decoding' && (
                <button 
                    onClick={nextItem}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-md"
                >
                    NEXT
                </button>
            )}
        </div>
      </header>

      {/* Parent Toggle Button - Floating */}
      {state.currentStep === 'decoding' && state.currentItem && (
        <button 
          onClick={() => setIsParentPanelOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-slate-800 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all border-4 border-white"
        >
          <i className="fas fa-user-tie text-2xl"></i>
        </button>
      )}

      {/* Main Game Area */}
      <main className="flex-grow flex flex-col justify-center">
        {state.loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse">Powering up...</p>
          </div>
        ) : (
          <>
            {state.currentStep === 'intro' && (
              <div className="text-center space-y-6 animate-fade-in flex flex-col items-center">
                <div className="bouncy inline-block">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=phonics&backgroundColor=b6e3f4" alt="Character" className="w-40 h-40 rounded-full border-8 border-white shadow-2xl" />
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-blue-500 w-full">
                  <h2 className="text-3xl mb-3 text-blue-600">Ready?</h2>
                  <p className="text-slate-600 mb-6">Let's find the best level for your adventure!</p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={runQuickTest}
                      className="flex items-center gap-4 p-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl shadow-lg hover:scale-[1.02] transition-transform text-left"
                    >
                      <i className="fas fa-vial text-2xl"></i>
                      <div>
                        <h3 className="text-lg font-kids">Quick Test</h3>
                        <p className="text-xs opacity-90">I'm not sure where to start!</p>
                      </div>
                    </button>
                    <button 
                      onClick={showMenu}
                      className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-2xl shadow-lg hover:scale-[1.02] transition-transform text-left"
                    >
                      <i className="fas fa-list text-2xl"></i>
                      <div>
                        <h3 className="text-lg font-kids">Pick a Level</h3>
                        <p className="text-xs opacity-90">I want to choose my level!</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {state.currentStep === 'menu' && (
              <div className="grid grid-cols-1 gap-3 animate-fade-in pb-20">
                <h2 className="text-2xl text-slate-800 mb-2 font-kids">Adventure Levels</h2>
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => startLevel(lvl.id)}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:shadow-md transition-all text-left"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-blue-600">Level {lvl.id}: {lvl.title}</h3>
                      <p className="text-slate-500 text-sm">{lvl.description}</p>
                    </div>
                    <i className="fas fa-chevron-right text-slate-300"></i>
                  </button>
                ))}
              </div>
            )}

            {state.currentStep === 'decoding' && state.currentItem && (
              <div className="space-y-6 animate-fade-in flex flex-col items-center">
                <LetterCard 
                  phonemes={state.currentItem.phonemes} 
                  phonemeGuides={state.currentItem.phonemeGuides}
                  activeIndex={activePhonemeIndex} 
                />
                
                <div className="flex flex-col w-full gap-4 px-2">
                    <div className="flex gap-4 justify-center">
                        <button 
                            className={`w-20 h-20 rounded-full text-white shadow-xl active:scale-90 transition-all flex items-center justify-center text-3xl ${
                                isSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'
                            }`}
                            onClick={() => {
                                const nextIdx = activePhonemeIndex < state.currentItem!.phonemes.length - 1 ? activePhonemeIndex + 1 : 0;
                                playPhoneme(nextIdx);
                            }}
                        >
                            <i className={`fas ${isSpeaking ? 'fa-volume-up' : 'fa-hand-point-up'}`}></i>
                        </button>
                        <button 
                            className="flex-grow h-20 bg-green-500 text-white rounded-3xl font-kids text-3xl shadow-xl hover:bg-green-600 active:scale-95 transition-all"
                            onClick={showReward}
                        >
                            READ IT!
                        </button>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <i className="fas fa-lightbulb text-blue-400 mt-1"></i>
                        <p className="text-xs text-blue-800 leading-tight">
                            Tap the blue button to hear each sound. Then "glue" them together! Tapping the guy in the corner helps with secrets!
                        </p>
                    </div>
                </div>

                <ParentPanel 
                  isOpen={isParentPanelOpen}
                  onClose={() => setIsParentPanelOpen(false)}
                  readingGuide={state.currentItem.readingGuide} 
                  audioCue={state.currentItem.audioCue}
                  congratulation={state.currentItem.congratulation}
                  onPlayCue={() => playText(state.currentItem!.audioCue, 'Charon')}
                  isSpeaking={isSpeaking}
                />
              </div>
            )}

            {state.currentStep === 'reward' && state.currentItem && (
                <div className="text-center space-y-4 animate-pop-in flex flex-col items-center py-2">
                    <div className="relative w-full">
                        <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
                        <h2 className="text-5xl text-orange-500 mb-2 font-kids letter-pop">HUZZAH!</h2>
                        
                        <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-green-400 relative z-10 w-full flex flex-col items-center">
                            {state.rewardLoading ? (
                                <div className="w-full aspect-square bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3 animate-pulse">
                                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-slate-400 text-xs font-bold">Creating your reward...</p>
                                </div>
                            ) : state.rewardImageUrl ? (
                                <div className="w-full aspect-square relative rounded-2xl overflow-hidden shadow-inner mb-4 border-2 border-slate-100">
                                    <img 
                                        src={state.rewardImageUrl} 
                                        alt="Reward" 
                                        className="w-full h-full object-cover animate-pop-in" 
                                    />
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                        <i className="fas fa-star"></i>
                                    </div>
                                </div>
                            ) : null}

                            <div className="flex justify-center mb-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSpeaking ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                                    <i className={`fas ${isSpeaking ? 'fa-volume-up text-orange-500 animate-bounce' : 'fa-star text-yellow-500'} text-2xl`}></i>
                                </div>
                            </div>
                            <p className="italic mb-4 leading-snug text-slate-700 text-lg">"{state.currentItem.visualReward}"</p>
                            
                            <button 
                                onClick={nextItem}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-kids text-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                NEXT ADVENTURE! <i className="fas fa-play"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {state.currentStep === 'test' && state.currentItem && (
                <div className="space-y-6 text-center animate-fade-in">
                    <h2 className="text-2xl text-slate-800 font-kids">Check your skills!</h2>
                    <LetterCard phonemes={state.currentItem.phonemes} activeIndex={activePhonemeIndex} />
                    
                    <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-yellow-500 text-left">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-slate-600 font-bold text-sm">Parent: Can he decode this?</p>
                            <button 
                                onClick={() => playText(state.currentItem!.readingGuide, 'Kore')}
                                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shadow-sm"
                            >
                                <i className="fas fa-volume-up text-blue-500"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <button 
                                onClick={() => startLevel(Math.max(1, state.currentLevel - 1))}
                                className="py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors"
                            >
                                Too Hard
                            </button>
                            <button 
                                onClick={() => startLevel(state.currentLevel)}
                                className="py-3 bg-green-100 text-green-600 rounded-xl font-bold hover:bg-green-200 transition-colors"
                            >
                                Just Right
                            </button>
                            <button 
                                onClick={() => startLevel(Math.min(5, state.currentLevel + 1))}
                                className="py-3 bg-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-200 transition-colors"
                            >
                                Too Easy
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-4 py-4 text-center text-slate-400 text-[10px] uppercase tracking-widest">
        Synthetic Phonics • No Guessing!
      </footer>
    </div>
  );
};

export default App;
