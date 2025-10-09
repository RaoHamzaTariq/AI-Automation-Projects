import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get total appointments
    const { count: totalAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })

    if (appointmentsError) {
      console.error('Error fetching total appointments:', appointmentsError)
      throw appointmentsError
    }

    // Get today's appointments
    const today = new Date().toISOString().split('T')[0]
    const { count: todayAppointments, error: todayError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'Confirmed')

    if (todayError) {
      console.error('Error fetching today appointments:', todayError)
      throw todayError
    }

    // Get total patients
    const { count: totalPatients, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    if (patientsError) {
      console.error('Error fetching total patients:', patientsError)
      throw patientsError
    }

    // Calculate revenue from paid appointments
    const { data: paidAppointments, error: revenueError } = await supabase
      .from('appointments')
      .select('payment_method')
      .eq('payment_status', 'Paid')

    if (revenueError) {
      console.error('Error fetching paid appointments:', revenueError)
      throw revenueError
    }

    // Calculate revenue (assuming $50 per appointment)
    const appointmentPrice = 50
    const revenue = (paidAppointments?.length || 0) * appointmentPrice

    return NextResponse.json({
      totalAppointments: totalAppointments || 0,
      todayAppointments: todayAppointments || 0,
      totalPatients: totalPatients || 0,
      revenue
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}