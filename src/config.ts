//import { import.meta.env } from 'vue'
//import { location } from 'window'

export const API_BASE = import.meta.env.VITE_API_BASE || ''

export const authHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}