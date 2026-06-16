import { db } from '../db/db';
import { Zikr, Session, Goal, Streak, Setting } from '../db/types';

interface ExportData {
  version: string;
  exportDate: string;
  data: {
    zikrs: Zikr[];
    sessions: Session[];
    goals: Goal[];
    streaks: Streak[];
    settings: Setting[];
  };
}

export async function exportData(): Promise<void> {
  try {
    const [zikrs, sessions, goals, streaks, settings] = await Promise.all([
      db.zikrs.toArray(),
      db.sessions.toArray(),
      db.goals.toArray(),
      db.streaks.toArray(),
      db.settings.toArray()
    ]);

    const exportData: ExportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: { zikrs, sessions, goals, streaks, settings }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zikr-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data. Please check browser storage permissions.');
  }
}

export async function importData(file: File): Promise<void> {
  let backup: ExportData | null = null;

  try {
    // Read and validate JSON
    const text = await file.text();
    const imported = JSON.parse(text) as ExportData;

    // Validate file structure integrity
    if (!imported.version || !imported.data) {
      throw new Error('Invalid file format: missing version or data');
    }

    // Validate required arrays exist and are arrays
    if (!Array.isArray(imported.data.zikrs) ||
        !Array.isArray(imported.data.sessions) ||
        !Array.isArray(imported.data.goals) ||
        !Array.isArray(imported.data.streaks) ||
        !Array.isArray(imported.data.settings)) {
      throw new Error('Invalid file format: missing required arrays');
    }

    // Create backup of existing data
    const [zikrs, sessions, goals, streaks, settings] = await Promise.all([
      db.zikrs.toArray(),
      db.sessions.toArray(),
      db.goals.toArray(),
      db.streaks.toArray(),
      db.settings.toArray()
    ]);

    backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: { zikrs, sessions, goals, streaks, settings }
    };

    // Clear existing data and import
    await db.transaction(
      'rw',
      db.zikrs,
      db.sessions,
      db.goals,
      db.streaks,
      db.settings,
      async () => {
        await Promise.all([
          db.zikrs.clear(),
          db.sessions.clear(),
          db.goals.clear(),
          db.streaks.clear(),
          db.settings.clear()
        ]);

        // Import data in order (zikrs first for foreign key references)
        await db.zikrs.bulkAdd(imported.data.zikrs);
        await db.sessions.bulkAdd(imported.data.sessions);
        await db.goals.bulkAdd(imported.data.goals);
        await db.streaks.bulkAdd(imported.data.streaks);
        await db.settings.bulkAdd(imported.data.settings);
      }
    );
  } catch (error) {
    console.error('Import failed:', error);

    // Rollback if backup exists
    if (backup !== null) {
      try {
        const backupData = backup.data; // Capture data to avoid null issues
        await db.transaction(
          'rw',
          db.zikrs,
          db.sessions,
          db.goals,
          db.streaks,
          db.settings,
          async () => {
            await Promise.all([
              db.zikrs.clear(),
              db.sessions.clear(),
              db.goals.clear(),
              db.streaks.clear(),
              db.settings.clear()
            ]);

            await db.zikrs.bulkAdd(backupData.zikrs);
            await db.sessions.bulkAdd(backupData.sessions);
            await db.goals.bulkAdd(backupData.goals);
            await db.streaks.bulkAdd(backupData.streaks);
            await db.settings.bulkAdd(backupData.settings);
          }
        );
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
        throw new Error('Import failed and rollback also failed. Data may be inconsistent.');
      }
    }

    throw new Error(
      'Failed to import data. Original data restored. Please check the file format and try again.'
    );
  }
}

export const exportService = {
  exportData,
  importData
};