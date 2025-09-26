'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format, differenceInDays, isAfter } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { 
  ArrowDownTrayIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

type Invoice = {
  id: string;
  lead_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue';
  issued_at: string;
  due_date: string;
  paid_at: string | null;
};

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
};

type InvoiceStats = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
};

const displayShort = (value: unknown) => {
  if (value === null || value === undefined) return '-';
  const str = String(value);
  return str.slice(0, 8);
};

const statusConfig = {
  paid: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircleIcon },
  pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: ClockIcon },
  overdue: { color: 'bg-red-100 text-red-800 border-red-200', icon: ExclamationTriangleIcon }
};

export default function InvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const [leadId, setLeadId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [dueDate, setDueDate] = useState('');
  const [issuedAt, setIssuedAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({ total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0, paidAmount: 0 });

  // Fetch invoices once with concise logic and robust error handling
  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, lead_id, amount, currency, status, issued_at, due_date, paid_at')
        .order('issued_at', { ascending: false });

      if (error) {
        console.error('Fetch invoices failed:', error.message);
        setInvoices([]);
        setStats({ total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0, paidAmount: 0 });
        return;
      }

      const invoicesData = data || [];

      setInvoices(invoicesData);

      const calculated = invoicesData.reduce((acc, inv) => {
        acc.total += 1;
        acc.totalAmount += Number(inv.amount || 0);
        if (inv.status === 'paid') {
          acc.paid += 1;
          acc.paidAmount += Number(inv.amount || 0);
        } else if (inv.status === 'pending') {
          acc.pending += 1;
        } else if (inv.status === 'overdue') {
          acc.overdue += 1;
        }
        return acc;
      }, { total: 0, paid: 0, pending: 0, overdue: 0, totalAmount: 0, paidAmount: 0 });

      setStats(calculated);
    };

    fetchInvoices();
  }, []);

  // Fetch leads for dropdown with error handling
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, company')
        .order('name', { ascending: true });
      if (error) {
        console.error('Fetch leads failed:', error.message);
        setLeads([]);
        return;
      }
      setLeads(data || []);
    };
    fetchLeads();
  }, []);

  // Filtered and searched invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = q === '' || inv.id.toLowerCase().includes(q) || inv.lead_id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Mark as Paid
  const markAsPaid = async (id: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: now })
      .eq('id', id);
    
    if (!error) {
      setInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: 'paid', paid_at: now } : inv
      ));
    }
  };

  // Delete invoice
  const deleteInvoice = async () => {
    if (!invoiceToDelete) return;
    
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceToDelete.id);
    
    if (!error) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      setDeleteOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const resetForm = () => {
    setLeadId('');
    setAmount('');
    setCurrency('USD');
    setDueDate('');
    setIssuedAt(format(new Date(), 'yyyy-MM-dd'));
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
  
    if (!leadId || !amount || !currency || !dueDate) {
      setFormError('Please fill all required fields.');
      return;
    }
  
    const amtNum = Number(amount);
    if (Number.isNaN(amtNum) || amtNum <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }
  
    try {
      setSubmitting(true);
  
      const payload = {
        lead_id: leadId,
        amount: amtNum,
        currency,
        due_date: new Date(dueDate).toISOString(),
        issued_at: issuedAt ? new Date(issuedAt).toISOString() : new Date().toISOString(),
        status: 'pending',
      };
  
      const resp = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }
  
      const { invoice } = await resp.json();
  
      setInvoices(prev => [invoice, ...prev]);
      setCreateOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };
  

  const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const AmountDisplay = ({ amount, currency, status }: { amount: number; currency: string; status: Invoice['status'] }) => (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-semibold ${
        status === 'paid' ? 'text-emerald-600' : 
        status === 'overdue' ? 'text-red-600' : 'text-gray-900'
      }`}>
        {currency} {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Invoice Management
            </h1>
            <p className="text-slate-600 mt-2">Manage and track your invoices efficiently</p>
      </div>

        <button
          onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
            <PlusIcon className="w-5 h-5" />
            New Invoice
        </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Invoices', value: stats.total, color: 'blue', icon: ChartBarIcon },
            { label: 'Paid', value: stats.paid, color: 'emerald', icon: CheckCircleIcon },
            { label: 'Pending', value: stats.pending, color: 'amber', icon: ClockIcon },
            { label: 'Overdue', value: stats.overdue, color: 'red', icon: ExclamationTriangleIcon },
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

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'pending', 'paid', 'overdue'] as const).map((f) => (
          <button
            key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filter === f
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FunnelIcon className="w-4 h-4" />
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
            </div>
          </div>
      </div>

      {/* Invoice Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-6 font-semibold text-slate-700">Invoice</th>
                  <th className="text-left p-6 font-semibold text-slate-700">Lead</th>
                  <th className="text-left p-6 font-semibold text-slate-700">Amount</th>
                  <th className="text-left p-6 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-6 font-semibold text-slate-700">Due Date</th>
                  <th className="text-left p-6 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => {
                  const dueIn = differenceInDays(new Date(invoice.due_date), new Date());
                  const lead = leads.find(l => l.id === invoice.lead_id);
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6">
                        <div>
                          <div 
                            className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => { setSelectedInvoice(invoice); setModalOpen(true); }}
                          >
                            INV-{displayShort(invoice.id).toUpperCase()}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {format(new Date(invoice.issued_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div>
                          <div className="font-medium text-slate-900">
                            {lead?.name || lead?.company || 'Unknown Lead'}
                          </div>
                          <div className="text-sm text-slate-500">{lead?.email}</div>
                        </div>
                      </td>
                      <td className="p-6">
                        <AmountDisplay 
                          amount={invoice.amount} 
                          currency={invoice.currency} 
                          status={invoice.status} 
                        />
                      </td>
                      <td className="p-6">
                        <StatusBadge status={invoice.status} />
                        {invoice.status === 'pending' && (
                          <div className="text-xs text-slate-500 mt-1">
                            {dueIn >= 0 ? `Due in ${dueIn} days` : 'Overdue'}
                          </div>
                        )}
                      </td>
                      <td className="p-6">
                        <div className={`font-medium ${
                          invoice.status === 'overdue' ? 'text-red-600' : 'text-slate-900'
                        }`}>
                          {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedInvoice(invoice); setModalOpen(true); }}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          
                          {invoice.status !== 'paid' && (
                    <button
                              onClick={() => markAsPaid(invoice.id)}
                              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Mark as Paid"
                    >
                              <CheckCircleIcon className="w-4 h-4" />
                    </button>
                  )}
                          
                          <button
                            onClick={() => { setInvoiceToDelete(invoice); setDeleteOpen(true); }}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Invoice"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                </td>
              </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <ChartBarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices found</p>
            </div>
          )}
        </div>

        {/* Invoice Detail Modal */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
      {selectedInvoice && (
                <div className="p-6">
                  <Dialog.Title className="text-2xl font-bold text-slate-900 mb-2">
                    Invoice Details
                  </Dialog.Title>
                  
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-3">Basic Information</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-slate-500">Invoice ID</dt>
                          <dd className="font-mono">{selectedInvoice.id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-slate-500">Lead ID</dt>
                          <dd>{selectedInvoice.lead_id}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-slate-500">Status</dt>
                          <dd><StatusBadge status={selectedInvoice.status} /></dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-3">Financial Details</h3>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-slate-500">Amount</dt>
                          <dd className="text-lg font-semibold">
                            {selectedInvoice.currency} {selectedInvoice.amount.toFixed(2)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-slate-500">Issued Date</dt>
                          <dd>{format(new Date(selectedInvoice.issued_at), 'PPP')}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-slate-500">Due Date</dt>
                          <dd>{format(new Date(selectedInvoice.due_date), 'PPP')}</dd>
                        </div>
                        {selectedInvoice.paid_at && (
                          <div>
                            <dt className="text-sm text-slate-500">Paid Date</dt>
                            <dd>{format(new Date(selectedInvoice.paid_at), 'PPP')}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                  
                  
                  
                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>

      {/* Create Invoice Modal */}
        <Dialog open={createOpen} onClose={() => { setCreateOpen(false); resetForm(); }} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <Dialog.Title className="text-2xl font-bold text-slate-900 mb-2">
                  Create New Invoice
                </Dialog.Title>
                
                <form onSubmit={handleCreate} className="space-y-6 mt-6">
            {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {formError}
                    </div>
            )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Lead *</label>
              <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                required
              >
                        <option value="">Select a lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                            {lead.name || lead.email || 'Unnamed Lead'} {lead.company && `- ${lead.company}`}
                  </option>
                ))}
              </select>
            </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Amount *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                <select
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                          <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
                    
              <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Due Date *</label>
                <input
                  type="date"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
                    
              <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Issued At</label>
                <input
                  type="date"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                />
              </div>
                    
                    
            </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                      className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                      onClick={() => { setCreateOpen(false); resetForm(); }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Delete Invoice
                  </Dialog.Title>
                </div>
                
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete this invoice? This action cannot be undone.
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteInvoice}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
        </Dialog.Panel>
          </div>
      </Dialog>
      </div>
    </div>
  );
}
