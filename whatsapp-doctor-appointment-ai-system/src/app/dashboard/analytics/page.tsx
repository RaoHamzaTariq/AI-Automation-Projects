'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react'

interface AnalyticsData {
  stats: {
    totalAppointments: number
    todayAppointments: number
    totalPatients: number
    revenue: number
  }
  appointmentsByStatus: { status: string; count: number }[]
  appointmentsByDate: { date: string; count: number }[]
  patientsByGender: { gender: string; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch(`/api/analytics?range=${timeRange}`)
      if (!res.ok) throw new Error('Failed to fetch analytics data')
      
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration - replace with actual API data
  const mockData: AnalyticsData = {
    stats: {
      totalAppointments: 124,
      todayAppointments: 8,
      totalPatients: 89,
      revenue: 6200
    },
    appointmentsByStatus: [
      { status: 'Confirmed', count: 45 },
      { status: 'Completed', count: 65 },
      { status: 'Cancelled', count: 14 }
    ],
    appointmentsByDate: [
      { date: 'Mon', count: 12 },
      { date: 'Tue', count: 19 },
      { date: 'Wed', count: 8 },
      { date: 'Thu', count: 15 },
      { date: 'Fri', count: 11 },
      { date: 'Sat', count: 5 },
      { date: 'Sun', count: 3 }
    ],
    patientsByGender: [
      { gender: 'Male', count: 52 },
      { gender: 'Female', count: 37 }
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 1200 },
      { month: 'Feb', revenue: 1900 },
      { month: 'Mar', revenue: 1500 },
      { month: 'Apr', revenue: 2100 },
      { month: 'May', revenue: 1800 },
      { month: 'Jun', revenue: 2500 }
    ]
  }

  const displayData = data || mockData

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Clinic performance insights and statistics
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <h3 className="text-2xl font-bold mt-1">{displayData.stats.totalAppointments}</h3>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <h3 className="text-2xl font-bold mt-1">{displayData.stats.totalPatients}</h3>
                <p className="text-xs text-gray-500 mt-1">Registered</p>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <h3 className="text-2xl font-bold mt-1">${displayData.stats.revenue}</h3>
                <p className="text-xs text-gray-500 mt-1">Total income</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <h3 className="text-2xl font-bold mt-1">{displayData.stats.todayAppointments}</h3>
                <p className="text-xs text-gray-500 mt-1">Scheduled today</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointments by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayData.appointmentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {displayData.appointmentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Patients by Gender */}
        <Card>
          <CardHeader>
            <CardTitle>Patients by Gender</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData.patientsByGender}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayData.appointmentsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayData.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Busiest Day</h4>
              <p className="text-blue-700 mt-1">Tuesday</p>
              <p className="text-sm text-blue-600">19 appointments on average</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Conversion Rate</h4>
              <p className="text-green-700 mt-1">84%</p>
              <p className="text-sm text-green-600">Appointments completed vs booked</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">Avg Revenue per Patient</h4>
              <p className="text-purple-700 mt-1">$69.66</p>
              <p className="text-sm text-purple-600">Based on completed appointments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}