import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

// Create the Vue application instance and mount it



const app = createApp(App)
app.use(router)
app.mount('#app')
