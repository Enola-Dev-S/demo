<script setup lang="ts">
import { ref, onMounted } from 'vue';

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
  name: '',
  email: '',
  role: 'user',
  password: '' // added
});

const roles = ['user', 'administrator', 'superadmin'];
const apiBase = 'http://localhost:3000'; // server base

const loadUsers = async () => {
  try {
    const res = await fetch(`${apiBase}/api/users`);
    const data = await res.json();
    if (data.success) users.value = data.data;
    else {
      console.error('Load users failed', data);
      users.value = [];
    }
  } catch (err) {
    console.error('Load users error', err);
    users.value = [];
  }
};

const resetForm = () => {
  formData.value = { name: '', email: '', role: 'user', password: '' }
  editingUser.value = null
  showForm.value = false
}

const handleSubmit = async () => {
  try {
    if (editingUser.value && editingUser.value.id) {
      // Update user - send password only if provided
      const payload: any = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role
      }
      if (formData.value.password && formData.value.password.trim() !== '') {
        payload.password = formData.value.password
      }
      const res = await fetch(`${apiBase}/api/users/${editingUser.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Update failed')
    } else {
      // Add new user - password required
      const res = await fetch(`${apiBase}/api/adduser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.value.name,
          email: formData.value.email,
          role: formData.value.role,
          password: formData.value.password
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Create failed')
    }
    await loadUsers()
    resetForm()
  } catch (err: any) {
    console.error(err)
    alert(err.message || 'เกิดข้อผิดพลาด')
  }
}

const editUser = (user: User) => {
  editingUser.value = user;
  formData.value = { name: user.name, email: user.email, role: user.role, password: '' } // clear password
  showForm.value = true;
};

const showDeleteModal = ref(false)
const deleteTarget = ref<User | null>(null)

const openDeleteModal = (user: User) => {
  deleteTarget.value = user
  showDeleteModal.value = true
}

const doDelete = async () => {
  if (!deleteTarget.value?.id) return
  try {
    const res = await fetch(`${apiBase}/api/users/${deleteTarget.value.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Delete failed')
    }
    showDeleteModal.value = false
    await loadUsers()
  } catch (err: any) {
    console.error(err)
    alert(err.message || 'เกิดข้อผิดพลาด')
  }
}

onMounted(() => loadUsers());
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">User Management</h2>
      <button 
        @click="showForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add New User
      </button>
    </div>

    <!-- User Form -->
    <div v-if="showForm" class="mb-8 bg-white p-6 rounded-lg shadow">
      <h3 class="text-xl font-semibold mb-4">
        {{ editingUser ? 'Edit User' : 'Add New User' }}
      </h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input 
            v-model="formData.name"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            v-model="formData.email"
            type="email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <!-- New password input -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Password
            <span class="text-xs text-gray-500">({{ editingUser ? 'leave blank to keep current' : 'required' }})</span>
          </label>
          <input
            v-model="formData.password"
            :required="!editingUser"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            minlength="6"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Role</label>
          <select 
            v-model="formData.role"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option v-for="role in roles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
        </div>

        <div class="flex space-x-4">
          <button 
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {{ editingUser ? 'Update' : 'Create' }}
          </button>
          <button 
            type="button"
            @click="resetForm"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="!users.length" class="text-center py-4">
      Loading users...
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4">{{ user.name }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">{{ user.role }}</td>
            <td class="px-6 py-4 space-x-2">
              <button 
                @click="editUser(user)"
                class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 
                       rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button 
                @click="openDeleteModal(user)"
                class="inline-flex items-center px-3 py-1.5 border border-red-600 text-red-600 
                       rounded-md hover:bg-red-50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <transition name="modal" appear>
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/40" @click="showDeleteModal = false"></div>
        <div class="bg-white rounded-lg shadow-xl z-50 w-full max-w-md mx-4 p-6">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <svg class="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold">Confirm delete</h3>
              <p class="text-sm text-gray-600 mt-1">
                ต้องการลบผู้ใช้
                <span class="font-medium" v-if="deleteTarget">{{ deleteTarget.name }}</span>
                หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
              </p>
              <div class="mt-4 flex justify-end space-x-3">
                <button @click="showDeleteModal = false" class="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button @click="doDelete" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>