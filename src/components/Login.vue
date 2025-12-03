<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-[100dvh] flex items-center justify-center bg-login-main p-4 overflow-y-auto">
    <div class="bg-login-block w-full max-w-md mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white">Welcome Fatima</h2>
        <p class="text-white mt-2">Please Sign In to Your Email Account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6 text-white">
        <div>
          <label class="block text-sm font-medium text-white">Email</label>
          <div class="mt-1 relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              <!-- icon svg -->
            </span>
            <input
              v-model="email"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              :class="{ 'border-red-500': errors.email }"
              placeholder="Enter your Email"
            />
          </div>
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-white">Password</label>
          <div class="mt-1 relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <!-- icon svg -->
            </span>
            <input
              v-model="password"
              type="password"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Enter your password"
            />
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <button type="submit" class="button-Login" :disabled="loading">
            {{ loading ? "Logging in..." : "Login" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/components/Authen.vue";
import { API_BASE } from "@/config";

const router = useRouter();
const { login } = useAuth();
const email = ref("canon@fatima.co.th");
const password = ref("P@ssw0rd");
const errors = reactive({ email: "", password: "", roll: "" });
const loading = ref(false);

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
  };
}

const handleLogin = async () => {
  errors.email = "";
  errors.password = "";
  loading.value = true;

  if (!email.value || !password.value) {
    errors.password = "Please enter both Email and password";
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data: LoginResponse = await response.json();

    if (data.success) {
      // Store user data so Navbar and BookingCalendar can read them
      localStorage.setItem("userEmail", data.user?.email || email.value);
      localStorage.setItem("userRole", data.user?.role || "");
      if (data.user?.id !== undefined) localStorage.setItem("userId", String(data.user.id));
      const username =
        data.user?.name || data.user?.email?.split?.("@")?.[0] || email.value.split("@")[0];
      localStorage.setItem("username", username);
      if (data.token) localStorage.setItem("token", data.token);

      login();

      if (data.user?.role === "superadmin") {
        localStorage.setItem(
          "allowedRoutes",
          JSON.stringify(["/superadmin", "/administrator", "/"])
        );
        router.push("/administrator");
      } else {
        switch (data.user?.role) {
          case "administrator":
            router.push("/");
            break;
          default:
            router.push("/");
        }
      }
    } else {
      errors.password = data.message || "Invalid username or password";
    }
  } catch (error) {
    errors.password = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
    console.error("Login error:", error);
  } finally {
    loading.value = false;
  }
};
</script>
