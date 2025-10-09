export interface Patient {
  patient_id: string
  whatsapp_number: string
  name: string
  age: number
  gender: string
  created_at: string
}

export interface Appointment {
  appointment_id: string
  patient_id: string
  whatsapp_number: string
  date: string
  time: string
  payment_method: 'Stripe' | 'Cash'
  payment_status: 'Pending' | 'Paid' | 'Refunded'
  status: 'Confirmed' | 'Cancelled' | 'Completed'
  stripe_payment_intent?: string
  created_at: string
  patient?: Patient
}

export interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  totalPatients: number
  revenue: number
}