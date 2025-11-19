<template>
  <div class="min-h-screen flex flex-col broder-">
    <!-- Navbar -->

    <!-- Main Content -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Car Booking Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Book a Car</h2>
          <form @submit.prevent="handleBooking" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Select Car</label>
              <select
                v-model="booking.car"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Choose a car</option>
                <option value="car1">Toyota Camry</option>
                <option value="car2">Honda Civic</option>
                <option value="car3">Ford Ranger</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                v-model="booking.date"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="time"
                v-model="booking.time"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea
                v-model="booking.purpose"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

        <!-- Booking History -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Your Bookings</h2>
          <div class="space-y-4">
            <div v-for="(booking, index) in bookingHistory" :key="index" class="border-b pb-4">
              <p class="font-medium">{{ booking.car }}</p>
              <p class="text-sm text-gray-600">Date: {{ booking.date }}</p>
              <p class="text-sm text-gray-600">Time: {{ booking.time }}</p>
              <p class="text-sm text-gray-600">Status: {{ booking.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-6">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <p>&copy; 2025 Company Car Booking System. All rights reserved.</p>
          </div>
          <div class="flex space-x-4">
            <a href="#" class="hover:text-gray-300">Terms</a>
            <a href="#" class="hover:text-gray-300">Privacy</a>
            <a href="#" class="hover:text-gray-300">Support</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const userEmail = ref("user@company.com"); // Replace with actual user email from auth

const booking = ref({
  car: "",
  date: "",
  time: "",
  purpose: "",
});

const bookingHistory = ref([
  {
    car: "Toyota Camry",
    date: "2025-09-23",
    time: "09:00",
    status: "Approved",
  },
  {
    car: "Honda Civic",
    date: "2025-09-24",
    time: "14:00",
    status: "Pending",
  },
]);

const handleBooking = () => {
  // Add API call to submit booking
  console.log("Booking submitted:", booking.value);
  // Reset form
  booking.value = {
    car: "",
    date: "",
    time: "",
    purpose: "",
  };
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAuthenticated");
  router.push("/login");
};

onMounted(() => {
  // Add API call to fetch user bookings
});
</script>
