import LonelyWolfVue from '@/components/LonelyWolf.vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import IndexPage from '@/pages/IndexPage.vue'
import TasbeehPage from '@/pages/tasbeeh/TasbeehIndex.vue';
import AddTasbeeh from '@/pages/tasbeeh/AddTasbeeh.vue';
import TahleelPageVue from './pages/TahleelPage.vue';

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    component: IndexPage,
    meta: {
      title: 'Vite + Vue + TypeScript + Tailwind Starter Template',
    },
  },
  {
    path: '/tasbeeh',
    component: TasbeehPage,
    name: 'ManageTasbeeh',
    meta: {
      title: 'Tasbeeh',
    },
  },
  {
    path: '/tasbeeh/add',
    component: AddTasbeeh,
    name: 'AddTasbeeh',
    meta: {
      title: 'Add New Tasbeeh',
    }
  },
  {
    name: 'Tahleel',
    path: '/tahleel',
    component: TahleelPageVue,
    meta: {
      title: 'Tahleel',
    },
  },
  {
    component: LonelyWolfVue,
    path: '/lonelywolf(.*)',
    name: 'Lonelywolf',
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
