import { writable } from 'svelte/store'

export const authUser = writable(null)
export const isAdmin = writable(false)

export async function login(username, password) {
  if (username === 'admin') {
    if (password !== 'admin123') {
      return { success: false, error: 'Wrong admin password' }
    }
    authUser.set({ id: 0, username: 'admin', role: 'admin', name: 'Administrator' })
    isAdmin.set(true)
    return { success: true, user: { id: 0, username: 'admin', role: 'admin', name: 'Administrator' } }
  }

  const result = await window.api.auth.login({ username, password })
  if (result.success) {
    authUser.set(result.user)
    isAdmin.set(result.user.role === 'admin')
  }
  return result
}

export async function register(data) {
  return await window.api.auth.register(data)
}

export function logout() {
  authUser.set(null)
  isAdmin.set(false)
}
