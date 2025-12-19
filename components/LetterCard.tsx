
import React from 'react';

interface LetterCardProps {
  phonemes: string[];
  phonemeGuides?: string[];
  activeIndex: number;
}

const LetterCard: React.FC<LetterCardProps> = ({ phonemes, phonemeGuides, activeIndex }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-xl border-4 border-yellow-400 min-h-[280px] relative overflow-visible">
      <div className="flex items-center gap-2 sm:gap-4 mb-4">
        {phonemes.map((char, idx) => (
          <div key={idx} className="flex flex-col items-center relative">
            {/* Reading Guide Bubble */}
            {idx === activeIndex && phonemeGuides?.[idx] && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shadow-lg animate-bounce z-20">
                {phonemeGuides[idx]}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
              </div>
            )}

            <span 
              className={`text-6xl sm:text-8xl font-kids transition-all duration-300 ${
                idx === activeIndex ? 'text-blue-600 scale-125' : 'text-slate-800'
              }`}
            >
              {char}
            </span>
            <div 
              className={`finger-slide-dot mt-3 ${idx === activeIndex ? 'active' : ''}`}
            />
          </div>
        ))}
      </div>
      
      <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider animate-pulse mt-4">
        {activeIndex === -1 ? "Tap the blue button!" : "Repeat the sound!"}
      </p>
    </div>
  );
};

export default LetterCard;
