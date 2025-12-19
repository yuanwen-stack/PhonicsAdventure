
import React from 'react';

interface ParentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  readingGuide: string;
  audioCue: string;
  congratulation: string;
  onPlayCue: () => void;
  isSpeaking: boolean;
}

const ParentPanel: React.FC<ParentPanelProps> = ({ 
  isOpen, 
  onClose, 
  readingGuide, 
  audioCue, 
  congratulation, 
  onPlayCue, 
  isSpeaking 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-800 text-white p-6 rounded-3xl shadow-2xl border-t-8 border-blue-500 animate-pop-in">
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
              <i className="fas fa-user-tie text-blue-400 text-xl"></i>
              <h3 className="font-bold text-xl font-kids">Parent's Secret Guide</h3>
          </div>
          <button 
              onClick={onPlayCue}
              disabled={isSpeaking}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isSpeaking ? 'bg-blue-600 scale-110 shadow-blue-500/50 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'
              }`}
          >
              <i className={`fas ${isSpeaking ? 'fa-volume-up animate-pulse' : 'fa-play-circle text-xl'}`}></i>
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-bold block mb-2">Word Sound</span>
            <p className="text-3xl font-mono text-blue-300 tracking-wider">{readingGuide}</p>
          </div>
          
          <div className="bg-slate-700/50 p-4 rounded-2xl border border-slate-600">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-bold block mb-2">Voice Instruction</span>
            <p className="text-yellow-400 italic font-medium leading-relaxed">"{audioCue}"</p>
          </div>

          <div className="pt-2">
            <span className="text-slate-400 text-xs uppercase tracking-widest font-bold block mb-2">Victory Speech</span>
            <p className="text-green-400 font-medium text-lg leading-snug">{congratulation}</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default ParentPanel;
