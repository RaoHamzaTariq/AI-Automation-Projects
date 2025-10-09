import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*)
      `, { count: 'exact' })
      .order('date', { ascending: true })
      .order('time', { ascending: true })

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
      console.error('Error fetching appointments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      appointments: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Error in appointments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}