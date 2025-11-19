<template>
  <div class="p-2 w-full bg-gray-100 rounded-xl">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
    >
      <!-- Navigation Group -->
      <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div class="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            @click="prevWeek"
            class="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <span class="px-4 font-semibold text-gray-700 min-w-[140px] text-center text-sm">{{
            weekRangeLabel
          }}</span>
          <button
            @click="nextWeek"
            class="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div class="relative">
          <input
            type="date"
            v-model="pickedDate"
            @change="jumpToDate"
            class="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all hover:bg-white"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      <!-- Actions Group -->
       
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <!-- Select resolution -->
          <select
            v-model="resolution"
            class="appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all cursor-pointer min-w-[160px]"
          >
            <option value="Small">Small</option>
            <option value="Large">Large</option>
          </select>   
        <div class="relative group">
          <!-- Select -->
          <select
            v-model="filterCar"
            @change="loadWeek"
            class="appearance-none pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all cursor-pointer min-w-[160px]"
          >
            <option value="">All Cars</option>
            <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-gray-600 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <div class="h-8 w-px bg-gray-200 hidden md:block mx-1"></div>

        <button
          @click="loadWeek"
          class="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
          title="Refresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <button
          @click="openBooking(null)"
          class="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
          New Booking
        </button>
      </div>
    </div>

    <!-- resolution -->
    

    <BookingSmall 
      v-if="resolution === 'Small'" 
      ref="bookingSmallRef"
      :start-date="weekStartDate" 
      :filter-car="filterCar"
    />
    <BookingLarge 
      v-if="resolution === 'Large'" 
      ref="bookingLargeRef"
      :start-date="weekStartDate" 
      :filter-car="filterCar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { API_BASE } from "@/config";
import BookingSmall from "./BookingWeekly copy 22.vue";
import BookingLarge from "./BookingWeekly copy 33.vue";

const resolution = ref("Small");
const bookingSmallRef = ref<any>(null);
const bookingLargeRef = ref<any>(null);

// helper: format date as YYYY-MM-DD in local timezone (avoid toISOString timezone shift)
const pad = (n: number) => n.toString().padStart(2, "0");
const formatDateLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// week helpers
const pickedDate = ref(new Date().toISOString().slice(0, 10));
const startOfWeek = (d: Date) => {
  const dt = new Date(d);
  const day = dt.getDay(); // 0..6
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // monday as start
  const s = new Date(dt);
  s.setDate(diff);
  s.setHours(0, 0, 0, 0);
  return s;
};
const makeWeekDays = (baseDateStr: string) => {
  const base = new Date(baseDateStr + "T00:00:00");
  const s = startOfWeek(new Date(base));
  const days: any[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(s);
    dt.setDate(s.getDate() + i);
    days.push({
      date: formatDateLocal(dt),
      labelShort: dt.toLocaleDateString(undefined, { weekday: "short" }),
      labelDate: dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      full: dt,
    });
  }
  return days;
};

const weekStartDate = ref(formatDateLocal(startOfWeek(new Date())));
const weekDays = ref(makeWeekDays(weekStartDate.value));
watch(weekStartDate, () => (weekDays.value = makeWeekDays(weekStartDate.value)));
const weekRangeLabel = computed(() => {
  const a = weekDays.value[0].full,
    b = weekDays.value[6].full;
  return `${a.toLocaleDateString()} — ${b.toLocaleDateString()}`;
});

const prevWeek = () => {
  const d = new Date(weekStartDate.value + "T00:00:00");
  d.setDate(d.getDate() - 7);
  weekStartDate.value = formatDateLocal(d);
};
const nextWeek = () => {
  const d = new Date(weekStartDate.value + "T00:00:00");
  d.setDate(d.getDate() + 7);
  weekStartDate.value = formatDateLocal(d);
};
const jumpToDate = () => {
  const d = new Date(pickedDate.value + "T00:00:00");
  weekStartDate.value = formatDateLocal(startOfWeek(d));
};

// data
const cars = ref<any[]>([]);
const filterCar = ref<string | number>("");

const loadCars = async () => {
  const res = await fetch(`${API_BASE}/api/car`);
  const data = await res.json();
  cars.value = data.data || [];
};

// We don't need loadWeek here anymore as children handle it, 
// but the refresh button calls it. We can make it trigger children refresh?
// Actually, if we just update a key or something, it might re-render.
// But the simplest way is to expose a refresh method on children too, or just ignore it if the children auto-refresh on prop change.
// The refresh button calls loadWeek. Let's make loadWeek call children's loadWeek if available?
// Or just remove the refresh button logic for now since children watch props.
// But the user might want to manually refresh.
// Let's keep loadWeek but make it call child's loadWeek?
// Child components watch props. If we want to force refresh, we can maybe toggle a 'refreshKey' prop?
// Or just access the ref.

const loadWeek = async () => {
  if (resolution.value === 'Small' && bookingSmallRef.value) {
    await bookingSmallRef.value.loadWeek();
  } else if (resolution.value === 'Large' && bookingLargeRef.value) {
    await bookingLargeRef.value.loadWeek();
  }
};

const loadAll = async () => {
  await loadCars();
};

onMounted(loadAll);

// booking actions
const openBooking = (car: any | null) => {
  if (resolution.value === 'Small' && bookingSmallRef.value) {
    bookingSmallRef.value.openBooking(car);
  } else if (resolution.value === 'Large' && bookingLargeRef.value) {
    bookingLargeRef.value.openBooking(car);
  }
};

</script>

<style scoped>
/* small modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.12s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
/* smaller text utility */
.text-xxs {
  font-size: 10px;
}

/* booking modal new styling */
.booking-modal-card {
  width: min(90vw, 520px);
  border-radius: 22px;
  padding: 30px;
  background: linear-gradient(135deg, #f0f2f5, #d9dde3 55%, #c8ccd3);
  color: #111827;
  box-shadow: 0 25px 55px rgba(17, 24, 39, 0.18);
  position: relative;
  overflow: hidden;
}
.booking-modal-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(148, 163, 184, 0.45), transparent 55%),
    radial-gradient(circle at bottom left, rgba(203, 213, 225, 0.4), transparent 65%);
  pointer-events: none;
}
.booking-modal-card > * {
  position: relative;
  z-index: 1;
}

.booking-modal-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}
.booking-modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.65);
  display: grid;
  place-items: center;
  font-size: 24px;
  color: #111827;
}
.booking-modal-eyebrow {
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(17, 24, 39, 0.6);
}
.booking-modal-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-top: 2px;
  color: #0f172a;
}
.booking-modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.booking-modal-errors {
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.45);
  color: #b91c1c;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
}
.booking-modal-errors ul {
  margin-left: 20px;
  list-style: disc;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 0.9rem;
  color: rgba(17, 24, 39, 0.75);
}
.form-group input,
.form-group select {
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 12px;
  padding: 11px 13px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  transition: border 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.form-group input:hover,
.form-group select:hover {
  background: #fff;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4b5563;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  background: #ffffff;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.schedule-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.schedule-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.schedule-card-title {
  font-weight: 600;
  color: #0f172a;
}
.schedule-card-caption {
  font-size: 0.85rem;
  color: rgba(17, 24, 39, 0.65);
  margin-top: 2px;
}
.schedule-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 600;
}
.schedule-card-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}
.schedule-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.schedule-input label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(15, 23, 42, 0.65);
}
.schedule-input input {
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  padding: 12px 14px;
  background: #fff;
  color: #0f172a;
  font-size: 0.95rem;
  transition: border 0.15s ease, box-shadow 0.15s ease;
}
.schedule-input input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

@media (max-width: 520px) {
  .schedule-card {
    padding: 18px;
  }
  .schedule-card-body {
    grid-template-columns: 1fr;
  }
}

.booking-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}
.btn {
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.btn:hover {
  transform: translateY(-1px);
}
.btn:active {
  transform: translateY(0);
}
.btn.ghost {
  background: rgba(15, 23, 42, 0.08);
  color: #111827;
}
.btn.primary {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  color: #fff;
  box-shadow: 0 12px 25px rgba(79, 70, 229, 0.25);
}

/* popup styling (ปรับได้ที่เดียว) */
.ui-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}
.ui-popup-card {
  width: min(90vw, 360px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.35);
  background: #fff;
  text-align: center;
  transition: transform 0.15s ease;
}
.ui-popup-card.type-success {
  border: 2px solid #22c55e;
}
.ui-popup-card.type-error {
  border: 2px solid #ef4444;
}
.ui-popup-card.type-warning {
  border: 2px solid #f97316;
}
.ui-popup-card.type-info {
  border: 2px solid #3b82f6;
}
.ui-popup-title {
  font-weight: 600;
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}
.ui-popup-message {
  font-size: 0.95rem;
  color: #475569;
  margin-bottom: 1.25rem;
}
.ui-popup-button {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-weight: 600;
  transition: background 0.15s ease;
}
.ui-popup-button:hover {
  background: #1e293b;
}

/* car image hover chip */
.car-img-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  cursor: pointer;
}
.car-img-chip-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #0f172a;
}
.car-img-chip-preview {
  position: absolute;
  left: 150%;
  top: calc(-100% + -50px);
  transform: translateX(-50%) scale(0.94);
  opacity: 0;
  pointer-events: none;
  max-width: min(320px, 60vw);
  max-height: min(220px, 40vh);
  width: auto;
  height: auto;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
  background: #fff;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 60;
}
.car-img-chip:hover .car-img-chip-preview,
.car-img-chip:focus-within .car-img-chip-preview {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}
</style>
