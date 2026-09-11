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
    name: 'Salawat',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Subhanallahi wa Bihamdihi',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Subhanallahi walhamdulillahi wa La ilaha illallahu wallahu Akbar',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'La ilaha illallahu wahdahu la sharika lah',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'La hawla wa la quwwata illa Billah',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Allahumma Ajirni Minan-Nar',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Hasbiyallahu La ilaha illa Huwa',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Bismillahilladhi la Yadurru',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Radhitu Billahi Rabba',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Allahumma A\'inni ala Dhikrika',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Sayyidul Istighfar',
    custom: false,
    createdAt: new Date()
  },
  {
    name: 'Hasbunallahu wa Ni\'mal Wakeel',
    custom: false,
    createdAt: new Date()
  },
];

let seedPromise: Promise<void> | null = null;

export function seedZikrs(database: ZikrDatabase): Promise<void> {
  // Memoize so concurrent callers (e.g. React StrictMode double effects)
  // can't race past the existence check and seed duplicates.
  if (!seedPromise) {
    seedPromise = (async () => {
      await seedZikrsByIdempotentNames(database);
      await removeObsoleteSeedRows(database);
      await deduplicateZikrs(database);
    })().catch(err => {
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

/**
 * One-time cleanup: 'Short Salawat' was a briefly-shipped duplicate of
 * Salawat (the mapping now holds the short formula). Remove the stray row
 * on devices that received it. Safe: it was auto-seeded, never user-created.
 */
async function removeObsoleteSeedRows(database: ZikrDatabase): Promise<void> {
  await database.zikrs.where('name').equals('Short Salawat').delete();
}

/**
 * Self-heal duplicate predefined rows left by historical seeding races:
 * keep the oldest row per name, drop the rest.
 */
async function deduplicateZikrs(database: ZikrDatabase): Promise<void> {
  const all = await database.zikrs.toArray();
  const seen = new Set<string>();
  const duplicates: number[] = [];
  for (const zikr of all.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))) {
    if (seen.has(zikr.name)) duplicates.push(zikr.id!);
    else seen.add(zikr.name);
  }
  if (duplicates.length > 0) {
    await database.zikrs.bulkDelete(duplicates);
  }
}
