<script setup lang="ts">
import { ref } from "vue";
import UserManagement from "./admin/UserManagement.vue";
import CarManagement from "./admin/CarManagement.vue";

const activeMenu = ref("cars"); // default to users view
const isSidebarOpen = ref(false);
</script>

<template>
  <div class="flex h-[100dvh] bg-gray-50 font-sans text-gray-900 overflow-hidden">
    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:w-80 lg:h-auto"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo / Header -->
      <div class="h-20 lg:h-28 flex items-center px-6 lg:px-10 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 lg:w-12 lg:h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-lg shadow-gray-200"
          >
            A
          </div>
          <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">Admin Panel</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-6 lg:py-8 px-4 lg:px-6 space-y-2">
        <div class="px-4 mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Main Menu
        </div>

        <button
          @click="activeMenu = 'cars'; isSidebarOpen = false"
          :class="[
            'w-full flex items-center gap-4 px-6 py-4 text-base font-medium rounded-2xl transition-all duration-200 group',
            activeMenu === 'cars'
              ? 'bg-gray-900 text-white shadow-md shadow-gray-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 transition-colors"
            :class="
              activeMenu === 'cars' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'
            "
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          Car Management
        </button>

        <button
          @click="activeMenu = 'users'; isSidebarOpen = false"
          :class="[
            'w-full flex items-center gap-4 px-6 py-4 text-base font-medium rounded-2xl transition-all duration-200 group',
            activeMenu === 'users'
              ? 'bg-gray-900 text-white shadow-md shadow-gray-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 transition-colors"
            :class="
              activeMenu === 'users' ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'
            "
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          User Management
        </button>
      </nav>

      <!-- Footer User Profile (Optional) -->
      <div class="p-2 lg:px-5 border-t border-gray-100 pb-32">
        <div
          class="flex items-center gap-4 px-2 lg:px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100"
        >
          <div
            class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold"
          >
            AD
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-gray-900 truncate">Administrator</p>
            <p class="text-sm text-gray-500 truncate">System@fatima.co.th</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto relative w-full">
      <!-- Top Bar -->
      <header
        class="h-20 lg:h-28 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-6 lg:px-10 flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <!-- Hamburger Menu -->
          <button 
            @click="isSidebarOpen = !isSidebarOpen"
            class="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h2 class="text-xl lg:text-2xl font-semibold text-gray-800">
            {{ activeMenu === "cars" ? "Car Management" : "User Management" }}
          </h2>
        </div>
        <!-- Right side actions if needed -->
      </header>

      <div class="p-4 lg:p-10">
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
          mode="out-in"
        >
          <UserManagement v-if="activeMenu === 'users'" />
          <CarManagement v-else-if="activeMenu === 'cars'" />
        </transition>
      </div>
    </main>
  </div>
</template>
