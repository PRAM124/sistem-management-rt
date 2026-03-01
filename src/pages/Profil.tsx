import React, { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Camera, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [photo, setPhoto] = useState(user.photo_url || '');
  const [fullName, setFullName] = useState(user.full_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: user.id, 
        full_name: fullName,
        email,
        phone,
        address,
        photo_url: photo 
      }),
    });
    if (res.ok) {
      const updatedUser = { 
        ...user, 
        full_name: fullName,
        email,
        phone,
        address,
        photo_url: photo 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Profil berhasil diperbarui!');
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900">Profil Admin</h1>
        <p className="text-sm text-slate-500 font-medium">Kelola informasi lengkap akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 card-shadow flex flex-col items-center gap-6"
        >
          <div className="relative group">
            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User size={64} />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-2xl cursor-pointer shadow-lg hover:bg-emerald-600 transition-all">
              <Camera size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-slate-900">{fullName || user.username}</h2>
            <p className="text-sm text-slate-500 font-medium">Administrator RT</p>
          </div>
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="w-full mt-4 px-6 bg-red-50 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Keluar Aplikasi
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 card-shadow"
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Username</label>
                <input 
                  type="text" 
                  disabled
                  value={user.username}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Nama Lengkap"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">No. Telepon</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="No. Telepon"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Alamat</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Alamat Lengkap"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
