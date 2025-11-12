import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('../views/Unauthorized.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userRole = localStorage.getItem('userRole');
  
  if (to.meta.requiresAuth) {
    if (!localStorage.getItem('token')) {
      next('/login');
    } else if (userRole === 'superadmin') {
      // Superadmin can access all routes
      next();
    } else if (to.meta.role && to.meta.role !== userRole) {
      // Other roles are restricted
      next('/unauthorized');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;