<script setup lang="ts">
import { ref, onMounted } from "vue";
import { API_BASE, authHeader } from "@/config";

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  password?: string; // added
}

const users = ref<User[]>([]);
const editingUser = ref<User | null>(null);
const showForm = ref(false);
const formData = ref<User>({
  name: "",
  email: "",
  role: "user",
  password: "", // added
});

const roles = ["user", "administrator"];

const loadUsers = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/users`, { headers: authHeader() });
    const data = await res.json();
    if (data.success) users.value = data.data;
    else {
      console.error("Load users failed", data);
      users.value = [];
    }
  } catch (err) {
    console.error("Load users error", err);
    users.value = [];
  }
};

const resetForm = () => {
  formData.value = { name: "", email: "", role: "user", password: "" };
  editingUser.value = null;
  showForm.value = false;
};

const handleSubmit = async () => {
  try {
    if (editingUser.value && editingUser.value.id) {
      // Update user - send password only if provided
      const payload: any = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
      };
      if (formData.value.password && formData.value.password.trim() !== "") {
        payload.password = formData.value.password;
      }
      const res = await fetch(`${API_BASE}/api/users/${editingUser.value.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
    } else {
      // Add new user - password required
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          name: formData.value.name,
          email: formData.value.email,
          role: formData.value.role,
          password: formData.value.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Create failed");
    }
    await loadUsers();
    resetForm();
  } catch (err: any) {
    console.error(err);
    alert(err.message || "เกิดข้อผิดพลาด");
  }
};

const editUser = (user: User) => {
  editingUser.value = user;
  formData.value = { name: user.name, email: user.email, role: user.role, password: "" }; // clear password
  showForm.value = true;
};

const showDeleteModal = ref(false);
const deleteTarget = ref<User | null>(null);

const openDeleteModal = (user: User) => {
  deleteTarget.value = user;
  showDeleteModal.value = true;
};

const doDelete = async () => {
  if (!deleteTarget.value?.id) return;
  try {
    const res = await fetch(`${API_BASE}/api/users/${deleteTarget.value.id}`, { method: "DELETE", headers: authHeader() });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Delete failed");
    }
    showDeleteModal.value = false;
    await loadUsers();
  } catch (err: any) {
    console.error(err);
    alert(err.message || "เกิดข้อผิดพลาด");
  }
};

onMounted(() => loadUsers());
</script>

<template>
  <div class="w-full max-w-7xl mx-auto pb-24">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
      <div>
        <h2 class="text-4xl font-bold text-gray-900 tracking-tight">User Management</h2>
        <p class="text-gray-500 mt-2 text-base">Manage system users and their permissions</p>
      </div>
      <button
        @click="showForm = true"
        class="group flex items-center px-8 py-4 bg-gray-900 text-white text-base rounded-2xl hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-200 hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 mr-3 text-gray-300 group-hover:text-white transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add New User
      </button>
    </div>

    <!-- User Form (Collapsible/Modal-like inline) -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showForm"
        class="mb-10 bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div
          class="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"
        >
          <h3 class="text-xl font-semibold text-gray-800">
            {{ editingUser ? "Edit User" : "Add New User" }}
          </h3>
          <button @click="resetForm" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 sm:p-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-3">
              <label class="text-base font-medium text-gray-700">Full Name</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200"
                placeholder="John Doe"
                required
              />
            </div>

            <div class="space-y-3">
              <label class="text-base font-medium text-gray-700">Email Address</label>
              <input
                v-model="formData.email"
                type="email"
                :disabled="!!editingUser"
                class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="john@example.com"
                required
              />
            </div>

            <div class="space-y-3">
              <label class="text-base font-medium text-gray-700">
                Password
                <span class="text-sm text-gray-400 font-normal ml-1">
                  {{ editingUser ? "(Leave blank to keep current)" : "(Required)" }}
                </span>
              </label>
              <input
                v-model="formData.password"
                :required="!editingUser"
                type="password"
                class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200"
                placeholder="••••••••"
                minlength="6"
              />
            </div>

            <div class="space-y-3">
              <label class="text-base font-medium text-gray-700">Role</label>
              <div class="relative">
                <select
                  v-model="formData.role"
                  class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200 appearance-none"
                >
                  <option v-for="role in roles" :key="role" :value="role">
                    {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                  </option>
                </select>
                <div
                  class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-10 flex items-center justify-end gap-4">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium text-base transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium text-base shadow-lg shadow-gray-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {{ editingUser ? "Save Changes" : "Create User" }}
            </button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Loading State -->
    <div v-if="!users.length" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg
        class="animate-spin h-10 w-10 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-lg">Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-8 py-6 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                User Info
              </th>
              <th
                scope="col"
                class="px-8 py-6 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                class="px-8 py-6 text-right text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr
              v-for="user in users"
              :key="user.id"
              class="group hover:bg-gray-50/50 transition-colors duration-150"
            >
              <td class="px-8 py-6 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-14 w-14">
                    <div
                      class="h-14 w-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg border border-gray-200"
                    >
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="ml-6">
                    <div class="text-xl font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                  :class="{
                    'bg-green-100 text-green-700 border-green-200': user.role === 'user',
                    'bg-blue-50 text-blue-700 border-blue-100': user.role === 'administrator',
                    'bg-purple-50 text-purple-700 border-purple-100': user.role === 'superadmin',
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-8 py-6 whitespace-nowrap text-right text-base font-medium">
                <div
                  class="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <button
                    @click="editUser(user)"
                    class="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="openDeleteModal(user)"
                    class="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0"
      >
        <div
          class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          @click="showDeleteModal = false"
        ></div>

        <div
          class="bg-white rounded-3xl shadow-2xl z-50 w-full max-w-lg p-8 transform transition-all scale-100"
        >
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0 bg-red-50 rounded-full p-3">
              <svg
                class="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900">Delete User</h3>
              <p class="text-base text-gray-500 mt-3">
                Are you sure you want to delete
                <span class="font-semibold text-gray-900">{{ deleteTarget?.name }}</span
                >? This action cannot be undone.
              </p>
              <div class="mt-8 flex justify-end space-x-4">
                <button
                  @click="showDeleteModal = false"
                  class="px-6 py-3 rounded-xl text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium text-base transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="doDelete"
                  class="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium text-base shadow-lg shadow-red-100 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
