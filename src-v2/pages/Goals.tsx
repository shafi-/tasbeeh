/**
 * Goals & Reminders Screen (V2)
 * Goals list with toggle switches and reminder scheduling
 * NOW INTEGRATED WITH ZUSTAND STORES
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/cards/GlassCard';
import ToggleSwitch from '../components/forms/ToggleSwitch';
import MaterialIcon from '../components/MaterialIcon';
import GoalFormModal from '../components/GoalFormModal';
import BottomNav from '../components/navigation/BottomNav';
import { NAV_ITEMS } from '../components/navigation/navItems';
import OrnamentDivider from '../components/decor/OrnamentDivider';
import { useGoalStore } from '../../src/core/stores/goalStore';
import { useZikrStore } from '../../src/core/stores/zikrStore';
import { getZikrDisplayInfo } from '../utils/zikrMapping';
import { Goal } from '../../src/core/db/types';
import { goalService } from '../../src/core/services/goalService';

interface GoalWithDisplay extends Goal {
  zikrName: string;
  displayInfo: {
    arabicText: string;
    translation: string;
  };
}

const Goals: React.FC = () => {
  const navigate = useNavigate();

  // Store integrations
  const goals = useGoalStore(state => state.goals);
  const goalsLoading = useGoalStore(state => state.loading);
  const zikrs = useZikrStore(state => state.zikrs);

  // Local state for goals with display info
  const [enhancedGoals, setEnhancedGoals] = useState<GoalWithDisplay[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  // Enhance goals with zikr display information
  useEffect(() => {
    if (goals.length === 0 || zikrs.length === 0) {
      setEnhancedGoals([]);
      return;
    }

    const enhanced = goals.map(goal => {
      const zikr = zikrs.find(z => z.id === goal.zikrId);
      const zikrName = zikr?.name || 'Unknown Zikr';
      const displayInfo = getZikrDisplayInfo(zikrName);

      return {
        ...goal,
        zikrName,
        displayInfo: {
          arabicText: displayInfo.arabicText,
          translation: displayInfo.translation,
        },
      };
    });

    setEnhancedGoals(enhanced);
  }, [goals, zikrs]);

  const handleToggle = async (goalId: number, newActiveState: boolean) => {
    setIsUpdating(goalId.toString());

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      await goalService.update(goalId, {
        status: newActiveState ? 'active' : 'paused',
        completedAt: newActiveState ? undefined : new Date(),
      } as any);
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditGoal = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setEditGoal(goal);
    }
  };

  const handleRefreshGoals = () => {
    useGoalStore.getState().initialize();
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditGoal(null);
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalService.delete(goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  // Format period for display
  const formatPeriod = (period: Goal['period']) => {
    switch (period) {
      case 'daily': return 'Daily Practice';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'custom': return 'Custom';
    }
  };

  // Format schedule for display
  const formatSchedule = (goal: Goal) => {
    if (goal.period === 'weekly') {
      return 'Fridays'; // Default for weekly, can be enhanced
    }
    if (goal.period === 'daily') {
      return '06:00 AM'; // Default for daily, can be enhanced
    }
    return 'Custom';
  };

  // Loading state
  if (goalsLoading) {
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
        <div className="font-headline-md text-headline-md text-primary font-bold">
          Dhikr Sanctuary
        </div>
        <button
          aria-label="Profile"
          className="text-primary hover:opacity-80 transition-opacity active-scale-95 duration-200 w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full"
          onClick={() => navigate('/settings')}
        >
          <MaterialIcon icon="account_circle" className="text-2xl" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[800px] mx-auto px-container-padding-mobile py-8 flex flex-col">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-4">
          <div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">
              Intentions &amp; Reminders
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Cultivate your daily practice through gentle nudges.
            </p>
          </div>
          <OrnamentDivider className="w-48" />
        </div>

        {/* Active Goals Stacked Layout */}
        <div className="space-y-6 mb-12">
          {enhancedGoals.length === 0 ? (
            <div className="text-center py-12">
              <MaterialIcon icon="flag" className="text-6xl text-surface-variant mb-4" />
              <h3 className="font-headline-md text-headline-md text-primary mb-2">
                No Goals Yet
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Create your first goal to start tracking your progress.
              </p>
            </div>
          ) : (
            enhancedGoals.map((goal) => (
              <GlassCard key={goal.id} hover>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-tertiary-container/10 border border-tertiary-container/30 text-tertiary text-xs font-semibold tracking-wide uppercase mb-3">
                      {formatPeriod(goal.period)}
                    </div>
                    <h2 className="font-headline-md text-headline-md text-primary mb-1">
                      {goal.zikrName}
                    </h2>
                    {goal.displayInfo.arabicText && (
                      <p className="font-display-arabic text-[22px] leading-8 text-tertiary mb-1" lang="ar" dir="rtl">
                        {goal.displayInfo.arabicText}
                      </p>
                    )}
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {goal.displayInfo.translation}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      checked={goal.status === 'active'}
                      onChange={(checked) => handleToggle(goal.id!, checked)}
                      disabled={isUpdating === goal.id!.toString()}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 relative z-10">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <MaterialIcon
                      icon={goal.period === 'daily' ? 'schedule' : 'event'}
                      className="text-[20px]"
                    />
                    <span className="font-label-md text-label-md">
                      {formatSchedule(goal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-primary font-label-md text-label-md">
                      <span>{goal.target}x</span>
                    </div>
                    {/* Action buttons */}
                    <button
                      onClick={() => handleEditGoal(goal.id!)}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1"
                      aria-label="Edit goal"
                    >
                      <MaterialIcon icon="edit" className="text-[18px]" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id!)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      aria-label="Delete goal"
                    >
                      <MaterialIcon icon="delete" className="text-[18px]" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* Create New CTA */}
        <div className="mt-8 mb-4">
          <button
            onClick={handleCreateNew}
            className="
              w-full bg-primary-container text-on-primary
              rounded-xl h-touch-target-min
              flex items-center justify-center
              font-label-md text-label-md
              hover:opacity-90 active-scale-[0.98] duration-200
              gap-2 shadow-sm
            "
          >
            <MaterialIcon icon="add" className="text-[20px]" />
            Create New Intention
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        items={NAV_ITEMS}
        activeId="goals"
        onNavigate={(path) => navigate(path)}
      />

      {/* Goal Form Modals */}
      <GoalFormModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleRefreshGoals}
      />
      <GoalFormModal
        isOpen={editGoal !== null}
        onClose={handleCloseEditModal}
        onSave={handleRefreshGoals}
        editGoal={editGoal}
      />
    </div>
  );
};

export default Goals;
