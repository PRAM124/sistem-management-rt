import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Home, 
  FileText, 
  TrendingUp, 
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { formatCurrency } from '@/src/lib/utils';

interface Stats {
  totalWarga: number;
  totalKK: number;
  totalSurat: number;
  wargaAktif: number;
  saldo: number;
}

const StatCard = ({ icon: Icon, label, value, sublabel, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-[2rem] card-shadow flex items-start justify-between group cursor-pointer hover:scale-[1.02] transition-all duration-300"
  >
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{label}</p>
      <h3 className="text-4xl font-extrabold text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 font-medium">{sublabel}</p>
      <div className="pt-4 flex items-center gap-1 text-slate-400 group-hover:text-primary transition-colors">
        <ArrowUpRight size={14} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Data terkini</span>
      </div>
    </div>
    <div className={cn(
      "p-4 rounded-2xl",
      color === 'blue' ? "bg-blue-50 text-blue-500" : 
      color === 'green' ? "bg-emerald-50 text-emerald-500" :
      color === 'purple' ? "bg-purple-50 text-purple-500" :
      "bg-indigo-50 text-indigo-500"
    )}>
      <Icon size={24} />
    </div>
  </motion.div>
);

import { cn } from '@/src/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/pengaturan').then(res => res.json())
    ]).then(([statsData, settingsData]) => {
      setStats(statsData);
      setSettings(settingsData);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center font-bold text-2xl text-white overflow-hidden shadow-xl shadow-emerald-500/20">
                {user?.photo_url ? (
                  <img src={user.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (user?.username?.[0]?.toUpperCase() || 'A')}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  ADMINISTRATOR
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                  Selamat Datang, {user?.full_name || user?.username || 'Admin'}!
                </h1>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl min-w-[240px]">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">SALDO KAS RT</p>
                <h2 className="text-3xl font-extrabold text-emerald-400">
                  {formatCurrency(stats?.saldo || 0)}
                </h2>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Tersedia saat ini</p>
              </div>

              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                  {settings?.logo_url ? (
                    <img src={settings.logo_url} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  ) : <Home size={20} className="text-slate-400" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{settings?.nama_desa || 'Desa Sukamaju'}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    RT {settings?.rt || '001'} / RW {settings?.rw || '001'} • {settings?.kecamatan || 'Kecamatan'}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{settings?.kota || 'Kota'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="TOTAL WARGA" 
          value={stats?.totalWarga || 0} 
          sublabel="jiwa terdaftar"
          color="blue"
        />
        <StatCard 
          icon={Home} 
          label="KARTU KELUARGA" 
          value={stats?.totalKK || 0} 
          sublabel="KK terdaftar"
          color="green"
        />
        <StatCard 
          icon={FileText} 
          label="SURAT DIBUAT" 
          value={stats?.totalSurat || 0} 
          sublabel="total surat"
          color="purple"
        />
        <StatCard 
          icon={TrendingUp} 
          label="WARGA AKTIF" 
          value={stats?.wargaAktif || 0} 
          sublabel="berdomisili"
          color="indigo"
        />
      </div>

      {/* Recent Activity / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 card-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-slate-900">Aktivitas Terakhir</h3>
            <button className="text-xs font-bold text-primary hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Pembuatan Surat Pengantar</p>
                  <p className="text-xs text-slate-500">Warga: Budi Santoso • 2 jam yang lalu</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase">Selesai</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 card-shadow">
          <h3 className="text-xl font-extrabold text-slate-900 mb-8">Akses Cepat</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "Tambah Warga", color: "bg-blue-50 text-blue-500" },
              { icon: FileText, label: "Buat Surat", color: "bg-purple-50 text-purple-500" },
              { icon: Wallet, label: "Input Kas", color: "bg-emerald-50 text-emerald-500" },
              { icon: Home, label: "Input KK", color: "bg-orange-50 text-orange-500" },
            ].map((action, idx) => (
              <button key={idx} className="flex flex-col items-center gap-3 p-6 rounded-3xl hover:bg-slate-50 transition-all border border-slate-100 group">
                <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", action.color)}>
                  <action.icon size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
