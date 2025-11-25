'use client';
import { useState, useEffect, FormEvent } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, parseISO, isSameMonth, subMonths, addMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#10b981'];

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Gider');
  const [category, setCategory] = useState('Diğer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());

  const fetchData = async () => {
    const res = await fetch('/api/transactions');
    if (res.ok) {
        const data = await res.json();
        setTransactions(data.map((t: any) => ({ ...t, amount: Number(t.amount) })));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ description: desc, amount, type, category, date })
    });
    setDesc(''); setAmount(''); fetchData();
  };

  const handleDelete = async (id: string) => {
    if(confirm('Sil?')) {
        await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
        fetchData();
    }
  };

  const filtered = transactions.filter(t => isSameMonth(parseISO(t.date), viewDate));
  const income = filtered.filter(t => t.type === 'Gelir').reduce((a, b) => a + b.amount, 0);
  const expense = filtered.filter(t => t.type === 'Gider').reduce((a, b) => a + b.amount, 0);
  
  const pieData = filtered.filter(t => t.type === 'Gider').reduce((acc: any[], curr) => {
      const f = acc.find(i => i.name === curr.category);
      f ? f.value += curr.amount : acc.push({ name: curr.category, value: curr.amount });
      return acc;
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold text-indigo-600">FinTrack</h1>
            <div className="flex gap-4 items-center">
                <button onClick={() => setViewDate(subMonths(viewDate, 1))}>◀</button>
                <span className="font-bold">{format(viewDate, 'MMMM yyyy', { locale: tr })}</span>
                <button onClick={() => setViewDate(addMonths(viewDate, 1))}>▶</button>
            </div>
        </header>

        <div className="grid grid-cols-3 gap-4 text-white text-center">
            <div className="bg-emerald-500 p-4 rounded-2xl">Gelir<br/><span className="text-2xl font-bold">{income} ₺</span></div>
            <div className="bg-rose-500 p-4 rounded-2xl">Gider<br/><span className="text-2xl font-bold">{expense} ₺</span></div>
            <div className="bg-indigo-500 p-4 rounded-2xl">Net<br/><span className="text-2xl font-bold">{income - expense} ₺</span></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="font-bold mb-4">Yeni İşlem</h2>
            <form onSubmit={handleAdd} className="grid gap-4">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
                <div className="grid grid-cols-2 gap-2">
                    <select value={type} onChange={e => setType(e.target.value)} className="border p-2 rounded">
                        <option value="Gider">Gider</option><option value="Gelir">Gelir</option>
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 rounded">
                         {['Market','Kira','Fatura','Maaş','Diğer'].map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <input placeholder="Açıklama" value={desc} onChange={e => setDesc(e.target.value)} className="border p-2 rounded" required />
                <input placeholder="Tutar" type="number" value={amount} onChange={e => setAmount(e.target.value)} className="border p-2 rounded" required />
                <button className="bg-indigo-600 text-white p-3 rounded-xl font-bold">KAYDET</button>
            </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="space-y-2">
            {filtered.map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                    <div>
                        <div className="font-bold">{t.description}</div>
                        <div className="text-xs text-gray-500">{t.category} • {t.date}</div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className={t.type === 'Gelir' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {t.type === 'Gelir' ? '+' : '-'}{t.amount} ₺
                        </span>
                        <button onClick={() => handleDelete(t.id)}>🗑️</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </main>
  );
}
