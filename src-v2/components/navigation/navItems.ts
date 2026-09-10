/**
 * Central navigation items for the bottom bar.
 * Single source of truth so every page renders the same nav.
 */

import { NavItem } from '../../types/components';

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'goals', label: 'Goals', icon: 'target', path: '/goals' },
  { id: 'group', label: 'Group', icon: 'groups', path: '/group' },
  { id: 'progress', label: 'Progress', icon: 'trending_up', path: '/progress' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
];
