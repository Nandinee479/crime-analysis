import { writable } from 'svelte/store'

export const authUser = writable(null)
export const isAdmin = writable(false)

export async function login(username, password) {
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
