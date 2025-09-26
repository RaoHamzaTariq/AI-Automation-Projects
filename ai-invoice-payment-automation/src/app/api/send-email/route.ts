import { NextResponse } from 'next/server'
import { createClientForServer } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClientForServer()
    const body = await request.json()
    const { lead } = body as { lead: { id: string; name: string; email: string; company?: string | null } }

    if (!lead?.id || !lead?.email || !lead?.name) {
      return NextResponse.json({ error: 'Invalid lead payload' }, { status: 400 })
    }

    // Optionally call external workflow (e.g., n8n webhook) if configured
    const webhookUrl = process.env.N8N_SEND_EMAIL_WEBHOOK || ''

    if (webhookUrl) {
      try {
        const resp = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead }),
        })
        if (resp.ok) {
          return NextResponse.json({ ok: true })
        } else {
          // Optionally, you could log or handle the error response here
          return NextResponse.json({ error: 'Failed to trigger webhook' }, { status: 500 })
        }
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Webhook error' }, { status: 500 })
      }
    }

    // If no webhook is configured, just return ok
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
