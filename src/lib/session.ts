export type UserRole = 'seeker' | 'employer'

export type Session = {
  phone: string
  role: UserRole
}

export type SeekerProfile = {
  fullName: string
  phone: string
  city: string
  experience: string
  skills: string
}

export type EmployerProfile = {
  companyName: string
  phone: string
  city: string
  industry: string
  description?: string
}

const SESSION_KEY = 'kar-yabi-session'
const SEEKER_KEY = 'kar-yabi-seeker-profile'
const EMPLOYER_KEY = 'kar-yabi-employer-profile'

function read<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : null
  } catch {
    return null
  }
}

export function getSession() {
  return read<Session>(SESSION_KEY)
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSeekerProfile() {
  return read<SeekerProfile>(SEEKER_KEY)
}

export function saveSeekerProfile(profile: SeekerProfile) {
  localStorage.setItem(SEEKER_KEY, JSON.stringify(profile))
}

export function getEmployerProfile() {
  return read<EmployerProfile>(EMPLOYER_KEY)
}

export function saveEmployerProfile(profile: EmployerProfile) {
  localStorage.setItem(EMPLOYER_KEY, JSON.stringify(profile))
}
