import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, X, Download } from 'lucide-react';
import ExportButtons from '@/src/components/ExportButtons';

export default function Warga() {
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    kk_id: '',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: 'Islam',
    pekerjaan: '',
    status_warga: 'aktif'
  });

  const fetchData = () => {
    fetch('/api/warga')
      .then(res => res.json())
      .then(data => {
        setWarga(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/warga/${editingId}` : '/api/warga';
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
        nama: '', nik: '', kk_id: '', jenis_kelamin: 'Laki-laki',
        tempat_lahir: '', tanggal_lahir: '', agama: 'Islam', pekerjaan: '', status_warga: 'aktif'
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      nik: item.nik,
      kk_id: item.kk_id || '',
      jenis_kelamin: item.jenis_kelamin,
      tempat_lahir: item.tempat_lahir || '',
      tanggal_lahir: item.tanggal_lahir || '',
      agama: item.agama || 'Islam',
      pekerjaan: item.pekerjaan || '',
      status_warga: item.status_warga || 'aktif'
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data warga ini secara permanen?')) {
      const res = await fetch(`/api/warga/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Data Warga</h1>
          <p className="text-sm text-slate-500 font-medium">Kelola informasi seluruh penduduk RT 001</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons data={warga} fileName="data_warga" title="Data Warga RT" />
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
          >
            <Plus size={20} />
            Tambah Warga
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl card-shadow flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau NIK..." 
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
        <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIK</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jenis Kelamin</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pekerjaan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : warga.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada data warga.</td>
                </tr>
              ) : warga.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                        {item.nama[0]}
                      </div>
                      <span className="font-bold text-slate-900">{item.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.nik}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.jenis_kelamin}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{item.pekerjaan}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase">
                      {item.status_warga}
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

      {/* Modal Tambah/Edit Warga */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => {
            setShowModal(false);
            setEditingId(null);
          }} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 card-shadow max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {editingId ? 'Edit Data Warga' : 'Tambah Warga Baru'}
              </h2>
              <button onClick={() => {
                setShowModal(false);
                setEditingId(null);
              }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.nama}
                  onChange={e => setFormData({...formData, nama: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Nama sesuai KTP"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">NIK</label>
                <input 
                  type="text" 
                  required
                  value={formData.nik}
                  onChange={e => setFormData({...formData, nik: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="16 digit NIK"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Jenis Kelamin</label>
                <select 
                  value={formData.jenis_kelamin}
                  onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Pekerjaan</label>
                <input 
                  type="text" 
                  value={formData.pekerjaan}
                  onChange={e => setFormData({...formData, pekerjaan: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Pekerjaan saat ini"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Tempat Lahir</label>
                <input 
                  type="text" 
                  value={formData.tempat_lahir}
                  onChange={e => setFormData({...formData, tempat_lahir: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Tanggal Lahir</label>
                <input 
                  type="date" 
                  value={formData.tanggal_lahir}
                  onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              {editingId && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Status Warga</label>
                  <select 
                    value={formData.status_warga}
                    onChange={e => setFormData({...formData, status_warga: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="meninggal">Meninggal</option>
                    <option value="pindah">Pindah</option>
                  </select>
                </div>
              )}
              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Data Warga'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
