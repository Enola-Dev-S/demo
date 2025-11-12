<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
}

const users = ref<User[]>([]);
const editingUser = ref<User | null>(null);
const showForm = ref(false);
const formData = ref<User>({
  name: '',
  email: '',
  role: 'user'
});

const roles = ['user', 'admin'];

const handleSubmit = async () => {
  try {
    if (editingUser.value) {
      // Update existing user
      await fetch(`http://localhost:3000/users/${editingUser.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value)
      });
    } else {
      // Create new user
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value)
      });
    }
    await loadUsers();
    resetForm();
  } catch (error) {
    console.error('Error:', error);
  }
};

const editUser = (user: User) => {
  editingUser.value = user;
  formData.value = { ...user };
  showForm.value = true;
};

const deleteUser = async (id: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE'
      });
      await loadUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    role: 'user'
  };
  editingUser.value = null;
  showForm.value = false;
};

const loadUsers = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/users');
    const data = await response.json();
    if (data.success) {
      users.value = data.data; // Assuming API returns { success: true, data: [...users] }
    } else {
      console.error('Failed to load users:', data.message);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

onMounted(() => {
  loadUsers();
});
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
                @click="deleteUser(user.id!)"
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
  </div>
</template>