import type { Appointment } from '../types'
import { readStorage, writeStorage } from './storage'

const key = 'appointments'

export function listAppointments(initial: Appointment[]): Appointment[] {
  return readStorage(key, initial)
}

export function saveAppointments(appointments: Appointment[]): void {
  writeStorage(key, appointments)
}

export function updateAppointmentStatus(appointments: Appointment[], id: string, status: Appointment['status']): Appointment[] {
  return appointments.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment)
}
