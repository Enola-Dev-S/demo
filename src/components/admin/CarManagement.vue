```
<template>
  <div class="w-full max-w-7xl mx-auto pb-24">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
      <div>
        <h2 class="text-4xl font-bold text-gray-900 tracking-tight">Car Management</h2>
        <p class="text-gray-500 mt-2 text-base">Manage your fleet and vehicle status</p>
      </div>
      <button
        @click="openAdd()"
        class="group flex items-center px-8 py-4 bg-gray-900 text-white text-base rounded-2xl hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-200 hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 mr-3 text-gray-300 group-hover:text-white transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add New Car
      </button>
    </div>

    <!-- Cars Table -->
    <div class="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-8 py-6 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                Car Info
              </th>
              <th
                scope="col"
                class="px-8 py-6 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-8 py-6 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                Availability
              </th>
              <th
                scope="col"
                class="px-8 py-6 text-right text-sm font-semibold text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr
              v-for="car in cars"
              :key="car.id"
              class="group hover:bg-gray-50/50 transition-colors duration-150"
            >
              <td class="px-8 py-6 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-16 w-16 relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <img
                      v-if="hasImage(car.img)"
                      :src="getImgUrl(car.img)"
                      class="h-full w-full object-cover"
                      alt="Car Image"
                    />
                    <div
                      v-else
                      class="h-full w-full flex items-center justify-center text-gray-400"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-6">
                    <div class="text-base font-bold text-gray-900">{{ car.name }}</div>
                    <div class="text-sm text-gray-500 mt-0.5">ID: #{{ car.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                  :class="{
                    'bg-green-50 text-green-700 border-green-100':
                      car.status.toLowerCase() === 'available',
                    'bg-yellow-50 text-yellow-700 border-yellow-100':
                      car.status.toLowerCase() === 'maintenance',
                    'bg-blue-50 text-blue-700 border-blue-100':
                      car.status.toLowerCase() === 'booked',
                  }"
                >
                  <span
                    class="w-2 h-2 rounded-full mr-1.5"
                    :class="{
                      'bg-green-500': car.status.toLowerCase() === 'available',
                      'bg-yellow-500': car.status.toLowerCase() === 'maintenance',
                      'bg-blue-500': car.status.toLowerCase() === 'booked',
                    }"
                  ></span>
                  {{ car.status }}
                </span>
              </td>
              <td class="px-8 py-6 whitespace-nowrap">
                <div class="text-base text-gray-900">
                  <span class="text-gray-500 text-sm uppercase tracking-wider mr-2">Start:</span>
                  {{ car.start_date }}
                </div>
                <div class="text-base text-gray-900 mt-1">
                  <span class="text-gray-500 text-sm uppercase tracking-wider mr-2">End:</span>
                  {{ car.end_dete }}
                </div>
              </td>
              <td class="px-8 py-6 whitespace-nowrap text-right text-base font-medium">
                <div
                  class="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <button
                    @click="openEdit(car)"
                    class="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="confirmDelete(car.id!)"
                    class="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
        <div
          class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          @click="closeForm"
        ></div>

        <div
          class="bg-white rounded-3xl shadow-2xl z-50 w-full max-w-4xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto"
        >
          <!-- Modal Header -->
          <div
            class="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"
          >
            <div>
              <h3 class="text-2xl font-bold text-gray-900">
                {{ editingCar ? "Edit Car" : "Add New Car" }}
              </h3>
              <p class="text-base text-gray-500 mt-0.5">Fill in the details below</p>
            </div>
            <button
              @click="closeForm"
              class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-base font-medium text-gray-700">Vehicle Name</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200"
                  placeholder="e.g. Toyota Camry"
                  required
                />
              </div>

              <div class="space-y-2">
                <label class="text-base font-medium text-gray-700">Status</label>
                <div class="relative">
                  <select
                    v-model="formData.status"
                    class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200 appearance-none"
                    required
                  >
                    <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-base font-medium text-gray-700">Available From</label>
                <input
                  v-model="formData.start_date"
                  type="date"
                  class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200"
                  required
                />
              </div>

              <div class="space-y-2">
                <label class="text-base font-medium text-gray-700">Available Until</label>
                <input
                  v-model="formData.end_dete"
                  type="date"
                  class="w-full px-6 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-base focus:bg-white focus:border-gray-400 focus:ring-0 transition-all duration-200"
                  required
                />
              </div>

              <div class="md:col-span-2 space-y-2">
                <label class="text-base font-medium text-gray-700 flex justify-between">
                  <span>Vehicle Image</span>
                  <span class="text-sm text-gray-400 font-normal">Required</span>
                </label>

                <div
                  class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  @click="triggerFileInput"
                >
                  <div class="space-y-1 text-center">
                    <div
                      v-if="preview"
                      class="mx-auto h-64 w-auto relative rounded-lg overflow-hidden shadow-sm"
                    >
                      <img :src="preview" class="h-full w-full object-contain" />
                      <div
                        class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <span
                          class="text-white text-base font-medium bg-black/50 px-3 py-1 rounded-full"
                          >Change Image</span
                        >
                      </div>
                    </div>
                    <svg
                      v-else
                      class="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <div v-if="!preview" class="flex text-base text-gray-600 justify-center">
                      <span
                        class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                      </span>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p v-if="!preview" class="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
                <p v-if="imageError" class="text-sm text-red-600 mt-1">{{ imageError }}</p>
              </div>
            </div>

            <div class="mt-8 flex items-center justify-end gap-4">
              <button
                type="button"
                @click="closeForm"
                class="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium text-base transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium text-base shadow-lg shadow-gray-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {{ editingCar ? "Save Changes" : "Create Vehicle" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Confirm Modal -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showDelete"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0"
      >
        <div
          class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          @click="showDelete = false"
        ></div>

        <div
          class="bg-white rounded-3xl shadow-2xl z-50 w-full max-w-lg p-8 transform transition-all scale-100"
        >
          <div class="flex items-start space-x-6">
            <div class="flex-shrink-0 bg-red-50 rounded-full p-3">
              <svg
                class="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900">Delete Vehicle</h3>
              <p class="text-base text-gray-500 mt-3">
                Are you sure you want to delete this vehicle? This action cannot be undone.
              </p>
              <div class="mt-8 flex justify-end space-x-4">
                <button
                  @click="showDelete = false"
                  class="px-6 py-3 rounded-xl text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 font-medium text-base transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="doDelete"
                  class="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium text-base shadow-lg shadow-red-100 transition-colors"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { API_BASE, authHeader } from "@/config";

interface Car {
  id?: number;
  name: string;
  status: string;
  start_date: string;
  end_dete: string;
  img?: string;
}

const cars = ref<Car[]>([]);
const editingCar = ref<Car | null>(null);
const showForm = ref(false);
const showDelete = ref(false);
const preview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const imageError = ref<string>("");
const confirmDeleteId = ref<number | null>(null);

const formData = ref<Car>({
  name: "",
  status: "available",
  start_date: new Date().toISOString().slice(0, 10),
  end_dete: new Date().toISOString().slice(0, 10),
  img: "",
});

const statuses = ["Available", "Maintenance"];
const apiBase = API_BASE + "/api/car";
const serverBase = API_BASE;
const fileInput = ref<HTMLInputElement | null>(null);

const getImgUrl = (img?: string) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${serverBase}/imgcar/${img}`;
};

const hasImage = (img?: string | null) => {
  if (!img) return false;
  const normalized = String(img).trim().toLowerCase();
  if (!normalized) return false;
  return normalized !== "null" && normalized !== "undefined" && normalized !== "-";
};

// convert various date formats -> YYYY-MM-DD for <input type="date">
const toInputDate = (val?: string) => {
  if (!val) return "";
  // dd-mm-yyyy -> yyyy-mm-dd
  if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split("-");
    return `${y}-${m}-${d}`;
  }
  // ISO or other parseable -> local yyyy-mm-dd
  const dt = new Date(val);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return val;
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  if (!file) return;
  selectedFile.value = file;
  formData.value.img = file.name;
  imageError.value = "";
  // preview using object URL
  if (preview.value) URL.revokeObjectURL(preview.value);
  preview.value = URL.createObjectURL(file);
};

const openEdit = (car: Car) => {
  editingCar.value = car;
  selectedFile.value = null;
  imageError.value = "";
  formData.value = {
    ...car,
    start_date: toInputDate(car.start_date),
    end_dete: toInputDate(car.end_dete),
  };
  preview.value = car.img ? getImgUrl(car.img) : null;
  showForm.value = true;
};

const openAdd = () => {
  editingCar.value = null;
  resetForm();
  showForm.value = true;
};

const closeForm = () => {
  resetForm();
  showForm.value = false;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleSubmit = async () => {
  try {
    const isEditing = Boolean(editingCar.value && editingCar.value.id);
    const file = selectedFile.value;
    const hasExistingImage = hasImage(formData.value.img);

    if (!isEditing && !file) {
      imageError.value = "กรุณาเลือกรูปก่อนบันทึก";
      return;
    }

    const url =
      editingCar.value && editingCar.value.id ? `${apiBase}/${editingCar.value.id}` : apiBase;
    const method = editingCar.value && editingCar.value.id ? "PUT" : "POST";
    const body = new FormData();
    body.append("name", formData.value.name);
    body.append("status", formData.value.status);
    body.append("start_date", formData.value.start_date);
    body.append("end_dete", formData.value.end_dete);
    if (file) {
      body.append("img", file);
    } else if (isEditing && hasExistingImage && formData.value.img) {
      body.append("img", formData.value.img);
    }

    await fetch(url, { method, body, headers: authHeader() });
    await loadCars();
    closeForm();
  } catch (error) {
    console.error("Error:", error);
  }
};

const confirmDelete = (id: number) => {
  confirmDeleteId.value = id;
  showDelete.value = true;
};

const doDelete = async () => {
  if (!confirmDeleteId.value) return;
  try {
    await fetch(`${apiBase}/${confirmDeleteId.value}`, { method: "DELETE", headers: authHeader() });
    showDelete.value = false;
    await loadCars();
  } catch (error) {
    console.error("Delete error:", error);
  }
};

const resetForm = () => {
  formData.value = {
    name: "",
    status: "available",
    start_date: new Date().toISOString().slice(0, 10),
    end_dete: new Date().toISOString().slice(0, 10),
    img: "",
  };
  editingCar.value = null;
  selectedFile.value = null;
  imageError.value = "";
  if (preview.value) URL.revokeObjectURL(preview.value);
  preview.value = null;
};

const loadCars = async () => {
  try {
    const res = await fetch(apiBase, { headers: authHeader() });
    const data = await res.json();
    const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    cars.value = rows.map(
      (r: {
        id?: number;
        name?: string;
        status?: string;
        start_date?: string;
        end_dete?: string;
        img?: string;
      }) => ({
        id: r.id,
        name: r.name ?? "",
        status: r.status ?? "available",
        start_date: r.start_date ?? "",
        end_dete: r.end_dete ?? "",
        img: r.img ?? "",
      })
    );
  } catch (error) {
    console.error("Error loading cars:", error);
  }
};

onMounted(() => {
  loadCars();
});
</script>
