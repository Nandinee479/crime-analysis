import { writable } from 'svelte/store'
import { isAdmin } from './auth.js'

export const currentPage = writable('dashboard')

export const toastStore = writable(null)

export function showToast(message, type = 'success') {
  toastStore.set({ message, type, id: Date.now() })
}

// Set default page based on user role
export function setDefaultPage() {
  // Subscribe to isAdmin to get current value
  isAdmin.subscribe(admin => {
    currentPage.set(admin ? 'dashboard' : 'dashboard')
  })()
}
