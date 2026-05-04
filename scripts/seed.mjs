import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id TEXT PRIMARY KEY,
    word TEXT NOT NULL,
    englishDef TEXT NOT NULL,
    chineseTrans TEXT NOT NULL,
    category TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id TEXT NOT NULL,
    learn_count INTEGER DEFAULT 0,
    UNIQUE(word_id),
    FOREIGN KEY(word_id) REFERENCES words(id)
  );
`);

const CATEGORIES = {
  SAT_GRE_MIX: 'Mix of SAT and GRE',
  BEGINNING_FRENCH: 'Beginning French',
  BEGINNING_JAPANESE: 'Beginning Japanese'
};

const sampleRealWords = {
  SAT_GRE_MIX: [
    { word: 'abate', englishDef: 'to reduce in amount, degree, or severity', chineseTrans: '减轻，减少' },
    { word: 'cacophony', englishDef: 'harsh, jarring noise', chineseTrans: '刺耳的声音' },
    { word: 'ebullient', englishDef: 'exhilarated; full of enthusiasm and high spirits', chineseTrans: '热情洋溢的' },
    { word: 'fastidious', englishDef: 'demanding; hard to please', chineseTrans: '挑剔的' },
    { word: 'garrulous', englishDef: 'tending to talk a lot', chineseTrans: '喋喋不休的' }
  ],
  BEGINNING_FRENCH: [
    { word: 'bonjour', englishDef: 'hello, good morning', chineseTrans: '你好，早上好' },
    { word: 'merci', englishDef: 'thank you', chineseTrans: '谢谢' },
    { word: 'chat', englishDef: 'cat', chineseTrans: '猫' },
    { word: 'chien', englishDef: 'dog', chineseTrans: '狗' },
    { word: 'eau', englishDef: 'water', chineseTrans: '水' }
  ],
  BEGINNING_JAPANESE: [
    { word: 'arigatou', englishDef: 'thank you', chineseTrans: '谢谢' },
    { word: 'konnichiwa', englishDef: 'hello, good afternoon', chineseTrans: '你好，下午好' },
    { word: 'neko', englishDef: 'cat', chineseTrans: '猫' },
    { word: 'inu', englishDef: 'dog', chineseTrans: '狗' },
    { word: 'mizu', englishDef: 'water', chineseTrans: '水' }
  ]
};

// Check if already seeded
const row = db.prepare('SELECT COUNT(*) as count FROM words').get();
if (row.count > 0) {
  console.log('Database already seeded. Skipping.');
  process.exit(0);
}

const insertWord = db.prepare(`
  INSERT INTO words (id, word, englishDef, chineseTrans, category)
  VALUES (@id, @word, @englishDef, @chineseTrans, @category)
`);

const insertProgress = db.prepare(`
  INSERT INTO user_progress (word_id, learn_count)
  VALUES (@word_id, 0)
`);

db.transaction(() => {
  for (const [key, categoryName] of Object.entries(CATEGORIES)) {
    const realWords = sampleRealWords[key];
    
    // Insert real words
    for (let i = 0; i < realWords.length; i++) {
      const id = key + '_real_' + i;
      insertWord.run({
        id,
        word: realWords[i].word,
        englishDef: realWords[i].englishDef,
        chineseTrans: realWords[i].chineseTrans,
        category: categoryName
      });
      insertProgress.run({ word_id: id });
    }

    // Insert procedural words to reach 1000 total per category
    const remaining = 1000 - realWords.length;
    for (let i = 0; i < remaining; i++) {
      const id = key + '_proc_' + i;
      insertWord.run({
        id,
        word: categoryName + ' Word ' + (i + 6),
        englishDef: 'Definition for ' + categoryName + ' word ' + (i + 6),
        chineseTrans: '测试翻译 ' + (i + 6),
        category: categoryName
      });
      insertProgress.run({ word_id: id });
    }
  }
})();

console.log('Seeding completed. 1000 words per category generated.');
