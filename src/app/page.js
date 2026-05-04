'use client';

import { useState, useEffect, useCallback } from 'react';
import WordCard from '@/components/WordCard';
import { RefreshCw, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'Mix of SAT and GRE',
  'Beginning French',
  'Beginning Japanese'
];

export default function Home() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWords = useCallback(async (selectedCat) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/words?category=' + encodeURIComponent(selectedCat));
      if (response.ok) {
        const data = await response.json();
        setWords(data.words || []);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(category);
  }, [category, fetchWords]);

  const handleLearned = (wordId) => {
    setWords((prev) => prev.filter(w => w.id !== wordId));
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/progress/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      if (response.ok) {
        await fetchWords(category);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 md:p-12 lg:p-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-teal-400">
            Vocab Master
          </h1>
          <p className="text-[var(--foreground)]/60 text-lg">
            Master your vocabulary with spaced repetition.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <select
            className="card-standard px-4 py-3 bg-[var(--background)] cursor-pointer outline-none focus:ring-2 focus:ring-[var(--primary)]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <button 
            onClick={() => fetchWords(category)}
            disabled={isLoading}
            className="btn-primary"
          >
            <RefreshCw size={18} className={'mr-2 ' + (isLoading ? 'animate-spin' : '')} />
            Re-fetch
          </button>
          
          <button 
            onClick={handleReset}
            disabled={isLoading}
            className="btn-primary bg-red-600 hover:bg-red-700 text-white"
          >
            <RotateCcw size={18} className={'mr-2 ' + (isLoading ? 'animate-spin' : '')} />
            Reset
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="card-standard h-64 animate-pulse bg-[var(--border)]/50" />
          ))}
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">You've mastered this category!</h2>
          <p className="text-[var(--foreground)]/60">All words have reached the maximum learn count.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {words.map((wordData) => (
            <WordCard 
              key={wordData.id} 
              wordData={wordData} 
              onLearned={handleLearned} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
