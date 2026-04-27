import { writable } from 'svelte/store'

export const currentPage = writable('dashboard')

export const toastStore = writable(null)

export function showToast(message, type = 'success') {
  toastStore.set({ message, type, id: Date.now() })
}
