<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav v-if="isAuthenticated" class="p-4 bg-gray-700 text-white mb-4 px-auto">
    <div class="flex justify-between items-center">
      <div class="flex items-center w-full justify-between">
        <ul class="flex space-x-4 items-center">
          <li>
            <img
              src="@/assets/fatima.png"
              class="h-12 w-auto rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 "
            />
          </li>
          <li>
            <RouterLink to="/" class="nav-item" active-class="bg-gray-900 text-white">HOME</RouterLink>
          </li>
          <li>
            <RouterLink to="/about" class="nav-item" active-class="bg-gray-900 text-white">About</RouterLink>
          </li>
          <li>
            <RouterLink to="/game" class="nav-item" active-class="bg-gray-900 text-white">Game</RouterLink>
          </li>
          <li v-if="userRole === 'administrator'">
            <RouterLink to="/Administrator" class="nav-item" active-class="bg-gray-900 text-white">Administrator</RouterLink>
          </li>
        </ul>

        <!-- user info -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center bg-blue-600 text-white rounded-full w-12 h-12 text-lg font-semibold">
              {{ customerInitials }}
            </div>
            <div>
              <div class="text-sm font-semibold text-white">
                {{ customerName }} <span class="text-xs text-gray-200">(#{{ customerId }})</span>
              </div>
              <div class="text-xs text-gray-200">{{ customerEmail }}</div>
            </div>
          </div>

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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from "./Authen.vue";

defineProps<{
  onLogout?: () => void
}>();

const { isAuthenticated } = useAuth();

const userName = ref('')
const userEmail = ref('')
const userRole = ref('')
const userId = ref('')

// expose friendly aliases used in template
const customerName = computed(() => userName.value || (userEmail.value ? userEmail.value.split('@')[0] : 'Guest'))
const customerEmail = computed(() => userEmail.value || '')
const customerId = computed(() => userId.value || '')
const customerInitials = computed(() => {
  const name = (customerName.value || 'GU').trim()
  const parts = name.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase()
  return (parts[0][0] + (parts[1][0] || '')).toUpperCase()
})

function loadFromStorage() {
  userName.value =
    localStorage.getItem('username')
    ?? localStorage.getItem('userName')
    ?? localStorage.getItem('name')
    ?? ''

  userEmail.value =
    localStorage.getItem('userEmail')
    ?? localStorage.getItem('email')
    ?? ''

  userRole.value =
    localStorage.getItem('userRole')
    ?? localStorage.getItem('role')
    ?? ''

  userId.value = localStorage.getItem('userId') ?? localStorage.getItem('id') ?? ''
  // attempt to parse token if fields missing
  const token = localStorage.getItem('token')
  if (token && (!userName.value || !userId.value)) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userName.value = userName.value || payload.name || payload.username || payload.fullname || ''
      userEmail.value = userEmail.value || payload.email || ''
      userRole.value = userRole.value || payload.role || ''
      userId.value = userId.value || String(payload.userId ?? payload.id ?? '')
    } catch (e) {
      // ignore
    }
  }
}

onMounted(() => {
  loadFromStorage()
  window.addEventListener('storage', (e: StorageEvent) => {
    if (!e.key) return
    if (['username','userName','name'].includes(e.key)) userName.value = e.newValue || ''
    if (['userEmail','email'].includes(e.key)) userEmail.value = e.newValue || ''
    if (['userRole','role'].includes(e.key)) userRole.value = e.newValue || ''
    if (['userId','id'].includes(e.key)) userId.value = e.newValue || ''
  })
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  // navigate to login
  window.location.href = '/login'
}
</script>

<style scoped>
.nav-item { padding: 0.5rem 0.75rem; border-radius: 0.375rem; }
</style>
