import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  Baby, 
  FileText, 
  Wallet, 
  CreditCard, 
  UserCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  active?: boolean;
  key?: React.Key;
}

const SidebarItem = ({ icon: Icon, label, to, active }: SidebarItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={cn(active ? "text-white" : "group-hover:text-white")} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {active && <ChevronRight size={16} />}
  </Link>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    fetch('/api/pengaturan')
      .then(res => res.json())
      .then(data => setSettings(data));
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuGroups = [
    {
      title: "UTAMA",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", to: "/" },
      ]
    },
    {
      title: "DATA KEPENDUDUKAN",
      items: [
        { icon: Home, label: "Kartu Keluarga", to: "/kk" },
        { icon: Users, label: "Data Warga", to: "/warga" },
        { icon: Baby, label: "Kelahiran & Kematian", to: "/peristiwa" },
      ]
    },
    {
      title: "LAYANAN",
      items: [
        { icon: FileText, label: "Surat Menyurat", to: "/surat" },
      ]
    },
    {
      title: "KEUANGAN",
      items: [
        { icon: Wallet, label: "Kas RT", to: "/kas" },
        { icon: CreditCard, label: "Iuran Warga", to: "/iuran" },
      ]
    },
    {
      title: "PENGATURAN",
      items: [
        { icon: UserCircle, label: "Profil Admin", to: "/profil" },
        { icon: Settings, label: "Pengaturan Desa", to: "/pengaturan" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 sidebar-gradient text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-lg relative overflow-hidden">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : 'RT'}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight">{settings?.nama_desa || 'Sistem Manajemen RT'}</h1>
                <p className="text-[10px] text-slate-400 font-medium">RT {settings?.rt || '001'} / RW {settings?.rw || '001'}</p>
                <p className="text-[10px] text-emerald-400 font-medium">{settings?.kecamatan || 'Desa'}, {settings?.kota || 'Kota'}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
              {menuGroups.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <h2 className="text-[10px] font-bold text-slate-500 tracking-widest px-4 uppercase">
                    {group.title}
                  </h2>
                  <div className="space-y-1">
                    {group.items.map((item, i) => (
                      <SidebarItem 
                        key={i} 
                        {...item} 
                        active={location.pathname === item.to} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto p-6 border-t border-slate-800">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white overflow-hidden">
                  {user?.photo_url ? (
                    <img src={user.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (user?.username?.[0]?.toUpperCase() || 'A')}
                </div>
                <div>
                  <p className="text-sm font-bold">{user?.username || 'Admin'}</p>
                  <p className="text-[10px] text-slate-400">Ketua RT</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-lg font-bold text-slate-800">
                {menuGroups.flatMap(g => g.items).find(i => i.to === location.pathname)?.label || "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold overflow-hidden">
              {user?.photo_url ? (
                <img src={user.photo_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (user?.username?.[0]?.toUpperCase() || 'A')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
