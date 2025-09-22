
<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Car Booking Calendar</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Calendar Section -->
      <div class="md:col-span-2">
        <Calendar
          :attributes="attributes"
          :min-date="new Date()"
          @dayclick="onDayClick"
          class="border rounded-lg"
        />
      </div>

      <!-- Booking Form Section -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Make a Booking</h2>
        <form @submit.prevent="handleBooking" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Selected Date</label>
            <input
              type="text"
              :value="selectedDate"
              readonly
              class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Car</label>
            <select
              v-model="booking.car"
              class="mt-1 block w-full rounded-md border-gray-300"
              required
            >
              <option value="">Select a car</option>
              <option v-for="car in cars" :key="car.id" :value="car.id">
                {{ car.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Time Slot</label>
            <select
              v-model="booking.timeSlot"
              class="mt-1 block w-full rounded-md border-gray-300"
              required
            >
              <option value="">Select time</option>
              <option v-for="slot in timeSlots" :key="slot.value" :value="slot.value">
                {{ slot.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Purpose</label>
            <textarea
              v-model="booking.purpose"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Submit Booking
          </button>
        </form>
      </div>
    </div>

    <!-- Existing Bookings -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Existing Bookings</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="booking in existingBookings"
          :key="booking.id"
          class="bg-white p-4 rounded-lg shadow"
        >
          <div class="font-medium">{{ booking.car }}</div>
          <div class="text-sm text-gray-600">Date: {{ booking.date }}</div>
          <div class="text-sm text-gray-600">Time: {{ booking.timeSlot }}</div>
          <div class="text-sm text-gray-600">Status: {{ booking.status }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Calendar } from 'v-calendar'
import 'v-calendar/dist/style.css'

// Car options
const cars = [
  { id: 1, name: 'Toyota Camry' },
  { id: 2, name: 'Honda Civic' },
  { id: 3, name: 'Ford Ranger' }
]

// Time slots
const timeSlots = [
  { value: '09:00', label: '09:00 - 10:00' },
  { value: '10:00', label: '10:00 - 11:00' },
  { value: '11:00', label: '11:00 - 12:00' },
  { value: '13:00', label: '13:00 - 14:00' },
  { value: '14:00', label: '14:00 - 15:00' },
  { value: '15:00', label: '15:00 - 16:00' },
]

// State
const selectedDate = ref('')
const booking = ref({
  car: '',
  timeSlot: '',
  purpose: ''
})

// Example existing bookings
const existingBookings = ref([
  {
    id: 1,
    car: 'Toyota Camry',
    date: '2025-09-23',
    timeSlot: '09:00 - 10:00',
    status: 'Confirmed'
  },
  {
    id: 2,
    car: 'Honda Civic',
    date: '2025-09-24',
    timeSlot: '13:00 - 14:00',
    status: 'Pending'
  }
])

// Calendar attributes to show bookings
const attributes = computed(() => {
  return existingBookings.value.map(booking => ({
    dates: [new Date(booking.date)],
    dot: {
      color: booking.status === 'Confirmed' ? 'green' : 'orange'
    },
    popover: {
      label: `${booking.car} - ${booking.timeSlot}`
    }
  }))
})

// Handlers
const onDayClick = (day: any) => {
  selectedDate.value = day.id
}

const handleBooking = async () => {
  if (!selectedDate.value) {
    alert('Please select a date')
    return
  }

  try {
    // Add API call here
    console.log('Booking submitted:', {
      date: selectedDate.value,
      ...booking.value
    })

    // Reset form
    booking.value = {
      car: '',
      timeSlot: '',
      purpose: ''
    }
    selectedDate.value = ''

    alert('Booking submitted successfully!')
  } catch (error) {
    console.error('Booking error:', error)
    alert('Failed to submit booking')
  }
}
</script>
