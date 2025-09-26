'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area, ReferenceLine,
} from 'recharts';

type Lead = {
  id: string;
  source: string | null;
  created_at: string;
};

type Email = {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
};

type Invoice = {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  issued_at: string;
};

export default function DashboardPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
      const [{ data: leadsData }, { data: emailsData }, { data: invoicesData }] = await Promise.all([
        supabase.from('leads').select('id, source, created_at'),
        supabase.from('emails').select('id, status, created_at'),
        supabase.from('invoices').select('id, amount, status, due_date, issued_at'),
      ]);
      setLeads(leadsData || []);
      setEmails(emailsData || []);
      setInvoices(invoicesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ------------------ KPI Cards ------------------
  const kpiData = useMemo(() => {
  const totalLeads = leads.length;
  const totalEmailsSent = emails.filter((e) => e.status === 'sent').length;
  const revenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const pendingInvoices = invoices.filter((i) => i.status === 'pending').length;
    
    // Calculate trends (simplified - in real app, compare with previous period)
    const trends = {
      leads: 12.5,
      emails: 8.3,
      revenue: 23.7,
      invoices: -5.2
    };

    return { totalLeads, totalEmailsSent, revenue, pendingInvoices, trends };
  }, [leads, emails, invoices]);

  // ------------------ Charts ------------------
  const monthlyStatusData = useMemo(() => {
    const byMonth: Record<string, { month: string; paid: number; pending: number; overdue: number }> = {};
    invoices.forEach((inv) => {
      const d = new Date(inv.issued_at);
      const month = `${d.toLocaleString('default', { month: 'short' })}`;
      if (!byMonth[month]) byMonth[month] = { month, paid: 0, pending: 0, overdue: 0 };
      byMonth[month][inv.status] = (byMonth[month][inv.status as 'paid' | 'pending' | 'overdue'] || 0) + 1;
    });
    return Object.values(byMonth);
  }, [invoices]);

  const cumulativeRevenueData = useMemo(() => {
    const paid = invoices
      .filter((i) => i.status === 'paid')
      .map((i) => ({ date: new Date(i.issued_at), amount: Number(i.amount || 0) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const byDay: Record<string, number> = {};
    paid.forEach((p) => {
      const key = p.date.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + p.amount;
    });
    const days = Object.keys(byDay).sort();
    const out: Array<{ day: string; revenue: number; cumulative: number }> = [];
    let running = 0;
    days.forEach((day) => {
      running += byDay[day];
      out.push({ day: new Date(day).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }), revenue: byDay[day], cumulative: running });
    });
    return out;
  }, [invoices]);

  const dailyEmailsData = useMemo(() => {
    const byDay: Record<string, { day: string; sent: number }> = {};
    emails.forEach((e) => {
      const key = new Date(e.created_at).toISOString().slice(0, 10);
      if (!byDay[key]) byDay[key] = { day: key, sent: 0 };
      if (e.status === 'sent') byDay[key].sent += 1;
    });
    const days = Object.keys(byDay).sort();
    const out = days.map((d) => ({ day: new Date(d).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }), sent: byDay[d].sent }));
    // 7-day moving average
    const window = 7;
    return out.map((row, idx) => {
      const start = Math.max(0, idx - window + 1);
      const slice = out.slice(start, idx + 1);
      const avg = slice.reduce((s, r) => s + r.sent, 0) / slice.length;
      return { ...row, ma7: Number(avg.toFixed(2)) };
    });
  }, [emails]);

  const invoiceStatusData = useMemo(() => {
    const statuses: Array<Invoice['status']> = ['pending', 'paid', 'overdue'];
    return statuses.map((s) => ({ name: s, value: invoices.filter((i) => i.status === s).length }));
  }, [invoices]);

  const leadsSourceData = useMemo(() => {
    const bySource: Record<string, number> = {};
    leads.forEach((l) => {
      const key = l.source || 'Unknown';
      bySource[key] = (bySource[key] || 0) + 1;
    });
    return Object.entries(bySource).map(([source, count]) => ({ source, count }));
  }, [leads]);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const STATUS_COLORS = { paid: '#10b981', pending: '#f59e0b', overdue: '#ef4444' };

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-1 sm:mt-2">Real-time business insights and performance metrics</p>
      </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
      </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-700">Live</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[
            { 
              title: 'Total Leads', 
              value: kpiData.totalLeads, 
              trend: kpiData.trends.leads,
              icon: '👥',
              color: 'blue'
            },
            { 
              title: 'Emails Sent', 
              value: kpiData.totalEmailsSent, 
              trend: kpiData.trends.emails,
              icon: '✉️',
              color: 'green'
            },
            { 
              title: 'Revenue', 
              value: `$${kpiData.revenue.toLocaleString()}`,
              trend: kpiData.trends.revenue,
              icon: '💰',
              color: 'purple'
            },
            { 
              title: 'Pending Invoices', 
              value: kpiData.pendingInvoices, 
              trend: kpiData.trends.invoices,
              icon: '📄',
              color: 'orange'
            }
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className="text-2xl">{card.icon}</div>
              </div>
              <div className="flex items-center mt-4">
                <span className={`inline-flex items-center text-sm font-medium ${
                  card.trend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
                </span>
                <span className="text-slate-500 text-sm ml-2">vs previous period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Cumulative Revenue */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Cumulative Revenue</h2>
              <div className="flex gap-1 mt-2 sm:mt-0">
                <button className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg font-medium">Daily</button>
                <button className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg font-medium">Weekly</button>
                <button className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg font-medium">Monthly</button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeRevenueData}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#revGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

          {/* Invoice Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-6">Invoice Status Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="paid" stackId="a" fill={STATUS_COLORS.paid} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill={STATUS_COLORS.pending} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overdue" stackId="a" fill={STATUS_COLORS.overdue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
        </div>
      </div>

          {/* Email Analytics */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-6">Email Performance</h2>
            <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyEmailsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ma7" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
            </LineChart>
          </ResponsiveContainer>
            </div>
        </div>

          {/* Leads Source */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-6">Leads by Source</h2>
            <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                  <Pie 
                    data={leadsSourceData} 
                    innerRadius={70} 
                    outerRadius={110} 
                    paddingAngle={2} 
                    dataKey="count" 
                    nameKey="source"
                    label={({ name, percent }: { name?: string; percent?: number }) => 
                      `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`
                    }
                  >
                    {leadsSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
            </PieChart>
          </ResponsiveContainer>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}