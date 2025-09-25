<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuth } from "./Authen.vue";

defineProps<{
  onLogout: () => void
}>();

const { isAuthenticated } = useAuth();
const userEmail = ref('');
const userRole = ref('');

// ดึงค่า email และ role เมื่อ component ถูกโหลด
onMounted(() => {
  const email = localStorage.getItem('userEmail');
  userEmail.value = email || '';
  const role = localStorage.getItem('userRole');
  userRole.value = role || '';
});

// ติดตามการเปลี่ยนแปลงของ localStorage
watch(() => localStorage.getItem('userRole'), (newRole) => {
  userRole.value = newRole || '';
});

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userEmail");
  window.location.href = "/login";
};
</script>

<template>
  <nav v-if="isAuthenticated" class="p-4 bg-gray-700 text-white mb-4 px-auto">
    <div class="flex justify-between items-center">
      <div class="flex items-center w-full justify-between">
        <ul class="flex space-x-4 items-center">
          <!-- เพิ่ม items-center -->
          <li>
            <img
              src="@/assets/fatima.png"
              class="h-12 w-auto rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 "

            />
          </li>
          <li>
            <RouterLink
              to="/"
              class="nav-item"
              active-class="bg-gray-900 text-white"
            >
              HOME
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/about"
              class="nav-item"
              active-class="bg-gray-900 text-white"
            >
              About
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/game"
              class="nav-item"
              active-class="bg-gray-900 text-white"
            >
              Game
            </RouterLink>
          </li>
          <li v-if="userRole === 'administrator'">
            <RouterLink
              to="/Administrator"
              class="nav-item"
              active-class="bg-gray-900 text-white"
            >
              Administrator
            </RouterLink>
          </li>
        </ul>
        <!-- แสดง Email และปุ่ม Logout -->
        <div class="flex items-center space-x-4">
          <span class="text-gray-300">You: {{ userEmail }} </span>
          <button
            @click="handleLogout"
            class="bg-red-500 text-white hover:bg-red-900 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-lg shadow-red-500/50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
