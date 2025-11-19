import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import About from './components/menu/About.vue'
import Home from './components/menu/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  { path: '/', component: Home  },
  { path: '/login', component: Login  },
  { path: '/about', component: About  },
  { path: '/:pathMatch(.*)*', redirect: '/'  },
 ],
})

export default router
