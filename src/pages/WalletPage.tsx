import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { getWallet } from '../api/wallet.api';
import Spinner from '../components/ui/Spinner';
import PageTransition from '../components/motion/PageTransition';

interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  ref?: string;
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { data, isLoading, isError } = useQuery<WalletData>({
    queryKey: ['wallet'],
    queryFn: getWallet,
  });

  if (isLoading) return <Spinner size="lg" className="py-24" />;

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-red-500">
        Failed to load wallet. Please try again.
      </div>
    );
  }

  const balance = data?.balance ?? 0;
  const transactions: Transaction[] = data?.transactions ?? [];

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Balance card */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-8 mb-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-pink-50 dark:bg-primary/10 rounded-full flex items-center justify-center">
              <Wallet size={28} className="text-pink-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-dark-muted mb-1">Nexcart Wallet</p>
          <p className="text-3xl font-bold text-green-600">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-muted mt-2">Available balance</p>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-border">
            <h2 className="font-semibold text-gray-800 dark:text-dark-text">Transactions</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-dark-muted text-sm">
              No transactions yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-dark-border">
              {transactions.map((tx) => (
                <li key={tx._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <ArrowUpRight size={16} className="text-green-600" />
                    ) : (
                      <ArrowDownLeft size={16} className="text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-dark-text truncate">
                      {tx.description || 'Transaction'}
                    </p>
                    {tx.ref && (
                      <p className="text-xs text-gray-400 dark:text-dark-muted truncate">Ref: {tx.ref}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}₹
                      {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-dark-muted">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
