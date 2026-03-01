import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Wallet, ArrowUpCircle, ArrowDownCircle, X, MoreVertical, Download, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import ExportButtons from '@/src/components/ExportButtons';

export default function Kas() {
  const [kas, setKas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
    jumlah: '',
    tipe: 'masuk'
  });

  const fetchData = () => {
    fetch('/api/kas')
      .then(res => res.json())
      .then(data => {
        setKas(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/kas/${editingId}` : '/api/kas';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        jumlah: parseInt(formData.jumlah)
      }),
    });
    if (res.ok) {
      setShowModal(false);
      setEditingId(null);
      fetchData();
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        jumlah: '',
        tipe: 'masuk'
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      tanggal: item.tanggal,
      keterangan: item.keterangan,
      jumlah: item.jumlah.toString(),
      tipe: item.tipe
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini secara permanen?')) {
      const res = await fetch(`/api/kas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    }
  };

  const totalMasuk = kas.filter(k => k.tipe === 'masuk').reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKeluar = kas.filter(k => k.tipe === 'keluar').reduce((acc, curr) => acc + curr.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Kas RT</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola keuangan dan kas RT 001</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons data={kas} fileName="laporan_kas" title="Laporan Kas RT" />
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
          >
            <Plus size={20} />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] card-shadow border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SALDO AKHIR</p>
          <h3 className="text-2xl font-extrabold text-slate-900">{formatCurrency(saldo)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border-l-4 border-blue-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL MASUK</p>
          <h3 className="text-2xl font-extrabold text-blue-600">{formatCurrency(totalMasuk)}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border-l-4 border-red-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL KELUAR</p>
          <h3 className="text-2xl font-extrabold text-red-600">{formatCurrency(totalKeluar)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keterangan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : kas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada transaksi.</td>
                </tr>
              ) : kas.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{item.keterangan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("font-bold", item.tipe === 'masuk' ? "text-emerald-600" : "text-red-600")}>
                      {item.tipe === 'masuk' ? '+' : '-'} {formatCurrency(item.jumlah)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.tipe === 'masuk' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase">
                        <ArrowUpCircle size={12} /> Masuk
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">
                        <ArrowDownCircle size={12} /> Keluar
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => {
            setShowModal(false);
            setEditingId(null);
          }} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 card-shadow"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}
              </h2>
              <button onClick={() => {
                setShowModal(false);
                setEditingId(null);
              }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Tanggal</label>
                <input 
                  type="date" 
                  required
                  value={formData.tanggal}
                  onChange={e => setFormData({...formData, tanggal: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tipe: 'masuk'})}
                    className={cn(
                      "py-4 rounded-2xl font-bold transition-all border-2",
                      formData.tipe === 'masuk' 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-600" 
                        : "bg-slate-50 border-transparent text-slate-400"
                    )}
                  >
                    Uang Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, tipe: 'keluar'})}
                    className={cn(
                      "py-4 rounded-2xl font-bold transition-all border-2",
                      formData.tipe === 'keluar' 
                        ? "bg-red-50 border-red-500 text-red-600" 
                        : "bg-slate-50 border-transparent text-slate-400"
                    )}
                  >
                    Uang Keluar
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Jumlah (Rp)</label>
                <input 
                  type="number" 
                  required
                  value={formData.jumlah}
                  onChange={e => setFormData({...formData, jumlah: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Masukkan nominal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Keterangan</label>
                <textarea 
                  required
                  value={formData.keterangan}
                  onChange={e => setFormData({...formData, keterangan: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[100px]"
                  placeholder="Keterangan transaksi..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
