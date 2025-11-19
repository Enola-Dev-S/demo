<script setup lang="ts">
import { ref } from "vue";
import UserManagement from "./admin/UserManagement.vue";
import CarManagement from "./admin/CarManagement.vue";

const activeMenu = ref("cars"); // default to users view
</script>

<template>
  <div class="flex h-screen bg-gray-50 font-sans text-gray-900">
    <!-- Sidebar -->
    <aside
      class="w-96 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 transition-all duration-300"
    >
      <!-- Logo / Header -->
      <div class="h-28 flex items-center px-10 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-gray-200"
          >
            A
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Admin Panel</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-8 px-6 space-y-2">
        <div class="px-4 mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Main Menu
        </div>

        <button
          @click="activeMenu = 'cars'"
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
          @click="activeMenu = 'users'"
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
      <div class="p-6 border-t border-gray-100">
        <div
          class="flex items-center gap-4 px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100"
        >
          <div
            class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold"
          >
            AD
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base font-medium text-gray-900 truncate">Administrator</p>
            <p class="text-sm text-gray-500 truncate">admin@system.com</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto relative">
      <!-- Top Bar (Optional for mobile trigger or breadcrumbs) -->
      <header
        class="h-28 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-10 flex items-center justify-between"
      >
        <h2 class="text-2xl font-semibold text-gray-800">
          {{ activeMenu === "cars" ? "Car Management" : "User Management" }}
        </h2>
        <!-- Right side actions if needed -->
      </header>

      <div class="p-10">
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
