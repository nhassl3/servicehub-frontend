import { useEffect, useState } from 'react'
import { balanceApi } from '../api/balance'
import type { BalanceTransaction } from '../types'
import './BalancePage.css'

export function BalancePage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 10;

  const loadAll = async () => {
    const [balData, txData] = await Promise.all([
      balanceApi.get(),
      balanceApi.getTransactions({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    ]);
    setBalance(balData.amount);
    setTransactions(txData.transactions ?? []);
    setTotal(txData.total);
  };

  useEffect(() => {
    setLoading(true);
    loadAll().finally(() => setLoading(false));
  }, [page]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { setDepositError('Enter a valid amount'); return; }
    setDepositing(true);
    try {
      const { amount: newBalance } = await balanceApi.deposit(amount);
      setBalance(newBalance);
      setDepositAmount('');
      // Reload transactions
      const txData = await balanceApi.getTransactions({ limit: PAGE_SIZE, offset: 0 });
      setTransactions(txData.transactions ?? []);
      setTotal(txData.total);
      setPage(0);
    } catch (err: any) {
      setDepositError(err?.response?.data?.error ?? 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">Balance</h1>

      <div className="balance-layout">
        {/* ── Balance card ──────────────────────────────────────────────────── */}
        <div className="balance-cards">
          <div className="card balance-card">
            <div className="balance-card__label text-muted">Available Balance</div>
            <div className="balance-card__amount text-primary">
              ${(balance ?? 0).toFixed(2)}
            </div>
          </div>

          <div className="card balance-deposit">
            <h2 className="balance-deposit__title">Deposit Funds</h2>
            {depositError && <div className="auth-error">{depositError}</div>}
            <form className="balance-deposit__form" onSubmit={handleDeposit}>
              <div className="balance-deposit__input-wrap">
                <span className="balance-deposit__currency text-muted">$</span>
                <input
                  className="input balance-deposit__input"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={depositing}>
                {depositing ? 'Processing…' : 'Deposit'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Transactions ──────────────────────────────────────────────────── */}
        <div className="card balance-tx">
          <h2 className="balance-tx__title">Transaction History</h2>

          {transactions.length === 0 ? (
            <p className="text-muted">No transactions yet.</p>
          ) : (
            <div className="balance-tx__list">
              {transactions.map(tx => (
                <div key={tx.id} className="balance-tx__item">
                  <div className="balance-tx__info">
                    <span className={`badge ${tx.type === 'deposit' ? 'badge-success' : 'badge-error'}`}>
                      {tx.type}
                    </span>
                    <span className="text-muted balance-tx__comment">{tx.comment || '—'}</span>
                  </div>
                  <div className="balance-tx__right">
                    <span className={tx.type === 'deposit' ? 'text-success' : 'text-error'}>
                      {tx.type === 'deposit' ? '+' : '−'}${tx.amount.toFixed(2)}
                    </span>
                    <span className="text-muted balance-tx__date">
                      {new Date(tx.created_at).toLocaleDateString('en-EN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="catalog__pagination" style={{ marginTop: '1rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >← Prev</button>
              <span className="text-muted">{page + 1} / {totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
