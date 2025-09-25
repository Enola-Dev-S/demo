<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts">
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
    const auth = localStorage.getItem('isAuthenticated')
    isAuthenticated.value = !!auth
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

<script setup lang="ts">
// Setup script can be empty since we're exporting from the regular script
</script>


