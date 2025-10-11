import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || 'month'

    console.log('🔍 Fetching enhanced analytics data...')

    // Get basic stats
    const { count: totalAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })

    if (appointmentsError) throw appointmentsError

    const today = new Date().toISOString().split('T')[0]
    const { count: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'Confirmed')

    if (todayError) throw todayError

    const { count: totalPatients, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    if (patientsError) throw patientsError

    // Calculate revenue
    const { data: paidAppointments, error: revenueError } = await supabase
      .from('appointments')
      .select('payment_method')
      .eq('payment_status', 'Paid')

    if (revenueError) throw revenueError
    const revenue = (paidAppointments?.length || 0) * 50

    // Get appointments by status
    const { data: statusData, error: statusError } = await supabase
      .from('appointments')
      .select('status')

    if (statusError) throw statusError

    const appointmentsByStatus = [
      { status: 'Confirmed', count: statusData?.filter(a => a.status === 'Confirmed').length || 0 },
      { status: 'Completed', count: statusData?.filter(a => a.status === 'Completed').length || 0 },
      { status: 'Cancelled', count: statusData?.filter(a => a.status === 'Cancelled').length || 0 }
    ]

    // Get patients by gender
    const { data: genderData, error: genderError } = await supabase
      .from('patients')
      .select('gender')

    if (genderError) throw genderError

    const patientsByGender = [
      { gender: 'Male', count: genderData?.filter(p => p.gender === 'Male').length || 0 },
      { gender: 'Female', count: genderData?.filter(p => p.gender === 'Female').length || 0 }
    ]

    const result = {
      stats: {
        totalAppointments: totalAppointments || 0,
        todayAppointments: todayAppointments || 0,
        totalPatients: totalPatients || 0,
        revenue
      },
      appointmentsByStatus,
      appointmentsByDate: [
        { date: 'Mon', count: 12 },
        { date: 'Tue', count: 19 },
        { date: 'Wed', count: 8 },
        { date: 'Thu', count: 15 },
        { date: 'Fri', count: 11 },
        { date: 'Sat', count: 5 },
        { date: 'Sun', count: 3 }
      ],
      patientsByGender,
      revenueByMonth: [
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1900 },
        { month: 'Mar', revenue: 1500 },
        { month: 'Apr', revenue: 2100 },
        { month: 'May', revenue: 1800 },
        { month: 'Jun', revenue: 2500 }
      ]
    }

    console.log('📊 Enhanced analytics result:', result)
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Error in enhanced analytics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}