<template>
  <!-- customer one-line info -->
  <!-- <div class="flex items-center justify-between mb-4">
    <div class="flex items-center space-x-4">
      <div class="flex items-center justify-center bg-blue-600 text-white rounded-full w-12 h-12 text-lg font-semibold">
        {{ customerInitials }}
      </div>
      <div>
        <div class="text-sm font-semibold text-gray-800">
          {{ customerName }} <span class="text-xs text-gray-500">(#{{ customerId }})</span>
        </div>
        <div class="text-xs text-gray-500">{{ customerEmail }}</div>
      </div>
    </div>
  </div> -->

  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <button @click="prevDay" class="px-3 py-1 bg-gray-200 rounded">‹</button>
        <div class="text-lg font-semibold">{{ displayDate }}</div>
        <button @click="nextDay" class="px-3 py-1 bg-gray-200 rounded">›</button>
        <input type="date" v-model="selectedDate" @change="loadAll" class="ml-4 border rounded px-2 py-1" />
      </div>

      <div class="flex items-center space-x-3">
        <select v-model="filterCar" @change="loadBookings" class="border rounded px-2 py-1">
          <option value="">All cars</option>
          <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <button @click="openBooking(null)" class="bg-blue-600 text-white px-3 py-1 rounded">New Booking</button>
        <button @click="loadAll" class="px-3 py-1 bg-gray-100 rounded">Refresh</button>
      </div>
    </div>

    <!-- Timeline heading -->
    <div class="flex border rounded-t bg-gray-50">
      <div class="w-48 p-2 text-sm font-medium border-r">Car / Time</div>
      <div class="flex-1 overflow-auto">
        <div class="flex" :style="{ minWidth: timelineWidth + 'px' }">
          <div v-for="h in hours" :key="h" class="w-slot text-center text-xs border-r py-2">
            {{ h }}:00
          </div>
        </div>
      </div>
    </div>

    <!-- Rows: each car -->
    <div class="bg-white rounded-b shadow-sm divide-y">
      <div v-for="car in filteredCars" :key="car.id" class="flex items-stretch">
        <div class="w-48 p-2 border-r">
          <div class="font-medium">{{ car.name }}</div>
          <div class="text-xs text-gray-500">{{ car.status }}</div>

          <div class="mt-3 space-y-2">
            <button @click="openBooking(car)" class="text-sm w-full px-2 py-1 bg-green-50 text-green-700 rounded">Book</button>
            <button @click="viewHistory(car)" class="text-sm w-full px-2 py-1 bg-gray-50 rounded">History</button>
          </div>
        </div>

        <div class="flex-1 overflow-auto relative p-2">
          <div class="flex" :style="{ minWidth: timelineWidth + 'px', height: rowHeight + 'px' }">
            <!-- background slots -->
            <div v-for="h in hours" :key="h" class="w-slot border-r h-full"></div>

            <!-- bookings for this car -->
            <div v-for="b in bookingsByCar[car.id] || []" :key="b.id"
                 class="absolute top-6 rounded-md text-xs text-white px-2 py-1 shadow"
                 :style="bookingStyle(b)"
                 :title="tooltipText(b)">
              <div class="font-semibold truncate">{{ b.user_name || 'User' }}</div>
              <div class="truncate">{{ shortRange(b.start_datetime, b.end_datetime) }}</div>

              <div class="mt-1 flex space-x-1">
                <button v-if="canCancel(b)" @click.stop="cancelBooking(b)" class="text-xs px-2 py-0.5 bg-white/20 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div> <!-- end car row -->
    </div>

    <!-- Booking modal -->
    <transition name="modal">
      <div v-if="showBooking" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="closeBooking"></div>
        <div class="bg-white rounded shadow-lg z-50 w-full max-w-lg p-6">
          <h3 class="text-lg font-semibold mb-3">{{ editingBooking ? 'Edit Booking' : 'New Booking' }}</h3>
          <form @submit.prevent="submitBooking" class="space-y-3">
            <div>
              <label class="block text-sm">Car</label>
              <select v-model="form.car_id" required class="w-full border rounded px-2 py-1">
                <option v-for="c in cars" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm">Start Date</label>
                <input type="date" v-model="form.start_date" required class="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label class="block text-sm">Start Time</label>
                <input type="time" v-model="form.start_time" required class="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label class="block text-sm">End Date</label>
                <input type="date" v-model="form.end_date" required class="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label class="block text-sm">End Time</label>
                <input type="time" v-model="form.end_time" required class="w-full border rounded px-2 py-1" />
              </div>
            </div>

            <div>
              <label class="block text-sm">Purpose</label>
              <input v-model="form.purpose" type="text" class="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label class="block text-sm">Destination</label>
              <input v-model="form.destination" type="text" class="w-full border rounded px-2 py-1" />
            </div>

            <div class="flex justify-end space-x-2">
              <button type="button" @click="closeBooking" class="px-3 py-1 bg-gray-100 rounded">Cancel</button>
              <button type="submit" class="px-3 py-1 bg-blue-600 text-white rounded">{{ editingBooking ? 'Update' : 'Book' }}</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- History modal -->
    <transition name="modal">
      <div v-if="showHistory" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="showHistory=false"></div>
        <div class="bg-white rounded shadow-lg z-50 w-full max-w-2xl p-6">
          <h3 class="text-lg font-semibold mb-2">History - {{ historyCar?.name }}</h3>
          <div class="max-h-80 overflow-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-100"><tr><th class="p-2">#</th><th class="p-2">User</th><th class="p-2">From</th><th class="p-2">To</th><th class="p-2">Status</th></tr></thead>
              <tbody>
                <tr v-for="(h,i) in history" :key="h.id" class="border-t">
                  <td class="p-2">{{ i+1 }}</td>
                  <td class="p-2">{{ h.user_name }}</td>
                  <td class="p-2">{{ formatDatetime(h.start_datetime) }}</td>
                  <td class="p-2">{{ formatDatetime(h.end_datetime) }}</td>
                  <td class="p-2">{{ h.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-3 text-right"><button @click="showHistory=false" class="px-3 py-1 bg-gray-200 rounded">Close</button></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const apiBase = 'http://localhost:3000'
const hours = Array.from({ length: 13 }, (_, i) => 8 + i) // 8..20
const slotWidth = 80 // px per hour
const timelineWidth = hours.length * slotWidth
const rowHeight = 72

const cars = ref<any[]>([])
const bookings = ref<any[]>([])
const bookingsByCar = ref<Record<number, any[]>>({})
const filterCar = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const showBooking = ref(false)
const showHistory = ref(false)
const history = ref<any[]>([])
const historyCar = ref<any | null>(null)
const editingBooking = ref<any | null>(null)

// customer display (one-line)
const customerName = ref<string>('')
const customerEmail = ref<string>('')
const customerId = ref<number>(0)
const customerInitials = computed(() => {
  const name = (customerName.value || 'Guest User').trim()
  const parts = name.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + (parts[1][0] || '')).toUpperCase()
})

function loadUserFromStorage() {
  customerName.value =
    localStorage.getItem('username') ||
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    ''

  customerEmail.value =
    localStorage.getItem('userEmail') ||
    localStorage.getItem('email') ||
    ''

  customerId.value = Number(
    localStorage.getItem('userId') ||
      localStorage.getItem('id') ||
      0
  )

  // try parse token payload if some fields still missing
  const token = localStorage.getItem('token')
  if (token && (customerName.value === '' || !customerId.value)) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      customerName.value = customerName.value || payload.name || payload.username || payload.fullname || ''
      customerEmail.value = customerEmail.value || payload.email || ''
      customerId.value = customerId.value || Number(payload.userId ?? payload.id ?? 0)
    } catch (e) { /* ignore invalid token */ }
  }
}

const form = ref({
  car_id: null as number | null,
  user_id: 1,
  start_date: selectedDate.value,
  start_time: '09:00',
  end_date: selectedDate.value,
  end_time: '10:00',
  purpose: '',
  destination: ''
})

const displayDate = computed(() => {
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
})

const filteredCars = computed(() => (filterCar.value ? cars.value.filter(c => c.id == Number(filterCar.value)) : cars.value))

const loadCars = async () => {
  const res = await fetch(`${apiBase}/api/car`)
  const data = await res.json()
  cars.value = data.data || []
  if (!form.value.car_id && cars.value.length) form.value.car_id = cars.value[0].id
}

const loadBookings = async () => {
  const q = new URLSearchParams()
  q.set('date', selectedDate.value)
  if (filterCar.value) q.set('car_id', filterCar.value)
  const res = await fetch(`${apiBase}/api/booking?${q.toString()}`)
  const data = await res.json()
  bookings.value = data.data || []
  const map: Record<number, any[]> = {}
  bookings.value.forEach((b: any) => {
    map[b.car_id] = map[b.car_id] || []
    map[b.car_id].push(b)
  })
  bookingsByCar.value = map
}

const loadAll = async () => {
  await loadUserFromStorage()
  await loadCars()
  await loadBookings()
}

onMounted(() => loadAll())

// keep form.user_id in sync with loaded customerId
watch(customerId, (v) => {
  if (v) form.value.user_id = v
})

// helpers
const hoursBetween = (startISO: string, endISO: string) => {
  const s = new Date(startISO), e = new Date(endISO)
  const diffH = (e.getTime() - s.getTime()) / 3600000
  return { start: s, end: e, hours: diffH }
}

const bookingStyle = (b: any) => {
  const s = new Date(b.start_datetime)
  const e = new Date(b.end_datetime)
  const startPx = Math.max(0, (s.getHours() + s.getMinutes() / 60 - 8) * slotWidth)
  const endPx = Math.min(hours.length * slotWidth, (e.getHours() + e.getMinutes() / 60 - 8) * slotWidth)
  const left = startPx
  const width = Math.max(28, endPx - startPx)
  const bg = b.status === 'approved' ? '#059669' : b.status === 'pending' ? '#c084fc' : '#ef4444'
  return {
    left: left + 'px',
    width: width + 'px',
    height: (rowHeight - 16) + 'px',
    background: bg
  }
}

const shortRange = (s: string, e: string) => {
  const ds = new Date(s), de = new Date(e)
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${fmt(ds)} - ${fmt(de)}`
}

const tooltipText = (b: any) => `${b.user_name || 'User'}\n${formatDatetime(b.start_datetime)} → ${formatDatetime(b.end_datetime)}\n${b.purpose || ''}`

const canCancel = (b: any) => {
  if (!b) return false
  const now = Date.now()
  return b.status !== 'cancelled' && b.status !== 'completed' && new Date(b.start_datetime).getTime() >= now - 5 * 60000
}

const openBooking = (car: any | null) => {
  editingBooking.value = null
  showBooking.value = true
  form.value.car_id = car?.id ?? cars.value[0]?.id ?? null
  form.value.start_date = selectedDate.value
  form.value.end_date = selectedDate.value
  form.value.start_time = '09:00'
  form.value.end_time = '17:00'
  form.value.purpose = ''
  form.value.destination = ''
}

const closeBooking = () => {
  showBooking.value = false
  editingBooking.value = null
}

const submitBooking = async () => {
  // build ISO datetimes
  const start = `${form.value.start_date}T${form.value.start_time}:00`
  const end = `${form.value.end_date}T${form.value.end_time}:00`
  const payload = {
    car_id: form.value.car_id,
    user_id: form.value.user_id,
    start_datetime: start,
    end_datetime: end,
    purpose: form.value.purpose,
    destination: form.value.destination
  }
  const res = await fetch(`${apiBase}/api/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.ok) {
    await loadBookings()
    closeBooking()
  } else {
    const err = await res.json().catch(() => ({ message: 'Booking failed' }))
    alert(err.message || 'Booking failed')
  }
}

const cancelBooking = async (b: any) => {
  if (!confirm('Confirm cancel booking?')) return
  const res = await fetch(`${apiBase}/api/booking/${b.id}/cancel`, { method: 'PUT' })
  if (res.ok) await loadBookings()
}

const viewHistory = async (car: any) => {
  const res = await fetch(`${apiBase}/api/booking/car/${car.id}/history`)
  const data = await res.json()
  history.value = data.data || []
  historyCar.value = car
  showHistory.value = true
}

const formatDatetime = (s: string) => {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleString()
}

const prevDay = () => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 1)
  selectedDate.value = d.toISOString().slice(0, 10)
  loadBookings()
}
const nextDay = () => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 1)
  selectedDate.value = d.toISOString().slice(0, 10)
  loadBookings()
}
</script>

<style scoped>
.w-slot { width: 80px; min-width:80px; border-left: 1px solid rgba(0,0,0,0.04); }
.modal-enter-active, .modal-leave-active { transition: opacity .12s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: translateY(6px) scale(.98); }
</style>