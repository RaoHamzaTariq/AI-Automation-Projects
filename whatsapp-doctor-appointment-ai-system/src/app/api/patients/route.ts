import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,whatsapp_number.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error fetching patients:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      patients: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Error in patients API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}