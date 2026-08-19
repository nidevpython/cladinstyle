import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, closeToast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-100 flex max-w-xs items-start gap-3 border border-white/10 bg-black p-4 text-white shadow-xl animate-slideup">
      <div className="mt-0.5 rounded-full bg-white/10 p-1 flex items-center justify-center">
        {toast.type === 'success' ? (
          <Check className="h-3.5 w-3.5 text-white" />
        ) : (
          <Info className="h-3.5 w-3.5 text-accent" />
        )}
      </div>
      
      <div className="flex-grow text-left">
        <p className="text-[10px] font-bold tracking-wider uppercase">
          {toast.type === 'success' ? 'Added successfully' : 'Boutique info'}
        </p>
        <p className="mt-0.5 text-xs text-white/85 font-medium leading-tight">
          {toast.message}
        </p>
      </div>

      <button onClick={closeToast} className="text-white/40 hover:text-white transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
