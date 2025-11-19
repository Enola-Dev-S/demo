import { createRouter, createWebHistory } from "vue-router";
import Login from "./components/Login.vue";
import About from "./components/menu/About.vue";
import Home from "./components/menu/Home.vue";
import Dashboard from "./components/Dashboard.vue";
import Administrator from "./components/Administrator.vue";
import Game from "./components/menu/Game.vue";
import { useAuth } from "./components/Authen.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: Login,
    },
    {
      path: "/",
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: "/about",
      name: "About",
      component: About,
      meta: { requiresAuth: true },
    },
    {
      path: "/game",
      name: "Game",
      component: Game,
      meta: { requiresAuth: true },
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: "/administrator",
      name: "Administrator",
      component: Administrator,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresAdmin && userRole !== "administrator") {
    next("/"); // Redirect non-admin users to home
  } else if (to.path === "/login" && isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
