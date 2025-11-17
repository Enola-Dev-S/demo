<script setup lang="ts">
import { ref } from 'vue';
import UserManagement from './admin/UserManagement.vue';
import CarManagement from './admin/CarManagement.vue';

const activeMenu = ref('cars'); // default to users view
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-800 text-white">
      <div class="p-4">
        <h2 class="text-2xl font-semibold">Admin Panel</h2>
      </div>
      <nav class="mt-4">
        <button
          @click="activeMenu = 'cars'"
          :class="['w-full text-left p-4 hover:bg-gray-700',
                  activeMenu === 'cars' ? 'bg-gray-700' : '']"
        >
          Car Management
        </button>
        <button
          @click="activeMenu = 'users'"
          :class="['w-full text-left p-4 hover:bg-gray-700',
                  activeMenu === 'users' ? 'bg-gray-700' : '']"
        >
          User Management
        </button>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8 overflow-auto">
      <UserManagement v-if="activeMenu === 'users'" />
      <CarManagement v-if="activeMenu === 'cars'" />
    </div>
  </div>
</template>
