'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function WordCard({ wordData, onLearned }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || isFadingOut) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: wordData.id })
      });

      if (response.ok) {
        setIsFadingOut(true);
        // Wait for fade out animation to finish before notifying parent to unmount
        setTimeout(() => {
          onLearned(wordData.id);
        }, 300); // 300ms matches the tailwind duration
      }
    } catch (error) {
      console.error('Failed to update progress', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "card-standard relative flex flex-col p-6 cursor-pointer group overflow-hidden",
        isFadingOut ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100",
        isLoading && "opacity-70 pointer-events-none"
      )}
      style={{ transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <div className="absolute top-4 right-4 text-[var(--border)] group-hover:text-[var(--primary)] transition-colors">
        <CheckCircle2 size={24} />
      </div>
      
      <div className="flex flex-col flex-grow justify-center mt-2">
        <h3 className="text-2xl font-bold mb-4 text-[var(--foreground)] tracking-tight">
          {wordData.word}
        </h3>
        
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/50 block mb-1">
              Definition
            </span>
            <p className="text-sm font-medium text-[var(--foreground)]/80 leading-relaxed">
              {wordData.englishDef}
            </p>
          </div>
          
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]/50 block mb-1">
              Translation
            </span>
            <p className="text-sm font-medium text-[var(--foreground)]/80 leading-relaxed">
              {wordData.chineseTrans}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--foreground)]/60">
          Learn Count: {wordData.learn_count}
        </span>
        <span className="text-xs font-medium text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
          Click to mark learned
        </span>
      </div>
    </div>
  );
}
