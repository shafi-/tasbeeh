/**
 * Home Screen (V2)
 * Dashboard with Arabic greeting, streak badge, daily goal arch, and quick start cards
 * INTEGRATED WITH ZUSTAND STORES
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/navigation/TopAppBar';
import BottomNav from '../components/navigation/BottomNav';
import CircularProgress from '../components/progress/CircularProgress';
import ZikrCard from '../components/cards/ZikrCard';
import MaterialIcon from '../components/MaterialIcon';
import ZikrFormModal from '../components/ZikrFormModal';
import PatternBackdrop from '../components/decor/PatternBackdrop';
import OrnamentDivider from '../components/decor/OrnamentDivider';
import { NavItem } from '../types/components';
import { useZikrStore } from '../../src/core/stores/zikrStore';
import { useSessionStore } from '../../src/core/stores/sessionStore';
import { useGoalStore } from '../../src/core/stores/goalStore';
import { getZikrDisplayInfo } from '../utils/zikrMapping';
import { formatDate, getToday } from '../../src/core/utils/dateUtils';
import { Zikr } from '../../src/core/db/types';

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'goals', label: 'Goals', icon: 'target', path: '/goals' },
  { id: 'progress', label: 'Progress', icon: 'trending_up', path: '/progress' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Store integrations
  const zikrs = useZikrStore(state => state.zikrs);
  const zikrsLoading = useZikrStore(state => state.loading);
  const sessions = useSessionStore(state => state.sessions);
  const sessionsLoading = useSessionStore(state => state.loading);
  const goals = useGoalStore(state => state.goals);

  // Local state for computed values
  const [streakDays, setStreakDays] = useState(0);
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [recentZikrs, setRecentZikrs] = useState<Zikr[]>([]);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Calculate daily stats
  useEffect(() => {
    if (sessions.length === 0) return;

    const today = getToday();
    const todayDateStr = formatDate(today);

    // Calculate today's total count
    const todaySessions = sessions.filter(s => formatDate(s.date) === todayDateStr);
    const total = todaySessions.reduce((sum, s) => sum + s.count, 0);
    setTodayTotal(total);

    // Calculate overall streak (consecutive days with any session)
    const allDates = [...new Set(sessions.map(s => formatDate(s.date)))].sort().reverse();
    let streak = 0;
    const checkDate = new Date(today);

    for (const dateStr of allDates) {
      const checkDateStr = formatDate(checkDate);
      if (dateStr === checkDateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (streak === 0) {
        // Skip future dates or today if no session yet
        continue;
      } else {
        break;
      }
    }
    setStreakDays(streak);

    // Calculate daily goal progress (simple version: use first active goal)
    const activeGoal = goals.find(g => g.status === 'active');
    if (activeGoal && total > 0) {
      const progress = Math.min(Math.round((total / activeGoal.target) * 100), 100);
      setDailyGoalProgress(progress);
    } else {
      setDailyGoalProgress(0);
    }
  }, [sessions, goals]);

  // Get recent zikrs for quick start (most recently practiced)
  useEffect(() => {
    if (zikrs.length === 0) {
      setRecentZikrs([]);
      return;
    }

    // Get zikr IDs from recent sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = sessions
      .filter(s => s.timestamp >= sevenDaysAgo)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Get unique zikr IDs in order of most recent practice
    const recentZikrIds = [...new Set(recentSessions.map(s => s.zikrId))];

    // Map to zikr objects
    const recentZikrObjects = recentZikrIds
      .map(id => zikrs.find(z => z.id === id))
      .filter(Boolean) as typeof zikrs;

    // Add any remaining zikrs that haven't been practiced
    const practicedIds = new Set(recentZikrIds);
    const remainingZikrs = zikrs.filter(z => !practicedIds.has(z.id!));

    setRecentZikrs([...recentZikrObjects, ...remainingZikrs].slice(0, 10));
  }, [zikrs, sessions]);

  const handleStartZikr = (zikrId: number) => {
    navigate(`/counter?zikrId=${zikrId}`);
  };

  const handleRefreshZikrs = () => {
    useZikrStore.getState().initialize();
  };

  // Loading state
  if (zikrsLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased flex items-center justify-center">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  // Empty state - no zikrs
  if (zikrs.length === 0) {
    return (
      <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <PatternBackdrop className="absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-24 rounded-t-full rounded-b-xl border border-tertiary-container/40 bg-surface-container-low flex items-center justify-center mb-6">
            <MaterialIcon icon="spa" className="text-5xl text-tertiary" />
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">
            Begin Your Journey
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Create your first zikr to start practicing.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary-container text-on-primary rounded-xl h-touch-target-min px-8 font-label-md"
          >
            Create Zikr
          </button>
        </div>
        <ZikrFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleRefreshZikrs}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col">
      {/* Top App Bar */}
      <TopAppBar
        showClose={false}
        onClose={() => {}}
        action={{
          icon: 'account_circle',
          onClick: () => navigate('/settings'),
          ariaLabel: 'Profile',
        }}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-32 px-container-padding-mobile flex flex-col gap-8 relative">
        {/* Welcome & Streak Header */}
        <section className="relative flex flex-col items-center text-center gap-2">
          <PatternBackdrop className="absolute -inset-x-8 -top-8 h-48" />
          <p className="relative font-display-arabic text-[32px] leading-[48px] text-tertiary" lang="ar" dir="rtl">
            ٱلسَّلَامُ عَلَيْكُمْ
          </p>
          {streakDays > 0 && (
            <div className="relative inline-flex items-center gap-2 bg-tertiary-container/10 text-tertiary border border-tertiary-container/30 px-4 py-1.5 rounded-full font-label-md text-label-md">
              <MaterialIcon icon="local_fire_department" filled className="text-[20px]" />
              <span className="tabular-nums">{streakDays} Day Streak</span>
            </div>
          )}
          <h2 className="relative font-headline-lg-mobile text-headline-lg-mobile text-primary mt-2">
            {streakDays > 0 ? 'Keep it going!' : getGreeting()}
          </h2>
          <p className="relative font-body-md text-body-md text-on-surface-variant">
            {todayTotal > 0
              ? `You've done ${todayTotal} dhikr today`
              : 'Begin your practice of remembrance.'
            }
          </p>
        </section>

        {/* Daily Goal Progress — mihrab arch */}
        {goals.length > 0 && (
          <section className="relative w-full max-w-[300px] mx-auto flex flex-col items-center rounded-t-full rounded-b-2xl border border-tertiary-container/30 bg-surface-container-low shadow-card px-6 pt-20 pb-8 overflow-hidden">
            <PatternBackdrop className="absolute inset-0" variant="green" />
            <div className="relative flex flex-col items-center gap-5">
              <CircularProgress progress={dailyGoalProgress} size={192}>
                <div className="flex flex-col items-center justify-center text-center">
                  <MaterialIcon icon="spa" filled className="text-tertiary text-4xl mb-1" />
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary tabular-nums">
                    {dailyGoalProgress}%
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant mt-1">
                    Daily Goal
                  </span>
                </div>
              </CircularProgress>
              <OrnamentDivider className="w-32" />
            </div>
          </section>
        )}

        {/* Quick Start Dhikr List */}
        {recentZikrs.length > 0 && (
          <section className="flex flex-col gap-4 -mx-container-padding-mobile px-container-padding-mobile">
            <h3 className="font-headline-md text-headline-md text-primary">Quick Start</h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 hide-scrollbar">
              {recentZikrs.map((zikr) => {
                const displayInfo = getZikrDisplayInfo(zikr.name);
                // Check if practiced today
                const practicedToday = sessions.some(
                  s => s.zikrId === zikr.id && formatDate(s.date) === formatDate(getToday())
                );

                return (
                  <ZikrCard
                    key={zikr.id}
                    id={zikr.id!}
                    name={zikr.name}
                    arabicName={displayInfo.arabicText}
                    translation={displayInfo.translation}
                    targetCount={displayInfo.defaultTarget}
                    icon={practicedToday ? 'check_circle' : 'play_arrow'}
                    onStart={handleStartZikr}
                    completed={practicedToday}
                  />
                );
              })}
              {/* Spacer for scrolling bleed */}
              <div className="shrink-0 w-4" />
            </div>
          </section>
        )}

        {/* Add Zikr CTA (when user has zikrs) */}
        {recentZikrs.length > 0 && zikrs.length > recentZikrs.length && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl h-touch-target-min flex items-center justify-center gap-2 font-label-md text-label-md text-primary hover:bg-surface-container transition-colors"
          >
            <MaterialIcon icon="add" className="text-[20px]" />
            Add More Zikrs
          </button>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        items={NAV_ITEMS}
        activeId="home"
        onNavigate={(path) => navigate(path)}
      />

      {/* Create Zikr Modal */}
      <ZikrFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleRefreshZikrs}
      />
    </div>
  );
};

export default Home;
