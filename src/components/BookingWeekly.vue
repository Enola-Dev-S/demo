<template>
  <div class="p-2 w-full bg-gray-100 rounded-xl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <button
          @click="prevWeek"
          class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg"
        >
          ‹
        </button>
        <div class="text-xl font-semibold">{{ weekRangeLabel }}</div>
        <button
          @click="nextWeek"
          class="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg"
        >
          ›
        </button>

        <!-- small calendar / pick date to jump -->
        <input
          type="date"
          v-model="pickedDate"
          @change="jumpToDate"
          class="ml-4 border rounded px-2 py-1"
        />
      </div>

      <div class="flex items-center space-x-3">
        <select v-model="filterCar" @change="loadWeek" class="border rounded px-2 py-1">
          <option value="">All cars</option>
          <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button
          @click="openBooking(null)"
          class="hover:bg-blue-300 bg-blue-600 text-white px-3 py-1 rounded"
        >
          New Booking
        </button>
        <button @click="loadWeek" class="px-3 py-1 bg-white hover:bg-gray-300 rounded">
          Refresh
        </button>
      </div>
    </div>

    <!-- Weekly grid -->
    <div class="bg-white rounded shadow overflow-auto">
      <div class="grid grid-cols-[260px_1fr] border-b bg-gray-50">
        <div class="p-2 text-sm font-medium border-r">Car / Day</div>
        <div class="flex">
          <div v-for="d in weekDays" :key="d.date" class="flex-1 text-center p-2 text-sm border-l">
            <div class="font-semibold">{{ d.labelShort }}</div>
            <div class="text-xs text-gray-500">{{ d.labelDate }}</div>
          </div>
        </div>
      </div>

      <div>
        <div
          v-for="car in filteredCars"
          :key="car.id"
          class="grid grid-cols-[260px_1fr] items-start border-t"
        >
          <!-- car column -->
          <div class="p-3 border-r">
            <div class="font-medium">{{ car.name }}</div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <div :class="`inline-block px-2 py-0.5 rounded text-xxs ${statusClass(car.status)}`">
                {{ car.status || "-" }}
              </div>
              <div v-if="car.img" class="car-img-chip">
                <span class="car-img-chip-label">IMG</span>
                <img
                  :src="getCarImgUrl(car.img)"
                  alt="car preview"
                  class="car-img-chip-preview"
                  loading="lazy"
                />
              </div>
            </div>

            <div class="mt-3 space-y-2">
              <button
                @click="openBooking(car)"
                class="text-sm w-full px-2 py-1 bg-green-200 hover:bg-green-500 text-green-700 rounded"
              >
                จอง-Booking
              </button>
              <button
                @click="viewHistory(car)"
                class="text-sm w-full px-2 py-1 bg-gray-200 hover:bg-gray-100 rounded"
              >
                ประวัติ-History
              </button>
            </div>
          </div>

          <!-- days columns -->
          <div class="flex">
            <div v-for="d in weekDays" :key="d.date" class="flex-1 p-2 min-h-24 border-l relative">
              <!-- times summary (small) -->
              <div
                v-if="bookingsByCarDay[String(car.id)] && bookingsByCarDay[String(car.id)][d.date]"
                class="space-y-2"
              >
                <div
                  v-for="b in bookingsByCarDay[String(car.id)][d.date]"
                  :key="b.id"
                  :class="bookingSummaryClass(b)"
                >
                  <div class="flex items-start justify-between">
                    <div class="pr-2">
                      <div class="font-semibold truncate">{{ b.user_name || b.user_id }}</div>
                      <div class="truncate">
                        {{ formatTime(b.start_datetime) }} - {{ formatTime(b.end_datetime) }}
                        <span class="ml-2 text-xxs text-white/90">({{ bookingDays(b) }}d)</span>
                      </div>
                      <div class="text-xxs text-white/90 truncate">
                        {{ b.destination || b.purpose }}
                      </div>
                    </div>

                    <!-- status badge -->
                    <div class="ml-2">
                      <span
                        :class="`inline-block px-2 py-0.5 rounded text-xxs ${statusClass(
                          b.status
                        )}`"
                      >
                        {{ b.status }}
                      </span>
                    </div>
                  </div>

                  <div class="absolute right-2 top-8 flex space-x-1">
                    <button
                      v-if="
                        (isOwner(b) || isAdmin) &&
                        String(b?.status || '').toLowerCase() !== 'cancelled'
                      "
                      @click.stop="showCancelConfirm(b)"
                      class="text-xxs px-2 py-0.5 bg-white/20 rounded hover:bg-white/50 hover:text-white-900"
                    >
                      Cancel
                    </button>
                    <button
                      v-if="
                        (isOwner(b) || isAdmin) &&
                        String(b?.status || '').toLowerCase() !== 'cancelled'
                      "
                      @click.stop="openBookingEdit(b)"
                      class="text-xxs px-2 py-0.5 bg-white/20 rounded hover:bg-white/50 hover:text-white-900"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-xs text-gray-400 text-center py-4">-</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <transition name="modal">
      <div v-if="showBooking" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="closeBooking"></div>
        <div class="booking-modal-card">
          <div class="booking-modal-header">
            <div class="booking-modal-icon">🚗</div>
            <div>
              <p class="booking-modal-eyebrow">
                {{ editingBooking ? "แก้ไขการจอง" : "สร้างการจองใหม่" }}
              </p>
              <h3 class="booking-modal-title">
                {{ editingBooking ? "Edit Booking" : "New Booking" }}
              </h3>
            </div>
          </div>

          <form @submit.prevent="submitBooking" class="booking-modal-form">
            <div v-if="formErrors.length" class="booking-modal-errors">
              <div class="font-medium">กรอกข้อมูลให้ครบก่อนบันทึก:</div>
              <ul>
                <li v-for="(err, idx) in formErrors" :key="idx">{{ err }}</li>
              </ul>
            </div>

            <div class="form-group">
              <label>SelectCar-เลือกรถ</label>
              <select v-model="form.car_id" required>
                <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="schedule-grid">
              <div class="schedule-card">
                <div class="schedule-card-header">
                  <div>
                    <p class="schedule-card-title">ช่วงเวลาเริ่มต้น</p>
                    <p class="schedule-card-caption">วันที่และเวลารับรถ</p>
                  </div>
                  <span class="schedule-chip">Start</span>
                </div>

                <div class="schedule-card-body">
                  <div class="schedule-input">
                    <label>วันที่</label>
                    <input type="date" v-model="form.start_date" required />
                  </div>
                  <div class="schedule-input">
                    <label>เวลา</label>
                    <input type="time" v-model="form.start_time" required />
                  </div>
                </div>
              </div>

              <div class="schedule-card">
                <div class="schedule-card-header">
                  <div>
                    <p class="schedule-card-title">ช่วงเวลาสิ้นสุด</p>
                    <p class="schedule-card-caption">วันที่และเวลาคืนรถ</p>
                  </div>
                  <span class="schedule-chip">End</span>
                </div>

                <div class="schedule-card-body">
                  <div class="schedule-input">
                    <label>วันที่</label>
                    <input type="date" v-model="form.end_date" required />
                  </div>
                  <div class="schedule-input">
                    <label>เวลา</label>
                    <input type="time" v-model="form.end_time" required />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Purpose-ต้นทาง</label>
              <input v-model="form.purpose" type="text" placeholder="Fatima R.B.D.S." />
            </div>

            <div class="form-group">
              <label>Destination-ปลายทาง</label>
              <input
                v-model="form.destination"
                type="text"
                placeholder="เช่น สำนักงาน/ลูกค้า/พื้นที่ปฏิบัติงาน"
              />
            </div>

            <div class="booking-modal-actions">
              <button type="button" @click="closeBooking" class="btn ghost">ยกเลิก</button>
              <button type="submit" class="btn primary">
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
        <div class="bg-white rounded-2xl shadow-lg z-50 w-full max-w-3xl p-8">
          <h3 class="text-lg font-semibold mb-2">History - {{ historyCar?.name }}</h3>
          <div class="max-h-80 overflow-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-2">#</th>
                  <th class="p-2">User</th>
                  <th class="p-2">From</th>
                  <th class="p-2">To</th>
                  <th class="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(h, i) in history" :key="h.id" class="border-t">
                  <td class="p-2">{{ i + 1 }}</td>
                  <td class="p-2">{{ h.user_name || h.user_id }}</td>
                  <td class="p-2">{{ formatDatetime(h.start_datetime) }}</td>
                  <td class="p-2">{{ formatDatetime(h.end_datetime) }}</td>
                  <td class="p-2">{{ h.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3 text-right">
            <button @click="showHistory = false" class="px-3 py-1 bg-gray-200 rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Cancel confirmation modal (styled) -->
    <transition name="modal">
      <div v-if="cancelModalVisible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="closeCancel"></div>
        <div class="bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div
                class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold"
              >
                !
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold">ยืนยันยกเลิกการจอง</h3>
              <p class="text-sm text-gray-600 mt-1">
                คุณต้องการยกเลิกการจองของ
                <strong>{{ cancelTarget?.user_name || cancelTarget?.user_id }}</strong>
                สำหรับรถ <strong>{{ cancelTargetCarName }}</strong> หรือไม่? <br />
                (วันที่: {{ smallFormat(cancelTarget?.start_datetime) }} —
                {{ smallFormat(cancelTarget?.end_datetime) }})
              </p>

              <div class="mt-4 flex justify-end space-x-2">
                <button @click="closeCancel" class="px-3 py-1 bg-gray-100 rounded">ยกเลิก</button>
                <button
                  @click="confirmCancel"
                  class="px-3 py-1 bg-red-600 text-white rounded shadow"
                >
                  ยืนยันยกเลิก
                </button>
              </div>
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
import { API_BASE, authHeader } from "@/config";

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
// whenever weekStartDate changes, reload bookings for that week
watch(weekStartDate, () => {
  loadWeek().catch(() => {});
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
const bookings = ref<any[]>([]);
const bookingsByCarDay = ref<Record<string, Record<string, any[]>>>({});
const filterCar = ref<string | number>("");
const serverBase = API_BASE;

// computed list used by template
const filteredCars = computed(() => {
  if (!cars.value) return [];
  if (!filterCar.value && filterCar.value !== 0) return cars.value;
  return cars.value.filter((c) => String(c.id) === String(filterCar.value));
});

// user info
const customerId = ref(Number(localStorage.getItem("userId") || 0));
watch(
  () => localStorage.getItem("userId"),
  (v) => (customerId.value = Number(v || 0))
);
console.log("userId=", customerId.value);
// user role / permissions
const userRole = ref(localStorage.getItem("userRole") || localStorage.getItem("role") || "");
watch(
  () => localStorage.getItem("userRole"),
  (v) => (userRole.value = v || "")
);
console.log("userRole=", userRole.value);

const isAdmin = computed(() =>
  ["administrator", "superadmin"].includes(String(userRole.value).toLowerCase())
);
const isNotCancelled = computed(
  () => !["cancelled"].includes(String(userRole.value).toLowerCase())
);
const isOwner = (b: any) => Number(b?.user_id) === Number(customerId.value);

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
  const res = await fetch(`${API_BASE}/api/car`, { headers: authHeader() });
  const data = await res.json();
  cars.value = data.data || [];
  if (!form.value.car_id && cars.value.length) form.value.car_id = cars.value[0].id;
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
  if (filterCar.value) params.set("car_id", String(filterCar.value));

  console.log(
    "[BookingWeekly] loadWeek ->",
    weekStart.toISOString(),
    weekEnd.toISOString(),
    "filterCar=",
    filterCar.value
  );

  const res = await fetch(`${API_BASE}/api/booking?${params.toString()}`, { headers: authHeader() });
  const data = await res.json();
  bookings.value = data.data || [];
  console.log("[BookingWeekly] bookings fetched:", bookings.value.length);

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
  console.log(
    "[BookingWeekly] bookingsByCarDay keys:",
    Object.keys(bookingsByCarDay.value).slice(0, 10)
  );
};

const loadAll = async () => {
  await loadCars();
  await loadWeek();
};

onMounted(loadAll);

// helpers
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDatetime = (iso: string) => new Date(iso).toLocaleString();
const canCancel = (b: any) =>
  b &&
  b.status !== "cancelled" &&
  b.status !== "completed" &&
  new Date(b.start_datetime).getTime() >= Date.now() - 5 * 60000;

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

const closeBooking = () => {
  showBooking.value = false;
  editingBooking.value = null;
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

// submitBooking: set status based on duration (1-2 days -> auto-approve, >2 days -> pending)
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
  const useDurationRule = false; // อนาคตสามารถเปลี่ยนเป็น true เพื่อกลับมาใช้เงื่อนไขเดิม
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

const cancelBooking = async (b: any) => {
  if (!confirm("Confirm cancel booking?")) return;
  const res = await fetch(`${API_BASE}/api/booking/${b.id}/cancel`, { method: "PUT" });
  if (res.ok) await loadWeek();
};

const viewHistory = async (car: any) => {
  const res = await fetch(`${API_BASE}/api/booking/car/${car.id}/history`, { headers: authHeader() });
  const data = await res.json();
  history.value = data.data || [];
  historyCar.value = car;
  showHistory.value = true;
};

const cancelModalVisible = ref(false);
const cancelTarget = ref<any | null>(null);

const showCancelConfirm = (b: any) => {
  cancelTarget.value = b;
  cancelModalVisible.value = true;
};

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
    const res = await fetch(`${API_BASE}/api/booking/${b.id}/cancel`, { method: "PUT", headers: authHeader() });
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

// Note: existing cancelBooking(b) function remains for any other quick-cancel uses,
// but the visible Cancel button now opens the styled modal.

// add helpers for multi-day summary
const msDay = 24 * 3600 * 1000;

const bookingDays = (b: any) => {
  if (!b || !b.start_datetime || !b.end_datetime) return 1;
  try {
    const start = new Date(b.start_datetime).getTime();
    const end = new Date(b.end_datetime).getTime();
    const days = Math.max(1, Math.ceil((end - start) / msDay));
    return days;
  } catch {
    return 1;
  }
};

const bookingSummaryClass = (b: any) => {
  const days = bookingDays(b);
  // special cancelled styling
  if (String(b?.status || "").toLowerCase() === "cancelled") {
    return "bg-gradient-to-r text-white rounded p-2 text-xs shadow relative from-red-500 to-red-200";
  }
  // 2 days -> indigo, >2 -> violet, else default sky
  const gradient =
    days === 2
      ? "from-indigo-700 to-indigo-400"
      : days > 2
      ? "from-violet-700 to-violet-400"
      : "from-sky-700 to-sky-400";

  return `bg-gradient-to-r text-white rounded p-2 text-xs shadow relative ${gradient}`;
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
