import React, { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Settings, Camera, Save, Building2 } from 'lucide-react';

export default function Pengaturan() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState('');

  useEffect(() => {
    fetch('/api/pengaturan')
      .then(res => res.json())
      .then(data => {
        const defaultSettings = {
          nama_desa: '',
          rt: '',
          rw: '',
          kecamatan: '',
          kota: '',
          ...data
        };
        setSettings(defaultSettings);
        setLogo(defaultSettings.logo_url || '');
        setLoading(false);
      });
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/pengaturan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, logo_url: logo }),
      });
      if (res.ok) {
        alert('Pengaturan berhasil diperbarui!');
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert('Gagal menyimpan pengaturan: ' + (errorData.error || 'Terjadi kesalahan sistem'));
      }
    } catch (error) {
      alert('Gagal menyimpan pengaturan: Terjadi kesalahan jaringan');
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Pengaturan Desa</h1>
        <p className="text-sm text-slate-500 font-medium">Konfigurasi identitas wilayah dan aplikasi</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-10 card-shadow"
      >
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex items-center gap-8 pb-8 border-b border-slate-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <Building2 size={32} className="text-slate-300" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-white text-slate-600 rounded-xl cursor-pointer shadow-md hover:text-primary transition-all border border-slate-100">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Logo Wilayah</h3>
              <p className="text-xs text-slate-500 font-medium">Unggah logo desa atau kelurahan Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Nama Desa/Kelurahan</label>
              <input 
                type="text" 
                value={settings.nama_desa}
                onChange={e => setSettings({...settings, nama_desa: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">RT</label>
                <input 
                  type="text" 
                  value={settings.rt}
                  onChange={e => setSettings({...settings, rt: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">RW</label>
                <input 
                  type="text" 
                  value={settings.rw}
                  onChange={e => setSettings({...settings, rw: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Kecamatan</label>
              <input 
                type="text" 
                value={settings.kecamatan}
                onChange={e => setSettings({...settings, kecamatan: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Kota/Kabupaten</label>
              <input 
                type="text" 
                value={settings.kota}
                onChange={e => setSettings({...settings, kota: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
