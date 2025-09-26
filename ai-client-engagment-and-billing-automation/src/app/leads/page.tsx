'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Papa from 'papaparse';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  UserPlusIcon,
  TableCellsIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

type Lead = {
  id?: string;
  name: string;
  email: string;
  company?: string;
  source?: string | null;
  created_at?: string;
};

type LeadStats = {
  total: number;
  bySource: Record<string, number>;
};

export default function LeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    source: '',
    status: ''
  });

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    source: 'manual'
  });

  const [bulkLeads, setBulkLeads] = useState('');
  const [importResult, setImportResult] = useState<{success: number; errors: string[]} | null>(null);

  // Fetch leads from Supabase
  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Calculate statistics
  const stats = useMemo((): LeadStats => {
    const bySource: Record<string, number> = {};
    leads.forEach(lead => {
      const source = lead.source || 'Unknown';
      bySource[source] = (bySource[source] || 0) + 1;
    });
    return { total: leads.length, bySource };
  }, [leads]);

  // Add lead manually
  const addLeadManually = async (lead: Omit<Lead, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...lead, created_at: new Date().toISOString() }])
      .select('*')
      .single();

    if (!error && data) {
      setLeads(prev => [data, ...prev]);
      setAddOpen(false);
      setNewLead({ name: '', email: '', company: '', source: 'manual' });
      
      // Auto-trigger email workflow
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead: data }),
        });
      } catch (_) {
        // Silent fail
      }
    }
  };

  // CSV import
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const csvLeads = (results.data as Lead[]).filter(l => l.name && l.email).map((l) => ({
          name: l.name,
          email: l.email,
          company: l.company || '',
          source: l.source || 'CSV',
          created_at: new Date().toISOString()
        }));

        if (csvLeads.length > 0) {
        const { data, error } = await supabase
          .from('leads')
            .insert(csvLeads)
          .select('*');

          if (!error && data) {
            setLeads(prev => [...data, ...prev]);
            // Trigger emails for imported leads
          try {
            await Promise.all(
                data.map(lead =>
                fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead })
                })
              )
            );
            } catch (_) {}
          }
        }
        setImporting(false);
      },
    });
  };

  // Bulk add from text
  const handleBulkAdd = async () => {
    const lines = bulkLeads.split('\n').filter(line => line.trim());
    const leadsToAdd = lines.map(line => {
      const [name, email, company] = line.split(',').map(s => s.trim());
      return { name, email, company: company || '', source: 'bulk' };
    }).filter(lead => lead.name && lead.email);

    const validLeads = leadsToAdd.filter(lead => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email));
    const errors = leadsToAdd.filter(lead => !validLeads.includes(lead)).map(lead => `Invalid email: ${lead.email}`);

    if (validLeads.length > 0) {
      const { data, error } = await supabase
        .from('leads')
        .insert(validLeads.map(lead => ({ ...lead, created_at: new Date().toISOString() })))
        .select('*');

      if (!error && data) {
        setLeads(prev => [...data, ...prev]);
        setImportResult({ success: data.length, errors });
        setBulkLeads('');
        
        // Trigger emails
        try {
          await Promise.all(
            data.map(lead =>
              fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead })
              })
            )
          );
        } catch (_) {}
      }
    } else {
      setImportResult({ success: 0, errors });
    }
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        (lead.company || '').toLowerCase().includes(searchLower);
      
      const matchesCompany = !filters.company || (lead.company || '').toLowerCase().includes(filters.company.toLowerCase());
      const matchesSource = !filters.source || (lead.source || '').toLowerCase().includes(filters.source.toLowerCase());
      return matchesSearch && matchesCompany && matchesSource;
    });
  }, [leads, filters]);

  function StatusBadge({ status }: { status?: string | null }) {
    const styles: Record<string, string> = {
      contacted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      manual: "bg-blue-50 text-blue-700 border-blue-200",
      CSV: "bg-amber-50 text-amber-700 border-amber-200",
      bulk: "bg-purple-50 text-purple-700 border-purple-200",
      web: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
  
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
  
    const appliedClasses = styles[status || ""] || "bg-slate-50 text-slate-700 border-slate-200";
  
    return <span className={`${baseClasses} ${appliedClasses}`}>{status || "Unknown"}</span>;
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lead Management
            </h1>
            <p className="text-slate-600 mt-2">Manage contacts, track engagement, and drive conversions</p>
      </div>

          <div className="flex gap-3">
            <button
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              <UserPlusIcon className="w-5 h-5" />
              Bulk Add
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <PlusIcon className="w-5 h-5" />
            Add Lead
          </button>
          </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: stats.total, color: 'slate', icon: TableCellsIcon },
            ...Object.entries(stats.bySource).slice(0, 3).map(([source, count], index) => ({
              label: source.charAt(0).toUpperCase() + source.slice(1),
              value: count,
              color: ['blue', 'amber', 'purple'][index] || 'emerald',
              icon: [ClockIcon, EnvelopeIcon, ChartBarIcon][index] || CheckCircleIcon
            }))
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
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
                placeholder="Search leads by name, email, or company..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2">
              
              <select 
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              >
                <option value="">All Sources</option>
                <option value="manual">Manual</option>
                <option value="CSV">CSV</option>
                <option value="bulk">Bulk</option>
                <option value="web">Web</option>
              </select>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Import Leads</h3>
              <p className="text-slate-600 mt-1">Upload a CSV file or add multiple leads at once</p>
            </div>
            
            <div className="flex gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl font-medium hover:bg-slate-100 transition-colors cursor-pointer">
                <ArrowDownTrayIcon className="w-5 h-5" />
                Import CSV
                <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
              </label>
            </div>
          </div>
          
          {importing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <ClockIcon className="w-4 h-4 animate-spin" />
                Importing leads...
              </div>
            </div>
          )}
      </div>

      {/* Leads Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">All Leads ({filteredLeads.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Lead</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Contact</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Company</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Source</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Created</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{lead.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900">{lead.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600">{lead.company || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {lead.source || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={lead.source} />
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-500">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        disabled={sending === lead.id}
                        onClick={async () => {
                          try {
                            setSending(lead.id!);
                            await fetch('/api/send-email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ lead }),
                            });
                            // Update status to contacted
                            const { data } = await supabase
                              .from('leads')
                              .update({ source: 'contacted' })
                              .eq('id', lead.id)
                              .select()
                              .single();
                            
                            if (data) {
                              setLeads(prev => prev.map(l => l.id === lead.id ? data : l));
                            }
                          } finally {
                            setSending(null);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                        {sending === lead.id ? 'Sending...' : 'Send Email'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <TableCellsIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No leads found matching your criteria</p>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <Dialog.Title className="text-xl font-bold text-slate-900 mb-4">
                Add New Lead
              </Dialog.Title>
              
              <form onSubmit={(e) => { e.preventDefault(); addLeadManually(newLead); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newLead.name}
                    onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newLead.company}
                    onChange={(e) => setNewLead(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 text-slate-600 hover:text-slate-800 font-medium rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Add Lead
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Bulk Add Modal */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <Dialog.Title className="text-xl font-bold text-slate-900 mb-2">
                Bulk Add Leads
              </Dialog.Title>
              <p className="text-slate-600 mb-6">Add multiple leads at once (one per line, format: Name, Email, Company)</p>
              
              <textarea
                rows={8}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="John Doe, john@example.com, Acme Inc&#10;Jane Smith, jane@example.com, Globex Corporation&#10;..."
                value={bulkLeads}
                onChange={(e) => setBulkLeads(e.target.value)}
              />
              
              {importResult && (
                <div className={`p-3 rounded-lg border ${
                  importResult.success > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className={`font-medium ${
                    importResult.success > 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {importResult.success} leads imported successfully
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="text-sm text-red-600 mt-1">
                      {importResult.errors.map((error, i) => (
                        <div key={i}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setBulkOpen(false); setImportResult(null); }}
                  className="flex-1 px-4 py-3 text-slate-600 hover:text-slate-800 font-medium rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={!bulkLeads.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  Import Leads
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
