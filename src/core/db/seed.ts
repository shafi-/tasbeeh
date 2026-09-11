import { ZikrDatabase } from './db';
import { Zikr } from './types';

const PREDEFINED_ZIKRS: Omit<Zikr, 'id'>[] = [
  {
    name: 'SubhanAllah',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Alhamdulillah',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Allahu Akbar',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'La ilaha illallah',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Astaghfirullah',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Short Salawat',
    custom: false,
    createdAt: new Date()
  },
];

let seedPromise: Promise<void> | null = null;

export function seedZikrs(database: ZikrDatabase): Promise<void> {
  // Memoize so concurrent callers (e.g. React StrictMode double effects)
  // can't race past the existence check and seed duplicates.
  if (!seedPromise) {
    seedPromise = seedZikrsByIdempotentNames(database).catch(err => {
      seedPromise = null; // allow retry on failure
      throw err;
    });
  }
  return seedPromise;
}

async function seedZikrsByIdempotentNames(database: ZikrDatabase): Promise<void> {
  const existing = await database.zikrs.toArray();
  const existingNames = new Set(existing.map(z => z.name));
  const missing = PREDEFINED_ZIKRS.filter(z => !existingNames.has(z.name));
  if (missing.length === 0) return;

  await database.zikrs.bulkAdd(missing);
}
