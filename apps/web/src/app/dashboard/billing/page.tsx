import type { ReactElement } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Download, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TRANSACTIONS = [
  { date: 'Apr 14', client: 'Sharma, P.', type: 'Trust deposit', typeColor: 'bg-blue-50 text-blue-700', description: 'Retainer installment 2/3', amount: '+$2,833', fx: 'USD', balance: '$146,200' },
  { date: 'Apr 13', client: 'Osei, A.', type: 'Invoice', typeColor: 'bg-emerald-50 text-emerald-700', description: 'EB-1A preparation · April', amount: '+$5,500', fx: 'USD', balance: '$143,367' },
  { date: 'Apr 12', client: 'Iyer, R.', type: 'Airwallex', typeColor: 'bg-amber-50 text-amber-700', description: 'H-1B retainer', amount: '+₹2,05,000 → $2,460', fx: 'INR→USD', balance: '$137,867' },
  { date: 'Apr 11', client: 'Moreno, L.', type: 'Filed-fee', typeColor: 'bg-rose-50 text-rose-700', description: 'USCIS I-485 filing fee (trust → operating)', amount: '-$1,440', fx: 'USD', balance: '$135,407' },
  { date: 'Apr 10', client: 'Wei, C.', type: 'Trust deposit', typeColor: 'bg-blue-50 text-blue-700', description: 'O-1A initial retainer', amount: '+$6,000', fx: 'USD', balance: '$136,847' },
  { date: 'Apr 09', client: 'Hussein, A.', type: 'Invoice', typeColor: 'bg-emerald-50 text-emerald-700', description: 'Asylum preparation fee', amount: '+$3,200', fx: 'USD', balance: '$130,847' },
  { date: 'Apr 08', client: 'Volkov, D.', type: 'Trust deposit', typeColor: 'bg-blue-50 text-blue-700', description: 'N-400 flat fee', amount: '+$2,500', fx: 'USD', balance: '$127,647' },
];

export default function BillingPage(): ReactElement {
  return (
    <>
      <Topbar firstName="Danish" previewMode />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Trust & Billing</h1>
            <p className="text-[12px] text-zinc-500">IOLTA-aware ledger · Stripe + Airwallex · installment tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-[12px] text-zinc-600 hover:bg-zinc-50"><Download className="h-3.5 w-3.5" /> Export</button>
            <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-[12px] font-medium text-white hover:bg-zinc-800"><Plus className="h-3.5 w-3.5" /> New invoice</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <BillingCard label="Trust balance" value="$146,200" sub="reconciled Apr 15" icon={<DollarSign className="h-4 w-4" />} />
          <BillingCard label="Open invoices" value="$38,450" sub="12 outstanding" icon={<CreditCard className="h-4 w-4" />} />
          <BillingCard label="Overdue > 30d" value="$4,100" sub="2 clients" icon={<AlertTriangle className="h-4 w-4" />} urgent />
          <BillingCard label="MTD collected" value="$184,220" sub="▲ 12% vs last month" icon={<TrendingUp className="h-4 w-4" />} good />
        </div>

        {/* Transactions table */}
        <div className="mt-5 rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-[13px] font-semibold text-zinc-900">Trust ledger</h2>
            <div className="flex gap-1 text-[11px]">
              <button className="rounded-md bg-zinc-900 px-2.5 py-1 font-medium text-white">All</button>
              <button className="rounded-md px-2.5 py-1 text-zinc-500 hover:bg-zinc-100">Deposits</button>
              <button className="rounded-md px-2.5 py-1 text-zinc-500 hover:bg-zinc-100">Disbursements</button>
              <button className="rounded-md px-2.5 py-1 text-zinc-500 hover:bg-zinc-100">Invoices</button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-2.5 text-left">Date</th>
                <th className="px-5 py-2.5 text-left">Client</th>
                <th className="px-5 py-2.5 text-left">Type</th>
                <th className="px-5 py-2.5 text-left">Description</th>
                <th className="px-5 py-2.5 text-right">Amount</th>
                <th className="px-5 py-2.5 text-center">FX</th>
                <th className="px-5 py-2.5 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {TRANSACTIONS.map((t, i) => (
                <tr key={i} className="border-t border-zinc-50 transition-colors hover:bg-zinc-50/50">
                  <td className="px-5 py-3 text-zinc-500">{t.date}</td>
                  <td className="px-5 py-3 font-medium text-zinc-900">{t.client}</td>
                  <td className="px-5 py-3"><span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${t.typeColor}`}>{t.type}</span></td>
                  <td className="px-5 py-3 text-zinc-600">{t.description}</td>
                  <td className={`px-5 py-3 text-right font-medium ${t.amount.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                    <span className="inline-flex items-center gap-1">
                      {t.amount.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {t.amount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-[11px] text-zinc-400">{t.fx}</td>
                  <td className="px-5 py-3 text-right font-medium text-zinc-700">{t.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* IOLTA compliance note */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-[12px] text-amber-800">
          <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />
          <span className="font-semibold">IOLTA compliance note</span> — Client funds never commingled with operating. Monthly 3-way reconciliation report auto-generated on the 1st. This ledger connects to your trust account — it is not a substitute for a compliant trust accounting system.
        </div>
      </main>
    </>
  );
}

function BillingCard({ label, value, sub, icon, urgent, good }: { label: string; value: string; sub: string; icon: ReactElement; urgent?: boolean; good?: boolean }): ReactElement {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-zinc-500">{label}</p>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-50 text-zinc-400">{icon}</div>
      </div>
      <p className={`mt-2 text-2xl font-bold ${urgent ? 'text-red-600' : 'text-zinc-900'}`}>{value}</p>
      <p className={`mt-1 text-[11px] ${good ? 'text-emerald-600' : 'text-zinc-400'}`}>{sub}</p>
    </div>
  );
}
