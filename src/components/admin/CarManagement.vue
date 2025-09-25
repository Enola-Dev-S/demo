<script setup lang="ts">
import { ref } from 'vue';

interface Car {
  id?: number;
  model: string;
  brand: string;
  year: number;
  plateNumber: string;
  status: 'available' | 'maintenance' | 'booked';
}

const cars = ref<Car[]>([]);
const editingCar = ref<Car | null>(null);
const showForm = ref(false);
const formData = ref<Car>({
  model: '',
  brand: '',
  year: new Date().getFullYear(),
  plateNumber: '',
  status: 'available'
});

const statuses = ['available', 'maintenance', 'booked'];

const handleSubmit = async () => {
  try {
    if (editingCar.value) {
      await fetch(`http://localhost:3000/cars/${editingCar.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value)
      });
    } else {
      await fetch('http://localhost:3000/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value)
      });
    }
    await loadCars();
    resetForm();
  } catch (error) {
    console.error('Error:', error);
  }
};

const editCar = (car: Car) => {
  editingCar.value = car;
  formData.value = { ...car };
  showForm.value = true;
};

const deleteCar = async (id: number) => {
  if (confirm('Are you sure you want to delete this car?')) {
    try {
      await fetch(`http://localhost:3000/cars/${id}`, {
        method: 'DELETE'
      });
      await loadCars();
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

const resetForm = () => {
  formData.value = {
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    status: 'available'
  };
  editingCar.value = null;
  showForm.value = false;
};

const loadCars = async () => {
  try {
    const response = await fetch('http://localhost:3000/cars');
    cars.value = await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Car Management</h2>
      <button 
        @click="showForm = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add New Car
      </button>
    </div>

    <!-- Car Form -->
    <div v-if="showForm" class="mb-8 bg-white p-6 rounded-lg shadow">
      <h3 class="text-xl font-semibold mb-4">
        {{ editingCar ? 'Edit Car' : 'Add New Car' }}
      </h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Brand</label>
          <input 
            v-model="formData.brand"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Model</label>
          <input 
            v-model="formData.model"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Year</label>
          <input 
            v-model.number="formData.year"
            type="number"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Plate Number</label>
          <input 
            v-model="formData.plateNumber"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select 
            v-model="formData.status"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option v-for="status in statuses" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div class="flex space-x-4">
          <button 
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {{ editingCar ? 'Update' : 'Create' }}
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

    <!-- Cars Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate Number</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="car in cars" :key="car.id">
            <td class="px-6 py-4">{{ car.brand }}</td>
            <td class="px-6 py-4">{{ car.model }}</td>
            <td class="px-6 py-4">{{ car.year }}</td>
            <td class="px-6 py-4">{{ car.plateNumber }}</td>
            <td class="px-6 py-4">
              <span :class="{
                'px-2 py-1 rounded text-xs font-medium': true,
                'bg-green-100 text-green-800': car.status === 'available',
                'bg-yellow-100 text-yellow-800': car.status === 'maintenance',
                'bg-blue-100 text-blue-800': car.status === 'booked'
              }">
                {{ car.status }}
              </span>
            </td>
            <td class="px-6 py-4 space-x-2">
              <button 
                @click="editCar(car)"
                class="text-blue-600 hover:text-blue-900"
              >
                Edit
              </button>
              <button 
                @click="deleteCar(car.id!)"
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