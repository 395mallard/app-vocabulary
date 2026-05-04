import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { word_id } = await request.json();

    if (!word_id) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 });
    }

    const db = getDb();
    
    // Increment the learn_count
    const result = db.prepare(`
      UPDATE user_progress
      SET learn_count = learn_count + 1
      WHERE word_id = ?
    `).run(word_id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Word progress not found' }, { status: 404 });
    }

    // Fetch the new count to return
    const newProgress = db.prepare(`
      SELECT learn_count FROM user_progress WHERE word_id = ?
    `).get(word_id);

    return NextResponse.json({ 
      success: true, 
      word_id, 
      learn_count: newProgress.learn_count 
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
