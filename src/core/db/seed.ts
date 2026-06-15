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
  }
];

export async function seedZikrs(database: ZikrDatabase): Promise<void> {
  await database.zikrs.bulkAdd(PREDEFINED_ZIKRS);
}
