'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format, parseISO } from 'date-fns';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

type Email = {
  id: string;
  lead_id: string | null;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
};

export default function EmailsPage() {
  const supabase = createClient();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as 'all' | 'pending' | 'sent' | 'failed'
  });
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('emails')
        .select('id, lead_id, subject, body, status, sent_at, created_at')
        .order('created_at', { ascending: false });
      setEmails(data || []);
      setLoading(false);
    };
    fetchEmails();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = emails.length;
    const sent = emails.filter(e => e.status === 'sent').length;
    const pending = emails.filter(e => e.status === 'pending').length;
    const failed = emails.filter(e => e.status === 'failed').length;
    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    return { total, sent, pending, failed, successRate };
  }, [emails]);

  // Filter emails
  const filteredEmails = useMemo(() => {
    let filtered = emails;
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.subject.toLowerCase().includes(searchLower) ||
        e.body.toLowerCase().includes(searchLower) ||
        e.lead_id?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [emails, filters]);

  const StatusBadge = ({ status }: { status: Email['status'] }) => {
    const config = {
      sent: { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: CheckCircleIcon,
        label: 'Sent'
      },
      pending: { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: ClockIcon,
        label: 'Pending'
      },
      failed: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircleIcon,
        label: 'Failed'
      }
    }[status];
    
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const retryEmail = async (emailId: string) => {
    setRetrying(emailId);
    try {
      await supabase.from('emails').update({ status: 'pending' }).eq('id', emailId);
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, status: 'pending' } : e));
    } finally {
      setRetrying(null);
    }
  };

  const previewEmail = (email: Email) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Email Preview - ${email.subject}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8fafc; }
              .email-container { max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
              .subject { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 1rem; }
              .body { line-height: 1.6; color: #475569; white-space: pre-wrap; }
              .meta { background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="meta">
                <strong>To:</strong> Lead ${email.lead_id?.slice(0, 8) || 'N/A'}<br>
                <strong>Subject:</strong> ${email.subject}<br>
                <strong>Status:</strong> ${email.status}<br>
                <strong>Sent:</strong> ${email.sent_at ? format(parseISO(email.sent_at), 'PPP pp') : 'Not sent'}
              </div>
              <div class="subject">${email.subject}</div>
              <div class="body">${email.body}</div>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Email Campaigns
            </h1>
            <p className="text-slate-600 mt-2">Track delivery status and manage email communications</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Emails', value: stats.total, color: 'blue', icon: EnvelopeIcon },
            { label: 'Sent', value: stats.sent, color: 'emerald', icon: CheckCircleIcon },
            { label: 'Pending', value: stats.pending, color: 'amber', icon: ClockIcon },
            { label: 'Failed', value: stats.failed, color: 'red', icon: XCircleIcon },
            { label: 'Success Rate', value: `${stats.successRate}%`, color: 'purple', icon: ChartBarIcon },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search emails by subject, content, or lead ID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'pending', 'sent', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilters(prev => ({ ...prev, status }))}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filters.status === status
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FunnelIcon className="w-4 h-4" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emails Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Email History ({filteredEmails.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Lead ID</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Subject</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Sent At</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Created</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm text-slate-900">
                        {email.lead_id ? `LD-${email.lead_id.slice(0, 8).toUpperCase()}` : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-slate-900 truncate" title={email.subject}>
                          {email.subject}
                        </div>
                        <div className="text-sm text-slate-500 truncate" title={email.body}>
                          {email.body.substring(0, 60)}...
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={email.status} />
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600">
                        {email.sent_at ? format(parseISO(email.sent_at), 'MMM dd, yyyy HH:mm') : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600">
                        {format(parseISO(email.created_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => previewEmail(email)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview Email"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Preview
                        </button>
                        
                        {email.status === 'failed' && (
                          <button
                            onClick={() => retryEmail(email.id)}
                            disabled={retrying === email.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Retry Email"
                          >
                            <ArrowPathIcon className={`w-4 h-4 ${retrying === email.id ? 'animate-spin' : ''}`} />
                            {retrying === email.id ? 'Retrying...' : 'Retry'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading emails...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <EnvelopeIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No emails found matching your criteria</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}