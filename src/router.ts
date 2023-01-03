// import LonelyWolfVue from '@/components/LonelyWolf.vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import IndexPage from '@/pages/IndexPage.vue'
import TasbeehPage from '@/pages/tasbeeh/TasbeehIndex.vue';
import AddTasbeehPage from '@/pages/tasbeeh/AddTasbeehPage.vue';
import TahleelPageVue from './pages/TahleelPage.vue';
import MSCDailyPage from '@/pages/MSCDailyPage.vue';
import AboutPage from '@/pages/AboutPage.vue';

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: '/',
    component: IndexPage,
    meta: {
      title: 'HomePage - Tasbeeh App',
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
    component: AddTasbeehPage,
    name: 'AddTasbeehPage',
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
    name: 'MSC Daily',
    path: '/msc-today',
    component: MSCDailyPage,
    meta: {
      title: 'MSC Today'
    }
  },
  {
    name: 'About',
    path: '/about',
    component: AboutPage,
    meta: {
      title: 'About- Tasbeeh App',
    }
  }
  // {
  //   component: LonelyWolfVue,
  //   path: '/lonelywolf(.*)',
  //   name: 'Lonelywolf',
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
