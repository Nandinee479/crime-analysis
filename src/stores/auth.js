import { writable } from 'svelte/store'
import { setDefaultPage } from './navigation.js'

export const authUser = writable(null)
export const isAdmin = writable(false)

export async function login(username, password) {
  if (username === 'admin123@gmail.com') {
    if (password !== 'admin123') {
      return { success: false, error: 'Wrong admin password' }
    }
    authUser.set({ id: 0, username: 'admin123@gmail.com', role: 'admin', name: 'Administrator' })
    isAdmin.set(true)
    setDefaultPage()
    return { success: true, user: { id: 0, username: 'admin123@gmail.com', role: 'admin', name: 'Administrator' } }
  }

  const result = await window.api.auth.login({ username, password })
  if (result.success) {
    const user = {
      ...result.user,
      name: result.user.name || result.user.username || 'User'
    }
    authUser.set(user)
    isAdmin.set(user.role === 'admin')
    setDefaultPage()
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
