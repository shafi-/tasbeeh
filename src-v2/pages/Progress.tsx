/**
 * Progress Screen (V2)
 * Stats overview, weekly chart, and manual entry form
 * NOW INTEGRATED WITH ZUSTAND STORES
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/cards/GlassCard';
import InputField from '../components/forms/InputField';
import MaterialIcon from '../components/MaterialIcon';
import WeeklyChart from '../components/progress/WeeklyChart';
import SessionHistory from '../components/SessionHistory';
import BulkEntryForm from '../components/BulkEntryForm';
import { useSessionStore } from '../../src/core/stores/sessionStore';
import { useStreakStore } from '../../src/core/stores/streakStore';
import { useZikrStore } from '../../src/core/stores/zikrStore';
import { sessionService } from '../../src/core/services/sessionService';
import { formatDate, getToday } from '../../src/core/utils/dateUtils';
import { WeeklyDataPoint } from '../types/components';

const Progress: React.FC = () => {
  const navigate = useNavigate();

  // Store integrations
  const sessions = useSessionStore(state => state.sessions);
  const sessionsLoading = useSessionStore(state => state.loading);
  const streaks = useStreakStore(state => state.streaks);
  const zikrs = useZikrStore(state => state.zikrs);

  // Local state
  const [logDate, setLogDate] = useState(formatDate(getToday()));
  const [logCount, setLogCount] = useState('');
  const [selectedZikr, setSelectedZikr] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [totalDhikr, setTotalDhikr] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [entryMode, setEntryMode] = useState<'single' | 'bulk'>('single');

  // Calculate statistics
  useEffect(() => {
    if (sessions.length === 0) {
      setStreakDays(0);
      setTotalDhikr(0);
      setWeeklyData(getEmptyWeekData());
      return;
    }

    // Calculate total dhikr
    const total = sessions.reduce((sum, s) => sum + s.count, 0);
    setTotalDhikr(total);

    // Calculate streak from streaks store (take max current streak)
    const maxStreak = streaks.length > 0
      ? Math.max(...streaks.map(s => s.currentStreak))
      : 0;
    setStreakDays(maxStreak);

    // Calculate weekly data
    const weekData = calculateWeeklyData(sessions);
    setWeeklyData(weekData);

    // Set default zikr to first available
    if (zikrs.length > 0 && !selectedZikr) {
      setSelectedZikr(zikrs[0].id || null);
    }
  }, [sessions, streaks, zikrs, selectedZikr]);

  const calculateWeeklyData = (sessionData: typeof sessions): WeeklyDataPoint[] => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = getToday();
    const dayOfWeek = today.getDay();

    // Calculate Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const data: WeeklyDataPoint[] = [];
    let maxValue = 0;

    // Generate data for each day of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = formatDate(date);

      const daySessions = sessionData.filter(s => formatDate(s.date) === dateStr);
      const dayTotal = daySessions.reduce((sum, s) => sum + s.count, 0);

      if (dayTotal > maxValue) maxValue = dayTotal;

      // Check if this day is today
      const isToday = formatDate(date) === formatDate(today);

      data.push({
        day: days[i],
        value: dayTotal,
        isToday,
      });
    }

    // Normalize values if there's data
    if (maxValue > 0) {
      return data.map(d => ({
        ...d,
        value: Math.round((d.value / maxValue) * 100),
      }));
    }

    return data;
  };

  const getEmptyWeekData = (): WeeklyDataPoint[] => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = getToday();
    const dayOfWeek = today.getDay();

    return days.map((day, index) => ({
      day,
      value: 0,
      isToday: index === (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
    }));
  };

  const handleSaveProgress = async () => {
    if (!selectedZikr || !logCount || isSaving) return;

    const count = parseInt(logCount, 10);
    if (isNaN(count) || count <= 0 || count > 10000) {
      alert('Please enter a valid count between 1 and 10000');
      return;
    }

    setIsSaving(true);

    try {
      const timestampDate = new Date(logDate + 'T00:00:00');

      await sessionService.add({
        zikrId: selectedZikr,
        count,
        source: 'manual',
        timestamp: timestampDate,
        date: timestampDate,
        editableUntil: new Date(timestampDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Clear form
      setLogCount('');
      setLogDate(formatDate(getToday()));

      // Show success feedback
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Failed to save progress:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased flex items-center justify-center">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col pb-24 max-w-md mx-auto">
      {/* Top App Bar */}
      <header className="bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-outline-variant/30 flex justify-between items-center h-16 px-container-padding-mobile">
        <h1 className="font-headline-md text-headline-md text-primary font-bold">
          Dhikr Sanctuary
        </h1>
        <div className="flex items-center gap-4">
          <button
            aria-label="Profile"
            className="text-on-surface-variant hover:opacity-80 transition-opacity active-scale-95 duration-200"
            onClick={() => navigate('/settings')}
          >
            <MaterialIcon icon="account_circle" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 px-container-padding-mobile flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">
            Your Spiritual Journey
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Consistency is the key to serenity.
          </p>
        </div>

        {/* Stats Overview (Bento Style) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak Card */}
          <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
            <MaterialIcon icon="local_fire_department" filled className="text-tertiary-container mb-2 text-4xl" />
            <p className="font-headline-md text-headline-md text-primary">
              {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
            </p>
            <p className="font-caption text-caption text-on-surface-variant mt-1">
              Current Streak
            </p>
          </GlassCard>

          {/* Total Count Card */}
          <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
            <MaterialIcon icon="all_inclusive" className="text-primary-container mb-2 text-4xl" />
            <p className="font-headline-md text-headline-md text-primary">
              {totalDhikr.toLocaleString()}
            </p>
            <p className="font-caption text-caption text-on-surface-variant mt-1">
              Total Dhikr
            </p>
          </GlassCard>
        </div>

        {/* Weekly Progress */}
        <GlassCard className="p-6">
          <h3 className="font-label-md text-label-md text-primary mb-6">Weekly Progress</h3>
          <WeeklyChart data={weeklyData} max={100} />
        </GlassCard>

        {/* Log Offline Progress Form */}
        <GlassCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-label-md text-label-md text-primary flex items-center gap-2">
              <MaterialIcon icon="edit_document" />
              Log Offline Progress
            </h3>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg">
              <button
                onClick={() => setEntryMode('single')}
                className={`px-3 py-1.5 rounded-md font-caption text-caption transition-all ${
                  entryMode === 'single'
                    ? 'bg-surface text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setEntryMode('bulk')}
                className={`px-3 py-1.5 rounded-md font-caption text-caption transition-all ${
                  entryMode === 'bulk'
                    ? 'bg-surface text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-variant/50'
                }`}
              >
                Bulk
              </button>
            </div>
          </div>

          {entryMode === 'bulk' ? (
            <BulkEntryForm
              onSuccess={() => {
                useSessionStore.getState().initialize();
              }}
            />
          ) : (
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            {/* Zikr Selector */}
            <div className="relative">
              <label className="block font-caption text-caption text-on-surface-variant mb-2">
                Zikr
              </label>
              <select
                value={selectedZikr || ''}
                onChange={(e) => setSelectedZikr(Number(e.target.value))}
                className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 h-touch-target-min font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              >
                <option value="">Select a zikr</option>
                {zikrs.map((zikr) => (
                  <option key={zikr.id} value={zikr.id}>
                    {zikr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <InputField
              label="Date"
              type="date"
              value={logDate}
              onChange={(value) => setLogDate(String(value))}
              icon="calendar_today"
            />

            {/* Count Input */}
            <InputField
              label="Dhikr Count"
              type="number"
              placeholder="e.g., 100"
              value={logCount}
              onChange={(value) => setLogCount(String(value))}
              icon="numbers"
            />

            {/* Submit Button */}
            <button
              onClick={handleSaveProgress}
              disabled={!selectedZikr || !logCount || isSaving}
              className="
                w-full bg-primary-container text-on-primary
                rounded-xl h-touch-target-min
                flex items-center justify-center gap-2
                hover:opacity-90 active-scale-95 transition-all mt-2
                font-label-md text-label-md
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <MaterialIcon icon="add_circle" />
              {isSaving ? 'Saving...' : 'Save Progress'}
            </button>
          </form>
          )}
        </GlassCard>

        {/* Session History Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <MaterialIcon icon="history" />
              Session History
            </h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-on-surface-variant flex items-center gap-2 px-4 py-2 rounded-full hover:bg-surface-variant/50 transition-colors font-caption text-caption"
            >
              {showHistory ? 'Hide' : 'Show'}
              <MaterialIcon icon={showHistory ? 'expand_less' : 'expand_more'} className="text-[18px]" />
            </button>
          </div>

          {showHistory && (
            <SessionHistory onRefresh={handleSaveProgress} />
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-surface fixed bottom-0 w-full z-50 rounded-t-xl border-t border-outline-variant/20 shadow-sm flex justify-around items-center h-touch-target-min pb-safe px-4">
        {/* Home */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-variant/50 active-scale-90 transition-transform duration-150 rounded-xl group"
        >
          <MaterialIcon icon="home" className="group-hover:text-primary transition-colors" />
          <span className="font-label-md text-label-md text-[10px] mt-1 opacity-0 group-hover:opacity-100 group-hover:h-auto transition-all">
            Home
          </span>
        </button>

        {/* Goals */}
        <button
          onClick={() => navigate('/goals')}
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-variant/50 active-scale-90 transition-transform duration-150 rounded-xl group"
        >
          <MaterialIcon icon="target" className="group-hover:text-primary transition-colors" />
          <span className="font-label-md text-label-md text-[10px] mt-1 opacity-0 group-hover:opacity-100 group-hover:h-auto transition-all">
            Goals
          </span>
        </button>

        {/* Progress (Active) */}
        <button
          onClick={() => navigate('/progress')}
          className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-4 py-1 active-scale-90 transition-transform duration-150"
        >
          <MaterialIcon icon="trending_up" filled />
          <span className="font-label-md text-label-md text-[10px] mt-1">Progress</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-variant/50 active-scale-90 transition-transform duration-150 rounded-xl group"
        >
          <MaterialIcon icon="settings" className="group-hover:text-primary transition-colors" />
          <span className="font-label-md text-label-md text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Settings
          </span>
        </button>
      </nav>
    </div>
  );
};

export default Progress;
