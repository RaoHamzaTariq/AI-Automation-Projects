'use client'

import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentAppointments } from '@/components/dashboard/recent-appointments'
import { AppointmentCalendar } from '@/components/dashboard/appointment-calendar'
import { DashboardStats, Appointment } from '@/lib/types'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    revenue: 0
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Starting to fetch dashboard data...')

      // Fetch recent appointments sorted by created_at (newest first)
      const [statsRes, appointmentsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/appointments?limit=5&sortBy=created_at&sortOrder=desc')
      ])

      console.log('📊 Stats response status:', statsRes.status)
      console.log('📅 Appointments response status:', appointmentsRes.status)

      if (!statsRes.ok) {
        throw new Error(`Stats API failed: ${statsRes.status}`)
      }

      if (!appointmentsRes.ok) {
        throw new Error(`Appointments API failed: ${appointmentsRes.status}`)
      }

      const statsData = await statsRes.json()
      const appointmentsData = await appointmentsRes.json()

      console.log('📈 Stats data received:', statsData)
      console.log('🗓️ Appointments data received:', appointmentsData)

      // Use the actual data structure from API
      if (statsData.stats) {
        setStats(statsData.stats)
      } else {
        setStats(statsData)
      }
      
      setAppointments(appointmentsData.appointments || [])

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800 font-semibold">Error Loading Data</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

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