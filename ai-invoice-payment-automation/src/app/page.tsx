import React from 'react'
import {createClient} from "@/utils/supabase/client"

const Home = () => {
  const client = createClient()
  
  return (
    <div className="space-y-8">
      <section className="card p-8 flex items-center justify-between">
        <div>
          <h1 className="page-title">🤖 AI Invoice & Payment Automation</h1>
          <p className="mt-2 text-gray-600">Streamline leads, invoices, emails, and transactions with an elegant dashboard.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/dashboard" className="card p-6 hover:shadow-2xl transition">
          <div className="text-2xl">📊</div>
          <div className="mt-2 font-semibold">Dashboard</div>
          <div className="text-sm text-gray-500">KPIs and charts at a glance</div>
        </a>
        <a href="/leads" className="card p-6 hover:shadow-2xl transition">
          <div className="text-2xl">👥</div>
          <div className="mt-2 font-semibold">Leads</div>
          <div className="text-sm text-gray-500">Manage prospects and outreach</div>
        </a>
        <a href="/invoices" className="card p-6 hover:shadow-2xl transition">
          <div className="text-2xl">💼</div>
          <div className="mt-2 font-semibold">Invoices</div>
          <div className="text-sm text-gray-500">Create and track invoices</div>
        </a>
      </section>
    </div>
  )
}

export default Home