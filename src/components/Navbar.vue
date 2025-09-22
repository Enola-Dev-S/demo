<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  onLogout: () => void
}>()
import { useAuth } from './Authen.vue'
const { isAuthenticated } = useAuth()
const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  isAuthenticated.value = false
  router.push('/login')
  if (typeof onLogout === 'function') {
    onLogout()
}

</script>

<template>
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
</template>
