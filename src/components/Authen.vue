<!-- eslint-disable vue/multi-word-component-names -->
<script  lang="ts">

import { ref } from 'vue'

const isAuthenticated = ref(false)

export function useAuth() {
  const login = () => {
    localStorage.setItem('isAuthenticated', 'true')
    isAuthenticated.value = true
  }

  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('token')
    isAuthenticated.value = false
  }

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    isAuthenticated.value = !!token
  }

  // Call immediately when imported
  checkAuth()

  return {
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
}
</script>
