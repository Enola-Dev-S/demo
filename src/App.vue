vue\demo\src\App.vue
<script setup lang="ts">
import { RouterView } from "vue-router";
import { useRouter } from "vue-router";
import { useAuth } from "./components/Authen.vue";
import Navbar from "./components/Navbar.vue";

const router = useRouter();
const { isAuthenticated, logout } = useAuth();

const handleLogout = () => {
  logout();
  router.push("/login");
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar v-if="isAuthenticated" :onLogout="handleLogout" />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
