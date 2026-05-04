import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }

  try {
    const db = getDb();
    
    // Fetch all words for the category where learn_count < 3
    const words = db.prepare(`
      SELECT w.id, w.word, w.englishDef, w.chineseTrans, w.category, p.learn_count
      FROM words w
      JOIN user_progress p ON w.id = p.word_id
      WHERE w.category = ? AND p.learn_count < 3
    `).all(category);

    if (words.length === 0) {
      return NextResponse.json({ words: [] });
    }

    // Weighted random selection
    // Weight = 1 / (learn_count + 1)
    // E.g., learn_count 0 -> weight 1
    // learn_count 1 -> weight 0.5
    // learn_count 2 -> weight 0.33
    const weightedWords = words.map(w => ({
      ...w,
      weight: 1 / (w.learn_count + 1)
    }));

    const selectedWords = [];
    const numToSelect = Math.min(10, weightedWords.length);

    while (selectedWords.length < numToSelect) {
      const totalWeight = weightedWords.reduce((sum, w) => sum + w.weight, 0);
      let randomVal = Math.random() * totalWeight;
      
      for (let i = 0; i < weightedWords.length; i++) {
        randomVal -= weightedWords[i].weight;
        if (randomVal <= 0) {
          selectedWords.push(weightedWords[i]);
          weightedWords.splice(i, 1); // remove to avoid duplicate selection
          break;
        }
      }
    }

    // Remove the weight property before sending
    const cleanedWords = selectedWords.map(({ weight, ...rest }) => rest);

    return NextResponse.json({ words: cleanedWords });
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
