import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Home, X, MoreVertical } from 'lucide-react';

export default function KartuKeluarga() {
  const [kk, setKk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nomor_kk: '',
    kepala_keluarga: '',
    alamat: '',
    rt_rw: '001/001'
  });

  const fetchData = () => {
    fetch('/api/kk')
      .then(res => res.json())
      .then(data => {
        setKk(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/kk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowModal(false);
      fetchData();
      setFormData({ nomor_kk: '', kepala_keluarga: '', alamat: '', rt_rw: '001/001' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Kartu Keluarga</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola data Kartu Keluarga warga RT 001</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
        >
          <Plus size={20} />
          Tambah KK
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl card-shadow flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nomor KK atau kepala keluarga..." 
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Memuat data...</div>
        ) : kk.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">Belum ada data Kartu Keluarga.</div>
        ) : kk.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] card-shadow border border-transparent hover:border-primary/20 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                <Home size={24} />
              </div>
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                <MoreVertical size={18} />
              </button>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NOMOR KK</p>
              <h3 className="text-lg font-extrabold text-slate-900">{item.nomor_kk}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Kepala Keluarga</span>
                <span className="text-sm font-bold text-slate-900">{item.kepala_keluarga}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">RT/RW</span>
                <span className="text-sm font-bold text-slate-900">{item.rt_rw}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed">{item.alamat}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 card-shadow"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">Tambah Kartu Keluarga</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Nomor KK</label>
                <input 
                  type="text" 
                  required
                  value={formData.nomor_kk}
                  onChange={e => setFormData({...formData, nomor_kk: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="16 digit nomor KK"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Kepala Keluarga</label>
                <input 
                  type="text" 
                  required
                  value={formData.kepala_keluarga}
                  onChange={e => setFormData({...formData, kepala_keluarga: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Nama Kepala Keluarga"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Alamat</label>
                <textarea 
                  required
                  value={formData.alamat}
                  onChange={e => setFormData({...formData, alamat: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[100px]"
                  placeholder="Alamat lengkap"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
              >
                Simpan Data KK
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
