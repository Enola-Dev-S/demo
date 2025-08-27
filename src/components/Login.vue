<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-login-main ">
    <div class="bg-login-block">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white">Welcome Back</h2>
        <p class="text-white mt-2">Please sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6 text-white">
        <div>
          <label class="block text-sm font-medium text-white">Email/Username</label>
          <div class="mt-1 relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </span>
            <input
              v-model="username"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="{ 'border-red-500': errors.username }"
              placeholder="Enter your email or username"
            >
          </div>
          <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-white" >Password</label>
          <div class="mt-1 relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              v-model="password"
              type="password"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Enter your password"
            >
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <button
            type="submit"
            class="button-Login">
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/components/Authen.vue'

const router = useRouter()
const { login } = useAuth()
const username = ref('')
const password = ref('')
const errors = reactive({
  username: '',
  password: ''
})

const handleLogin = () => {
  errors.username = ''
  errors.password = ''

  if (!username.value || !password.value) {
    errors.password = 'Please enter both username and password'
    return
  }

  if (username.value === 'admin' && password.value === 'admin') {
    login() // ใช้ฟังก์ชัน login จาก composable
    router.push('/')
  } else {
    errors.password = 'Invalid username or password'
  }
}
</script>
