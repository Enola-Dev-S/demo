<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Car Management</h2>
      <button 
        @click="openAdd()"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add New Car
      </button>
    </div>

    <!-- Cars Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Img</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="car in cars" :key="car.id">
            <td class="px-6 py-4">{{ car.name }}</td>
            <td class="px-6 py-4">
              <span :class="statusClass(car.status)">{{ car.status }}</span>
            </td>
            <td class="px-6 py-4">{{ car.start_date }}</td>
            <td class="px-6 py-4">{{ car.end_dete }}</td>
            <td class="px-6 py-4">
              <div class="img-wrap" v-if="car.img" >
                <img
                  :src="getImgUrl(car.img)"
                  alt="img"                  class="img-thumb"
                />
                <img
                  :src="getImgUrl(car.img)"
                  alt="preview"
                  class="img-preview"
                  :style="{ width: previewWidth + 'px', height: previewHeight + 'px' }"
                />
              </div>
              <span v-else class="text-sm text-gray-400">-</span>
            </td>
            <td class="px-6 py-4 space-x-2">
              <button 
                @click="openEdit(car)"
                class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
              >
                Edit
              </button>
              <button 
                @click="confirmDelete(car.id!)"
                class="inline-flex items-center px-3 py-1.5 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <transition name="modal" appear>
      <div v-if="showForm" class="fixed inset-0 z-40 flex items-center justify-center">
        <div class="fixed inset-0 bg-black opacity-40" @click="closeForm"></div>
        <div class="bg-white rounded-lg shadow-lg z-50 w-full max-w-2xl mx-4 p-6 transform transition-all">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">{{ editingCar ? 'Edit Car' : 'Add New Car' }}</h3>
            <button @click="closeForm" class="text-gray-500 hover:text-gray-800">✕</button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input v-model="formData.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select v-model="formData.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input v-model="formData.start_date" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <input v-model="formData.end_dete" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Image</label>
              <div class="flex items-center space-x-3">
                <button type="button" @click="triggerFileInput" class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Choose Image</button>
                <span class="text-sm text-gray-600" v-if="formData.img">{{ formData.img }}</span>
                <span class="text-sm text-gray-400" v-else>No file chosen</span>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
              <div v-if="preview" class="mt-3">
                <img :src="preview" alt="preview" class="h-32 w-auto rounded border" />
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-4">
              <button type="button" @click="closeForm" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                {{ editingCar ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Confirm Modal -->
    <transition name="modal" appear>
      <div v-if="showDelete" class="fixed inset-0 z-40 flex items-center justify-center">
        <div class="fixed inset-0 bg-black opacity-40" @click="showDelete = false"></div>
        <div class="bg-white rounded-lg shadow-lg z-50 w-full max-w-sm mx-4 p-6 text-center">
          <h4 class="text-lg font-semibold mb-2">Confirm delete</h4>
          <p class="text-sm text-gray-600 mb-4">ต้องการลบรายการนี้ใช่หรือไม่?</p>
          <div class="flex justify-center space-x-3">
            <button @click="showDelete = false" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button @click="doDelete" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { auto } from '@popperjs/core'
import { ref, onMounted } from 'vue'

interface Car {
  id?: number
  name: string
  status: string
  start_date: string
  end_dete: string
  img?: string
}

const cars = ref<Car[]>([])
const editingCar = ref<Car | null>(null)
const showForm = ref(false)
const showDelete = ref(false)
const preview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const confirmDeleteId = ref<number | null>(null)

const formData = ref<Car>({
  name: '',
  status: 'available',
  start_date: new Date().toISOString().slice(0,10),
  end_dete: new Date().toISOString().slice(0,10),
  img: ''
})

const statuses = ['available', 'maintenance', 'booked']
const apiBase = 'http://localhost:3000/api/car'
const serverBase = 'http://localhost:3000'
const fileInput = ref<HTMLInputElement | null>(null)
const previewWidth = ref<number>(800)   // ปรับเป็นขนาดที่ต้องการ
const previewHeight = ref<number>(800)  // ปรับเป็นขนาดที่ต้องการ

const getImgUrl = (img?: string) => {
  if (!img) return ''
  if (img.startsWith('http')) return img
  return `${serverBase}/imgcar/${img}`
}

// convert various date formats -> YYYY-MM-DD for <input type="date">
const toInputDate = (val?: string) => {
  if (!val) return ''
  // dd-mm-yyyy -> yyyy-mm-dd
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split('-')
    return `${y}-${m}-${d}`
  }
  // ISO or other parseable -> local yyyy-mm-dd
  const dt = new Date(val)
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return val
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  if (!file) return
  selectedFile.value = file
  formData.value.img = file.name
  // preview using object URL
  preview.value && URL.revokeObjectURL(preview.value)
  preview.value = URL.createObjectURL(file)
  // if you want base64 instead:
  // const reader = new FileReader()
  // reader.onload = () => { formData.value.img = reader.result as string }
  // reader.readAsDataURL(file)
}


const openEdit = (car: Car) => {
  editingCar.value = car
  formData.value = { 
    ...car,
    start_date: toInputDate(car.start_date),
    end_dete: toInputDate(car.end_dete)
  }
  preview.value = car.img ? getImgUrl(car.img) : null
  showForm.value = true
}

const openAdd = () => {
  editingCar.value = null
  resetForm()
  showForm.value = true
}

const closeForm = () => {
  resetForm()
  showForm.value = false
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleSubmit = async () => {
  try {
    const url = editingCar.value && editingCar.value.id ? `${apiBase}/${editingCar.value.id}` : apiBase
    const method = editingCar.value && editingCar.value.id ? 'PUT' : 'POST'
    const body = new FormData()
    body.append('name', formData.value.name)
    body.append('status', formData.value.status)
    body.append('start_date', formData.value.start_date)
    body.append('end_dete', formData.value.end_dete)
    if (selectedFile.value) body.append('img', selectedFile.value)
    else if (formData.value.img) body.append('img', formData.value.img)

    await fetch(url, { method, body })
    await loadCars()
    closeForm()
  } catch (error) {
    console.error('Error:', error)
  }
}

const confirmDelete = (id: number) => {
  confirmDeleteId.value = id
  showDelete.value = true
}

const doDelete = async () => {
  if (!confirmDeleteId.value) return
  try {
    await fetch(`${apiBase}/${confirmDeleteId.value}`, { method: 'DELETE' })
    showDelete.value = false
    await loadCars()
  } catch (error) {
    console.error('Delete error:', error)
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    status: 'available',
    start_date: new Date().toISOString().slice(0,10),
    end_dete: new Date().toISOString().slice(0,10),
    img: ''
  }
  editingCar.value = null
  selectedFile.value = null
  preview.value && URL.revokeObjectURL(preview.value)
  preview.value = null
}

const loadCars = async () => {
  try {
    const res = await fetch(apiBase)
    const data = await res.json()
    const rows = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
    cars.value = rows.map((r: any) => ({
      id: r.id,
      name: r.name ?? '',
      status: r.status ?? 'available',
      start_date: r.start_date ?? '',
      end_dete: r.end_dete ?? '',
      img: r.img ?? ''
    }))
  } catch (error) {
    console.error('Error loading cars:', error)
  }
}

const statusClass = (status: string) => ({
  'px-2 py-1 rounded text-xs font-medium': true,
  'bg-green-100 text-green-800': status === 'available',
  'bg-yellow-100 text-yellow-800': status === 'maintenance',
  'bg-blue-100 text-blue-800': status === 'booked'
})

onMounted(() => { loadCars() })
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .18s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: translateY(6px) scale(.98); }

/* Image hover preview */
.img-wrap { position: relative; display: inline-block; }
.img-thumb {
  height: 80px;
  width: auto;
  border-radius: 6px;
  object-fit: cover;
  transition: opacity .12s ease, transform .12s ease;
  cursor: zoom-in;
}

/* Preview box placed above the thumbnail; starts hidden and slightly scaled */
.img-preview {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%) scale(.96);
  /* width / height ถูกกำหนดจาก inline style (previewWidth/Height) */
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease, transform .18s ease;
  z-index: 50;
}

/* On hover show full-size preview (no extra translation/offset): normal 300x400 */
.img-wrap:hover .img-preview,
.img-wrap:focus-within .img-preview {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}
.img-wrap:hover .img-thumb,
.img-wrap:focus-within .img-thumb {
  opacity: 0.7;
}
</style>