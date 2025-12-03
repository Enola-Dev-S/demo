<template>
  <div class="w-full bg-gray-100 flex flex-col pb-24">
    <!-- Mobile List View -->
    <div class="space-y-4">
      <div
        v-for="car in filteredCars"
        :key="car.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- Car Header -->
        <div class="p-4 flex items-start justify-between border-b border-gray-50">
          <div class="flex items-center gap-3">
            <div
              class="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative"
            >
              <img
                v-if="car.img"
                :src="getCarImgUrl(car.img)"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
              >
                ไม่มีรูป
              </div>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 leading-tight text-base">{{ car.name }}</h3>
              <span
                :class="`inline-block px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${statusClass(
                  car.status
                )}`"
              >
                {{ car.status || "-" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Week Strip -->
        <div class="px-4 py-4 bg-gray-50/50">
          <div class="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
            <div
              v-for="d in weekDays"
              :key="d.date"
              class="flex-shrink-0 w-12 flex flex-col items-center snap-start"
              @click="handleDayClick(car, d)"
            >
              <span class="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">{{
                d.labelShort
              }}</span>
              <div
                class="w-12 h-12 rounded-xl border flex items-center justify-center relative transition-all active:scale-95 shadow-sm"
                :class="getDayClass(car, d)">
                <!-- Booking Indicator -->
                <div v-if="hasBooking(car, d)" class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-[8px] text-white/90 leading-none">ไม่ว่าง</span>
                </div>
                <span v-else class="text-[8px] text-gray-400 leading-none">ว่าง</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <transition name="modal">
      <div v-if="showBooking" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeBooking"></div>
        
        <!-- Modal Card -->
        <div 
          class="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto scrollbar-hide bg-gradient-to-br from-gray-50 to-gray-200 rounded-3xl shadow-2xl p-6 border border-white/50"
        >
          <!-- Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">
              🚗
            </div>
            <div>
              <p class="text-xs font-bold tracking-wider text-gray-500 uppercase mb-0.5">
                {{ editingBooking ? (isReadOnly ? "รายละเอียด" : "แก้ไขการจอง") : "สร้างการจองใหม่" }}
              </p>
              <h3 class="text-xl font-bold text-gray-900 leading-tight">
                {{ editingBooking ? (isReadOnly ? "รายละเอียดการจอง" : "แก้ไขการจอง") : "สร้างการจองใหม่" }}
              </h3>
              <p v-if="editingBooking" class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                ผู้จอง: <span class="font-semibold text-gray-700">{{ editingBooking.user_name || editingBooking.user_id }}</span>
              </p>
            </div>
          </div>

          <form @submit.prevent="submitBooking" class="space-y-5">
            <!-- Error Alert -->
            <div v-if="formErrors.length" class="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
              <div class="font-bold mb-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                กรุณาตรวจสอบข้อมูล
              </div>
              <ul class="list-disc list-inside space-y-0.5 opacity-90 pl-1">
                <li v-for="(err, idx) in formErrors" :key="idx">{{ err }}</li>
              </ul>
            </div>

            <!-- Car Selection -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">SelectCar-เลือกรถ</label>
              <div class="relative">
                <select 
                  v-model="form.car_id" 
                  required 
                  :disabled="isReadOnly"
                  class="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 pr-10 shadow-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Admin User Selection -->
            <div v-if="isAdmin" class="space-y-1.5">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">จองให้ผู้ใช้ (Book for User)</label>
              <div class="relative">
                <select 
                  v-model="form.user_id" 
                  required 
                  :disabled="isReadOnly"
                  class="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 pr-10 shadow-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="" disabled>เลือกผู้ใช้</option>
                  <option v-for="u in users" :key="u.id" :value="u.id">
                    {{ u.name }} ({{ u.email }})
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Schedule Grid -->
            <div class="grid grid-cols-1 gap-4">
              <!-- Start Time -->
              <div class="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm space-y-3">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-bold text-gray-900">ช่วงเวลาเริ่มต้น</p>
                    <p class="text-[10px] text-gray-500">วันที่และเวลารับรถ</p>
                  </div>
                  <span class="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">เริ่ม</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">วันที่</label>
                    <input 
                      type="date" 
                      v-model="form.start_date" 
                      required 
                      :disabled="isReadOnly"
                      class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">เวลา</label>
                    <input 
                      type="time" 
                      v-model="form.start_time" 
                      required 
                      :disabled="isReadOnly"
                      class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <!-- End Time -->
              <div class="bg-white/60 p-4 rounded-2xl border border-white/50 shadow-sm space-y-3">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-bold text-gray-900">ช่วงเวลาสิ้นสุด</p>
                    <p class="text-[10px] text-gray-500">วันที่และเวลาคืนรถ</p>
                  </div>
                  <span class="px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider">สิ้นสุด</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">วันที่</label>
                    <input 
                      type="date" 
                      v-model="form.end_date" 
                      required 
                      :disabled="isReadOnly"
                      class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-bold text-gray-400 uppercase">เวลา</label>
                    <input 
                      type="time" 
                      v-model="form.end_time" 
                      required 
                      :disabled="isReadOnly"
                      class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Purpose -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Purpose-ต้นทาง</label>
              <input 
                v-model="form.purpose" 
                type="text" 
                placeholder="Fatima R.B.D.S." 
                :disabled="isReadOnly"
                class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 shadow-sm transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder-gray-300"
              />
            </div>

            <!-- Destination -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Destination-ปลายทาง</label>
              <input
                v-model="form.destination"
                type="text"
                placeholder="เช่น สำนักงาน/ลูกค้า/พื้นที่ปฏิบัติงาน"
                :disabled="isReadOnly"
                class="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 shadow-sm transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder-gray-300"
              />
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button 
                type="button" 
                @click="closeBooking" 
                class="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all shadow-sm"
              >
                {{ isReadOnly ? "ปิด" : "ยกเลิก" }}
              </button>
              <button 
                v-if="!isReadOnly" 
                type="submit" 
                class="flex-[2] px-4 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:transform active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
              >
                {{ editingBooking ? "อัปเดต" : "ยืนยันการจอง" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- History Modal -->
    <transition name="modal">
      <div v-if="showHistory" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="showHistory = false"></div>
        <div class="bg-white rounded-2xl shadow-lg z-50 w-full max-w-sm p-6 m-4">
          <h3 class="text-lg font-semibold mb-4">ประวัติ - {{ historyCar?.name }}</h3>
          <div class="max-h-[60vh] overflow-y-auto pr-2">
            <div class="space-y-3">
              <div
                v-for="(h, i) in history"
                :key="h.id"
                class="bg-gray-50 p-3 rounded-xl border border-gray-100"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xs font-bold text-gray-500">#{{ i + 1 }}</span>
                  <span
                    :class="`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusClass(
                      h.status
                    )}`"
                  >
                    {{ h.status }}
                  </span>
                </div>
                <div class="text-sm font-medium text-gray-900 mb-1">
                  {{ h.user_name || h.user_id }}
                </div>
                <div class="text-xs text-gray-500 space-y-0.5">
                  <div class="flex justify-between">
                    <span>เริ่ม:</span>
                    <span>{{ formatDatetime(h.start_datetime) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>ถึง:</span>
                    <span>{{ formatDatetime(h.end_datetime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-6">
            <button
              @click="showHistory = false"
              class="w-full py-3 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Cancel confirmation modal -->
    <transition name="modal">
      <div
        v-if="cancelModalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeCancel"></div>
        <div class="bg-white rounded-2xl shadow-xl z-50 w-full max-w-sm p-6 mx-4">
          <div class="flex flex-col items-center text-center">
            <div
              class="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl mb-4"
            >
              !
            </div>
            <h3 class="text-lg font-bold text-gray-900">ยืนยันยกเลิกการจอง</h3>
            <p class="text-sm text-gray-500 mt-2">
              คุณต้องการยกเลิกการจองของ
              <strong class="text-gray-900">{{
                cancelTarget?.user_name || cancelTarget?.user_id
              }}</strong>
              สำหรับรถ <strong class="text-gray-900">{{ cancelTargetCarName }}</strong> หรือไม่?
            </p>
            <p class="text-xs text-gray-400 mt-2 bg-gray-50 px-3 py-2 rounded-lg w-full">
              {{ smallFormat(cancelTarget?.start_datetime) }} —
              {{ smallFormat(cancelTarget?.end_datetime) }}
            </p>

            <div class="mt-6 flex w-full gap-3">
              <button
                @click="closeCancel"
                class="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                @click="confirmCancel"
                class="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium shadow-lg shadow-red-200 hover:bg-red-700"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Reusable popup -->
    <transition name="modal">
      <div v-if="popup.visible" class="ui-popup-overlay" @click="closePopup">
        <div class="ui-popup-card" :class="`type-${popup.type}`" @click.stop>
          <div class="ui-popup-title">{{ popup.title }}</div>
          <p class="ui-popup-message">{{ popup.message }}</p>
          <button class="ui-popup-button" @click="closePopup">ปิด</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { API_BASE } from "@/config";

// helper: format date as YYYY-MM-DD in local timezone
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

const props = defineProps<{ startDate?: string; filterCar?: string | number }>();

const weekStartDate = ref(props.startDate || formatDateLocal(startOfWeek(new Date())));
const weekDays = ref(makeWeekDays(weekStartDate.value));

watch(
  () => props.startDate,
  (newVal) => {
    if (newVal && newVal !== weekStartDate.value) {
      weekStartDate.value = newVal;
    }
  }
);

watch(weekStartDate, () => (weekDays.value = makeWeekDays(weekStartDate.value)));
// whenever weekStartDate changes, reload bookings for that week
watch(weekStartDate, () => {
  loadWeek().catch(() => {});
});

// data
const cars = ref<any[]>([]);
const users = ref<any[]>([]);
const bookings = ref<any[]>([]);
const bookingsByCarDay = ref<Record<string, Record<string, any[]>>>({});
const serverBase = API_BASE;

// computed list used by template
const filteredCars = computed(() => {
  if (!cars.value) return [];
  if (!props.filterCar && props.filterCar !== 0) return cars.value;
  return cars.value.filter((c) => String(c.id) === String(props.filterCar));
});

// user info
const customerId = ref(Number(localStorage.getItem("userId") || 0));
watch(
  () => localStorage.getItem("userId"),
  (v) => (customerId.value = Number(v || 0))
);
const userRole = ref(localStorage.getItem("userRole") || localStorage.getItem("role") || "");
watch(
  () => localStorage.getItem("userRole"),
  (v) => (userRole.value = v || "")
);

const isAdmin = computed(() =>
  ["administrator", "superadmin"].includes(String(userRole.value).toLowerCase())
);

const isOwner = (b: any) => Number(b?.user_id) === Number(customerId.value);

const isReadOnly = computed(() => {
  if (!editingBooking.value) return false;
  return !(isOwner(editingBooking.value) || isAdmin.value);
});

function statusClass(status = "") {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-gray-800 text-white";
    case "cancelled":
      return "bg-red-100 text-red-900";
    case "Available":
      return "bg-green-100 text-green-800";
    case "Maintenance":
      return "bg-red-200 text-red-900";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// UI states & form
const showBooking = ref(false);
const showHistory = ref(false);
const history = ref<any[]>([]);
const historyCar = ref<any | null>(null);
const editingBooking = ref<any | null>(null);

type PopupType = "info" | "success" | "error" | "warning";
type PopupState = { visible: boolean; title: string; message: string; type: PopupType };
const popup = ref<PopupState>({ visible: false, title: "แจ้งเตือน", message: "", type: "info" });
let popupTimer: ReturnType<typeof setTimeout> | null = null;

const closePopup = () => {
  popup.value.visible = false;
  if (popupTimer) {
    clearTimeout(popupTimer);
    popupTimer = null;
  }
};

const showPopup = (
  message: string,
  options: { title?: string; type?: PopupType; autoCloseMs?: number } = {}
) => {
  popup.value = {
    visible: true,
    title: options.title || "แจ้งเตือน",
    message,
    type: options.type || "info",
  };
  if (popupTimer) {
    clearTimeout(popupTimer);
    popupTimer = null;
  }
  if (options.autoCloseMs !== 0) {
    popupTimer = setTimeout(() => closePopup(), options.autoCloseMs ?? 3500);
  }
};

const form = ref({
  id: null as number | null,
  car_id: null as number | null,
  user_id: customerId.value || 1,
  start_date: weekDays.value[0].date,
  start_time: "09:00",
  end_date: weekDays.value[0].date,
  end_time: "17:00",
  purpose: "",
  destination: "",
});
const formErrors = ref<string[]>([]);

const loadCars = async () => {
  const res = await fetch(`${API_BASE}/api/car`);
  const data = await res.json();
  cars.value = data.data || [];
  if (!form.value.car_id && cars.value.length) form.value.car_id = cars.value[0].id;
};

const loadUsers = async () => {
  const res = await fetch(`${API_BASE}/api/users`);
  const data = await res.json();
  users.value = data.data || [];
};

const getCarImgUrl = (img?: string) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${serverBase}/imgcar/${img}`;
};

const loadWeek = async () => {
  const weekStart = new Date(weekDays.value[0].date + "T00:00:00");
  const weekEnd = new Date(weekDays.value[6].date + "T23:59:59");
  const params = new URLSearchParams();
  params.set("start", weekStart.toISOString());
  params.set("end", weekEnd.toISOString());
  if (props.filterCar) params.set("car_id", String(props.filterCar));

  const res = await fetch(`${API_BASE}/api/booking?${params.toString()}`);
  const data = await res.json();
  bookings.value = data.data || [];

  // build map car -> day -> bookings[] (handle multi-day bookings) using local-date keys
  const map: Record<string, Record<string, any[]>> = {};
  bookings.value.forEach((b: any) => {
    const carId = String(b.car_id);
    const bStart = new Date(b.start_datetime);
    const bEnd = new Date(b.end_datetime);

    // clamp booking range to the current week
    const from = bStart > weekStart ? new Date(bStart) : new Date(weekStart);
    const to = bEnd < weekEnd ? new Date(bEnd) : new Date(weekEnd);

    // iterate each day the booking covers and add to that day's list
    const cur = new Date(from);
    cur.setHours(0, 0, 0, 0);
    const lastDay = new Date(to);
    lastDay.setHours(0, 0, 0, 0);
    while (cur <= lastDay) {
      const dayKey = formatDateLocal(cur);
      map[carId] = map[carId] || {};
      map[carId][dayKey] = map[carId][dayKey] || [];
      map[carId][dayKey].push(b);
      cur.setDate(cur.getDate() + 1);
    }
  });

  // sort bookings per day by start time
  Object.values(map).forEach((dayMap: any) => {
    Object.keys(dayMap).forEach((d) => {
      dayMap[d].sort(
        (x: any, y: any) =>
          new Date(x.start_datetime).getTime() - new Date(y.start_datetime).getTime()
      );
    });
  });

  bookingsByCarDay.value = map;
};

const loadAll = async () => {
  await loadCars();
  if (isAdmin.value) {
    await loadUsers();
  }
  await loadWeek();
};

onMounted(loadAll);

// helpers
const formatDatetime = (iso: string) => new Date(iso).toLocaleString();

// booking actions
const openBooking = (car: any | null) => {
  editingBooking.value = null;
  showBooking.value = true;
  formErrors.value = [];
  form.value.id = null;
  form.value.car_id = car?.id ?? cars.value[0]?.id ?? null;
  form.value.user_id = customerId.value || form.value.user_id;
  form.value.start_date = weekDays.value[0].date;
  form.value.end_date = weekDays.value[0].date;
  form.value.start_time = "09:00";
  form.value.end_time = "17:00";
  form.value.purpose = "Fatima R.B.D.S.";
  form.value.destination = "";
};

const closeBooking = () => {
  showBooking.value = false;
  editingBooking.value = null;
};

const openBookingEdit = (b: any) => {
  editingBooking.value = b;
  showBooking.value = true;
  formErrors.value = [];
  form.value.id = b.id;
  form.value.car_id = b.car_id;
  form.value.user_id = b.user_id;
  form.value.start_date = formatDateLocal(new Date(b.start_datetime));
  form.value.start_time = new Date(b.start_datetime).toTimeString().slice(0, 5);
  form.value.end_date = formatDateLocal(new Date(b.end_datetime));
  form.value.end_time = new Date(b.end_datetime).toTimeString().slice(0, 5);
  form.value.purpose = b.purpose || "";
  form.value.destination = b.destination || "";
};

// watch start_date to auto-update end_date to the same day
watch(
  () => form.value.start_date,
  (newStartDate) => {
    if (newStartDate) {
      form.value.end_date = newStartDate;
    }
  }
);

// submitBooking
const submitBooking = async () => {
  formErrors.value = [];
  const startIso = `${form.value.start_date}T${form.value.start_time}:00`;
  const endIso = `${form.value.end_date}T${form.value.end_time}:00`;

  // validation
  if (!form.value.car_id) formErrors.value.push("กรุณาเลือกรถที่จะจอง");
  if (!form.value.user_id) formErrors.value.push("ไม่พบรหัสผู้ใช้งาน");
  if (!form.value.start_date || !form.value.start_time)
    formErrors.value.push("กรุณาระบุวันและเวลาเริ่มต้น");
  if (!form.value.end_date || !form.value.end_time)
    formErrors.value.push("กรุณาระบุวันและเวลาสิ้นสุด");
  if (!form.value.purpose?.trim()) formErrors.value.push("กรุณาระบุจุดประสงค์/ต้นทาง");
  if (!form.value.destination?.trim()) formErrors.value.push("กรุณาระบุปลายทาง");
  if (formErrors.value.length) return;
  if (new Date(startIso) >= new Date(endIso)) {
    formErrors.value.push("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
    return;
  }

  const msDay = 24 * 3600 * 1000;
  const durationDays =
    Math.ceil((new Date(endIso).getTime() - new Date(startIso).getTime()) / msDay) || 1;

  if (durationDays > 3) {
    formErrors.value.push("จองได้ไม่เกิน 3 วัน");
    return;
  }
  const useDurationRule = false;
  const computedStatus = useDurationRule ? (durationDays > 2 ? "pending" : "approved") : "approved";

  const payload: any = {
    car_id: form.value.car_id,
    user_id: form.value.user_id,
    start_datetime: startIso,
    end_datetime: endIso,
    purpose: form.value.purpose || null,
    destination: form.value.destination || null,
    status: computedStatus,
  };

  try {
    const url = form.value.id
      ? `${API_BASE}/api/booking/${form.value.id}`
      : `${API_BASE}/api/booking`;
    const method = form.value.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await loadWeek();
      closeBooking();
      return;
    }
    const data = await res.json().catch(() => ({ message: "บันทึกการจองไม่สำเร็จ" }));
    if (res.status === 409) {
      showPopup(data.message || "ช่วงเวลานี้มีการจองแล้ว", {
        type: "warning",
        title: "ไม่สามารถจองได้",
      });
    } else {
      showPopup(data.message || "บันทึกการจองไม่สำเร็จ", { type: "error" });
    }
  } catch (err) {
    console.error("submitBooking error", err);
    showPopup("บันทึกไม่สำเร็จ กรุณาลองใหม่หรือตรวจสอบคอนโซล", { type: "error" });
  }
};

const viewHistory = async (car: any) => {
  const res = await fetch(`${API_BASE}/api/booking/car/${car.id}/history`);
  const data = await res.json();
  history.value = data.data || [];
  historyCar.value = car;
  showHistory.value = true;
};

const cancelModalVisible = ref(false);
const cancelTarget = ref<any | null>(null);

const closeCancel = () => {
  cancelModalVisible.value = false;
  cancelTarget.value = null;
};

// helper to get car name for cancel modal (safe)
const cancelTargetCarName = computed(() => {
  if (!cancelTarget.value) return "";
  const c = cars.value.find((x) => Number(x.id) === Number(cancelTarget.value.car_id));
  return c?.name || `#${cancelTarget.value.car_id}`;
});

// small formatter for modal display
const smallFormat = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

// perform cancel without built-in confirm (used by modal)
const performCancel = async (b: any) => {
  try {
    const res = await fetch(`${API_BASE}/api/booking/${b.id}/cancel`, { method: "PUT" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: "ยกเลิกไม่สำเร็จ" }));
      showPopup(data.message || "ยกเลิกไม่สำเร็จ", { type: "error" });
      return false;
    }
    await loadWeek();
    return true;
  } catch (err) {
    console.error("performCancel error", err);
    showPopup("ยกเลิกไม่สำเร็จ กรุณาตรวจสอบคอนโซล", { type: "error" });
    return false;
  }
};

const confirmCancel = async () => {
  if (!cancelTarget.value) return closeCancel();
  const ok = await performCancel(cancelTarget.value);
  if (ok) closeCancel();
};

watch(() => props.filterCar, loadWeek);
defineExpose({ openBooking, loadWeek });

// Mobile specific helpers
const hasBooking = (car: any, day: any) => {
  const carId = String(car.id);
  const dayKey = day.date;
  return (
    bookingsByCarDay.value[carId] &&
    bookingsByCarDay.value[carId][dayKey] &&
    bookingsByCarDay.value[carId][dayKey].length > 0
  );
};

const getBookingCount = (car: any, day: any) => {
  const carId = String(car.id);
  const dayKey = day.date;
  return bookingsByCarDay.value[carId]?.[dayKey]?.length || 0;
};

const getDayClass = (car: any, day: any) => {
  const isBooked = hasBooking(car, day);
  const isToday = day.date === new Date().toISOString().slice(0, 10);
  
  if (isBooked) {
    return "bg-blue-500 border-blue-600 shadow-md";
  }
  if (isToday) {
    return "bg-gray-200 border-blue-400 ring-2 ring-blue-100";
  }
  return "bg-white border-gray-200";
};

const handleDayClick = (car: any, day: any) => {
  const carId = String(car.id);
  const dayKey = day.date;
  const dayBookings = bookingsByCarDay.value[carId]?.[dayKey] || [];

  if (dayBookings.length > 0) {
    // Show first booking details
    openBookingEdit(dayBookings[0]);
  } else {
    // New booking
    openBooking(car);
    form.value.start_date = day.date;
    form.value.end_date = day.date;
  }
};
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

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

/* booking modal new styling - REMOVED, using Tailwind classes */

/* popup styling */
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
  width: min(90vw, 320px);
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
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.ui-popup-message {
  font-size: 0.95rem;
  color: #475569;
  margin-bottom: 1.5rem;
}
.ui-popup-button {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background: #0f172a;
  color: #fff;
  font-weight: 600;
  transition: background 0.15s ease;
}
.ui-popup-button:hover {
  background: #1e293b;
}
</style>
