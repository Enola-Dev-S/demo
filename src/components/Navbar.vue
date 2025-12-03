<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <nav v-if="isAuthenticated" class="bg-gray-800 text-white mb-4 shadow-md relative z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and Desktop Nav -->
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img
              src="@/assets/fatima.png"
              class="h-10 w-auto rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
              alt="Logo"
            />
          </div>
          <div class="hidden md:block ml-10">
            <div class="flex items-baseline space-x-4">
              <RouterLink
                to="/"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                active-class="bg-gray-900 text-white"
                >HOME</RouterLink
              >
              <RouterLink
                v-if="userRole === 'administrator'"
                to="/Administrator"
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                active-class="bg-gray-900 text-white"
                >Administrator</RouterLink
              >
            </div>
          </div>
        </div>

        <!-- Booking Color Legend (Desktop Only) -->
        <div class="hidden md:flex items-center space-x-4 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
          <div class="flex items-center space-x-1.5">
            <div class="w-3 h-3 rounded bg-gradient-to-r from-green-700 to-green-400 shadow-sm"></div>
            <span class="text-[10px] text-gray-200 font-medium">1 Day</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <div class="w-3 h-3 rounded bg-gradient-to-r from-violet-700 to-violet-400 shadow-sm"></div>
            <span class="text-[10px] text-gray-200 font-medium">2 Days</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <div class="w-3 h-3 rounded bg-gradient-to-r from-sky-700 to-sky-400 shadow-sm"></div>
            <span class="text-[10px] text-gray-200 font-medium">3 Days</span>
          </div>
          <div class="flex items-center space-x-1.5">
            <div class="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-red-200 shadow-sm"></div>
            <span class="text-[10px] text-gray-200 font-medium">Cancel</span>
          </div>
        </div>

        <!-- User Info & Logout (Desktop Only) -->
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6 space-x-4">
            <div class="flex items-center space-x-3">
              <div class="text-right">
                <div class="text-sm font-medium text-white">
                  {{ customerName }} <span class="text-xs text-gray-400">(#{{ customerId }})</span>
                </div>
                <div class="text-xs text-gray-400">{{ customerEmail }}</div>
              </div>
              <div
                class="flex items-center justify-center bg-blue-600 text-white rounded-full w-10 h-10 text-sm font-bold shadow-lg ring-2 ring-blue-500/30"
              >
                {{ customerInitials }}
              </div>
            </div>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="-mr-2 flex md:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            type="button"
            class="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            aria-controls="mobile-menu"
            :aria-expanded="isMobileMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Icon when menu is closed -->
            <svg
              v-if="!isMobileMenuOpen"
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <!-- Icon when menu is open -->
            <svg
              v-else
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state -->
    <div v-show="isMobileMenuOpen" class="md:hidden" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <RouterLink
          to="/"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          active-class="bg-gray-900 text-white"
          @click="isMobileMenuOpen = false"
          >HOME</RouterLink
        >
        <RouterLink
          v-if="userRole === 'administrator'"
          to="/Administrator"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
          active-class="bg-gray-900 text-white"
          @click="isMobileMenuOpen = false"
          >Administrator</RouterLink
        >
      </div>
      <div class="pt-4 pb-4 border-t border-gray-700">
        <div class="flex items-center px-5">
          <div class="flex-shrink-0">
            <div
              class="flex items-center justify-center bg-blue-600 text-white rounded-full w-10 h-10 text-sm font-bold"
            >
              {{ customerInitials }}
            </div>
          </div>
          <div class="ml-3">
            <div class="text-base font-medium leading-none text-white">
              {{ customerName }} <span class="text-xs text-gray-400">(#{{ customerId }})</span>
            </div>
            <div class="text-sm font-medium leading-none text-gray-400 mt-1">
              {{ customerEmail }}
            </div>
          </div>
        </div>
        <div class="mt-3 px-2 space-y-1">
          <button
            @click="handleLogout"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuth } from "./Authen.vue";

defineProps<{
  onLogout?: () => void;
}>();

const { isAuthenticated } = useAuth();
const isMobileMenuOpen = ref(false);

const userName = ref("");
const userEmail = ref("");
const userRole = ref("");
const userId = ref("");

// expose friendly aliases used in template
const customerName = computed(
  () => userName.value || (userEmail.value ? userEmail.value.split("@")[0] : "Guest")
);
const customerEmail = computed(() => userEmail.value || "");
const customerId = computed(() => userId.value || "");
const customerInitials = computed(() => {
  const name = (customerName.value || "GU").trim();
  const parts = name.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
});

function loadFromStorage() {
  userName.value =
    localStorage.getItem("username") ??
    localStorage.getItem("userName") ??
    localStorage.getItem("name") ??
    "";

  userEmail.value = localStorage.getItem("userEmail") ?? localStorage.getItem("email") ?? "";

  userRole.value = localStorage.getItem("userRole") ?? localStorage.getItem("role") ?? "";

  userId.value = localStorage.getItem("userId") ?? localStorage.getItem("id") ?? "";
  // attempt to parse token if fields missing
  const token = localStorage.getItem("token");
  if (token && (!userName.value || !userId.value)) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userName.value = userName.value || payload.name || payload.username || payload.fullname || "";
      userEmail.value = userEmail.value || payload.email || "";
      userRole.value = userRole.value || payload.role || "";
      userId.value = userId.value || String(payload.userId ?? payload.id ?? "");
    } catch {
      // ignore
    }
  }
}

onMounted(() => {
  loadFromStorage();
  window.addEventListener("storage", (e: StorageEvent) => {
    if (!e.key) return;
    if (["username", "userName", "name"].includes(e.key)) userName.value = e.newValue || "";
    if (["userEmail", "email"].includes(e.key)) userEmail.value = e.newValue || "";
    if (["userRole", "role"].includes(e.key)) userRole.value = e.newValue || "";
    if (["userId", "id"].includes(e.key)) userId.value = e.newValue || "";
  });
});

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  // navigate to login
  window.location.href = "/login";
};
</script>
