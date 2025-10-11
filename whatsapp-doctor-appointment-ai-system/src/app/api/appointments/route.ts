import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching appointments from Supabase...')

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'created_at' // New parameter
    const sortOrder = searchParams.get('sortOrder') || 'desc' // New parameter

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*)
      `, { count: 'exact' })

    // Sort by created_at by default for recent appointments
    if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' })
    } else {
      // For other cases, sort by date and time
      query = query.order('date', { ascending: false })
                   .order('time', { ascending: false })
    }

    if (date) {
      query = query.eq('date', date)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('❌ Supabase error fetching appointments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = {
      appointments: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
      sortBy,
      sortOrder
    }

    console.log('✅ Appointments fetched successfully:', result.appointments.length, 'appointments')
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Unexpected error in appointments API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}