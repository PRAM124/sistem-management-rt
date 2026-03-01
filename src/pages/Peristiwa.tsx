import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Baby, Skull, X, MoreVertical, Download, Edit2, Trash2 } from 'lucide-react';
import ExportButtons from '@/src/components/ExportButtons';

export default function Peristiwa() {
  const [peristiwa, setPeristiwa] = useState<any[]>([]);
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    warga_id: '',
    jenis_peristiwa: 'kelahiran',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: ''
  });

  const fetchData = () => {
    Promise.all([
      fetch('/api/peristiwa').then(res => res.json()),
      fetch('/api/warga').then(res => res.json())
    ]).then(([peristiwaData, wargaData]) => {
      setPeristiwa(peristiwaData);
      setWarga(wargaData.filter((w: any) => w.status_warga === 'aktif'));
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/peristiwa/${editingId}` : '/api/peristiwa';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowModal(false);
      setEditingId(null);
      fetchData();
      setFormData({
        warga_id: '',
        jenis_peristiwa: 'kelahiran',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: ''
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      warga_id: item.warga_id.toString(),
      jenis_peristiwa: item.jenis_peristiwa,
      tanggal: item.tanggal,
      keterangan: item.keterangan || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data peristiwa ini secara permanen?')) {
      const res = await fetch(`/api/peristiwa/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Kelahiran & Kematian</h1>
          <p className="text-sm text-slate-500 font-medium">Catat peristiwa kependudukan warga RT 001</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons data={peristiwa} fileName="data_peristiwa" title="Data Peristiwa Warga RT" />
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
          >
            <Plus size={20} />
            Tambah Peristiwa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warga</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Peristiwa</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keterangan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : peristiwa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Belum ada data peristiwa.</td>
                </tr>
              ) : peristiwa.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{item.nama_warga}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.jenis_peristiwa === 'kelahiran' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase">
                          <Baby size={12} /> Kelahiran
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">
                          <Skull size={12} /> Kematian
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.tanggal}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.keterangan}</td>
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
                {editingId ? 'Edit Peristiwa' : 'Tambah Peristiwa'}
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Jenis Peristiwa</label>
                <select 
                  value={formData.jenis_peristiwa}
                  onChange={e => setFormData({...formData, jenis_peristiwa: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option value="kelahiran">Kelahiran</option>
                  <option value="kematian">Kematian</option>
                </select>
              </div>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Keterangan</label>
                <textarea 
                  value={formData.keterangan}
                  onChange={e => setFormData({...formData, keterangan: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[100px]"
                  placeholder="Keterangan tambahan..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Peristiwa'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
