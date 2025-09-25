<script setup lang="ts">
import { ref } from 'vue';

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
    const response = await fetch('http://localhost:3000/users');
    users.value = await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
};
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

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
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
                class="text-blue-600 hover:text-blue-900"
              >
                Edit
              </button>
              <button 
                @click="deleteUser(user.id!)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>