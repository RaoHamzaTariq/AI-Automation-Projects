'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format, parseISO } from 'date-fns';
import { 
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

type Transaction = {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  transaction_date: string;
};

export default function TransactionsPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    paymentMethod: '',
    dateRange: '30d' as '7d' | '30d' | '90d' | 'all'
  });
  const [customDateRange, setCustomDateRange] = useState({
    from: '',
    to: ''
  });

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('id, invoice_id, amount, currency, payment_method, transaction_date')
      .order('transaction_date', { ascending: false });

    // Apply date range filter
    const now = new Date();
    let fromDate: Date | null = null;
    
    switch (filters.dateRange) {
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        // No date filter
        break;
    }

    if (fromDate) {
      query = query.gte('transaction_date', fromDate.toISOString());
    }

    // Apply custom date range
    if (filters.dateRange === 'custom') {
      if (customDateRange.from) {
        query = query.gte('transaction_date', new Date(customDateRange.from).toISOString());
      }
      if (customDateRange.to) {
        query = query.lte('transaction_date', new Date(customDateRange.to).toISOString());
      }
    }

    // Apply payment method filter
    if (filters.paymentMethod) {
      query = query.eq('payment_method', filters.paymentMethod);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters.dateRange, filters.paymentMethod]);

  // Calculate statistics based on actual schema
  const stats = useMemo(() => {
    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const averageAmount = transactions.length > 0 ? totalAmount / transactions.length : 0;

    return {
      total: transactions.length,
      totalAmount,
      averageAmount
    };
  }, [transactions]);

  // Filter transactions by search
  const filteredTransactions = useMemo(() => {
    if (!filters.search) return transactions;
    
    const searchLower = filters.search.toLowerCase();
    return transactions.filter(t => 
      t.id.toLowerCase().includes(searchLower) ||
      t.invoice_id.toLowerCase().includes(searchLower) ||
      t.payment_method?.toLowerCase().includes(searchLower) ||
      t.currency.toLowerCase().includes(searchLower)
    );
  }, [transactions, filters.search]);

  // Payment method icons
  const getPaymentMethodIcon = (method: string | null) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return <CreditCardIcon className="w-4 h-4" />;
      case 'bank_transfer':
        return <BanknotesIcon className="w-4 h-4" />;
      case 'paypal':
        return <CurrencyDollarIcon className="w-4 h-4" />;
      default:
        return <WalletIcon className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Invoice ID', 'Amount', 'Currency', 'Payment Method', 'Date'];
    const csvData = transactions.map(t => [
      t.id,
      t.invoice_id,
      t.amount,
      t.currency,
      t.payment_method || 'N/A',
      format(parseISO(t.transaction_date), 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Missing icons
  const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ClockIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transaction History
            </h1>
            <p className="text-slate-600 mt-2">Track and manage all payment transactions</p>
          </div>
          
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards - Simplified to match actual schema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              label: 'Total Transactions', 
              value: stats.total, 
              color: 'blue',
              icon: ChartBarIcon 
            },
            { 
              label: 'Total Amount', 
              value: `$${stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
              color: 'emerald',
              icon: CurrencyDollarIcon 
            },
            { 
              label: 'Average Transaction', 
              value: `$${stats.averageAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
              color: 'purple',
              icon: ChartBarIcon 
            },
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
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions by ID, invoice, or payment method..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select 
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
              
              <select 
                className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>

              <button
                onClick={fetchTransactions}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customDateRange.from}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customDateRange.to}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Transaction History ({filteredTransactions.length})
            </h3>
            <div className="text-sm text-slate-600">
              Average: ${stats.averageAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Transaction ID</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Invoice</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Amount</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Payment Method</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Date & Time</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-sm text-slate-900">TX-{transaction.id.slice(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="p-4">
                      <a 
                        href={`/invoices#${transaction.invoice_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        INV-{transaction.invoice_id.slice(0, 8).toUpperCase()}
                      </a>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-slate-900">
                          {transaction.currency} {Number(transaction.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.payment_method)}
                        <span className="capitalize text-slate-700">
                          {transaction.payment_method?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600">
                        {format(parseISO(transaction.transaction_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(parseISO(transaction.transaction_date), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-500 mt-2">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No transactions found matching your criteria</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}