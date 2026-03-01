import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Warga from './pages/Warga';
import KartuKeluarga from './pages/KartuKeluarga';
import Peristiwa from './pages/Peristiwa';
import Surat from './pages/Surat';
import Kas from './pages/Kas';
import Iuran from './pages/Iuran';
import Profil from './pages/Profil';
import Pengaturan from './pages/Pengaturan';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/warga" element={<Layout><Warga /></Layout>} />
        <Route path="/kk" element={<Layout><KartuKeluarga /></Layout>} />
        <Route path="/peristiwa" element={<Layout><Peristiwa /></Layout>} />
        <Route path="/surat" element={<Layout><Surat /></Layout>} />
        <Route path="/kas" element={<Layout><Kas /></Layout>} />
        <Route path="/iuran" element={<Layout><Iuran /></Layout>} />
        <Route path="/profil" element={<Layout><Profil /></Layout>} />
        <Route path="/pengaturan" element={<Layout><Pengaturan /></Layout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
