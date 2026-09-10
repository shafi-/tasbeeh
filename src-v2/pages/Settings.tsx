/**
 * Settings Screen (V2)
 * Settings page with dark mode, haptics, data management, and about sections
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../components/forms/ToggleSwitch';
import MaterialIcon from '../components/MaterialIcon';
import ZikrFormModal from '../components/ZikrFormModal';
import BottomNav from '../components/navigation/BottomNav';
import { NAV_ITEMS } from '../components/navigation/navItems';
import OrnamentDivider from '../components/decor/OrnamentDivider';
import { useSettingsStore } from '../../src/core/stores/settingsStore';
import { useZikrStore } from '../../src/core/stores/zikrStore';
import { exportService } from '../../src/core/services/exportService';
import { zikrService } from '../../src/core/services/zikrService';
import { db } from '../../src/core/db/db';
import { Zikr } from '../../src/core/db/types';
import { useSharedRoomStore } from '../../src/core/stores/sharedRoomStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  // Store integrations
  const settings = useSettingsStore(state => state.settings);
  const loading = useSettingsStore(state => state.loading);
  const loadSettings = useSettingsStore(state => state.loadSettings);
  const saveSetting = useSettingsStore(state => state.saveSetting);
  const zikrs = useZikrStore(state => state.zikrs);

  // Local state
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [nameEditing, setNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const sharedRoomStore = useSharedRoomStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editZikr, setEditZikr] = useState<Zikr | null>(null);

  // Filter zikrs based on search query
  const filteredZikrs = zikrs.filter(zikr => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return zikr.name.toLowerCase().includes(query);
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update local state when settings change
  useEffect(() => {
    // Reflect the effective theme: explicit setting, else system preference
    setDarkMode(
      settings.darkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    setHapticsEnabled(settings.hapticsEnabled ?? true);
  }, [settings]);

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    await saveSetting('darkMode', value);

    // Apply dark mode to document
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleHapticsToggle = async (value: boolean) => {
    setHapticsEnabled(value);
    await saveSetting('hapticsEnabled', value);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportService.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const confirmed = confirm(
        'This will replace all your current data. This action cannot be undone. Continue?'
      );

      if (!confirmed) return;

      setIsImporting(true);
      try {
        await exportService.importData(file);
        alert('Data imported successfully! The app will now reload.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Failed to import data. Please make sure you selected a valid backup file.');
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  const handleClearAllData = async () => {
    const confirmed1 = confirm('Are you sure you want to clear all data? This cannot be undone.');
    if (!confirmed1) return;

    const confirmed2 = confirm('This will delete ALL your zikrs, sessions, goals, and settings. Are you absolutely sure?');
    if (!confirmed2) return;

    try {
      await db.delete();
      alert('All data cleared. The app will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    }
  };

  // Zikr management handlers
  const handleRefreshZikrs = () => {
    useZikrStore.getState().initialize();
  };

  const handleEditZikr = (zikr: Zikr) => {
    setEditZikr(zikr);
  };

  const handleDeleteZikr = async (zikr: Zikr) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${zikr.name}"? This will also delete all associated sessions and goals. This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await zikrService.softDelete(zikr.id!);
      alert('Zikr deleted successfully.');
    } catch (error) {
      console.error('Failed to delete zikr:', error);
      alert('Failed to delete zikr. Please try again.');
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditZikr(null);
  };

  // Get app version
  const appVersion = process.env.PACKAGE_VERSION || '1.0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased flex items-center justify-center">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col pt-16 pb-24 max-w-md mx-auto">
      {/* Top App Bar */}
      <header className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/30 flex justify-between items-center h-16 px-container-padding-mobile">
        <button
          onClick={() => navigate(-1)}
          className="text-primary active:scale-95 duration-200 w-touch-target-min h-touch-target-min flex items-center justify-center -ml-4"
        >
          <MaterialIcon icon="arrow_back" className="text-2xl" />
        </button>
        <div className="font-headline-md text-headline-md text-primary font-bold">
          Settings
        </div>
        <div className="w-touch-target-min" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-container-padding-mobile py-8 flex flex-col gap-8">
        {/* Preferences Section */}
        <section>
          <h2 className="font-label-md text-label-md text-on-surface-variant mb-4 px-2">
            Preferences
          </h2>
          <div className="flex flex-col gap-2">
            {/* Dark Mode Toggle */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-high p-2 rounded-lg">
                  <MaterialIcon icon="dark_mode" className="text-primary text-[20px]" />
                </div>
                <div>
                  <p className="font-body-md text-body-md text-on-surface">Dark Mode</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <ToggleSwitch checked={darkMode} onChange={handleDarkModeToggle} />
            </div>

            {/* Haptics Toggle */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-high p-2 rounded-lg">
                  <MaterialIcon icon="vibration" className="text-primary text-[20px]" />
                </div>
                <div>
                  <p className="font-body-md text-body-md text-on-surface">Haptic Feedback</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Vibrate on taps and interactions
                  </p>
                </div>
              </div>
              <ToggleSwitch checked={hapticsEnabled} onChange={handleHapticsToggle} />
            </div>
          </div>
        </section>

        {/* Shared Goals Section */}
        <section>
          <h2 className="font-label-md text-label-md text-on-surface-variant mb-4 px-2">
            Shared Goals
          </h2>
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <div className="bg-surface-container-high p-2 rounded-lg shrink-0">
                  <MaterialIcon icon="person" className="text-primary text-[20px]" />
                </div>
                <div className="min-w-0">
                  <p className="font-body-md text-body-md text-on-surface">Your name in rooms</p>
                  <p className="font-caption text-caption text-on-surface-variant truncate">
                    {sharedRoomStore.identity?.displayName || 'Not set'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNameDraft(sharedRoomStore.identity?.displayName || '');
                  setNameEditing(true);
                }}
                className="text-primary p-2 hover:bg-primary-container/20 rounded-lg transition-colors shrink-0"
                aria-label="Edit display name"
              >
                <MaterialIcon icon="edit" className="text-[20px]" />
              </button>
            </div>

            {nameEditing && (
              <div className="mt-4 flex flex-col gap-3">
                <input
                  type="text"
                  value={nameDraft}
                  maxLength={24}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 h-12 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setNameEditing(false)}
                    className="flex-1 h-11 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const name = nameDraft.trim();
                      if (!name) return;
                      await sharedRoomStore.updateDisplayName(name);
                      setNameEditing(false);
                    }}
                    className="flex-1 h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <p className="font-caption text-caption text-on-surface-variant mt-3">
              Shared goal rooms let you read together with others. Your personal counts stay on
              this device — only the combined total is shared.
            </p>
          </div>
        </section>

        {/* Data Management Section */}
        <section>
          <h2 className="font-label-md text-label-md text-on-surface-variant mb-4 px-2">
            Data Management
          </h2>
          <div className="flex flex-col gap-2">
            {/* Export Data */}
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 flex items-center justify-between active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="bg-surface-container-high p-2 rounded-lg">
                  <MaterialIcon icon="download" className="text-primary text-[20px]" />
                </div>
                <div>
                  <p className="font-body-md text-body-md text-on-surface">Export Data</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Download backup of all your data
                  </p>
                </div>
              </div>
              <MaterialIcon icon="chevron_right" className="text-on-surface-variant" />
            </button>

            {/* Import Data */}
            <button
              onClick={handleImportData}
              disabled={isImporting}
              className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 flex items-center justify-between active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="bg-surface-container-high p-2 rounded-lg">
                  <MaterialIcon icon="upload" className="text-primary text-[20px]" />
                </div>
                <div>
                  <p className="font-body-md text-body-md text-on-surface">Import Data</p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    Restore from backup file
                  </p>
                </div>
              </div>
              <MaterialIcon icon="chevron_right" className="text-on-surface-variant" />
            </button>

            {/* Clear All Data */}
            <button
              onClick={handleClearAllData}
              className="bg-error/5 rounded-xl border border-error/20 p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="bg-error/10 p-2 rounded-lg">
                  <MaterialIcon icon="delete_forever" className="text-error text-[20px]" />
                </div>
                <div>
                  <p className="font-body-md text-body-md text-error">Clear All Data</p>
                  <p className="font-caption text-caption text-error/70">
                    Permanently delete all data
                  </p>
                </div>
              </div>
              <MaterialIcon icon="chevron_right" className="text-error" />
            </button>
          </div>
        </section>

        {/* Manage Zikrs Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-label-md text-label-md text-on-surface-variant">
              Manage Zikrs
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-primary font-label-md text-label-md flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <MaterialIcon icon="add" className="text-[18px]" />
              Add New
            </button>
          </div>

          {/* Search Input */}
          {zikrs.length > 0 && (
            <div className="mb-4">
              <div className="relative">
                <MaterialIcon
                  icon="search"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search zikrs..."
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl pl-12 pr-4 h-touch-target-min font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label="Clear search"
                  >
                    <MaterialIcon icon="close" className="text-[20px]" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="font-caption text-caption text-on-surface-variant mt-2 px-2">
                  {filteredZikrs.length} {filteredZikrs.length === 1 ? 'zikr' : 'zikrs'} found
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {zikrs.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-8 text-center">
                <MaterialIcon icon="spa" className="text-4xl text-tertiary-container mx-auto mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No zikrs yet. Create your first zikr to get started.
                </p>
              </div>
            ) : searchQuery && filteredZikrs.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-8 text-center">
                <MaterialIcon icon="search_off" className="text-4xl text-tertiary-container mx-auto mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No zikrs found matching "{searchQuery}"
                </p>
              </div>
            ) : (
              filteredZikrs.map((zikr) => (
                <div
                  key={zikr.id}
                  className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-container/20 p-2 rounded-lg">
                      <MaterialIcon icon="spa" filled className="text-primary text-[20px]" />
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface">{zikr.name}</p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        {zikr.custom ? 'Custom zikr' : 'Predefined zikr'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditZikr(zikr)}
                      className="text-primary p-2 hover:bg-primary-container/20 rounded-lg transition-colors"
                      aria-label={`Edit ${zikr.name}`}
                    >
                      <MaterialIcon icon="edit" className="text-[20px]" />
                    </button>
                    <button
                      onClick={() => handleDeleteZikr(zikr)}
                      className="text-error p-2 hover:bg-error/10 rounded-lg transition-colors"
                      aria-label={`Delete ${zikr.name}`}
                    >
                      <MaterialIcon icon="delete" className="text-[20px]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="font-label-md text-label-md text-on-surface-variant mb-4 px-2">
            About
          </h2>
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-14 rounded-t-full rounded-b-lg bg-primary-container flex items-center justify-center">
                <span className="font-display-arabic text-[26px] leading-9 text-tertiary-fixed" lang="ar" aria-hidden="true">ذِكْر</span>
              </div>
              <div>
                <p className="font-headline-md text-headline-md text-primary">Zikr</p>
                <p className="font-caption text-caption text-on-surface-variant">
                  Version {appVersion}
                </p>
              </div>
            </div>

            <OrnamentDivider className="mb-4" />

            <div className="space-y-3 text-body-md text-on-surface-variant">
              <p>Zikr is a Progressive Web App for Islamic dhikr practice.</p>
              <p className="text-sm">
                Features: custom zikr lists, manual progress entry, goals &amp; streaks, and complete offline functionality.
              </p>
            </div>
          </div>
        </section>

        {/* Platform Info */}
        <section className="text-center flex flex-col gap-3">
          <OrnamentDivider className="w-40 mx-auto" />
          <p className="font-caption text-caption text-on-surface-variant">
            Built for remembrance
          </p>
          <p className="font-caption text-caption text-on-surface-variant">
            © 2024 Zikr
          </p>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        items={NAV_ITEMS}
        activeId="settings"
        onNavigate={(path) => navigate(path)}
      />

      {/* Zikr Form Modals */}
      <ZikrFormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleRefreshZikrs}
      />
      <ZikrFormModal
        isOpen={editZikr !== null}
        onClose={handleCloseEditModal}
        onSave={handleRefreshZikrs}
        editZikr={editZikr}
      />
    </div>
  );
};

export default Settings;
