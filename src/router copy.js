import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import About from './components/About.vue'
import Home from './components/Home.vue'

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
