import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentAppointments } from '@/components/dashboard/recent-appointments'
import { AppointmentCalendar } from '@/components/dashboard/appointment-calendar'
import { DashboardStats, Appointment } from '@/lib/types'

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${res.status}`)
    }
    
    return await res.json()
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default values if API fails
    return {
      totalAppointments: 0,
      todayAppointments: 0,
      totalPatients: 0,
      revenue: 0
    }
  }
}

async function getRecentAppointments(): Promise<Appointment[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/appointments?limit=5`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch recent appointments: ${res.status}`)
    }
    
    const data = await res.json()
    return data.appointments || []
  } catch (error) {
    console.error('Error fetching recent appointments:', error)
    return []
  }
}

export default async function DashboardPage() {
  const [stats, appointments] = await Promise.all([
    getDashboardStats(),
    getRecentAppointments()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your clinic management dashboard
        </p>
      </div>

      <StatsCards stats={stats} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RecentAppointments appointments={appointments} />
        <AppointmentCalendar />
      </div>
    </div>
  )
}