import { writable } from 'svelte/store'

export const authUser = writable(null)

export const isAdmin = writable(false)

const DEFAULT_USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
  student: { username: 'student', password: 'student123', role: 'student', name: 'Student' }
}

export function login(username, password) {
  const user = DEFAULT_USERS[username]
  if (user && user.password === password) {
    authUser.set({ username: user.username, role: user.role, name: user.name })
    isAdmin.set(user.role === 'admin')
    return { success: true, user }
  }
  return { success: false, error: 'Invalid username or password' }
}

export function logout() {
  authUser.set(null)
  isAdmin.set(false)
}
