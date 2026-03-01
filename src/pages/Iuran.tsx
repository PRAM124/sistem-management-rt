import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, CreditCard, X, MoreVertical, CheckCircle, Download, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';
import ExportButtons from '@/src/components/ExportButtons';

export default function Iuran() {
  const [iuran, setIuran] = useState<any[]>([]);
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    warga_id: '',
    bulan: 'Januari',
    tahun: '2026',
    jumlah: '20000',
    tanggal_bayar: new Date().toISOString().split('T')[0]
  });

  const fetchData = () => {
    Promise.all([
      fetch('/api/iuran').then(res => res.json()),
      fetch('/api/warga').then(res => res.json())
    ]).then(([iuranData, wargaData]) => {
      setIuran(iuranData);
      setWarga(wargaData.filter((w: any) => w.status_warga === 'aktif'));
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/iuran/${editingId}` : '/api/iuran';
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
        warga_id: '',
        bulan: 'Januari',
        tahun: '2026',
        jumlah: '20000',
        tanggal_bayar: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      warga_id: item.warga_id.toString(),
      bulan: item.bulan,
      tahun: item.tahun,
      jumlah: item.jumlah.toString(),
      tanggal_bayar: item.tanggal_bayar
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data iuran ini secara permanen?')) {
      const res = await fetch(`/api/iuran/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    }
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Iuran Warga</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola pembayaran iuran bulanan warga RT 001</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons data={iuran} fileName="data_iuran" title="Data Iuran Warga RT" />
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
          >
            <Plus size={20} />
            Input Pembayaran
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warga</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tgl Bayar</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : iuran.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada data iuran.</td>
                </tr>
              ) : iuran.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{item.nama_warga}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {item.bulan} {item.tahun}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(item.jumlah)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.tanggal_bayar}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase w-fit">
                      <CheckCircle size={12} /> {item.status}
                    </span>
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
                {editingId ? 'Edit Pembayaran' : 'Input Pembayaran'}
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Warga</label>
                <select 
                  required
                  value={formData.warga_id}
                  onChange={e => setFormData({...formData, warga_id: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option value="">Pilih Warga</option>
                  {warga.map(w => (
                    <option key={w.id} value={w.id}>{w.nama} - {w.nik}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Bulan</label>
                  <select 
                    value={formData.bulan}
                    onChange={e => setFormData({...formData, bulan: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  >
                    {months.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Tahun</label>
                  <select 
                    value={formData.tahun}
                    onChange={e => setFormData({...formData, tahun: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option>2025</option>
                    <option>2026</option>
                    <option>2027</option>
                  </select>
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
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Tanggal Bayar</label>
                <input 
                  type="date" 
                  required
                  value={formData.tanggal_bayar}
                  onChange={e => setFormData({...formData, tanggal_bayar: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Pembayaran'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
