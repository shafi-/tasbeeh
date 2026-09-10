/**
 * Central navigation items for the bottom bar.
 * `label` holds an i18n key (translated at render time in BottomNav).
 * Settings is NOT a tab — it opens from the top-right gear on each screen.
 */

import { NavItem } from '../../types/components';

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'nav.home', icon: 'home', path: '/' },
  { id: 'goals', label: 'nav.goals', icon: 'target', path: '/goals' },
  { id: 'group', label: 'nav.group', icon: 'groups', path: '/group' },
  { id: 'progress', label: 'nav.progress', icon: 'trending_up', path: '/progress' },
];
