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
    isAuthenticated.value = false
  }

  // ตรวจสอบ auth state เมื่อ initialize
  const checkAuth = () => {
    isAuthenticated.value = !!localStorage.getItem('isAuthenticated')
  }

  // เรียกใช้ทันทีเมื่อ import
  checkAuth()

  return {
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
}
</script>
