<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  onLogout: () => void
}>()
</script>

<template>
  <nav class="bg-gray-700 shadow-lg mb-2">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <ul class="flex space-x-4 items-center">
            <li>
              <img
                src="@/assets/fatima.png"
                alt="Logo"
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
        <div class="flex items-center">
          <button
            @click="onLogout"
            class="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
