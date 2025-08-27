<script  lang="ts">
import { RouterView, RouterLink } from 'vue-router';
import { useAuth } from './components/Authen.vue';

const { isAuthenticated } = useAuth();
</script>

<template>
  <div>
    <nav v-if="isAuthenticated" class="bg-gray-700 shadow-lg mb-2 h-">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center">
            <ul class="flex space-x-4 items-center"> <!-- เพิ่ม items-center -->
              <li>
                <img
                  src="@/assets/fatima.png"
                  class="h-12 w-auto rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
                />
              </li>
              <li>
                <RouterLink
                  to="/"
                  class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  active-class="bg-gray-900 text-white"
                >
                  HOME
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/about"
                  class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  active-class="bg-gray-900 text-white"
                >
                  About
                </RouterLink>
              </li>
            </ul>
          </div>
          <!-- แสดงปุ่ม Logout อย่างเดียว เมื่อ logged in -->
          <div class="flex items-center">
            <button
              @click="handleLogout"
              class="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="p-0">
      <RouterView></RouterView>
    </main>
  </div>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const isAuthenticated = ref(false)

// ตรวจสอบ auth state ทันทีที่ component mount
watch(() => localStorage.getItem('isAuthenticated'), (newValue) => {
  isAuthenticated.value = !!newValue
}, { immediate: true })

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  isAuthenticated.value = false
  router.push('/login')
}
</script>
