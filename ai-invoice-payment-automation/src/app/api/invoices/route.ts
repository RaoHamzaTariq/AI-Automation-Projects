import { NextResponse } from 'next/server'
import { createClientForServer } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClientForServer()
    const body = await request.json()
    const {
      lead_id,
      amount,
      currency,
      due_date,
      issued_at,
      status,
    } = body as {
      lead_id?: string
      amount?: number
      currency?: string
      due_date?: string
      issued_at?: string
      status?: 'pending' | 'paid' | 'overdue'
    }

    if (!lead_id || !amount || !currency || !due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = {
      lead_id,
      amount,
      currency,
      due_date,
      issued_at: issued_at || new Date().toISOString(),
      status: status || 'pending',
    }

    // Instead of inserting into Supabase, send the payload to the n8n webhook
    const webhookUrl = process.env.N8N_CREATE_INVOICE_WEBHOOK || ''
    if (!webhookUrl) {
      return NextResponse.json({ error: 'n8n webhook URL not configured' }, { status: 500 })
    }
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) {
      const errorText = await resp.text()
      return NextResponse.json({ error: 'Failed to trigger n8n webhook', details: errorText }, { status: 500 })
    }
    const data = await resp.json()
    // No need to check for 'error' here, as any error would have thrown or been handled above.

    return NextResponse.json({ invoice: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


