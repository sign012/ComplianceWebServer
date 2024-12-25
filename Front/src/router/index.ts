import { createRouter, createWebHistory, createWebHashHistory, Router } from 'vue-router';
import Layout from '@/layout';
import { RouterTy } from '@/types/router';

export const constantRoutes: RouterTy = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/oper-review', // 默认进入直播风控，避免进入dashboard页面
    meta: { title: '', icon: 'table' },
    hidden: true,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        hidden: true,
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'table' }
      }
      // {
      //   path: 'live-monitor',
      //   name: 'liveMonitor',
      //   hidden: true,
      //   meta: { title: '直播监控', icon: 'table' },
      //   component: () => import('@/views/live-monitor/index')
      // }
    ]
  }
];
/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes: RouterTy = [];

const router: Router = createRouter({
  history: createWebHistory('/compliance'), // createWebHashHistory(),
  // history: createWebHashHistory('/compliance'), // createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
});

// export function resetRouter() {
//   const newRouter = createRouter({
//     history: createWebHistory('/compliance'),
//     scrollBehavior: () => ({ top: 0 }),
//     routes: constantRoutes
//   })
// }

export default router;
